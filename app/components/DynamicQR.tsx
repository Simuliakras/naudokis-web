"use client";
// Runtime QR — encodes an arbitrary `value` (e.g. the per-code OneLink attribution
// link on /invite) into a scannable matrix client-side via the `qrcode` lib's
// browser `toDataURL`. The lib is dynamically imported so its chunk loads only
// where a dynamic QR is actually rendered, never in the shared bundle. Mirrors the
// white rounded `.nk-qr-card` frame of the static <QR/> in visual.tsx. Decorative
// for AT (a QR can only be scanned visually) — the adjacent CTA + badges are the
// real path, so the image is aria-hidden.
import { useEffect, useState } from "react";

export function DynamicQR({ value, size = 152 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    import("qrcode")
      .then((QRCode) =>
        QRCode.toDataURL(value, { errorCorrectionLevel: "M", margin: 1, width: size * 2 }),
      )
      .then((url) => {
        if (active) {
          setSrc(url);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [value, size]);
  return (
    <span className="nk-qr-card">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" aria-hidden="true" width={size} height={size}
          style={{ display: "block", width: size, height: size }} />
      ) : (
        <span aria-hidden="true" style={{ display: "block", width: size, height: size }} />
      )}
    </span>
  );
}
