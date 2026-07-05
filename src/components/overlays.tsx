import { forwardRef, useEffect, useRef } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { CONSOLE_URL, EXPLORER_URL, GLYPH_PATH, HEADLINE, LEAVE_EVENT, SOCIALS, WALLET_URL } from "../lib/config";

gsap.registerPlugin(TextPlugin);

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
export function RotatingHeadline() {
  return (
    <motion.div id="rot-headline" className="headline" {...fade(0.3)}>
      <div className="line-clip">
        <span className="line display">{HEADLINE}</span>
      </div>
      <p id="hero-sub" className="sub">
        Send, request, and receive money without putting your balance, income, or payment history on
        display. Benzo gives every payment a private receipt you can prove when needed.
      </p>
      <OutroCtas />
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
          title="Demo balance — hover to preview, only you can do this"
          aria-label="Private balance, hidden. Hover to preview a demo amount."
        >
          {MASKED}
        </div>
        <div className="sub">Only you can see this</div>
      </motion.div>
    );
  },
);

export const ScrollHint = () => (
  <motion.div id="scroll-hint" className="xchrome hint" {...fade(0.7)} aria-hidden="true">
    Scroll to make it private
  </motion.div>
);

/** The two doors. Lives inside the footer; keeps the full send-off ceremony. */
export function OutroCtas() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const pills = Array.from(root.querySelectorAll<HTMLAnchorElement>("a.pill"));
    const cleanups: Array<() => void> = [];
    let leaving = false;

    for (const pill of pills) {
      // Magnetic pull toward the cursor (desktop only).
      if (fine && !reduced) {
        const onMove = (e: MouseEvent) => {
          if (leaving) return;
          const r = pill.getBoundingClientRect();
          gsap.to(pill, {
            x: (e.clientX - (r.left + r.width / 2)) * 0.16,
            y: (e.clientY - (r.top + r.height / 2)) * 0.28,
            duration: 0.4,
            ease: "power3.out",
          });
        };
        const onLeave = () => gsap.to(pill, { x: 0, y: 0, duration: 0.55, ease: "power3.out" });
        pill.addEventListener("mousemove", onMove);
        pill.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          pill.removeEventListener("mousemove", onMove);
          pill.removeEventListener("mouseleave", onLeave);
        });
      }

      // Send-off ceremony: the label admits what it's doing, petals scatter,
      // the violet wave carries the visitor through the door.
      const onClick = (e: MouseEvent) => {
        if (reduced || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        if (leaving) return;
        leaving = true;

        const label = pill.querySelector(".big");
        if (label) {
          gsap.to(label, { duration: 0.45, text: { value: "Opening privately…", type: "diff" }, ease: "sine.in" });
        }
        gsap.fromTo(pill, { scale: 0.97 }, { scale: 1, duration: 0.4, ease: "power3.out" });

        const r = root.getBoundingClientRect();
        const cx = (e.clientX || r.left + r.width / 2) - r.left;
        const cy = (e.clientY || r.top + r.height / 2) - r.top;
        const colors = ["#efeee9", "#c9b8f5", "#7342e2", "#9d81ec"];
        for (let i = 0; i < 14; i++) {
          const petal = document.createElement("span");
          petal.className = "petal";
          petal.style.left = `${cx}px`;
          petal.style.top = `${cy}px`;
          petal.style.background = colors[i % colors.length];
          root.appendChild(petal);
          const ang = (i / 14) * Math.PI * 2 + Math.random() * 0.5;
          const dist = 34 + Math.random() * 66;
          gsap.fromTo(
            petal,
            { scale: 0, rotation: Math.random() * 160 },
            {
              x: Math.cos(ang) * dist,
              y: Math.sin(ang) * dist + 42,
              scale: 0.5 + Math.random() * 0.8,
              rotation: "+=140",
              opacity: 0,
              duration: 0.55 + Math.random() * 0.35,
              ease: "power2.out",
              onComplete: () => petal.remove(),
            },
          );
        }

        window.dispatchEvent(new CustomEvent(LEAVE_EVENT, { detail: { href: pill.href } }));
      };
      pill.addEventListener("click", onClick);
      cleanups.push(() => pill.removeEventListener("click", onClick));
    }

    // bfcache restore: un-latch the ceremony and restore the door labels.
    const originalLabels = pills.map((pill) => pill.querySelector(".big")?.textContent ?? "");
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      leaving = false;
      pills.forEach((pill, i) => {
        const label = pill.querySelector(".big");
        if (label) label.textContent = originalLabels[i];
        gsap.set(pill, { clearProps: "transform" });
      });
    };
    window.addEventListener("pageshow", onPageShow);
    cleanups.push(() => window.removeEventListener("pageshow", onPageShow));

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <div ref={rootRef} id="hero-ctas" className="ctas">
      <a className="pill primary" href={WALLET_URL}>
        <span className="stack">
          <span className="kicker">Personal</span>
          <span className="big display">Open wallet</span>
        </span>
        <span className="arrow" aria-hidden="true">
          →
        </span>
      </a>
      <a className="pill secondary" href={CONSOLE_URL}>
        <span className="stack">
          <span className="kicker">Business</span>
          <span className="big display">Open console</span>
        </span>
        <span className="arrow" aria-hidden="true">
          →
        </span>
      </a>
    </div>
  );
}
