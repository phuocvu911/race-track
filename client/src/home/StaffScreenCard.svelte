<script lang="ts">
  import { ArrowRight, Lock } from '@lucide/svelte'
  import type { Component } from 'svelte'

  interface Props {
    title: string
    href: string
    icon: Component
    desc: string
    persona: string
  }

  let { title, href, icon: Icon, desc, persona }: Props = $props()
</script>

<a
  class="flex flex-col gap-5 pt-6 px-6 pb-5 bg-white border border-solid border-gray-200 rounded-2xl box-border"
  {href}
  aria-label="Go to {title}"
>
  <span class="flex flex-col gap-3 flex-1">
    <span class="flex items-center gap-3.5">
      <span
        class="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-none"
        aria-hidden="true"
      >
        <Icon class="size-6 stroke-neutral-900" />
      </span>
      <span class="flex flex-col gap-0.5">
        <span class="text-xl font-semibold">{title}</span>
        <span class="text-sm text-gray-600">{persona}</span>
      </span>
    </span>
    <span class="text-base text-gray-600 text-pretty">{desc}</span>
    <span
      class="pt-3.5 border-t border-solid border-gray-100 flex items-center gap-2 text-sm text-gray-600 mt-auto"
    >
      <Lock class="size-3.5" />
      Locked
      <span
        class="ml-auto flex items-center gap-1 flex-none text-zinc-500 font-medium"
        aria-hidden="true"
      >
        Unlock
        <ArrowRight class="size-4" />
      </span>
    </span>
  </span>
</a>
