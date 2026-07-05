import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CONSOLE_URL, LEAVE_EVENT, WALLET_URL } from "../lib/config";

const SCRAMBLE = "█▓▒░•§#%¤";

const CONTENT = {
  personal: {
    kicker: "For you",
    title: "The wallet",
    points: [
      "Send to @handles, as easy as texting",
      "Your balance and history stay yours",
      "Cash in, cash out, split anything",
      "Every payment gets a provable receipt",
    ],
  },
  business: {
    kicker: "For your team",
    title: "The console",
    points: [
      "Run payroll without leaking salaries",
      "Pay invoices, keep the terms private",
      "Treasury with totals you can prove",
      "Give auditors exactly what they need",
    ],
  },
} as const;
type DoorKey = keyof typeof CONTENT;

/**
 * The two doors as one square: Personal and Business are two triangles that
 * meet on the diagonal. Hovering a triangle lets it claim more of the square
 * (the seam slides), the whole square follows the cursor magnetically, and a
 * feature panel decrypts into the open sky on the right. Clicking runs the
 * petal send-off and the violet wave.
 */
export default function HeroDoors() {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<DoorKey | null>(null);
  const hideTimer = useRef<number | null>(null);

  // magnetic square + click ceremony
  useEffect(() => {
    const root = rootRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const cleanups: Array<() => void> = [];
    let leaving = false;

    if (fine && !reduced) {
      const onMove = (e: MouseEvent) => {
        if (leaving) return;
        const r = root.getBoundingClientRect();
        gsap.to(root, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.14,
          y: (e.clientY - (r.top + r.height / 2)) * 0.18,
          duration: 0.4,
          ease: "power3.out",
        });
      };
      const onLeave = () => gsap.to(root, { x: 0, y: 0, duration: 0.55, ease: "power3.out" });
      root.addEventListener("mousemove", onMove);
      root.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        root.removeEventListener("mousemove", onMove);
        root.removeEventListener("mouseleave", onLeave);
      });
    }

    for (const door of Array.from(root.querySelectorAll<HTMLAnchorElement>("a.tri"))) {
      const onClick = (e: MouseEvent) => {
        if (reduced || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        if (leaving) return;
        leaving = true;

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
        window.dispatchEvent(new CustomEvent(LEAVE_EVENT, { detail: { href: door.href } }));
      };
      door.addEventListener("click", onClick);
      cleanups.push(() => door.removeEventListener("click", onClick));
    }

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) leaving = false;
    };
    window.addEventListener("pageshow", onPageShow);
    cleanups.push(() => window.removeEventListener("pageshow", onPageShow));

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // feature panel: decrypting title + masked rows sliding up
  useEffect(() => {
    const panel = panelRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!active) {
      gsap.killTweensOf(panel);
      gsap.to(panel, { autoAlpha: 0, duration: 0.22, ease: "power1.out" });
      return;
    }
    const rows = panel.querySelectorAll<HTMLElement>(".dp-row");
    const title = panel.querySelector<HTMLElement>(".dp-title");
    gsap.killTweensOf([panel, ...Array.from(rows)]);
    gsap.set(panel, { autoAlpha: 1 });
    if (reduced || !title) return;

    // title decrypts in
    const target = CONTENT[active].title;
    let frame = 0;
    const total = 10;
    const id = window.setInterval(() => {
      frame++;
      const resolved = Math.floor((frame / total) * target.length);
      let out = "";
      for (let i = 0; i < target.length; i++) {
        out += i < resolved ? target[i] : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
      }
      title.textContent = out;
      if (frame >= total) {
        window.clearInterval(id);
        title.textContent = target;
      }
    }, 34);

    gsap.fromTo(
      rows,
      { yPercent: 130 },
      { yPercent: 0, duration: 0.55, ease: "power3.out", stagger: 0.06 },
    );
    return () => window.clearInterval(id);
  }, [active]);

  const enter = (key: DoorKey) => () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    setActive(key);
  };
  const leave = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setActive(null), 140);
  };

  const content = active ? CONTENT[active] : null;

  return (
    <>
      <div ref={rootRef} id="hero-ctas" className="doors" onMouseLeave={leave}>
        <a className="tri tri-p" href={WALLET_URL} onMouseEnter={enter("personal")} aria-label="Personal — open the wallet">
          <span className="t-label">
            <span className="t-word display">Personal</span>
            <span className="t-sub">The wallet ↗</span>
          </span>
        </a>
        <a className="tri tri-b" href={CONSOLE_URL} onMouseEnter={enter("business")} aria-label="Business — open the console">
          <span className="t-label">
            <span className="t-word display">Business</span>
            <span className="t-sub">The console ↗</span>
          </span>
        </a>
      </div>

      <div ref={panelRef} className="door-panel" aria-hidden={!active}>
        {content && (
          <>
            <p className="dp-kicker">{content.kicker}</p>
            <h3 className="dp-title display">{content.title}</h3>
            {content.points.map((p) => (
              <div className="dp-clip" key={p}>
                <p className="dp-row">
                  <span className="dp-dash" aria-hidden="true">
                    —
                  </span>
                  {p}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
