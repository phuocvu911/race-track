import { boot, esc, getApp, getState, registerScreen } from '/shared/app.js'

const app = getApp()

function renderNextRace() {
  const raceState = getState()
  const session = raceState?.upcomingSession
  const drivers = session?.drivers ?? []

  app.innerHTML = `<div class="page-heading">
    <div><h1>Next <span class="accent">race</span></h1><p class="subtitle">${session ? esc(session.label) : 'The next grid will appear here.'}</p></div>
    ${session ? `<span class="badge">${drivers.length} drivers</span>` : ''}
  </div>
  ${raceState?.sessionEnded && session ? '<div class="paddock-call">Drivers for the next race · Please proceed to the paddock</div>' : ''}
  ${
    drivers.length
      ? `<div class="next-driver-list">${drivers
          .map(
            (driver) =>
              `<article class="next-driver"><span class="car-chip">${esc(driver.carNumber)}</span><span>${esc(driver.name)}</span></article>`,
          )
          .join('')}</div>`
      : '<div class="empty-state"><div><strong>No drivers announced</strong><p class="empty-copy">Please check back later.</p></div></div>'
  }`
}

registerScreen(renderNextRace)
boot()
