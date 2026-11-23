import { io, type Socket } from 'socket.io-client'
import type { RaceState, ServerToClientEvents } from './types'

/** Who this page connects as, sent in the handshake's `auth`. `public` needs no key; the others need their own access key. */
export type Role = 'public' | 'race-control' | 'front-desk' | 'lap-line-tracker'

/** The status of this page's socket connection. */
export type Connection =
  | 'idle' // connect hasn't been called yet
  | 'connecting' // first attempt, including failed retries during the grace period
  | 'connected' // live updates arriving
  | 'reconnecting' // was connected, then dropped; Socket.IO is retrying
  | 'unreachable' // never connected after the grace period; still retrying
  | 'offline' // the browser reports no network
  | 'denied' // access key rejected; no retry

export const race = $state<{
  state: RaceState | null
  updatedAt: number | null
  connection: Connection
  reconnectedAt: number | null
}>({
  state: null,
  updatedAt: null,
  connection: 'idle',
  reconnectedAt: null,
})

/** How long a first connection may keep failing before it counts as unreachable. */
const CONNECT_GRACE_MS = 4000

let socket: Socket<ServerToClientEvents> | null = null
let hasConnected = false

/** True when the server couldn't be reached, false when it answered with a rejection. */
function isNetworkError(err: Error): boolean {
  return 'type' in err && err.type === 'TransportError'
}

export function connect(role: Role) {
  if (socket?.active) return

  race.connection = 'connecting'
  const graceTimer = setTimeout(() => {
    if (race.connection === 'connecting') race.connection = 'unreachable'
  }, CONNECT_GRACE_MS)

  socket = io({
    auth: { role },
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    clearTimeout(graceTimer)
    if (
      race.connection === 'reconnecting' ||
      race.connection === 'offline' ||
      race.connection === 'unreachable'
    )
      race.reconnectedAt = Date.now()

    race.connection = 'connected'
    hasConnected = true
  })

  socket.on('disconnect', () => {
    race.connection = navigator.onLine ? 'reconnecting' : 'offline'
  })

  socket.on('connect_error', (err) => {
    if (!navigator.onLine) {
      race.connection = 'offline'
      return
    }
    if (!isNetworkError(err)) {
      race.connection = 'denied'
      return
    }
    if (hasConnected) race.connection = 'reconnecting'
    else if (race.connection !== 'connecting') race.connection = 'unreachable'
  })

  socket.on('race:state', (next) => {
    race.state = next
    race.updatedAt = Date.now()
  })
}
