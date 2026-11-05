import { ImageResponse } from "next/og";

export const alt = "Medicare Plus Lahore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #071a2c 0%, #0a2942 62%, #0d8f79 160%)",
          color: "white",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 480,
            height: 480,
            borderRadius: 999,
            right: -120,
            top: -140,
            background: "rgba(35,196,155,0.14)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 70,
                height: 70,
                borderRadius: 20,
                background: "#23c49b",
                color: "#071a2c",
                fontSize: 40,
                fontWeight: 800,
              }}
            >
              +
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 31, fontWeight: 800, letterSpacing: -1 }}>Medicare Plus Clinic</div>
              <div style={{ marginTop: 6, fontSize: 15, color: "#83e8ca", letterSpacing: 3 }}>
                MULTI-SPECIALTY CARE • LAHORE
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
            <div style={{ fontSize: 62, lineHeight: 1.08, fontWeight: 700, letterSpacing: -2.5 }}>
              Specialist healthcare in Lahore, without the wait.
            </div>
            <div style={{ marginTop: 22, fontSize: 23, color: "#cbd5e1", lineHeight: 1.5 }}>
              PMDC-registered consultants • Transparent PKR fees • Same-day appointments
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontSize: 18, color: "#83e8ca", fontWeight: 700 }}>
              medicare.wordbitx.pk
            </div>
            <div
              style={{
                display: "flex",
                padding: "14px 24px",
                borderRadius: 999,
                background: "#23c49b",
                color: "#071a2c",
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              Book appointment online
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
