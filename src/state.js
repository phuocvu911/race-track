import fs from "node:fs"
import path from "node:path"
import { randomUUID } from "node:crypto"

const validModes = new Set(["safe", "hazard", "danger", "finished"])

//defaultt setup for the race
function freshState(raceDurationMs) {
  return {
    sessions: [],
    activeSessionId: null,
    displaySessionId: null,
    mode: "danger",
    raceDurationMs,
  }
}

function parseState(filePath, raceDurationMs) {
  if (!fs.existsSync(filePath)) return freshState(raceDurationMs)

  try {
    const saved = JSON.parse(fs.readFileSync(filePath, "utf8"))
    if (!Array.isArray(saved.sessions) || !validModes.has(saved.mode)) {
      throw new Error("Saved race state has an invalid shape.")
    }
    return {
      ...freshState(raceDurationMs),
      ...saved,
      raceDurationMs,
    }
  } catch (error) {
    throw new Error(
      `Could not load persisted race data at ${filePath}: ${error.message}`,
      {
        cause: error,
      },
    )
  }
}

export function createStateStore(filePath, raceDurationMs) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const state = parseState(filePath, raceDurationMs)

  function save() {
    const temporaryPath = `${filePath}.tmp`
    fs.writeFileSync(temporaryPath, JSON.stringify(state, null, 2))
    fs.renameSync(temporaryPath, filePath)
  }

  function getUpcomingSession() {
    return (
      state.sessions.find((session) => session.status === "upcoming") ?? null
    )
  }

  function getActiveSession() {
    return (
      state.sessions.find((session) => session.id === state.activeSessionId) ??
      null
    )
  }

  function getDisplaySession() {
    return (
      state.sessions.find((session) => session.id === state.displaySessionId) ??
      null
    )
  }

  function publicState() {
    const activeSession = getActiveSession()
    const displaySession = getDisplaySession()
    const sessionForBoard = activeSession ?? displaySession
    const sessionEnded = state.sessions.some(
      (session) => session.status === "ended",
    )

    return {
      mode: state.mode,
      raceDurationMs: state.raceDurationMs,
      activeSessionId: state.activeSessionId,
      activeSession: sessionForBoard,
      upcomingSession: getUpcomingSession(),
      sessionEnded,
      sessions: state.sessions.filter(
        (session) => session.status === "upcoming",
      ),
      remainingMs:
        activeSession?.status === "active" && state.mode !== "finished"
          ? Math.max(
              0,
              activeSession.startedAt + activeSession.durationMs - Date.now(),
            )
          : 0,
    }
  }

  function createSession() {
    const sequence = state.sessions.length + 1
    const session = {
      id: randomUUID(),
      label: `Race session ${String(sequence).padStart(2, "0")}`,
      status: "upcoming",
      drivers: [],
      createdAt: Date.now(),
    }
    state.sessions.push(session)
    save()
    return session.id
  }

  function deleteSession(sessionId) {
    const index = state.sessions.findIndex(
      (session) => session.id === sessionId && session.status === "upcoming",
    )
    if (index < 0) throw new Error("Upcoming race session not found.")
    state.sessions.splice(index, 1)
    save()
  }

  function upsertDriver({ sessionId, driverId, name, carNumber }) {
    const session = state.sessions.find(
      (item) => item.id === sessionId && item.status === "upcoming",
    )
    if (!session) throw new Error("Upcoming race session not found.")

    const normalizedName = typeof name === "string" ? name.trim() : ""
    const numericCar = Number(carNumber)
    if (!normalizedName || normalizedName.length > 60) {
      throw new Error("Enter a driver name between 1 and 60 characters.")
    }
    if (!Number.isInteger(numericCar) || numericCar < 1 || numericCar > 8) {
      throw new Error("Car numbers must be whole numbers from 1 to 8.")
    }

    const existing = driverId
      ? session.drivers.find((driver) => driver.id === driverId)
      : null
    if (driverId && !existing)
      throw new Error("Driver not found in this race session.")
    if (!existing && session.drivers.length >= 8) {
      throw new Error("A race session can have no more than 8 drivers.")
    }
    if (
      session.drivers.some(
        (driver) =>
          driver.id !== driverId &&
          driver.name.toLowerCase() === normalizedName.toLowerCase(),
      )
    ) {
      throw new Error("Driver names must be unique within a race session.")
    }
    if (
      session.drivers.some(
        (driver) => driver.id !== driverId && driver.carNumber === numericCar,
      )
    ) {
      throw new Error(
        "Each driver in a race session must have a different car.",
      )
    }

    if (existing) {
      existing.name = normalizedName
      existing.carNumber = numericCar
    } else {
      session.drivers.push({
        id: randomUUID(),
        name: normalizedName,
        carNumber: numericCar,
        laps: 0,
        fastestLapMs: null,
        lastCrossingAt: null,
      })
    }
    save()
  }

  function deleteDriver({ sessionId, driverId }) {
    const session = state.sessions.find(
      (item) => item.id === sessionId && item.status === "upcoming",
    )
    if (!session) throw new Error("Upcoming race session not found.")
    const index = session.drivers.findIndex((driver) => driver.id === driverId)
    if (index < 0) throw new Error("Driver not found in this race session.")
    session.drivers.splice(index, 1)
    save()
  }

  function startRace() {
    if (getActiveSession()) throw new Error("A race is already in progress.")
    const session = getUpcomingSession()
    if (!session) throw new Error("Add a race session before starting a race.")
    if (session.drivers.length === 0)
      throw new Error("Add at least one driver before starting.")

    state.sessions = state.sessions.filter(
      (item) => item.status === "upcoming" || item.id === session.id,
    )
    session.status = "active"
    session.startedAt = Date.now()
    session.durationMs = raceDurationMs
    session.drivers.forEach((driver) => {
      driver.laps = 0
      driver.fastestLapMs = null
      driver.lastCrossingAt = null
    })
    state.activeSessionId = session.id
    state.displaySessionId = session.id
    state.mode = "safe"
    save()
    return session.id
  }

  function setMode(mode) {
    if (!validModes.has(mode) || mode === "finished") {
      throw new Error("Select a valid race mode.")
    }
    if (!getActiveSession() || state.mode === "finished") {
      throw new Error("Race modes can only be changed during an active race.")
    }
    state.mode = mode
    save()
  }

  function finishRace() {
    const session = getActiveSession()
    if (!session || state.mode === "finished") return false
    state.mode = "finished"
    session.status = "finished"
    session.finishedAt = Date.now()
    save()
    return true
  }

  function endRace() {
    const session = getActiveSession()
    if (!session || state.mode !== "finished") {
      throw new Error("Finish the race before ending the session.")
    }
    session.status = "ended"
    session.endedAt = Date.now()
    state.activeSessionId = null
    state.mode = "danger"
    save()
  }

  function recordLap(carNumber) {
    const session = getActiveSession()
    if (!session || !["active", "finished"].includes(session.status)) {
      throw new Error("There is no race session accepting lap times.")
    }
    const driver = session.drivers.find(
      (item) => item.carNumber === Number(carNumber),
    )
    if (!driver) throw new Error("Car not found in the current race session.")

    const now = Date.now()
    driver.laps += 1
    if (driver.lastCrossingAt !== null) {
      const lapTime = now - driver.lastCrossingAt
      if (driver.fastestLapMs === null || lapTime < driver.fastestLapMs) {
        driver.fastestLapMs = lapTime
      }
    }
    driver.lastCrossingAt = now
    save()
  }

  function finishIfExpired() {
    const session = getActiveSession()
    if (!session || session.status !== "active" || state.mode === "finished")
      return false
    if (Date.now() < session.startedAt + session.durationMs) return false
    return finishRace()
  }

  save()
  return {
    publicState,
    createSession,
    deleteSession,
    upsertDriver,
    deleteDriver,
    startRace,
    setMode,
    finishRace,
    endRace,
    recordLap,
    finishIfExpired,
    getActiveSession,
    close() {},
  }
}
