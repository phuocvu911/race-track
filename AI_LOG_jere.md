# AI log

## 1. Shared types for the race state

- **Asked:** TypeScript types for the data the server sends in `race:state` (`Mode`, `SessionStatus`, `Driver`, `Session`, `RaceState`, `ServerToClientEvents`), based on `publicState()` in `src/state.js`.
- **Kept:** the whole file as `client/src/lib/types.ts`, including the JSDoc comments on fields whose names don't tell the whole story.
- **Changed or rejected:** nothing yet.

## 2. Doc comment for the `Connection` type

- **Asked:** whether `Connection` in `socket.svelte.ts` should have a comment, and how to word it.
- **Kept:** a one-line JSDoc above the type, so it shows on hover in the Header, while the inline `//` comments on each value stay.
- **Changed or rejected:** AI suggested "Where this page's socket connection is at". I changed it to "The status of this page's socket connection", which fits how the Header shows it. Left out the optional "Only set by this module" part.

## 3. Cleaning up the exported checkered flag SVG

- **Asked:** simplify the SVG exported from the design into `lib/icons/CheckeredFlag.svelte`, so it can be recoloured and used like a Lucide icon in the header.
- **Kept:** AI's cleaned version: `viewBox="0 0 12 12"`, the three shapes (pole, flag outline, dark squares) in `currentColor`, and `aria-hidden="true"` on the `<svg>`.
- **Changed or rejected:** AI removed the export leftovers: the empty `<g />`s and `<defs />`, the canvas-offset `viewBox` and `transform`, the mask and its `id`s, the unused `color` attributes and the fixed `width`/`height`.

## 4. Connection states in the socket's error handlers

- **Asked:** the `connect_error` and `disconnect` handlers in `socket.svelte.ts`, so they set the right `Connection` state instead of always `'offline'`.
- **Kept:** `isNetworkError()` (the `'type' in err && err.type === 'TransportError'` check), and the order of the checks in `connect_error`: no network → `'offline'`, rejected by the server → `'denied'`, never connected → `'unreachable'`, otherwise `'reconnecting'`. `disconnect` sets `'reconnecting'`, or `'offline'` when the browser has no network.
- **Changed or rejected:** I'd already written the `hasConnected` flag and `'connecting'` before `io()` myself; AI only filled in the two handlers.

## 5. Updating the comments in the socket module

- **Asked:** fix the comments in `socket.svelte.ts` after adding the 4-second grace period.
- **Kept:** the `Role` comment now says it's the role sent in `auth` (not a Socket.IO namespace), `connecting`/`reconnecting`/`unreachable` describe what the code actually does, and `CONNECT_GRACE_MS` got a one-line comment.
- **Changed or rejected:** nothing. The old `unreachable` comment promised "reconnecting for too long", which isn't implemented, so it was shortened instead of building that.

## 6. Short phone texts for the status bar

- **Asked:** take the short titles and messages from the phone design board and add them to `StatusBar.svelte`.
- **Kept:** the short texts (`Can't reach the server.`, `Device offline.` / `Check the Wi-Fi.`, `Info may be out of date.`, `Up to date.`) and the message markup that shows the short version below the `sm` breakpoint, like the title markup I'd already written.
- **Changed or rejected:** skipped the separate tablet text, since the full text fits at 834 px. Short versions that would be identical to the long ones were left out, so they fall back to the normal text.

## 7. Line height in the unlock card

- **Asked:** why the gap between the heading and the subtitle in `UnlockCard.svelte` was much bigger than in the design.
- **Kept:** the explanation: arbitrary sizes like `text-[22px]` only set the font size, so the text inherits Tailwind's `line-height: 1.5`, while the design uses the browser default (about 1.2). I changed the heading to `text-[22px]/tight` and the subtitle to `text-sm`, which comes with its own line height.
- **Changed or rejected:** nothing yet. AI also listed other differences from the board (icon size, card width, corner radius), which I haven't applied.

## 8. Focus state for the access key field

- **Asked:** read the latest Staff unlock board and add its "typing" (focused) state to the key field in `UnlockCard.svelte`.
- **Kept:** `focus-within:border-zinc-950` and `focus-within:ring-3 focus-within:ring-zinc-950/10` on the box around the input, with `transition duration-150`, matching the board's dark border and 3 px soft ring. This also gives keyboard users a visible focus, since the input itself has `outline-none`.
- **Changed or rejected:** only the focused state was added. The board's error state (red border and ring) and checking state (grey button, spinner, "Checking…") are left for when the card gets its `error` and `pending` props.

## 9. `adopt()` in the socket module

- **Asked:** a function `adopt` that takes a socket made by `create`, removes the current socket's listeners if there is one, closes it, and makes the input socket the page's socket.
- **Kept:** `adopt(next)` doing exactly that, with the listeners removed before `close()` so closing the old socket doesn't trigger the "reconnecting" state.
- **Changed or rejected:** nothing. Moving the event listeners into `adopt` and using `create`/`adopt` in `connect` is still for me to do.

## 10. `unlock()` in the socket module

- **Asked:** an `unlock(role, key)` function that tries the key on a socket made with `create`, adopts it with `adopt` when it connects, sets `race.connection` to `'connected'`, and returns a `Promise<boolean>` that resolves `false` when the server rejects the key.
- **Kept:** that function, using `once` listeners on the attempt so they only answer this one try. Network errors don't settle the Promise: Socket.IO keeps retrying and it settles when the server answers. Also a `role` field in `race` (starts as `'public'`), set by `adopt`, which now takes the role as a second parameter, so a page knows when the server has accepted its staff key.
- **Changed or rejected:** nothing.

