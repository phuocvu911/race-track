import {
  boot,
  enterFullscreen,
  esc,
  getApp,
  getState,
  registerScreen,
} from '/shared/app.js'

const app = getApp()

function renderRaceFlags() {
  const raceState = getState()
  const mode = raceState?.mode ?? 'danger'
  const el = document.querySelector('.flag-display')
  if (!el) return
  el.className = `flag-display ${esc(mode)}`
}

registerScreen(renderRaceFlags)

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]')
  if (!button) return
  if (button.dataset.action === 'fullscreen') enterFullscreen()
})

boot()
