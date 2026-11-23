<script lang="ts">
  import { ArrowRight } from '@lucide/svelte'

  interface Props {
    title: string
    href: string
    desc: string
  }

  let { title, href, desc }: Props = $props()
</script>

<a
  class="flex flex-col gap-4 pt-3.5 px-3.5 pb-5 bg-white border border-solid border-gray-200 rounded-2xl"
  {href}
  aria-label="Go to {title}"
>
  <span
    class="aspect-video bg-neutral-950 rounded-xl p-3.5 box-border flex flex-col gap-2"
    aria-hidden="true"
  ></span>
  <span class="py-0 px-1.5 flex flex-col gap-1">
    <span class="text-xl font-semibold flex items-center justify-between gap-2">
      {title}
      <ArrowRight
        class="flex-none text-zinc-500 text-base size-4"
        aria-hidden="true"
      />
    </span>
    <span class="text-sm text-gray-600">{desc}</span>
  </span>
</a>
