import { useEffect, useRef } from "react";
import { GLYPH_PATH, LEAVE_EVENT } from "../lib/config";

const GLYPHS = "█▓▒░•";

/** Circled Benzo glyph that follows the pointer. Desktop only; exclusion-blended.
 *  Over the door card it turns into a label pill ("Open the wallet/console")
 *  that censors itself into cipher blocks the moment the door is clicked. */
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const tag = tagRef.current!;
    if (!window.matchMedia("(pointer: fine)").matches || window.innerWidth < 1024) return;

    let censorTimer: number | null = null;

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.classList.add("on");
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const tri = t.closest(".tri");
      el.classList.toggle("grow", !tri && !!t.closest("a, button, [data-cursor]"));
      // over the card the ring becomes the click prompt itself
      el.classList.toggle("tag", !!tri);
      if (tri && !censorTimer) {
        tag.textContent = tri.classList.contains("tri-p") ? "Open the wallet" : "Open the console";
      }
      // over the balance digits the cursor steps aside — the reveal is the feedback
      el.classList.toggle("quiet", !tri && !!t.closest(".balance .amount"));
    };
    const onLeave = () => el.classList.remove("on");
    // click: the prompt censors itself, left to right, like everything else here
    const onDoorClick = () => {
      const txt = tag.textContent || "";
      if (!txt || censorTimer) return;
      let frame = 0;
      const total = 8;
      censorTimer = window.setInterval(() => {
        frame++;
        const n = Math.ceil((frame / total) * txt.length);
        let out = "";
        for (let i = 0; i < txt.length; i++) {
          out += i < n ? (txt[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0]) : txt[i];
        }
        tag.textContent = out;
        if (frame >= total && censorTimer) window.clearInterval(censorTimer);
      }, 40);
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        if (censorTimer) window.clearInterval(censorTimer);
        censorTimer = null;
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener(LEAVE_EVENT, onDoorClick);
    window.addEventListener("pageshow", onPageShow);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      if (censorTimer) window.clearInterval(censorTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener(LEAVE_EVENT, onDoorClick);
      window.removeEventListener("pageshow", onPageShow);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span className="cursor-dot" />
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22.75" stroke="#fff" strokeWidth="2.5" />
        <g transform="translate(15.5 15.5) scale(0.0664)">
          <path d={GLYPH_PATH} fill="#fff" />
        </g>
      </svg>
      <span ref={tagRef} className="cursor-tag" />
    </div>
  );
}
