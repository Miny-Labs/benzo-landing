import { forwardRef, useMemo, useSyncExternalStore } from "react";
import PrivateSend from "./PrivateSend";
import { GALLERY_IMAGES } from "../lib/config";

/**
 * Scattered-grid layout (structure from the archive spec):
 * row r puts an image at column (r*2 + r%2) % cols; every 3rd row gets a
 * second image two columns over. Everything else stays empty air.
 */
export function buildLayout(count: number, cols: number): number[] {
  const cells: number[] = [];
  let placed = 0;
  for (let r = 0; placed < count; r++) {
    const row = new Array<number>(cols).fill(-1);
    const a = (r * 2 + (r % 2)) % cols;
    row[a] = placed++;
    if (r % 3 === 0 && placed < count) {
      let b = (a + 2) % cols;
      if (b === a) b = (a + 1) % cols;
      row[b] = placed++;
    }
    cells.push(...row);
  }
  return cells;
}

function subscribeCols(cb: () => void) {
  const m1 = window.matchMedia("(max-width: 639px)");
  const m2 = window.matchMedia("(max-width: 1023px)");
  m1.addEventListener("change", cb);
  m2.addEventListener("change", cb);
  return () => {
    m1.removeEventListener("change", cb);
    m2.removeEventListener("change", cb);
  };
}
function getCols() {
  if (window.matchMedia("(max-width: 639px)").matches) return 2;
  if (window.matchMedia("(max-width: 1023px)").matches) return 3;
  return 4;
}

type Props = { wrapRef: React.Ref<HTMLDivElement> };

const STEPS = [
  {
    num: "01",
    verb: "Shield it.",
    sub: "Move public USDC into a private note only you can spend. On-chain, your balance stops being anyone's business.",
  },
  {
    num: "02",
    verb: "Send it quietly.",
    sub: "Pay @handles like you'd text a friend. Payroll and invoices work the same way, and the amounts stay between you.",
  },
  {
    num: "03",
    verb: "Prove what you choose.",
    sub: "Need to show an auditor one number? A zero-knowledge proof shows them that number. The rest stays sealed.",
  },
];

const GalleryPanel = forwardRef<HTMLDivElement, Props>(function GalleryPanel({ wrapRef }, panelRef) {
  const cols = useSyncExternalStore(subscribeCols, getCols, () => 4);
  const cells = useMemo(() => buildLayout(GALLERY_IMAGES.length, cols), [cols]);

  return (
    <div ref={panelRef} className="vault" role="region" aria-label="What stays private">
      <div ref={wrapRef} className="vault-wrap">
        <div className="vault-intro">
          <span className="rule" />
          <span className="line">Nobody's business but yours</span>
          <span className="rule" />
        </div>

        <div className="vault-grid">
          {cells.map((idx, i) => {
            if (idx === -1) return <div key={i} className="vault-cell" aria-hidden="true" />;
            const col = i % cols;
            const origin = col < cols / 2 ? "right bottom" : "left bottom";
            const img = GALLERY_IMAGES[idx];
            return (
              <div key={i} className="vault-cell">
                <div className="bp-card" style={{ transformOrigin: origin }}>
                  <img src={img.src} alt={img.alt} loading="lazy" draggable={false} />
                </div>
                <span className={`cell-tag ${col < cols / 2 ? "side-right" : "side-left"}`}>
                  <span className="tag-num">{String(idx + 1).padStart(2, "0")}</span>
                  {img.caption}
                </span>
              </div>
            );
          })}
        </div>

        <div className="vault-how">
          <div className="vault-intro how-eyebrow">
            <span className="rule" />
            <span className="line">Private, yet provable</span>
            <span className="rule" />
          </div>
          {STEPS.map((s) => (
            <div key={s.num} className="step">
              <span className="num">{s.num}</span>
              <div>
                <h2 className="verb display">{s.verb}</h2>
                <p className="how-sub">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <PrivateSend />
      </div>
    </div>
  );
});

export default GalleryPanel;
