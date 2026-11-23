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

//get the session heading name
function sessionHeading(session) {
  return `<div class="eyebrow">${esc(session.label)}</div>`
}

//show car options dropdown, enfores 1 driver per car
function carOptions(session, selected, editingDriverId = '') {
  const assigned = new Set(
    session.drivers
      .filter((driver) => driver.id !== editingDriverId)
      .map((driver) => driver.carNumber),
  )
  return Array.from({ length: 8 }, (_, index) => index + 1)
    .map((number) => {
      const disabled = assigned.has(number) && number !== Number(selected)
      return `<option value="${number}" ${Number(selected) === number ? 'selected' : ''} ${disabled ? 'disabled' : ''}>Car ${number}${disabled ? ' (assigned)' : ''}</option>`
    })
    .join('')
}

function firstAvailableCar(session) {
  return Array.from({ length: 8 }, (_, index) => index + 1).find(
    (number) => !session.drivers.some((driver) => driver.carNumber === number),
  )
}

//render driver list, together with edit, delete button
function driverList(session) {
  if (session.drivers.length === 0) {
    return '<p class="empty-copy">No drivers assigned yet. Add drivers below (up to 8 per session).</p>'
  }
  return session.drivers
    .map(
      (
        driver,
      ) => `<form class="driver-row" data-form="edit-driver" data-session="${esc(session.id)}" data-driver="${esc(driver.id)}">
        <input aria-label="Driver name" name="name" maxlength="60" value="${esc(driver.name)}" required>
        <select aria-label="Assigned car" name="carNumber">${carOptions(session, driver.carNumber, driver.id)}</select>
        <span class="inline">
          <button class="button ghost" type="submit">Save</button>
          <button class="button ghost" type="button" data-action="delete-driver" data-session="${esc(session.id)}" data-driver="${esc(driver.id)}">×</button>
        </span>
      </form>`,
    )
    .join('')
}

function renderFrontDesk() {
  const raceState = getState()
  const sessions = raceState?.sessions ?? []
  const cards = sessions.length
    ? sessions
        .map(
          (session) => `<article class="session-card">
            <header class="session-card-header">
              <div>${sessionHeading(session)}<strong>${session.drivers.length}/8 drivers</strong></div>
              <button class="button ghost" data-action="delete-session" data-session="${esc(session.id)}">Remove session</button>
            </header>
            <div class="session-card-body">
              ${driverList(session)}
              ${
                session.drivers.length < 8
                  ? `<form class="driver-form" data-form="add-driver" data-session="${esc(session.id)}">
                <div class="field"><label>Driver name</label><input name="name" maxlength="60" placeholder="Enter full name" required></div>
                <div class="field"><label>Car</label><select name="carNumber">${carOptions(session, firstAvailableCar(session))}</select></div>
                <button class="button" type="submit">Add driver</button>
              </form>`
                  : ''
              }
            </div>
          </article>`,
        )
        .join('')
    : `<div class="empty-state"><div><strong>No upcoming race sessions</strong><p class="empty-copy">Create the next grid to begin building your race card.</p></div></div>`

  app.innerHTML = layout(`<div class="page-heading">
    <div><p class="eyebrow">Race operations / Reception</p><h1>Front <span class="accent">desk</span></h1><p class="subtitle">Build the race card and assign each driver a car.</p></div>
    <button class="button large" data-action="create-session">＋ Add race session</button>
  </div>
  <div class="grid">${cards}</div>
  <p class="footer-note">Up to 8 drivers per session · Driver names and car assignments must be unique within each grid.</p>`)
}

registerScreen(renderFrontDesk)

//dubmit event -> emit save driver
app.addEventListener('submit', (event) => {
  const form = event.target
  if (!(form instanceof HTMLFormElement)) return
  if (
    form.dataset.form === 'add-driver' ||
    form.dataset.form === 'edit-driver'
  ) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(form).entries())
    const payload = { ...data, sessionId: form.dataset.session }
    if (form.dataset.driver) payload.driverId = form.dataset.driver
    emit('frontdesk:save-driver', payload)
  }
})

//click event -> emit create/delete session, delete driver
app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]')
  if (!button) return
  const { action } = button.dataset
  if (action === 'create-session') emit('frontdesk:create-session')
  else if (action === 'delete-session') {
    emit('frontdesk:delete-session', { sessionId: button.dataset.session })
  } else if (action === 'delete-driver') {
    emit('frontdesk:delete-driver', {
      sessionId: button.dataset.session,
      driverId: button.dataset.driver,
    })
  }
})

boot()
