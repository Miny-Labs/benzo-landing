import { useEffect, useRef, useState, forwardRef } from "react";

/**
 * Full-bleed sky stage. One brand film, two directions: the 12s forward cut,
 * then the same film reversed — a palindrome drift that never jump-cuts.
 * Plays everywhere; prefers-reduced-motion gets the still poster frame.
 */
const VideoStage = forwardRef<HTMLDivElement>(function VideoStage(_props, outerRef) {
  const fwdRef = useRef<HTMLVideoElement>(null);
  const revRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fwd = fwdRef.current!;
    const rev = revRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reveal on first frame, on error (poster still shows), or after a grace
    // period — Data Saver / Low Power Mode may never fire loadeddata.
    const onReady = () => setReady(true);
    fwd.addEventListener("loadeddata", onReady, { once: true });
    fwd.addEventListener("error", onReady, { once: true });
    const readyFallback = window.setTimeout(onReady, 2500);
    if (fwd.readyState >= 2) setReady(true);

    if (reduced) {
      return () => {
        window.clearTimeout(readyFallback);
        fwd.removeEventListener("loadeddata", onReady);
        fwd.removeEventListener("error", onReady);
      };
    }

    const playSafe = (v: HTMLVideoElement) => v.play().catch(() => {});
    const onFwdEnd = () => {
      fwd.style.display = "none";
      rev.style.display = "block";
      rev.currentTime = 0;
      playSafe(rev);
    };
    const onRevEnd = () => {
      rev.style.display = "none";
      fwd.style.display = "block";
      fwd.currentTime = 0;
      playSafe(fwd);
    };
    fwd.addEventListener("ended", onFwdEnd);
    rev.addEventListener("ended", onRevEnd);
    playSafe(fwd);

    return () => {
      window.clearTimeout(readyFallback);
      fwd.removeEventListener("loadeddata", onReady);
      fwd.removeEventListener("error", onReady);
      fwd.removeEventListener("ended", onFwdEnd);
      rev.removeEventListener("ended", onRevEnd);
      fwd.pause();
      rev.pause();
    };
  }, []);

  return (
    <div ref={outerRef} className="stage" style={{ opacity: ready ? 1 : 0 }} aria-hidden="true">
      <video ref={fwdRef} src="/media/sky.mp4" poster="/media/sky-poster.jpg" muted playsInline preload="auto" />
      <video ref={revRef} src="/media/sky-rev.mp4" muted playsInline preload="auto" style={{ display: "none" }} />
      <div className="scrim" />
    </div>
  );
});

export default VideoStage;
