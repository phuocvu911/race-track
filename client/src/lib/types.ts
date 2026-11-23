/** Race flag. `finished` is final until the session is ended. */
export type Mode = 'safe' | 'hazard' | 'danger' | 'finished'

export type SessionStatus = 'upcoming' | 'active' | 'finished' | 'ended'

export interface Driver {
  id: string
  name: string
  carNumber: number
  laps: number
  /** `null` until the car has completed a full lap (two crossings). */
  fastestLapMs: number | null
  /** Timestamp (ms) of the last lap-line crossing; `null` before the first. */
  lastCrossingAt: number | null
}

export interface Session {
  id: string
  label: string
  status: SessionStatus
  drivers: Driver[]
  createdAt: number
  /** Set when the race starts. */
  startedAt?: number
  durationMs?: number
  /** Set when the race finishes. */
  finishedAt?: number
  /** Set when the session is ended. */
  endedAt?: number
}

/** The snapshot every client receives in `race:state` (`publicState()` on the server). */
export interface RaceState {
  mode: Mode
  raceDurationMs: number
  activeSessionId: string | null
  /** The running race, or the last one shown on the leader board. */
  activeSession: Session | null
  upcomingSession: Session | null
  sessionEnded: boolean
  /** Upcoming sessions only. */
  sessions: Session[]
  /** Time left when the snapshot was sent; doesn't count down by itself. */
  remainingMs: number
}

export interface ServerToClientEvents {
  'race:state': (state: RaceState) => void
}
