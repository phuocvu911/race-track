<script lang="ts">
  import type { Snippet } from 'svelte'
  import { race, type StaffRole, unlock } from '../socket.svelte.js'
  import { STATION_NAMES } from '../stations.js'
  import UnlockCard from './UnlockCard.svelte'

  interface Props {
    role: StaffRole
    children: Snippet
  }

  let { role, children }: Props = $props()
</script>

{#if race.role === role}
  {@render children()}
{:else}
  <main class="flex-1 flex items-center justify-center px-4 pb-16">
    <UnlockCard
      station={STATION_NAMES[role]}
      onunlock={(key) => unlock(role, key)}
    />
  </main>
{/if}
