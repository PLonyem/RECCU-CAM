import { ImageResponse } from "next/og";

export const alt = "RECCU-CAM — cooperation, confidence, shared progress";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0D3D2E", color: "white", padding: "72px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: 76, height: 76, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", background: "white", color: "#0D3D2E", fontSize: 34, fontWeight: 800 }}>R</div>
        <div style={{ fontSize: 34, fontWeight: 800 }}>RECCU-CAM LTD</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: 920, fontSize: 68, lineHeight: 1.08, fontWeight: 800 }}>Cooperation that moves communities forward.</div>
        <div style={{ marginTop: 28, fontSize: 25, color: "#D7EBDF" }}>Network services · VTIME learning · Knowledge Centre</div>
      </div>
      <div style={{ color: "#F0C351", fontSize: 20, letterSpacing: 4, textTransform: "uppercase" }}>Cooperation · Confidence · Shared progress</div>
    </div>,
    size,
  );
}
