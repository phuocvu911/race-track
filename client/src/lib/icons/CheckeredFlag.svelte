<script lang="ts">
  let { class: className = '' }: { class?: string } = $props()
</script>

<svg viewBox="0 0 12 12" class={className} aria-hidden="true">
  <path
    d="M2 1v10.5"
    stroke="currentColor"
    stroke-width="1.3"
    stroke-linecap="round"
  />
  <rect
    x="2.5"
    y="1.5"
    width="8"
    height="6"
    fill="white"
    stroke="currentColor"
    stroke-width="0.6"
  />
  <path
    d="M2.5 1.5h2v2h-2zM6.5 1.5h2v2h-2zM4.5 3.5h2v2h-2zM8.5 3.5h2v2h-2zM2.5 5.5h2v2h-2zM6.5 5.5h2v2h-2z"
    fill="currentColor"
  />
</svg>
