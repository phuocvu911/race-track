<script lang="ts">
  import {
    CircleExclamationPoint,
    Eye,
    EyeOff,
    LoaderCircle,
    Lock,
  } from '@lucide/svelte'
  import { tick } from 'svelte'

  let key = $state('')
  let showKey = $state(false)
  let checking = $state(false)
  let error = $state(false)
  let input = $state<HTMLInputElement>()

  interface Props {
    station: string
    onunlock: (key: string) => Promise<boolean>
  }

  let { station, onunlock }: Props = $props()

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    if (checking || key.trim() === '') return
    checking = true

    error = !(await onunlock(key))
    checking = false

    if (error) {
      await tick()
      input?.select()
    }
  }
</script>

<form
  class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 flex flex-col gap-5"
  onsubmit={handleSubmit}
>
  <div class="flex items-center gap-3.5">
    <span
      class="size-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center flex-none"
      aria-hidden="true"
    >
      <Lock class="size-4" />
    </span>
    <div class="flex flex-col gap-0.5">
      <h1 class="text-[22px]/tight font-semibold">Unlock {station}</h1>
      <p class="text-sm text-zinc-500">Enter the access key to continue.</p>
    </div>
  </div>
  <div class="flex flex-col gap-2">
    <label class="text-sm font-medium" for="key">Access key</label>
    <div
      class={[
        'flex items-center h-11 rounded-xl border bg-white pl-3 pr-1 shadow-xs transition duration-150',
        error
          ? 'border-red-700 ring-3 ring-red-700/12'
          : 'border-zinc-200 focus-within:border-zinc-950 focus-within:ring-3 focus-within:ring-zinc-950/10',
      ]}
    >
      <input
        class="flex-1 min-w-0 border-none outline-none font-medium text-base font-mono text-zinc-950 bg-transparent"
        id="key"
        bind:value={key}
        bind:this={input}
        type={showKey ? 'text' : 'password'}
        disabled={checking}
        autocomplete="current-password"
        enterkeyhint="go"
        placeholder="••••••••"
        oninput={() => (error = false)}
        aria-invalid={error}
        aria-describedby="key-help"
      />
      <button
        type="button"
        class="size-9 border-0 rounded-lg bg-transparent text-zinc-500 cursor-pointer flex items-center justify-center"
        onclick={() => (showKey = !showKey)}
        aria-label={showKey ? 'Hide key' : 'Show key'}
      >
        {#if showKey}
          <EyeOff class="size-4.5" strokeWidth={1.8} />
        {:else}
          <Eye class="size-4.5" strokeWidth={1.8} />
        {/if}
      </button>
    </div>
    {#if error}
      <p
        class="text-sm flex items-center gap-1.5 text-red-700"
        id="key-help"
        role="alert"
      >
        <CircleExclamationPoint class="size-4" />
        That key didn’t work. Check it with your shift lead.
      </p>
    {:else}
      <p class="text-sm text-zinc-500" id="key-help">
        Keys are case-sensitive.
      </p>
    {/if}
  </div>
  <button
    class={[
      'h-11 rounded-xl text-zinc-50 text-sm flex items-center justify-center gap-2',
      checking ? 'bg-zinc-600' : 'bg-zinc-950 cursor-pointer',
    ]}
    type="submit"
    aria-disabled={checking}
  >
    {#if checking}
      <LoaderCircle class="size-4 animate-spin motion-reduce:animate-none" />
      Checking…
    {:else}
      Unlock
    {/if}
  </button>
  <p
    class="pt-4 border-t border-zinc-100 text-sm/normal text-zinc-500 text-balance text-center"
  >
    Locks automatically after 30 minutes without use.
  </p>
</form>
