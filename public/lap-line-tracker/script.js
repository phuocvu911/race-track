import {
  boot,
  emit,
  esc,
  getApp,
  getState,
  layout,
  registerScreen,
} from '/shared/app.js'

const app = getApp()

function renderLapTracker() {
  const raceState = getState()
  const session = raceState?.activeSession
  const acceptsLaps = Boolean(
    raceState?.activeSessionId &&
      ['active', 'finished'].includes(session?.status),
  )
  const drivers = session?.drivers ?? []
  const cards = drivers.length
    ? drivers
        .map(
          (
            driver,
          ) => `<button class="lap-button" data-action="lap" data-car="${esc(driver.carNumber)}" ${acceptsLaps ? '' : 'disabled'}>
            <span class="lap-number">${esc(driver.carNumber)}</span>
          </button>`,
        )
        .join('')
    : '<div class="empty-state">No cars are on the circuit.</div>'
  const ended =
    session?.status === 'ended' || (!acceptsLaps && raceState?.sessionEnded)

  app.innerHTML = layout(`<div class="page-heading">
    <div><h1>Lap-line <span class="accent">tracker</span></h1><p class="subtitle">${session ? esc(session.label) : 'Waiting for a race to start'}</p></div>
  </div>
  ${ended ? '<div class="paddock-call">Race session ended. Lap inputs are disabled</div>' : ''}
  <div class="lap-grid">${cards}</div>
  <p class="footer-note">Tap each car as it crosses the lap line. The first crossing starts lap 1; each crossing after that records a lap time.</p>`)
}

registerScreen(renderLapTracker)

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]')
  if (!button) return
  if (button.dataset.action === 'lap') {
    emit('observer:record-lap', { carNumber: button.dataset.car })
  }
})

boot()
