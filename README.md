#TASK SPLIT

## tech

    express for routing (since it a node package)
    socket IO

## 1

The employee interfaces are for managing race operations. These screens require an admin password to unlock. These are:

Interface Persona Route
Front Desk Receptionist /front-desk
Race Control Safety Official /race-control
Lap-line Tracker Lap-line Observer /lap-line-tracker

plus persist data and allow receptionist to select cars

## 2

Interface Persona Route
Leader Board Guest leader-board
Next Race Race Driver next-race
Race Countdown Race Driver race-countdown
Race Flag Race Driver race-flags

Plus 2 bonus that can be used by any persona:

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
