<script lang="ts">
  import Header from '../lib/components/Header.svelte'
  import StaffGate from '../lib/components/StaffGate.svelte'
  import type { StaffRole } from '../lib/socket.svelte.js'

  const role: StaffRole = 'race-control'
</script>

<div class="min-h-dvh flex flex-col">
  <Header {role} />
  <StaffGate {role}>
    <h1>Hello, Safety Official!</h1>
  </StaffGate>
</div>
