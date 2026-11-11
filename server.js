import express from "express"
import "dotenv/config"
import http from "http"
import { Server } from "socket.io"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createGETRoutes } from "./src/routes.js"

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const PORT = 3000
const publicDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "public",
)

//require all 3 keys
const requiredKeys = {
  receptionist: process.env.RECEPTIONIST_KEY,
  observer: process.env.OBSERVER_KEY,
  safety: process.env.SAFETY_KEY,
}
const missingKeys = Object.entries(requiredKeys)
  .filter(([, value]) => !value?.trim())
  .map(([role]) => role.toUpperCase() + "_KEY")

if (missingKeys.length > 0) {
  console.error(
    `Missing required access keys: ${missingKeys.join(", ")}\n` +
      "Set all three environment variables before starting the server. See README.md.",
  )
  process.exit(1)
}

app.use(express.json())
app.use(express.static(publicDirectory))
app.use(createGETRoutes(publicDirectory))

server.listen(PORT, () => {
  console.log(`Server listening on  http://localhost:${PORT}`)
})
