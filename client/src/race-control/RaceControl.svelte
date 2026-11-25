<script lang="ts">
  import Header from '../lib/components/Header.svelte'
  import UnlockCard from '../lib/components/UnlockCard.svelte'
  import { race, unlock } from '../lib/socket.svelte'
</script>

<div class="min-h-dvh flex flex-col">
  <Header station="Race Control" />
  {#if race.role === 'race-control'}
    <h1>logged in as race-control</h1>
  {:else}
    <main class="flex-1 flex items-center justify-center px-4 pb-16">
      <UnlockCard
        station="Race Control"
        onunlock={(key) => unlock('race-control', key)}
      />
    </main>
  {/if}
</div>
