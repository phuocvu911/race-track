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

function renderFrontDesk() {
  app.innerHTML = layout()
}

registerScreen(renderFrontDesk)
