import { useEffect, useRef } from "react";
import gsap from "gsap";

const HEX = "0123456789abcdef";
const SCRAMBLE = "█▓▒░•§#%¤";
const MASK_BAL = "$•••••";
const MASK_ADDR = "0x••••…••••";
const MASK_TX = "0x••••••••";
const IDLE_TX = "· · · · · · · ·";
const Y_ADDR = "0x8f4a…31c9";
const R_ADDR = "0x2d7e…a844";
const TX_ID = "0x7d29…49da";
const BASE = 1067;
const AMOUNT = 120;
const fmt = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

/**
 * Scroll-scrubbed private send where encryption is the choreography:
 * the sender starts in the clear and ENCRYPTS the moment the packet departs;
 * the receiver DECRYPTS on arrival (balance counts up, address shows, tx id
 * resolves) and seals back to ciphertext at the end. All of it maps onto the
 * scene's --sp scroll progress, so it runs forward and backward.
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
    const yBal = q(".ps-ybal")[0] as HTMLElement;
    const yAddr = q(".ps-yaddr")[0] as HTMLElement;
    const rBal = q(".ps-rbal")[0] as HTMLElement;
    const rAddr = q(".ps-raddr")[0] as HTMLElement;
    const receipt = q(".ppriv")[0] as HTMLElement;

    const state = { bal: BASE };

    if (reduced) {
      packet.style.display = "none";
      sendline.style.opacity = "1";
      plus.style.opacity = "1";
      receipt.style.opacity = "1";
      yBal.textContent = "$8,214";
      yAddr.textContent = Y_ADDR;
      rBal.textContent = fmt(BASE + AMOUNT);
      rAddr.textContent = R_ADDR;
      netcap.textContent = TX_ID;
      return;
    }

    // — encrypt/decrypt text driver: scrambles whenever the target flips —
    const timers = new Map<HTMLElement, number>();
    const current = new Map<HTMLElement, string>();
    const scrambleTo = (el: HTMLElement, target: string) => {
      const old = timers.get(el);
      if (old) window.clearInterval(old);
      let frame = 0;
      const total = 11;
      const id = window.setInterval(() => {
        frame++;
        const resolved = Math.floor((frame / total) * target.length);
        let out = "";
        for (let i = 0; i < target.length; i++) {
          out += i < resolved ? target[i] : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
        }
        el.textContent = out;
        if (frame >= total) {
          window.clearInterval(id);
          timers.delete(el);
          el.textContent = target;
        }
      }, 38);
      timers.set(el, id);
    };
    const apply = (el: HTMLElement, target: string, live = false) => {
      const prev = current.get(el);
      if (prev === target) {
        // live values (the counting balance) update in place while decrypted
        if (live && !timers.has(el)) el.textContent = target;
        return;
      }
      current.set(el, target);
      scrambleTo(el, target);
    };

    const mobile = window.matchMedia("(max-width: 639px)");
    const scene = root.closest<HTMLElement>(".scene");
    let tl: gsap.core.Timeline | null = null;
    let scrambleAt = 0;

    const build = () => {
      tl?.kill();
      gsap.set(packet, { x: 0, y: 0, scale: 0, opacity: 1, clearProps: "backgroundColor" });
      gsap.set(note, { opacity: 1 });
      gsap.set(cipherFace, { opacity: 0 });
      gsap.set([plus, receipt], { opacity: 0, y: 6 });
      gsap.set(sendline, { opacity: 0 });

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
        .addLabel("reveal")
        .to(plus, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "<+=0.1")
        .to(state, { bal: BASE + AMOUNT, duration: 0.6, ease: "power2.out" }, "<")
        .to(receipt, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
        .to({}, { duration: 0.55 }) // dwell while decrypted
        .addLabel("sealBack")
        .to(plus, { opacity: 0, duration: 0.35 }, "sealBack")
        .to({}, { duration: 0.45 }); // tail
      return tl;
    };

    build();

    const update = () => {
      if (!tl || !scene) return;
      const sp = parseFloat(scene.style.getPropertyValue("--sp") || "0");
      const p = Math.max(0, Math.min(1, (sp - 0.04) / 0.9));
      tl.progress(p, false);

      const t = tl.time();
      const L = tl.labels;
      const senderClear = t < L.flightStart;
      const receiverClear = t >= L.reveal && t < L.sealBack;

      apply(yBal, senderClear ? "$8,214" : MASK_BAL);
      apply(yAddr, senderClear ? Y_ADDR : MASK_ADDR);
      apply(rBal, receiverClear ? fmt(state.bal) : MASK_BAL, true);
      apply(rAddr, receiverClear ? R_ADDR : MASK_ADDR);

      if (t > L.flightStart && t < L.flightEnd) {
        const now = performance.now();
        if (now - scrambleAt > 70) {
          scrambleAt = now;
          let s = "0x";
          for (let i = 0; i < 8; i++) s += HEX[(Math.random() * HEX.length) | 0];
          netcap.textContent = s;
        }
        current.set(netcap, "");
      } else if (t <= L.flightStart) {
        apply(netcap, IDLE_TX);
      } else {
        apply(netcap, receiverClear ? TX_ID : MASK_TX);
      }
    };
    gsap.ticker.add(update);

    const onBreak = () => build();
    mobile.addEventListener("change", onBreak);

    return () => {
      gsap.ticker.remove(update);
      mobile.removeEventListener("change", onBreak);
      tl?.kill();
      timers.forEach((id) => window.clearInterval(id));
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
          <span className="pbal display tnum ps-ybal">$8,214</span>
          <span className="paddr tnum ps-yaddr">{Y_ADDR}</span>
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
            What the network sees <span className="rail-cipher tnum">{IDLE_TX}</span>
          </div>
        </div>

        <div className="pcard">
          <span className="pname">@maria</span>
          <span className="pbal display tnum ps-rbal">{MASK_BAL}</span>
          <span className="paddr tnum ps-raddr">{MASK_ADDR}</span>
          <span className="pplus display tnum">+$120</span>
          <span className="ppriv">✓ Private receipt saved</span>
        </div>
      </div>
    </div>
  );
}
