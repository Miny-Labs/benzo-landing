import { useEffect, useRef } from "react";
import gsap from "gsap";

const HEX = "0123456789abcdef";
const SCRAMBLE = "█▓▒░•§#%¤";
const MASK = "$•••••";
const IDLE_CAPTION = "· · · · · · · ·";
const DONE_CAPTION = "0x••••••••";
const BASE = 1067;
const AMOUNT = 120;
const fmt = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

/** Masked amount: shows bullets, scrambles to the real value on hover/tap. */
function maskable(el: HTMLElement, getValue: () => string, reduced: boolean) {
  let timer: number | null = null;
  let shown = false;
  const scrambleTo = (target: string) => {
    if (reduced) {
      el.textContent = target;
      return;
    }
    if (timer) window.clearInterval(timer);
    let frame = 0;
    const total = 12;
    timer = window.setInterval(() => {
      frame++;
      const resolved = Math.floor((frame / total) * target.length);
      let out = "";
      for (let i = 0; i < target.length; i++) {
        out += i < resolved ? target[i] : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
      }
      el.textContent = out;
      if (frame >= total && timer) {
        window.clearInterval(timer);
        timer = null;
        el.textContent = target;
      }
    }, 40);
  };
  const reveal = () => {
    shown = true;
    scrambleTo(getValue());
  };
  const hide = () => {
    shown = false;
    scrambleTo(MASK);
  };
  const toggle = () => (shown ? hide() : reveal());
  el.textContent = MASK;
  el.addEventListener("mouseenter", reveal);
  el.addEventListener("mouseleave", hide);
  el.addEventListener("touchstart", toggle, { passive: true });
  return {
    refresh: () => {
      if (shown && !timer) el.textContent = getValue();
    },
    detach: () => {
      if (timer) window.clearInterval(timer);
      el.removeEventListener("mouseenter", reveal);
      el.removeEventListener("mouseleave", hide);
      el.removeEventListener("touchstart", toggle);
    },
  };
}

/**
 * Scroll-scrubbed demo of a private send. The surrounding .scene drives a
 * --sp progress custom property (set by the scroll engine); this component
 * maps it onto a paused GSAP timeline, so the payment seals, crosses the
 * Avalanche rail as a ciphered packet, and lands on @maria's card exactly
 * in step with the visitor's scroll — forward and backward. Both balances
 * stay masked; hover or tap de-scrambles them.
 */
