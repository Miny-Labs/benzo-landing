import { forwardRef, useEffect, useRef } from "react";
import { motion } from "motion/react";
import HeroDoors from "./HeroDoors";
import { EXPLORER_URL, GLYPH_PATH, HEADLINE, SOCIALS } from "../lib/config";

const EASE = [0.25, 0.1, 0.25, 1] as const;
// When the page loads already scrolled (reload mid-page, bfcache), skip entry
// animations entirely so Motion never fights the scroll ticker over opacity.
const startedScrolled = () => typeof window !== "undefined" && window.scrollY > 2;
const rise = (delay: number) =>
  startedScrolled()
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: EASE, delay },
      };
const fade = (delay: number) =>
  startedScrolled()
    ? { initial: false as const }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.6, ease: EASE, delay },
      };

export function BrandMark() {
  return (
    <motion.div id="brand-mark" className="xchrome brand" {...rise(0)}>
      <svg viewBox="0 0 256 256" fill="#fff" role="img" aria-label="Benzo">
        <path d={GLYPH_PATH} />
      </svg>
      <span className="word display">Benzo</span>
    </motion.div>
  );
}

export function HeaderNav() {
  return (
    <motion.nav id="site-nav" className="xchrome nav" {...rise(0.15)} aria-label="Site">
      <a className="about" href={SOCIALS.github} target="_blank" rel="noreferrer">
        GitHub
      </a>
      <div className="links">
        <a href={EXPLORER_URL} target="_blank" rel="noreferrer">
          [ Testnet ]
        </a>
      </div>
    </motion.nav>
  );
}

/** Hero block: title, subtitle, and the doors in one composed unit. */
export function HeroBlock() {
  return (
    <motion.div id="hero-block" className="headline" {...fade(0.3)}>
      <div className="title-box">
        <span className="line display">{HEADLINE}</span>
      </div>
      <p id="hero-sub" className="sub">
        Send, request, and receive money without putting your balance, income, or payment history on
        display. Benzo gives every payment a private receipt you can prove when needed.
      </p>
      <HeroDoors />
    </motion.div>
  );
}

const MASKED = "$•••••";
const REVEALED = "$8,214";
const GLYPHS = "█▓▒░•§#%¤";

export const BalanceInfo = forwardRef<HTMLDivElement, { symbolRef: React.Ref<HTMLSpanElement> }>(
  function BalanceInfo({ symbolRef }, ref) {
    const amountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const el = amountRef.current!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let timer: number | null = null;
      let shown = false;

      const scrambleTo = (target: string) => {
        if (reduced) {
          el.textContent = target;
          return;
        }
        if (timer) window.clearInterval(timer);
        let frame = 0;
        const totalFrames = 14;
        timer = window.setInterval(() => {
          frame++;
          const resolved = Math.floor((frame / totalFrames) * target.length);
          let out = "";
          for (let i = 0; i < target.length; i++) {
            out += i < resolved ? target[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          el.textContent = out;
          if (frame >= totalFrames && timer) {
            window.clearInterval(timer);
            timer = null;
            el.textContent = target;
          }
        }, 42);
      };

      const reveal = () => {
        shown = true;
        scrambleTo(REVEALED);
      };
      const hide = () => {
        shown = false;
        scrambleTo(MASKED);
      };
      const toggle = () => (shown ? hide() : reveal());

      el.addEventListener("mouseenter", reveal);
      el.addEventListener("mouseleave", hide);
      el.addEventListener("touchstart", toggle, { passive: true });
      return () => {
        if (timer) window.clearInterval(timer);
        el.removeEventListener("mouseenter", reveal);
        el.removeEventListener("mouseleave", hide);
        el.removeEventListener("touchstart", toggle);
      };
    }, []);

    return (
      <motion.div ref={ref} className="xchrome balance" {...fade(0.45)}>
        <div className="head">
          <div className="glyphcircle">
            <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">
              <circle cx="20" cy="20" r="18.75" stroke="#fff" strokeWidth="2.5" fill="none" />
            </svg>
            <span ref={symbolRef}>●</span>
          </div>
        </div>
        <div className="label display">
          Private
          <br />
          balance
        </div>
        <div
          ref={amountRef}
          className="amount display tnum"
          data-cursor
          title="Demo balance"
          aria-label="Private balance, hidden. Hover to preview a demo amount."
        >
          {MASKED}
        </div>
      </motion.div>
    );
  },
);

export const ScrollHint = () => (
  <motion.div id="scroll-hint" className="xchrome hint" {...fade(0.7)} aria-hidden="true">
    Scroll to see the magic
  </motion.div>
);
