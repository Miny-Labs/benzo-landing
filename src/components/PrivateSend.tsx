import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { reveal } from "../lib/reveal";

const GLYPHS = "0123456789abcdef";
const BASE = 1067;
const AMOUNT = 120;
const fmt = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

/**
 * Looping demo of a private send: the payment seals on your card, crosses the
 * Avalanche rail as a ciphered packet (the network caption scrambles while
 * it's in flight), and unseals only on @maria's card. Pauses offscreen;
 * reduced motion gets the composed final frame.
 */
export default function PrivateSend() {
  const rootRef = useRef<HTMLElement>(null);

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
    const rbal = q(".ps-rbal")[0] as HTMLElement;
    const receipt = q(".ppriv")[0] as HTMLElement;

    if (reduced) {
      packet.style.display = "none";
      sendline.style.opacity = "1";
      plus.style.opacity = "1";
      receipt.style.opacity = "1";
      rbal.textContent = fmt(BASE + AMOUNT);
      netcap.textContent = "0x••••••••";
      return;
    }

    const mobile = window.matchMedia("(max-width: 639px)");
    let tl: gsap.core.Timeline | null = null;
    let scrambleAt = 0;
    let inFlight = false;

    const reset = () => {
      gsap.set(packet, { x: 0, y: 0, scale: 0, opacity: 1, clearProps: "backgroundColor" });
      gsap.set(note, { opacity: 1 });
      gsap.set(cipherFace, { opacity: 0 });
      gsap.set([plus, receipt], { opacity: 0, y: 6 });
      gsap.set(sendline, { opacity: 0 });
      rbal.textContent = fmt(BASE);
      netcap.textContent = "· · · · · · · ·";
    };

    const build = () => {
      const wasPlaying = tl ? !tl.paused() : false;
      tl?.kill();
      reset();
      const vertical = mobile.matches;
      // keep the packet inside the pill's straight section, clear of the caps
      const PAD = 28;
      const dist = vertical
        ? track.clientHeight - packet.offsetHeight - PAD * 2
        : track.clientWidth - packet.offsetWidth - PAD * 2;
      const travel = vertical ? { y: dist } : { x: dist };
      const bal = { v: BASE };

      tl = gsap
        .timeline({
          repeat: -1,
          repeatDelay: 1.6,
          paused: true,
          onRepeat: () => {
            bal.v = BASE;
            reset();
          },
          onUpdate: () => {
            if (!inFlight) return;
            const now = performance.now();
            if (now - scrambleAt < 70) return;
            scrambleAt = now;
            let s = "0x";
            for (let i = 0; i < 8; i++) s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
            netcap.textContent = s;
          },
        })
        .to(sendline, { opacity: 1, duration: 0.4 })
        .to(packet, { scale: 1, duration: 0.35, ease: "power3.out" }, "+=0.25")
        .add(() => {
          inFlight = true;
        }, "+=0.3")
        .to(note, { opacity: 0, duration: 0.2 }, "<")
        .to(cipherFace, { opacity: 1, duration: 0.2 }, "<")
        .to(packet, { backgroundColor: "#1a2135", duration: 0.25 }, "<")
        .to(packet, { ...travel, duration: 1.7, ease: "power1.inOut" }, "<")
        .add(() => {
          inFlight = false;
          netcap.textContent = "0x••••••••";
        })
        .to(packet, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" })
        .to(plus, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "<+=0.1")
        .to(bal, {
          v: BASE + AMOUNT,
          duration: 0.7,
          ease: "power2.out",
          onUpdate: () => {
            rbal.textContent = fmt(bal.v);
          },
        }, "<")
        .to(receipt, { opacity: 1, y: 0, duration: 0.4 }, "-=0.25")
        .to([plus, sendline], { opacity: 0, duration: 0.5 }, "+=1.3");
      if (wasPlaying) tl.play();
      return tl;
    };

    build();

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!tl) return;
        if (entry.isIntersecting) tl.play();
        else tl.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(root);

    const onBreak = () => build();
    mobile.addEventListener("change", onBreak);

    return () => {
      io.disconnect();
      mobile.removeEventListener("change", onBreak);
      tl?.kill();
    };
  }, []);

  return (
    <section ref={rootRef} className="psend" aria-label="A private send, animated">
      <motion.div className="vault-intro psend-eyebrow" {...reveal()}>
        <span className="rule" />
        <span className="line">Sent over Avalanche</span>
        <span className="rule" />
      </motion.div>
      <motion.h2 className="psend-title display" {...reveal(0.08)}>
        Watch a send stay private.
      </motion.h2>

      <div className="psend-stage">
        <motion.div className="pcard" {...reveal(0.15)}>
          <span className="pname">You</span>
          <span className="pbal display tnum">$8,214</span>
          <span className="psending">
            Sending <b>$120</b> to @maria
          </span>
        </motion.div>

        <motion.div className="prail" {...reveal(0.3)}>
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
            What the network sees <span className="rail-cipher tnum">· · · · · · · ·</span>
          </div>
        </motion.div>

        <motion.div className="pcard" {...reveal(0.45)}>
          <span className="pname">@maria</span>
          <span className="pbal display tnum ps-rbal">{fmt(BASE)}</span>
          <span className="pplus display tnum">+$120</span>
          <span className="ppriv">✓ Private receipt saved</span>
        </motion.div>
      </div>
    </section>
  );
}
