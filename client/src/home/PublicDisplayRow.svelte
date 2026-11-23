<script lang="ts">
  import { ChevronRight } from '@lucide/svelte'
  import type { Component } from 'svelte'

  interface Props {
    title: string
    href: string
    icon: Component
    desc: string
  }

  let { title, icon: Icon, href, desc }: Props = $props()
</script>

<a
  class="flex items-center gap-4 min-h-15 py-0 px-4 border-b border-gray-100"
  aria-label="Go to {title}"
  {href}
>
  <span
    class="w-9 h-9 rounded-lg bg-neutral-950 text-gray-100 flex items-center justify-center flex-none "
  >
    <Icon class="size-4"></Icon>
  </span>
  <span class="flex-1 flex flex-col">
    <span class="text-base font-semibold">{title}</span>
    <span class="text-sm text-gray-600">{desc}</span>
  </span>
  <ChevronRight class="text-zinc-400 size-4.5" />
</a>
