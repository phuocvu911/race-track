import path from "node:path"
import { Router } from "express"

const routes = {
  "/": "home",
  "/front-desk": "front-desk",
  "/race-control": "race-control",
  "/lap-line-tracker": "lap-line-tracker",
  "/leader-board": "leader-board",
  "/next-race": "next-race",
  "/race-countdown": "race-countdown",
  "/race-flags": "race-flags",
}

//hook up get routes only
export function createGETRoutes(publicDirectory) {
  const router = Router()

  for (const [route, page] of Object.entries(routes)) {
    router.get(route, (_request, response) => {
      response.sendFile(path.join(publicDirectory, page, "index.html"))
    })
  }

  return router
}
