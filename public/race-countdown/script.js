import { boot, formatCountdown, getState, registerScreen } from '/shared/app.js'

function renderRaceCountdown() {
  const raceState = getState()
  const timer = raceState?.remainingMs ?? 0
  const el = document.querySelector('.timer')
  if (el) {
    el.textContent = formatCountdown(timer)
  }
}

registerScreen(renderRaceCountdown)
boot()