export default function PrivateSend() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = gsap.utils.selector(root);
    const packet = q(".packet")[0] as HTMLElement;
    const note = q(".packet-note")[0] as HTMLElement;
    const cipherFace = q(".packet-cipher")[0] as HTMLElement;
    const track = q(".rail-track")[0] as HTMLElement;
    const netcap = q(".rail-cipher")[0] as HTMLElement;
    const sendline = q(".psending")[0] as HTMLElement;
    const plus = q(".pplus")[0] as HTMLElement;
    const yourBal = q(".ps-ybal")[0] as HTMLElement;
    const mariaBal = q(".ps-rbal")[0] as HTMLElement;
    const receipt = q(".ppriv")[0] as HTMLElement;

    const state = { bal: BASE };
    const yourMask = maskable(yourBal, () => "$8,214", reduced);
    const mariaMask = maskable(mariaBal, () => fmt(state.bal), reduced);

    if (reduced) {
      packet.style.display = "none";
      sendline.style.opacity = "1";
      plus.style.opacity = "1";
      receipt.style.opacity = "1";
      state.bal = BASE + AMOUNT;
      netcap.textContent = DONE_CAPTION;
      return () => {
        yourMask.detach();
        mariaMask.detach();
      };
    }

    const mobile = window.matchMedia("(max-width: 639px)");
    const scene = root.closest<HTMLElement>(".scene");
    let tl: gsap.core.Timeline | null = null;
    let scrambleAt = 0;

    const build = () => {
      tl?.kill();
      gsap.set(packet, { x: 0, y: 0, scale: 0, opacity: 1, clearProps: "backgroundColor" });
      gsap.set(note, { opacity: 1 });
      gsap.set(cipherFace, { opacity: 0 });
      gsap.set([plus, receipt, sendline], { opacity: 0, y: 6 });
      gsap.set(sendline, { y: 0 });

      const vertical = mobile.matches;
      const PAD = 28;
      const dist = vertical
        ? track.clientHeight - packet.offsetHeight - PAD * 2
        : track.clientWidth - packet.offsetWidth - PAD * 2;
      const travel = vertical ? { y: dist } : { x: dist };

      tl = gsap
        .timeline({ paused: true })
        .to(sendline, { opacity: 1, duration: 0.4 })
        .to(packet, { scale: 1, duration: 0.35, ease: "power3.out" }, "+=0.2")
        .addLabel("flightStart", "+=0.25")
        .to(note, { opacity: 0, duration: 0.2 }, "flightStart")
        .to(cipherFace, { opacity: 1, duration: 0.2 }, "flightStart")
        .to(packet, { backgroundColor: "#1a2135", duration: 0.25 }, "flightStart")
        .to(packet, { ...travel, duration: 1.7, ease: "power1.inOut" }, "flightStart")
        .addLabel("flightEnd")
        .to(packet, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" })
        .to(plus, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "<+=0.1")
        .to(state, {
          bal: BASE + AMOUNT,
          duration: 0.6,
          ease: "power2.out",
          onUpdate: () => mariaMask.refresh(),
        }, "<")
        .to(receipt, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
        .to({}, { duration: 0.35 }); // settle
      return tl;
    };

    build();

    // scrub: the scroll engine writes --sp (0..1) on the scene while pinned
    const update = () => {
      if (!tl || !scene) return;
      const sp = parseFloat(scene.style.getPropertyValue("--sp") || "0");
      const p = Math.max(0, Math.min(1, (sp - 0.04) / 0.9));
      tl.progress(p, false);

      const t = tl.time();
      const start = tl.labels.flightStart ?? 0;
      const end = tl.labels.flightEnd ?? 0;
      if (t > start && t < end) {
        const now = performance.now();
        if (now - scrambleAt > 70) {
          scrambleAt = now;
          let s = "0x";
          for (let i = 0; i < 8; i++) s += HEX[(Math.random() * HEX.length) | 0];
          netcap.textContent = s;
        }
      } else {
        netcap.textContent = t >= end ? DONE_CAPTION : IDLE_CAPTION;
      }
    };
    gsap.ticker.add(update);

    const onBreak = () => build();
    mobile.addEventListener("change", onBreak);

    return () => {
      gsap.ticker.remove(update);
      mobile.removeEventListener("change", onBreak);
      tl?.kill();
      yourMask.detach();
      mariaMask.detach();
    };
  }, []);

  return (
    <div ref={rootRef} className="psend-inner" aria-label="A private send, scrubbed by scroll">
      <div className="vault-intro psend-eyebrow">
        <span className="rule" />
        <span className="line">Sent over Avalanche</span>
        <span className="rule" />
      </div>
      <h2 className="psend-title display">Watch a send stay private.</h2>

      <div className="psend-stage">
        <div className="pcard">
          <span className="pname">You</span>
          <span className="pbal display tnum ps-ybal" data-cursor title="Hover to reveal" />
          <span className="psending">
            Sending <b>$120</b> to @maria
          </span>
        </div>

        <div className="prail">
          <div className="rail-track">
            <svg className="rail-logo" viewBox="0 0 639 564" aria-hidden="true">
              <path
                d="M399.885 563.465H613.609C632.467 563.465 644.269 543.041 634.827 526.718L527.966 341.641C518.524 325.318 494.97 325.318 485.529 341.641L378.667 526.718C369.226 543.041 381.027 563.465 399.885 563.465Z"
                fill="#fff"
              />
              <path
                d="M426.609 166.12L338.779 13.9644C329.909 -1.41521 307.697 -1.41521 298.827 13.9644L3.43383 525.589C-6.28089 542.435 5.86872 563.454 25.2982 563.454H201.182C219.94 563.454 237.258 553.441 246.625 537.217L426.609 225.477C437.218 207.116 437.218 184.481 426.609 166.12Z"
                fill="#fff"
              />
            </svg>
            <div className="packet">
              <span className="packet-face packet-note tnum">$120</span>
              <span className="packet-face packet-cipher">••••</span>
            </div>
          </div>
          <div className="rail-caption">
            What the network sees <span className="rail-cipher tnum">{IDLE_CAPTION}</span>
          </div>
        </div>

        <div className="pcard">
          <span className="pname">@maria</span>
          <span className="pbal display tnum ps-rbal" data-cursor title="Hover to reveal" />
          <span className="pplus display tnum">+$120</span>
          <span className="ppriv">✓ Private receipt saved</span>
        </div>
      </div>
    </div>
  );
}
