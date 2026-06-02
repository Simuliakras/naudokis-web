"use client";
// Listing detail bottom-sheet (core "listing" screen, click-thru).
import { useEffect, useRef, useState } from "react";
import { Icon, GhostButton, Button, Tag, Rating, LocationChip, Dots } from "./ui";
import { Listing } from "./sections";
import { useI18n } from "./I18nProvider";
import { useListing } from "@/app/lib/listings";

const TITLE_ID = "nk-sheet-title";

export function ListingSheet({ item, onClose }: { item: Listing | null; onClose: () => void }) {
  const { locale, dict } = useI18n();
  const t = dict.listingSheet;
  const open = !!item;
  // Keep the last opened listing so content stays put during the close transition.
  // Adjusting state during render is the canonical pattern for deriving from a changing prop.
  const [shown, setShown] = useState<Listing | null>(null);
  if (item && item !== shown) {
    setShown(item);
  }
  // Reset the gallery whenever a different listing is opened.
  const [imgRef, setImgRef] = useState<Listing | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  if (shown !== imgRef) {
    setImgRef(shown);
    setImgIndex(0);
  }
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const { data: detail, isLoading } = useListing(shown?.id, locale);
  const loadingDetail = !!shown?.id && isLoading && !detail;

  useEffect(() => {
    if (!open) {
      return;
    }
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheetRef.current) {
        return;
      }
      const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
        return;
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      openerRef.current?.focus();
    };
  }, [open, onClose]);

  // Merge instant card data (shown) with the fetched detail; detail wins once loaded.
  const title = detail?.title ?? shown?.title ?? "";
  const city = detail?.city ?? shown?.city ?? "";
  const price = detail?.price ?? shown?.price ?? "";
  const rating = detail?.rating;
  const reviewLabel = detail && detail.ratingCount > 0 ? dict.common.reviewCount(detail.ratingCount) : undefined;
  const tags = detail?.tags ?? (shown?.id ? [] : t.tags);
  const description = detail?.description ?? (shown?.id ? undefined : t.description);
  const attributes = detail?.attributes ?? [];
  const owner = detail?.owner;
  const images = detail?.images ?? (shown?.img ? [shown.img] : []);
  const currentImg = images.length ? images[Math.min(imgIndex, images.length - 1)] : undefined;

  return (
    <div className={"nk-modal-scrim" + (open ? " open" : "")} onClick={onClose} inert={!open}>
      <div className="nk-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby={TITLE_ID}
        onClick={(e) => e.stopPropagation()}>
        {shown && (
          <div style={{ padding: "24px var(--nk-gutter) 80px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBlock: 16 }}>
              <GhostButton icon="ArrowLeft" onClick={onClose}>{t.back}</GhostButton>
              <button ref={closeRef} onClick={onClose} aria-label={t.close} style={{ width: 44, height: 44, borderRadius: 22, border: "1px solid var(--nk-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="X" size={20} color="var(--nk-text)" />
              </button>
            </div>
            <div className="nk-detail" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, marginTop: 24, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                {tags.length > 0 && (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                  </div>
                )}
                <h2 id={TITLE_ID} style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.07 }}>{title}</h2>
                <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
                  {rating && <Rating value={rating} count={reviewLabel} />}
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="MapPin" size={20} color="var(--nk-text)" stroke={2} />
                    <span className="nk-body-sm" style={{ color: "var(--nk-text)" }}>{city}</span>
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <h3 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 28 }}>{t.descriptionHeading}</h3>
                  {loadingDetail ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div className="nk-skel" style={{ height: 18, width: "100%" }} />
                      <div className="nk-skel" style={{ height: 18, width: "92%" }} />
                      <div className="nk-skel" style={{ height: 18, width: "60%" }} />
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 18, lineHeight: "30px", color: "var(--nk-text-2)", whiteSpace: "pre-wrap" }}>
                      {description}
                    </p>
                  )}
                </div>
                {attributes.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <h3 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 28 }}>{t.specsHeading}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
                      {attributes.map((a) => (
                        <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid var(--nk-border-soft)", paddingBottom: 8 }}>
                          <span className="nk-body-sm" style={{ color: "var(--nk-text-muted)" }}>{a.label}</span>
                          <span className="nk-body-sm" style={{ color: "var(--nk-text)", textAlign: "right" }}>{a.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {owner && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <h3 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 28 }}>{t.ownerHeading}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--nk-surface)", borderRadius: 16, padding: 20 }}>
                      <span className="nk-imgph" style={{ width: 56, height: 56, borderRadius: "50%", flex: "none", backgroundImage: owner.avatar ? `url("${owner.avatar}")` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
                        {!owner.avatar && <Icon name="User" size={26} stroke={1.6} color="#5b6163" />}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 20, color: "var(--nk-text)" }}>
                          {owner.name}
                          {owner.verified && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--nk-green)" }}><Icon name="ShieldCheck" size={16} color="var(--nk-green)" stroke={2} /> <span className="nk-meta">{t.ownerVerified}</span></span>}
                        </span>
                        <span className="nk-meta" style={{ color: "var(--nk-text-muted)", display: "flex", alignItems: "center", gap: 12 }}>
                          <span>{t.ownerRentals}: {owner.completedRentals}</span>
                          {owner.rating && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="Star" size={14} color="var(--nk-yellow)" fill="var(--nk-yellow)" /> {owner.rating}</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 32 }}>{price} <span style={{ fontFamily: "var(--nk-font-body)", fontWeight: 400, fontSize: 20, color: "var(--nk-text-2)" }}>{t.perDay}</span></span>
                  <Button variant="primary">{t.reserve}</Button>
                </div>
              </div>
              <div className="nk-imgph"
                role={images.length > 1 ? "button" : undefined}
                tabIndex={images.length > 1 ? 0 : undefined}
                aria-label={images.length > 1 ? t.nextImage : undefined}
                onClick={images.length > 1 ? () => setImgIndex((i) => (i + 1) % images.length) : undefined}
                onKeyDown={images.length > 1 ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setImgIndex((i) => (i + 1) % images.length);
                  }
                } : undefined}
                style={{ height: 620, borderRadius: 16, backgroundImage: currentImg ? `url("${currentImg}")` : undefined, backgroundSize: "cover", backgroundPosition: "center", cursor: images.length > 1 ? "pointer" : "default" }}>
                {!currentImg && <Icon name="Image" size={72} stroke={1.4} className="nk-imgicon" />}
                <span style={{ position: "absolute", top: 24, left: 24 }}><LocationChip city={city} /></span>
                {images.length > 0 && (
                  <span style={{ position: "absolute", top: 24, right: 24, background: "var(--nk-tag)", borderRadius: 2, padding: "6px 10px", fontFamily: "var(--nk-font-body)", fontSize: 18, color: "var(--nk-light-meta)" }}>{Math.min(imgIndex, images.length - 1) + 1} / {images.length}</span>
                )}
                {images.length > 1 && (
                  <span style={{ position: "absolute", left: 0, right: 0, bottom: 28, display: "flex", justifyContent: "center" }}><Dots n={images.length} active={Math.min(imgIndex, images.length - 1)} /></span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
