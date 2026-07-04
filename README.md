# Benzo landing page

Scroll-driven landing page for [Benzo](https://github.com/Miny-Labs), private USDC payments on Stellar.
The protocol, wallet, and console live in the `stellar-benzo` repo.

## How the page works

One continuous scroll, three scenes:

1. **The sky.** The brand's hydrangea-sky film plays full bleed in a palindrome loop: the 12-second
   cut forward, then the same film reversed, so it never jump-cuts. A large cover line cycles through
   privacy statements. Hovering the masked `$•••••` balance de-scrambles it into a demo amount.
2. **The vault.** After one viewport of scroll, a deep-ink panel slides over the sky. Inside it,
   captioned still lifes of things that are nobody's business (your salary, your invoices, your books)
   scale in and out as they pass. The images were generated with gpt-image-2, style-anchored to a
   frame of the sky film so the whole page reads as one world.
3. **The footer.** An ink slide with an animated dot band, nav columns, an oversized wordmark, and the
   two doors: Open wallet and Open console. Clicking a door plays a short send-off. The label rewrites
   itself to "Opening privately…", petals scatter from the click point, and a violet wave sweeps up
   before the browser navigates.

All the fixed chrome uses `mix-blend-mode: exclusion`, which is why the same white type reads sepia
over the sky and cream over the vault.

## Stack

React 19, TypeScript, Vite 6, Tailwind CSS v4, GSAP (ScrollTrigger + TextPlugin), Motion 12.

Every visible layer is `position: fixed`; a spacer div defines the scroll length. A single
`gsap.ticker` loop drives card scaling, wrap translation, header fades, and the footer slide. The
vault entrance is a scrubbed ScrollTrigger.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck + production build to dist/
```

Optional env (defaults point at production): `VITE_WALLET_URL`, `VITE_CONSOLE_URL`.

## Assets

- `public/media/sky.mp4` and `sky-rev.mp4`: the brand film, re-encoded with a keyframe every six
  frames so seeking stays cheap, plus a reversed copy for the loop.
- `public/gallery/*.webp`: ten 1024x1536 stills in one visual family (cream paper, violet accents,
  soft morning light).

Reduced motion is respected throughout: no autoplay, no card scaling, no ceremony. The doors become
plain links.
