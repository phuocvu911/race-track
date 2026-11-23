<script lang="ts">
  import {
    Flag,
    Hourglass,
    List,
    Lock,
    Maximize,
    Monitor,
    SlidersHorizontal,
    Timer,
    UserPlus,
    Users,
  } from '@lucide/svelte'
  import type { ComponentProps } from 'svelte'

  import Header from '../lib/components/Header.svelte'
  import PublicDisplayCard from './PublicDisplayCard.svelte'
  import PublicDisplayRow from './PublicDisplayRow.svelte'
  import StaffScreenCard from './StaffScreenCard.svelte'

  type StaffScreen = ComponentProps<typeof StaffScreenCard>
  type PublicDisplay = ComponentProps<typeof PublicDisplayRow>

  const staffScreens: StaffScreen[] = [
    {
      title: 'Front Desk',
      href: '/front-desk',
      icon: UserPlus,
      desc: 'Set up sessions and register drivers.',
      persona: 'Receptionist',
    },
    {
      title: 'Race Control',
      href: '/race-control',
      icon: SlidersHorizontal,
      desc: 'Start races and set the flag.',
      persona: 'Safety Official',
    },
    {
      title: 'Lap-line Tracker',
      href: '/lap-line-tracker',
      icon: Timer,
      desc: 'Tap each car as it passes the line.',
      persona: 'Lap-Line Observer',
    },
  ]

  const publicDisplays: PublicDisplay[] = [
    {
      title: 'Leaderboard',
      href: '/leader-board',
      icon: List,
      desc: 'Fastest laps, live.',
    },
    {
      title: 'Next Race',
      href: '/next-race',
      icon: Users,
      desc: 'Who drives which car next.',
    },
    {
      title: 'Race Countdown',
      href: '/race-countdown',
      icon: Hourglass,
      desc: 'Time left in the race.',
    },
    {
      title: 'Race Flags',
      href: '/race-flags',
      icon: Flag,
      desc: 'The current race flag.',
    },
  ]
</script>

<Header />
<main class="max-w-300 m-auto pt-14 px-8 pb-20 flex flex-col gap-14">
  <section class="flex flex-col gap-3">
    <h1 class="m-0 font-semibold text-5xl tracking-tight text-balance">
      Where are you working today?
    </h1>
    <p class="m-0 max-w-2xl text-lg text-gray-600 text-pretty">
      Choose what this device shows.
    </p>
  </section>
  <section class="flex flex-col gap-5" aria-labelledby="staff-h">
    <div class="flex items-baseline justify-between gap-4 flex-wrap">
      <h2
        class="m-0 text-base font-semibold uppercase tracking-widest text-gray-600"
      >
        Staff screens
      </h2>

      <span class="flex items-center gap-1.5 text-sm text-gray-600">
        <Lock class="size-4" />
        Access key required
      </span>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {#each staffScreens as screen}
        <StaffScreenCard {...screen} />
      {/each}
    </div>
  </section>
  <section class="flex flex-col gap-5">
    <div class="flex align-baseline justify-between gap-4 flex-wrap">
      <h2
        class="m-0 text-base font-semibold uppercase tracking-widest text-gray-600"
      >
        Public displays
      </h2>
      <span class="hidden md:flex items-center gap-1.5 text-sm text-gray-600">
        <Maximize class="size-4" />
        Open on a smart display, then press Full screen
      </span>
      <span class="md:hidden flex items-center gap-1.5 text-sm text-gray-600">
        <Monitor class="size-4" />
        For the big screens
      </span>
    </div>
    <div class="hidden md:grid grid-cols-1 md:grid-cols-4 gap-5">
      {#each publicDisplays as display}
        <PublicDisplayCard {...display} />
      {/each}
    </div>
    <div
      class="md:hidden bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col"
    >
      {#each publicDisplays as display}
        <PublicDisplayRow {...display} />
      {/each}
    </div>
  </section>
</main>
