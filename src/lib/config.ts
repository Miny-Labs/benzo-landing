// The apps aren't public yet — the doors lead to the under-construction page.
export const WALLET_URL = import.meta.env.VITE_WALLET_URL ?? "/construction?door=wallet";
export const CONSOLE_URL = import.meta.env.VITE_CONSOLE_URL ?? "/construction?door=console";

export const SOCIALS = {
  x: "https://x.com/MansiVe61115132",
  github: "https://github.com/Miny-Labs",
  linkedin: "https://www.linkedin.com/in/mansi-verma-4794a4328/",
};

/** Live shielded pool contract on Stellar testnet (from stellar-benzo deployments). */
export const EXPLORER_URL =
  "https://stellar.expert/explorer/testnet/contract/CB4VS4OCF6HEGCLSPM4E3ILNGP4KF5ZJ7JEXUJIJBUU5IZC2VPDVSJOT";

/** Fired when a door CTA is clicked; TransitionWave listens and navigates. */
export const LEAVE_EVENT = "benzo:leave";

/** The hero cover line. */
export const HEADLINE = "Privacy with receipts.";

/** Benzo brand glyph (from stellar-benzo apps/landing). */
export const GLYPH_PATH =
  "M 64 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 L 128 64 L 128 64.5 L 161 32 L 192 0 L 256 0 L 256 64 L 192 128 L 128 128 L 128 192 L 96 223 L 63.5 256 L 0 256 L 0 192 Z M 256 192 L 224 223 L 191.5 256 L 128 256 L 128 192 L 192 128 L 256 128 Z";

export const GALLERY_IMAGES = Array.from({ length: 10 }, (_, i) => ({
  src: `/gallery/${String(i + 1).padStart(2, "0")}.webp`,
  alt: [
    "A sealed cream envelope with a violet wax seal",
    "A receipt with its lines quietly redacted",
    "A pay envelope with banknotes tucked inside",
    "A stack of invoices tied with violet ribbon",
    "A single coin standing on its edge",
    "A small padlock resting on folded ledger pages",
    "Two coffee cups with a folded note between them",
    "A paper crane standing among scattered coins",
    "A linen curtain drawn across a bright window",
    "A tiny cream safe with a violet dial, slightly open",
  ][i],
  caption: [
    "Your salary",
    "Your receipts",
    "Your payday",
    "Your invoices",
    "Your savings",
    "Your balance",
    "Your dinner split",
    "Your gifts",
    "Your home",
    "Your books",
  ][i],
}));
