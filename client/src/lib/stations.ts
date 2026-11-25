import type { StaffRole } from './socket.svelte.js'

/** Display names for the staff stations. */
export const STATION_NAMES: Record<StaffRole, string> = {
  'front-desk': 'Front Desk',
  'race-control': 'Race Control',
  'lap-line-tracker': 'Lap-line Tracker',
}
