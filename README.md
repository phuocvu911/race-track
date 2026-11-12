# Beachside Racetrack

A real-time race operations MVP built with Node.js, Express, Socket.IO, and browser-native JavaScript. Race data is saved locally in `data/race-state.json`(or can be SQLite but json file is good enough to persist data, would simplify the codebase alot :)).

## Requirements

- Node.js 20 or newer
- npm
- The three staff access keys below

## Start the server

Install dependencies once:

```sh
npm install
```

Create `.env` file, set a separate access key for each employee interface, this will be used to open protected enpoints for the staff only, then start the server:

```sh
RECEPTIONIST_KEY='Hive'
OBSERVER_KEY='Helsinki'
SAFETY_KEY='Hiver9'
```

```
npm start
```

The server listens on port `3000`

## layout

```
race-track/
  package.json
  .gitignore            (node_modules, .env)
  .env                  (secrets like access keys, never in public/)
  server.js             (entry point: Express + Socket.IO setup)
  src/
    routes.js           (page routes)
    sockets.js          (all io.on handlers)
    state.js            (race data kept in memory)
  public/
    shared/
      base.css          (common styles)
      socket-client.js  (connects once, shared by all pages)
    front-desk/
      index.html
      style.css
      script.js
    race-control/
      index.html
      style.css
      script.js
    lap-line-tracker/
      index.html
      style.css
      script.js
    leader-board/
      index.html
      style.css
      script.js
      ....
```

## Role and command event for socket 

| Role             | Command event              | Purpose                               |
| ---------------- | -------------------------- | ------------------------------------- |
| Front desk       | `frontdesk:create-session` | Queue a race session                  |
| Front desk       | `frontdesk:save-driver`    | Add or edit a driver and assigned car |
| Front desk       | `frontdesk:delete-driver`  | Remove a driver                       |
| Front desk       | `frontdesk:delete-session` | Remove an upcoming session            |
| Race control     | `safety:start-race`        | Start the next grid and race clock    |
| Race control     | `safety:set-mode`          | Set Safe, Hazard, or Danger           |
| Race control     | `safety:finish-race`       | Finish early                          |
| Race control     | `safety:end-race`          | End after Finish when cars return     |
| Lap-line tracker | `observer:record-lap`      | Record a car crossing                 |
