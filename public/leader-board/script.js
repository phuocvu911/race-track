import {
  boot,
  esc,
  formatCountdown,
  formatTime,
  getApp,
  getState,
  layout,
  registerScreen,
} from '/shared/app.js'

const app = getApp()

//sort the drivers by fastest lap time, then by car number if no lap time is available
function leaderboardRows(session) {
  if (!session?.drivers?.length) {
    return '<tr><td colspan="5" class="empty-copy">No race results yet. The leaderboard will update when a race begins.</td></tr>'
  }
  const sorted = [...session.drivers].sort((a, b) => {
    if (a.fastestLapMs === null)
      return b.fastestLapMs === null ? a.carNumber - b.carNumber : 1
    if (b.fastestLapMs === null) return -1
    return a.fastestLapMs - b.fastestLapMs
  })
  return sorted
    .map(
      (driver, index) => `<tr>
        <td class="rank">${String(index + 1).padStart(2, '0')}</td>
        <td><span class="car-chip">${esc(driver.carNumber)}</span></td>
        <td><strong>${esc(driver.name)}</strong></td>
        <td class="best-time">${formatTime(driver.fastestLapMs)}</td>
        <td>${esc(driver.laps)}</td>
      </tr>`,
    )
    .join('')
}

function renderLeaderBoard() {
  const raceState = getState()
  const session = raceState?.activeSession
  const isActive = Boolean(raceState?.activeSessionId)

  app.innerHTML = layout(`<div class="page-heading">
    <div><h1>Leader <span class="accent">board</span></h1></div>
    <span class="badge mode-${esc(raceState?.mode ?? 'danger')}">${esc(raceState?.mode ?? 'danger')}</span>
  </div>
  <div class="grid grid-two">
    <section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">Race clock</p><h2>${isActive ? 'Time remaining' : 'Race status'}</h2></div></div>
      <div class="timer" data-countdown>${formatCountdown(raceState?.remainingMs ?? 0)}</div>
      <div class="timer-label">${isActive ? 'Until chequered flag' : session ? 'Session complete' : 'Standing by'}</div>
      <div class="stat-row" style="margin-top: 24px"><div class="stat"><span class="label">Race mode</span><strong class="mode-${esc(raceState?.mode ?? 'danger')}">${esc(raceState?.mode ?? 'danger')}</strong></div>
        <div class="stat"><span class="label">Drivers</span><strong>${session?.drivers.length ?? 0}</strong></div></div>
    </section>
    <section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">Fastest lap wins</p><h2>${session ? esc(session.label) : 'Standings'}</h2></div></div>
      <div style="overflow-x:auto"><table class="leader-table"><thead><tr><th>Pos</th><th>Car</th><th>Driver</th><th>Best lap</th><th>Laps</th></tr></thead><tbody>${leaderboardRows(session)}</tbody></table></div>
    </section>
  </div>`)
}

registerScreen(renderLeaderBoard)
boot()
