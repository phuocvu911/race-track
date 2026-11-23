<script lang="ts">
  import { Check, RotateCw, WifiOff } from '@lucide/svelte'
  import type { Component } from 'svelte'
  import { clock } from '../clock.svelte.js'
  import { type Connection, race } from '../socket.svelte.js'

  type Bar = {
    icon: Component<{ class?: string }>
    title: string
    titleShort?: string
    message: string
    messageShort?: string
    tone: 'dark' | 'blue'
  }

  const TONE: Record<Bar['tone'], { bar: string; message: string }> = {
    dark: { bar: 'bg-zinc-900', message: 'text-zinc-400' },
    blue: { bar: 'bg-blue-600', message: 'text-blue-100' },
  }

  const BARS: Record<Connection, Bar | null> = {
    idle: null,
    connecting: null,
    connected: null,
    denied: null,
    reconnecting: {
      icon: RotateCw,
      title: 'Reconnecting…',
      message: 'Race info may be out of date.',
      messageShort: 'Info may be out of date.',
      tone: 'dark',
    },
    unreachable: {
      icon: RotateCw,
      title: "Can't reach the race server.",
      titleShort: "Can't reach the server.",
      message: 'Retrying…',
      tone: 'dark',
    },
    offline: {
      icon: WifiOff,
      title: 'This device is offline.',
      titleShort: 'Device offline.',
      message: "Check the Wi-Fi. We'll reconnect automatically.",
      messageShort: 'Check the Wi-Fi.',
      tone: 'dark',
    },
  }

  const BACK_ONLINE_MS = 3000
  const BACK: Bar = {
    icon: Check,
    title: 'Back online.',
    message: 'Race info is up to date.',
    messageShort: 'Up to date.',
    tone: 'blue',
  }
  const showBack = $derived(
    race.reconnectedAt !== null &&
      clock.now - race.reconnectedAt < BACK_ONLINE_MS,
  )

  const bar = $derived(BARS[race.connection] ?? (showBack ? BACK : null))
</script>

<div role="status">
  {#if bar}
    {@const tone = TONE[bar.tone]}
    <div
      class="absolute top-full left-0 right-0 h-9 flex items-center gap-2 pr-2 pl-6 {tone.bar} text-zinc-50 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.15)] whitespace-nowrap"
    >
      <bar.icon class="size-3.5" />
      <b class="font-semibold">
        <span class="sm:hidden">{bar.titleShort ?? bar.title}</span>
        <span class="hidden sm:inline">{bar.title}</span>
      </b>
      <span class="{tone.message} truncate">
        <span class="sm:hidden">{bar.messageShort ?? bar.message}</span>
        <span class="hidden sm:inline">{bar.message}</span>
      </span>
    </div>
  {/if}
</div>
