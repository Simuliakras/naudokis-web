export default function Loading() {
  return (
    <div className="nk-page">
      <main id="nk-main" className="nk-container" style={{ paddingBlock: "120px 140px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="nk-skel" style={{ width: 280, height: 24, borderRadius: 8 }} />
        <div className="nk-skel" style={{ width: "60%", height: 52, borderRadius: 10 }} />
        <div className="nk-skel" style={{ height: 520, borderRadius: 18 }} />
      </main>
    </div>
  );
}
