import { useEffect, useRef } from "react";
import { GLYPH_PATH } from "../lib/config";

/** Circled Benzo glyph that follows the pointer. Desktop only; exclusion-blended. */
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (!window.matchMedia("(pointer: fine)").matches || window.innerWidth < 1024) return;

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.classList.add("on");
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      el.classList.toggle("grow", !!t.closest("a, button, [data-cursor]"));
      // over the door card and the balance digits the ring steps aside —
      // the highlight and the reveal are the feedback there
      el.classList.toggle("quiet", !!t.closest(".tri, .balance .amount"));
    };
    const onLeave = () => el.classList.remove("on");

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22.75" stroke="#fff" strokeWidth="2.5" />
        <g transform="translate(15.5 15.5) scale(0.0664)">
          <path d={GLYPH_PATH} fill="#fff" />
        </g>
      </svg>
    </div>
  );
}
