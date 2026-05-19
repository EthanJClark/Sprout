import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import GlobeGL from "globe.gl";
import { EVENT_CATEGORIES } from "../data/mockEvents";

const Globe = forwardRef(function Globe({ events, selectedEvent, onEventClick, onReady }, ref) {
  const containerRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const controlsRef = useRef(null);
  const autoTimerRef = useRef(null);
  const [error, setError] = useState(null);
  const defaultViewRef = useRef({ lat: 20, lng: -30, altitude: 2.2 });
  const baseRingsRef = useRef([]);

  useImperativeHandle(ref, () => ({
    focusOn(lat, lng) {
      const controls = controlsRef.current;
      if (controls) {
        controls.autoRotate = false;
      }
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
      }
      globeInstanceRef.current?.pointOfView({ lat, lng, altitude: 1.2 }, 900);
    },
  }));

  // ── Initialize globe once ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    let globe;
    try {
      globe = GlobeGL()(containerRef.current);
      globeInstanceRef.current = globe;

      globe
        .globeImageUrl("/earth-night.jpg")
        .bumpImageUrl("/earth-topology.png")
        .backgroundImageUrl("/night-sky.png")
        .showAtmosphere(true)
        .atmosphereColor("#1a3a6b")
        .atmosphereAltitude(0.18)
        .pointOfView(defaultViewRef.current, 0)
        .enablePointerInteraction(true);

      globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const controls = globe.controls();
      controlsRef.current = controls;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;

      const pause = () => {
        controls.autoRotate = false;
        if (autoTimerRef.current) {
          clearTimeout(autoTimerRef.current);
        }
      };
      const resume = () => {
        autoTimerRef.current = setTimeout(() => {
          controls.autoRotate = true;
        }, 3000);
      };
      containerRef.current.addEventListener("pointerdown", pause);
      containerRef.current.addEventListener("pointerup", resume);

      globe
        .pointsData([])
        .pointLat("lat")
        .pointLng("lng")
        .pointAltitude(0.01)
        .pointRadius(ev => 0.3 + (ev.severity / 100) * 0.5)
        .pointColor(ev => EVENT_CATEGORIES[ev.category]?.color ?? "#ffffff")
        .pointResolution(24)
        .onPointClick(ev => {
          pause();
          onEventClick(ev);
        })
        .onPointHover(ev => {
          containerRef.current.style.cursor = ev ? "pointer" : "grab";
        });

      globe
        .ringsData([])
        .ringLat("lat")
        .ringLng("lng")
        .ringMaxRadius(3)
        .ringPropagationSpeed(1.5)
        .ringRepeatPeriod(900)
        .ringColor(ev => {
          const hex = EVENT_CATEGORIES[ev.category]?.color ?? "#ffffff";
          return t => `${hex}${Math.round((1 - t) * 200).toString(16).padStart(2, "0")}`;
        })
        .ringAltitude(0.005);

      // Fit globe to container size
      const ro = new ResizeObserver(() => {
        if (containerRef.current) {
          globe.width(containerRef.current.clientWidth);
          globe.height(containerRef.current.clientHeight);
        }
      });
      ro.observe(containerRef.current);

      onReady?.();

      globe._cleanup = () => {
        ro.disconnect();
        if (autoTimerRef.current) {
          clearTimeout(autoTimerRef.current);
        }
        containerRef.current?.removeEventListener("pointerdown", pause);
        containerRef.current?.removeEventListener("pointerup", resume);
      };
    } catch (e) {
      console.error("Globe init failed:", e);
      setError(e.message);
    }

    return () => {
      globe?._cleanup?.();
      globe?._destructor?.();
    };
  }, []); // eslint-disable-line

  // ── Update points when events change ──────────────────────────────────
  useEffect(() => {
    const g = globeInstanceRef.current;
    if (!g) return;
    g.pointsData(events);
    baseRingsRef.current = events.filter(e => e.severity >= 70 && e.status === "Active");
    const rings = selectedEvent
      ? [
          ...baseRingsRef.current.filter(e => e.id !== selectedEvent.id),
          selectedEvent,
        ]
      : baseRingsRef.current;
    g.ringsData(rings);
  }, [events, selectedEvent]);

  // ── Highlight selected ─────────────────────────────────────────────────
  useEffect(() => {
    const g = globeInstanceRef.current;
    if (!g) return;
    g.pointRadius(ev => {
      const base = 0.3 + (ev.severity / 100) * 0.5;
      return selectedEvent?.id === ev.id ? base * 1.8 : base;
    });

    if (selectedEvent) {
      const rings = [
        ...baseRingsRef.current.filter(e => e.id !== selectedEvent.id),
        selectedEvent,
      ];
      g.ringsData(rings);
    }

    if (!selectedEvent) {
      const controls = controlsRef.current;
      if (controls) {
        controls.autoRotate = true;
      }
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
      }
      g.pointOfView(defaultViewRef.current, 900);
    }
  }, [selectedEvent]);

  if (error) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        color: "#ff6060", fontFamily: "var(--font-mono)", fontSize: 12,
        gap: 8, padding: 24, textAlign: "center"
      }}>
        <span style={{ fontSize: 28 }}>⚠</span>
        <strong>Globe failed to load</strong>
        <span style={{ color: "#7b82a0" }}>{error}</span>
        <span style={{ color: "#424862", marginTop: 8 }}>
          Try: <code>npm install globe.gl@2.27.0 three@0.160.0</code>
        </span>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      />
      {/* Data source label */}
      <div style={{
        position: "absolute", bottom: 16, left: 16,
        fontFamily: "var(--font-mono)", fontSize: 9,
        color: "#424862", letterSpacing: "0.08em",
        lineHeight: 1.7, pointerEvents: "none",
      }}>
        <div style={{ textTransform: "uppercase", marginBottom: 3 }}>Data Source</div>
        <div style={{ color: "#7b82a0", maxWidth: 220 }}>
          GDAC — Global Disaster Alert and Coordination System.
          Point size reflects severity.
        </div>
      </div>
    </div>
  );
});

export default Globe;