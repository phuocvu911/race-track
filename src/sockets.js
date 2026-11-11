const roleKeys = {
  "front-desk": "receptionist",
  "race-control": "safety",
  "lap-line-tracker": "observer",
}

function acknowledge(callback, operation) {
  try {
    const result = operation()
    callback?.({ ok: true, result })
  } catch (error) {
    callback?.({ ok: false, error: error.message })
  }
}

export function createSocketHandlers(io, store, accessKeys) {
  io.use((socket, next) => {
    const { role, accessKey } = socket.handshake.auth ?? {}
    if (role === "public") {
      socket.data.role = role
      return next()
    }

    const expectedRole = roleKeys[role]
    if (!expectedRole)
      return next(new Error("This interface is not authorized."))
    if (
      typeof accessKey !== "string" ||
      accessKey !== accessKeys[expectedRole]
    ) {
      return setTimeout(
        () => next(new Error("Incorrect access key. Please try again.")),
        500,
      )
    }

    socket.data.role = role
    return next()
  })

  function broadcast() {
    io.emit("race:state", store.publicState())
  }

  function finishTimer() {
    const session = store.getActiveSession()
    if (!session || session.status !== "active") return
    const delay = Math.max(
      0,
      session.startedAt + session.durationMs - Date.now(),
    )
    setTimeout(() => {
      if (store.finishIfExpired()) broadcast()
      else if (store.getActiveSession()?.id === session.id) finishTimer()
    }, delay + 5)
  }
  //connects a client role and event name to an action, store data(3) and emit event(4)
  function bind(role, event, action, afterAction = broadcast) {
    io.on("connection", (socket) => {
      if (socket.data.role !== role) return
      socket.on(event, (payload, callback) => {
        acknowledge(callback, () => {
          action(payload ?? {})
          afterAction()
        })
      })
    })
  }

  io.on("connection", (socket) => {
    console.log("New connection:", socket.id)
    socket.emit("race:state", store.publicState())
  })

  bind("front-desk", "frontdesk:create-session", () => store.createSession())
  bind("front-desk", "frontdesk:delete-session", ({ sessionId }) =>
    store.deleteSession(sessionId),
  )
  bind("front-desk", "frontdesk:save-driver", (payload) =>
    store.upsertDriver(payload),
  )
  bind("front-desk", "frontdesk:delete-driver", (payload) =>
    store.deleteDriver(payload),
  )
  bind("race-control", "safety:start-race", () => {
    store.startRace()
    finishTimer()
  })
  bind("race-control", "safety:set-mode", ({ mode }) => store.setMode(mode))
  bind("race-control", "safety:finish-race", () => store.finishRace())
  bind("race-control", "safety:end-race", () => store.endRace())
  bind("lap-line-tracker", "observer:record-lap", ({ carNumber }) =>
    store.recordLap(carNumber),
  )

  if (store.finishIfExpired()) broadcast()
  finishTimer()
}
