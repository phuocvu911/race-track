const employeeRoles = {
  'front-desk': 'receptionist',
  'race-control': 'safety',
  'lap-line-tracker': 'observer',
}
const pageNames = {
  'front-desk': 'Front desk',
  'race-control': 'Race control',
  'lap-line-tracker': 'Lap-line tracker',
  'leader-board': 'Leader board',
  'next-race': 'Next race',
  'race-countdown': 'Race countdown',
  'race-flags': 'Race flags',
}

const app = document.querySelector('#app')
const screen = document.body.dataset.screen
let socket
let raceState
let notice = ''
let noticeIsError = false
let timerInterval
let screenRenderer = null

function connectRaceSocket(role, accessKey) {
  return window.io({
    auth: { role, accessKey },
    reconnection: false,
  })
}

export function getState() {
  return raceState
}

export function getApp() {
  return app
}

//prevent HTML injection since I render the components by js
export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[character]
  })

export function formatTime(milliseconds) {
  if (milliseconds === null || milliseconds === undefined) return '—'
  const totalHundredths = Math.floor(milliseconds / 10)
  const minutes = Math.floor(totalHundredths / 6000)
  const seconds = Math.floor((totalHundredths % 6000) / 100)
  const hundredths = totalHundredths % 100
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`
}

export function formatCountdown(milliseconds) {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000)
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

export function isPublic() {
  return !employeeRoles[screen]
}

export function layout(content) {
  const display = isPublic()
  return `<div class="${display ? 'display-shell' : 'shell'}">
    <header class="topbar">
      <a class="brand" href="/">
        <span class="brand-mark">B</span>
        <span>BEACHSIDE RACETRACK</span>
      </a>
    </header>
    <main class="page">${content}</main>
    ${notice ? `<div class="notice ${noticeIsError ? 'error' : ''}" role="status">${esc(notice)}</div>` : ''}
  </div>`
}

export function authScreen(error = '') {
  app.innerHTML = `<section class="auth-screen">
    <div class="auth-card">
      <div class="brand">
        <span class="brand-mark">B</span>
        <span>BEACHSIDE RACETRACK</span>
      </div>
      <p class="eyebrow">${esc(pageNames[screen])}</p>
      <h1>Enter access</h1><h1 class="accent">key</h1>
      <form id="auth-form">
        <div class="field">
          <label for="access-key">Access key</label>
          <input id="access-key" name="accessKey" type="password" autocomplete="current-password" required autofocus>
        </div>
        <p class="auth-error" aria-live="polite">${esc(error)}</p>
        <button class="button" type="submit">Unlock interface →</button>
      </form>
    </div>
  </section>`
}

export function startConnection(accessKey = '') {
  socket = connectRaceSocket(
    employeeRoles[screen] ? screen : 'public',
    accessKey,
  )
  socket.on('race:state', (nextState) => {
    raceState = nextState
    render()
  })
  socket.on('connect', () => {
    if (employeeRoles[screen]) {
      raceState = raceState ?? null
      render()
    }
  })
  socket.on('connect_error', (error) => {
    if (employeeRoles[screen]) {
      socket?.disconnect()
      socket = null
      authScreen(
        error.message ||
          'Unable to connect. Check the access key and try again.',
      )
    } else {
      app.innerHTML = `<div class="shell page"><h1>Connection lost</h1><p class="subtitle">${esc(error.message)}</p></div>`
    }
  })
}

export function emit(event, payload = {}) {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      showNotice('Not connected. Re-enter your access key to continue.', true)
      resolve(false)
      return
    }
    socket.emit(event, payload, (response) => {
      if (!response?.ok) {
        showNotice(
          response?.error ?? 'The request could not be completed.',
          true,
        )
        resolve(false)
        return
      }
      showNotice('Updated successfully.')
      resolve(true)
    })
  })
}

export function showNotice(message, error = false) {
  notice = message
  noticeIsError = error
  render()
  window.setTimeout(() => {
    if (notice === message) {
      notice = ''
      render()
    }
  }, 5000)
}

function render() {
  if (!raceState) {
    if (isPublic()) {
      app.innerHTML = `<div class="shell page"><p class="eyebrow">Connecting to live race timing…</p></div>`
    }
    return
  }
  if (screenRenderer) screenRenderer()
  updateCountdowns()
}

function updateCountdowns() {
  if (timerInterval) window.clearInterval(timerInterval)
  const remaining = raceState?.remainingMs ?? 0
  const expiryAt = Date.now() + remaining
  timerInterval = window.setInterval(() => {
    const node = document.querySelector('[data-countdown]')
    if (node) node.textContent = formatCountdown(expiryAt - Date.now())
  }, 250)
}

export function registerScreen(screen) {
  screenRenderer = screen
}

export function boot() {
  app.addEventListener('submit', (event) => {
    const form = event.target
    if (!(form instanceof HTMLFormElement)) return
    if (form.id === 'auth-form') {
      event.preventDefault()
      const key = new FormData(form).get('accessKey')
      form.querySelector('button[type=submit]').disabled = true
      startConnection(String(key ?? ''))
    }
  })

  if (employeeRoles[screen]) authScreen()
  else startConnection()
}
