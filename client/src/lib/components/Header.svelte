<script lang="ts">
  import { ArrowLeft, LoaderCircle } from '@lucide/svelte'
  import { clock } from '../clock.svelte.js'
  import CheckeredFlag from '../icons/CheckeredFlag.svelte'
  import { race, type StaffRole } from '../socket.svelte.js'
  import { STATION_NAMES } from '../stations.js'
  import type { Mode, RaceState } from '../types.js'
  import StatusBar from './StatusBar.svelte'

  type Indicator =
    | { kind: 'dot'; color: string } // live race color or muted grey
    | { kind: 'ring' } // no race running
    | { kind: 'flag' } // finish
    | { kind: 'spinner' } // connecting

  type Line = {
    indicator: Indicator
    text: string
    time?: string
    muted?: boolean
  }

  const MODE: Record<
    Exclude<Mode, 'finished'>,
    { word: string; color: string }
  > = {
    safe: { word: 'Safe', color: 'bg-green-600' },
    hazard: { word: 'Hazard', color: 'bg-yellow-500' },
    danger: { word: 'Danger', color: 'bg-red-600' },
  }

  const MUTED: Indicator = { kind: 'dot', color: 'bg-zinc-300' }

  function describe(s: RaceState, receivedAt: number | null): Line {
    const session = s.activeSession
    if (
      session &&
      (session.status === 'active' || session.status === 'finished')
    ) {
      if (s.mode === 'finished')
        return {
          indicator: { kind: 'flag' },
          text: `${session.label} · Finish · Back to the pits`,
        }
      const m = MODE[s.mode]
      const endsAt =
        receivedAt !== null ? receivedAt + s.remainingMs : undefined
      return {
        indicator: { kind: 'dot', color: m.color },
        text: `${session.label} · ${m.word}`,
        time: countdown(endsAt),
      }
    }
    const next = s.upcomingSession
      ? `Next: ${s.upcomingSession.label}`
      : 'No sessions yet'
    return { indicator: { kind: 'ring' }, text: `No race running · ${next}` }
  }

  const line: Line = $derived.by(() => {
    const c = race.connection
    if (c === 'idle' || c === 'connecting')
      return {
        indicator: { kind: 'spinner' },
        text: 'Connecting…',
        muted: true,
      }
    if (!race.state)
      return {
        indicator: MUTED,
        text: 'No race info yet',
        muted: true,
      }

    const known = describe(race.state, race.updatedAt)
    if (c === 'connected') return known

    return {
      indicator: MUTED,
      text: `${known.text} · ${ago(race.updatedAt)}`,
      muted: true,
    }
  })

  function countdown(endsAt?: number) {
    if (!endsAt) return undefined
    const s = Math.max(0, Math.ceil((endsAt - clock.now) / 1000))
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  function ago(ts: number | null) {
    if (!ts) return 'a while ago'
    const s = Math.round((clock.now - ts) / 1000)
    return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`
  }

  interface Props {
    role?: StaffRole
  }

  let { role }: Props = $props()
</script>

<header
  class="sticky top-0 z-10 flex flex-wrap items-center gap-3 min-h-14 md:min-h-16 py-3 px-6 bg-white border-b border-zinc-200"
>
  <span class="flex flex-col gap-0.5 min-w-0">
    <span class="text-base font-bold leading-tight whitespace-nowrap">
      {#if role}
        <span class="flex items-center gap-1.5">
          <a class="flex items-center gap-1 font-medium text-zinc-600" href="/">
            <ArrowLeft class="size-4" />Home
          </a>
          <span class="text-zinc-300" aria-hidden="true">/</span>
          <span class="text-zinc-950">{STATION_NAMES[role]}</span>
        </span>
      {:else}
        <span class="tracking-tight">
          Beachside
          <span class="font-normal text-zinc-500">Racetrack</span>
        </span>
      {/if}
    </span>
    <span
      class="flex items-center gap-1.5 text-sm whitespace-nowrap {line.muted
        ? 'text-zinc-400'
        : 'text-zinc-600'}"
    >
      <span
        class="flex size-3 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        {#if line.indicator.kind === 'spinner'}
          <LoaderCircle
            class="size-3 animate-spin motion-reduce:animate-none"
          />
        {:else if line.indicator.kind === 'flag'}
          <CheckeredFlag class="size-3" />
        {:else if line.indicator.kind === 'ring'}
          <span
            class="size-1.75 rounded-full border-[1.5px] border-zinc-500"
          ></span>
        {:else}
          <span class="size-1.75 rounded-full {line.indicator.color}"></span>
        {/if}
      </span>
      <span>
        {line.text}
        {#if line.time}
          · <span class="font-mono tabular-nums">{line.time}</span>
        {/if}
      </span>
    </span>
  </span>
  <StatusBar />
</header>
