import { io, type Socket } from 'socket.io-client'
import type { RaceState, ServerToClientEvents } from './types'

/** Who this page connects as, sent in the handshake's `auth`. `public` needs no key; the others need their own access key. */
export type Role = 'public' | 'race-control' | 'front-desk' | 'lap-line-tracker'

/** The roles that need an access key: every role except `public`. */
export type StaffRole = Exclude<Role, 'public'>

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
  /** What the page's socket is connected as; a staff role only once the server has accepted its key. */
  role: Role
}>({
  state: null,
  updatedAt: null,
  connection: 'idle',
  reconnectedAt: null,
  role: 'public',
})

/** How long a first connection may keep failing before it counts as unreachable. */
const CONNECT_GRACE_MS = 4000

let socket: Socket<ServerToClientEvents> | null = null
let graceTimer: ReturnType<typeof setTimeout> | undefined
let hasConnected = false

/** True when the server couldn't be reached, false when it answered with a rejection. */
function isNetworkError(err: Error): boolean {
  return 'type' in err && err.type === 'TransportError'
}

/** Opens a new socket as `role`. It starts connecting right away, but nothing on the page reacts to it until it's adopted. */
function create(role: Role, accessKey?: string): Socket<ServerToClientEvents> {
  return io({
    auth: { role, accessKey },
    transports: ['websocket'],
  })
}

/** Makes `next` the page's socket, shutting down the current one first. */
function adopt(next: Socket<ServerToClientEvents>, role: Role) {
  // Listeners go first, so closing the old socket doesn't report a disconnect.
  socket?.removeAllListeners()
  socket?.close()
  socket = next
  race.role = role

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

  socket.on('race:state', (state) => {
    race.state = state
    race.updatedAt = Date.now()
  })
}

export function connect(role: Role) {
  if (socket?.active) return

  race.connection = 'connecting'
  graceTimer = setTimeout(() => {
    if (race.connection === 'connecting') race.connection = 'unreachable'
  }, CONNECT_GRACE_MS)

  adopt(create('public'), 'public')
}

/** Tries an access key. Resolves `true` once the server accepts it and `false` if it rejects it; while the server can't be reached, it keeps retrying. */
export function unlock(role: StaffRole, key: string): Promise<boolean> {
  const attempt = create(role, key)
  return new Promise((resolve) => {
    attempt.once('connect', () => {
      adopt(attempt, role)
      race.connection = 'connected'
      resolve(true)
    })
    attempt.once('connect_error', (err) => {
      if (!isNetworkError(err)) resolve(false)
    })
  })
}
