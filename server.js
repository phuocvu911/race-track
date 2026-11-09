import express from "express"
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
console.log(publicDirectory)

app.use(express.json())
app.use(express.static(publicDirectory))
app.use(createGETRoutes(publicDirectory))

server.listen(PORT, () => {
  console.log(`Server listening on  http://localhost:${PORT}`)
})
