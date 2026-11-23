export const clock = $state({ now: Date.now() })
setInterval(() => (clock.now = Date.now()), 1000)
