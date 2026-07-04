import { forwardRef } from "react";
import { CONSOLE_URL, EXPLORER_URL, GLYPH_PATH, SOCIALS, WALLET_URL } from "../lib/config";

/**
 * The last slide: a full-viewport footer in vault ink that slides up over the
 * gallery. Animated dot band, nav grid with the two doors, an oversized
 * wordmark row, and the legal line.
 */
const SiteFooter = forwardRef<HTMLDivElement>(function SiteFooter(_p, ref) {
  return (
    <footer ref={ref} className="site-footer">
      <div className="footer-dots" aria-hidden="true">
        <div className="footer-dots__line" />
      </div>

      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__lead">
            <h2>Private money, for people and for teams.</h2>
          </div>

          <nav className="site-footer__nav" aria-label="Product">
            <a href={WALLET_URL}>Wallet</a>
            <a href={CONSOLE_URL}>Console</a>
            <a href={EXPLORER_URL} target="_blank" rel="noreferrer">
              Testnet explorer
            </a>
          </nav>

          <nav className="site-footer__nav" aria-label="Company">
            <a href={SOCIALS.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={SOCIALS.x} target="_blank" rel="noreferrer">
              Follow us on X
            </a>
            <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </nav>
        </div>

        <div className="site-footer__brand-row">
          <a className="site-footer__brand" href="/" aria-label="Benzo home">
            <span className="site-footer__mark" aria-hidden="true">
              <svg viewBox="0 0 256 256">
                <path d={GLYPH_PATH} />
              </svg>
            </span>
            <span className="site-footer__word display">Benzo</span>
          </a>
        </div>

        <div className="site-footer__legal">
          <p>© 2026 Benzo. Private by default.</p>
          <a href={SOCIALS.github} target="_blank" rel="noreferrer">
            Apache-2.0
          </a>
          <span className="live">
            <span className="dot" /> Live on Stellar testnet
          </span>
        </div>
      </div>
    </footer>
  );
});

export default SiteFooter;
