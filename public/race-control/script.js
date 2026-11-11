import {
  registerScreen,
  boot,
  getState,
  getApp,
  layout,
  esc,
  emit,
  formatCountdown,
} from "/shared/app.js"

const app = getApp()

function renderRaceControl() {
  const raceState = getState()
  const active = raceState?.activeSession
  const isLive = Boolean(raceState?.activeSessionId)
  const next = raceState?.upcomingSession
  const shown = isLive ? active : next
  const canControl = isLive && active?.status === "active"
  const canEnd = isLive && active?.status === "finished"
  const drivers = shown?.drivers ?? []
  const controls = `<div class="control-grid">
    <button class="mode-button safe" data-action="mode" data-mode="safe" aria-pressed="${raceState?.mode === "safe"}" ${canControl ? "" : "disabled"}>Green<br>Safe</button>
    <button class="mode-button hazard" data-action="mode" data-mode="hazard" aria-pressed="${raceState?.mode === "hazard"}" ${canControl ? "" : "disabled"}>Yellow<br>Hazard</button>
    <button class="mode-button danger" data-action="mode" data-mode="danger" aria-pressed="${raceState?.mode === "danger"}" ${canControl ? "" : "disabled"}>Red<br>Danger</button>
    <button class="mode-button finish" data-action="finish" ${canControl ? "" : "disabled"}>🏁<br>Finish race</button>
  </div>`
  const driverRows = drivers.length
    ? drivers
        .map(
          (driver) => `<div class="driver-row">
            <span class="driver-name">${esc(driver.name)}</span><span class="car-chip">${esc(driver.carNumber)}</span>
            <span class="muted">${driver.laps ?? 0} laps</span>
          </div>`,
        )
        .join("")
    : '<div class="empty-state">No drivers in this race card.</div>'

  app.innerHTML = layout(`<div class="page-heading">
    <div><p class="eyebrow">Safety official</p><h1>Race <span class="accent">control</span></h1></div>
  </div>
  <div class="grid grid-two">
    <section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">${shown ? esc(shown.label) : "Pit lane"}</p><h2>${isLive ? "Current race" : "Next race"}</h2></div>
        ${canControl ? `<div><div class="timer" data-countdown>${formatCountdown(raceState.remainingMs)}</div><div class="timer-label">Time remaining</div></div>` : ""}
      </div>
      ${driverRows}
      ${!isLive && next ? `<button class="button large" data-action="start" ${drivers.length ? "" : "disabled"}>▶ &nbsp; Start race</button>` : ""}
      ${!isLive && !next ? '<p class="empty-copy">No upcoming session is queued. Ask reception to prepare the next grid.</p>' : ""}
    </section>
    <section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">Track signals</p><h2>Race mode</h2></div></div>
      ${controls}
      <div class="toolbar" style="margin-top: 16px">
        <button class="button danger" data-action="end" ${canEnd ? "" : "disabled"}>End race session</button>
        ${canEnd ? '<span class="muted">Confirm all cars are back in the pit lane.</span>' : ""}
      </div>
    </section>
  </div>`)
}

registerScreen(renderRaceControl)

app.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]")
  if (!button) return
  const { action } = button.dataset
  if (action === "start") emit("safety:start-race")
  else if (action === "mode")
    emit("safety:set-mode", { mode: button.dataset.mode })
  else if (action === "finish") emit("safety:finish-race")
  else if (action === "end") emit("safety:end-race")
})

boot()