## 11. Red error state for the access key box

- **Asked:** make the input box in `UnlockCard.svelte` red when the key is rejected via tailwind classes.
- **Kept:** the `class={[…]}` array with the shared classes first and a ternary on `error`: `border-red-700 ring-3 ring-red-700/12` for the error, the grey border and dark focus ring otherwise. Values taken from the Staff unlock board.
- **Changed or rejected:** nothing.

## 12. Code review of the unlock card

- **Asked:** a code review of `UnlockCard.svelte` once submitting, the checking state and the error state were in.
- **Kept:** the findings I acted on: the error message had no `role="alert"`, and once added it was on the icon instead of the `<p>`, so screen readers wouldn't announce the message. Moved it to the `<p>`. The review also suggested selecting the key again after a failed attempt, which became entry 13.
- **Changed or rejected:** nothing.

## 13. Selecting the key again after a failed attempt

- **Asked:** how to let the user retype straight away after a rejected key.
- **Kept:** `bind:this` on the input, and after a failed `onunlock`: `await tick()` then `input?.select()`. `tick()` is needed because the input is still disabled until Svelte has applied `checking = false` to the page, and a disabled input can't take focus.
- **Changed or rejected:** nothing. Also added `role="alert"` to the error message, which AI pointed out was missing.

## 14. Biome false positive on the `bind:this` variable

- **Asked:** whether Biome's `noUnassignedVariables` warning on `input` in `UnlockCard.svelte` can be fixed.
- **Kept:** the explanation that it's a false positive (Biome only reads the `<script>` and doesn't see `bind:this` in the markup assigning it), and the fix `let input = $state<HTMLInputElement>()`, which AI checked Biome accepts.
- **Changed or rejected:** chose `$state` over an explicit `= undefined`, and didn't use a `biome-ignore` comment.

## 15. `StaffGate` for all staff stations

- **Asked:** whether to copy the unlock block from race control into the other staff pages or make it a component, how `{@render children()}` and the `Snippet` type work, and a review of the result.
- **Kept:** a `StaffGate` component with `role` and `children` props that shows the station once `race.role` matches and the unlock card otherwise, so the role is written once per page. AI's explanation of snippets (the content between the tags, passed as `children`) and that the frontend can't be hidden, since the server ignores commands from sockets without the key.
- **Changed or rejected:** AI suggested renaming the card to `UnlockScreen` and moving `<main>` into it; I kept `UnlockCard` as the form and put `<main>` in the gate instead. Skipped lazy-loading the station code.

## 16. Station names in one lookup

- **Asked:** whether a lookup for the station names is worth it with only three fixed stations, how to name it, and reviews of the result.
- **Kept:** `STATION_NAMES: Record<StaffRole, string>` in `lib/stations.ts`, since the lock menu will need to turn roles from storage into names anyway. `StaffGate` and the Header now take only a `role` (the Header's is optional, so Home keeps the brand) and look the name up. The `UPPER_CASE` name follows the project's other module-level constants.
- **Changed or rejected:** I declared the role once per page (`const role: StaffRole`) and passed it with `{role}` to both components, instead of writing it twice.

## 17. Front desk and lap-line tracker pages

- **Asked:** copy the race control page structure to the front desk and lap-line tracker, add them to `vite.config.js`, with "Receptionist" and "Lap-line Observer" in the placeholder headings.
- **Kept:** for each, the HTML entry (`client/<page>/index.html`), `main.ts` calling `connect` with its role, the page component with its `const role` inside `StaffGate`, and the build input. AI checked that the build now contains all four pages.
- **Changed or rejected:** nothing. While testing, AI found that all three keys in my local `.env` were the same, so every station accepted every key; not a code problem, all three keys in my local .env are the same on purpose for convenience; with different keys each station accepts only its own.

## 18. Unlock card and the phone keyboard

- **Asked:** make the unlock card dock above the phone keyboard ("centred, docks to keyboard" from the sketches), then fix the page staying scrolled down after the keyboard closes on iOS, and make that scroll smooth.
- **Kept:** `onblur={() => window.scrollTo({ top: 0, behavior: 'smooth' })}` on the key input, so the header comes back into view when the keyboard closes. I kept it always smooth: it undoes the scroll iOS did itself and moves together with the keyboard, so it isn't extra decorative motion.
- **Changed or rejected:** rejected AI's docking code (a `visualViewport` module plus a `StaffGate` layout change): testing on my iPhone showed Safari already scrolls the field and button above the keyboard on its own. Also skipped the reduced-motion check AI suggested, for the reason above.

## 19. White status bar area on phones

- **Asked:** make the area around the phone's notch white like the header instead of the grey page background, and add it to every page.
- **Kept:** `<meta name="theme-color" content="#ffffff" />` in the `<head>` of all four page entries (home and the three stations).
- **Changed or rejected:** `theme-color` alone didn't work on my iPhone, since newer Safari takes the colour from a fixed or sticky element at the top instead. So the header is now `sticky top-0` (replacing `relative`), which also keeps the race status and the connection bar visible while scrolling. `theme-color` stays for Chrome on Android.
