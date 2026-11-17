"use client";

import { useMemo, useState } from "react";
import { geoEqualEarth, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, Objects } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import worldDataRaw from "world-atlas/countries-50m.json";

// ─── Types ─────────────────────────────────────────────────────────────────
export interface AtlasPlace {
  id: string; // ISO 3166-1 numeric string in world-atlas (e.g., "788")
  name: string;
  countryName: string;
  region: string;
  isHome?: boolean;
  coords: [number, number]; // [lng, lat]
  coordinatesDisplay: string;
  subtitle: string;
  description: string;
  zoomScale: number;
}

// ─── 7 Editorial Places with High-Separation Zoom Scales ───────────────────
export const PLACES: AtlasPlace[] = [
  {
    id: "788",
    name: "Tunisia",
    countryName: "Tunisia",
    region: "North Africa · Home Base",
    isHome: true,
    coords: [10.6369, 35.8256], // Sousse, Tunisia
    coordinatesDisplay: "35.83° N / 10.64° E",
    subtitle: "Home base in North Africa — Sousse, Tunisia",
    description:
      "Birthplace and home base in Sousse, on the Mediterranean coast of Tunisia. The foundation of my engineering curiosity, community leadership, and academic path.",
    zoomScale: 4.2,
  },
  {
    id: "724",
    name: "Spain",
    countryName: "Spain",
    region: "Europe · Visited",
    coords: [-3.7038, 40.4168], // Madrid / Barcelona
    coordinatesDisplay: "40.42° N / 3.70° W",
    subtitle: "A country I have visited in Europe",
    description:
      "Explored Mediterranean culture, architecture, and historic cities across the Iberian Peninsula.",
    zoomScale: 4.2,
  },
  {
    id: "276",
    name: "Germany",
    countryName: "Germany",
    region: "Europe · Visited",
    coords: [10.4515, 51.1657], // Central Germany / Berlin
    coordinatesDisplay: "51.17° N / 10.45° E",
    subtitle: "A country I have visited in Europe",
    description:
      "Visited central European engineering and cultural hubs; certified in German (ÖSD) and preparing for prospective study and research.",
    zoomScale: 5.0,
  },
  {
    id: "528",
    name: "Netherlands",
    countryName: "Netherlands",
    region: "Europe · Visited",
    coords: [5.2913, 52.1326], // Amsterdam
    coordinatesDisplay: "52.13° N / 5.29° E",
    subtitle: "A country I have visited in Europe",
    description:
      "Experienced pioneering urban design, sustainable infrastructure, and maritime engineering heritage with distinct visual separation.",
    zoomScale: 6.8, // Deep magnification for crisp North Sea separation from UK & Germany
  },
  {
    id: "826",
    name: "United Kingdom",
    countryName: "United Kingdom",
    region: "Europe · Visited",
    coords: [-0.1276, 51.5072], // London
    coordinatesDisplay: "51.51° N / 0.13° W",
    subtitle: "A country I have visited in Europe",
    description:
      "Explored global technological, academic, and cultural landmarks across Great Britain.",
    zoomScale: 5.2,
  },
  {
    id: "792",
    name: "Turkey",
    countryName: "Turkey",
    region: "Eurasia · Visited",
    coords: [28.9784, 41.0082], // Istanbul
    coordinatesDisplay: "41.01° N / 28.98° E",
    subtitle: "A country I have visited in Eurasia",
    description:
      "Explored the historic crossroads of Europe and Asia across Istanbul, the Bosphorus Strait, and Anatolia.",
    zoomScale: 4.0,
  },
  {
    id: "682",
    name: "Saudi Arabia",
    countryName: "Saudi Arabia",
    region: "Middle East · Visited",
    coords: [45.0792, 23.8859], // Riyadh / Jeddah
    coordinatesDisplay: "23.89° N / 45.08° E",
    subtitle: "A country I have visited in the Middle East",
    description:
      "Traveled across the Arabian Peninsula, visiting key historic landmarks, coastal Jeddah, and modern hubs.",
    zoomScale: 3.4,
  },
];

const W = 900;
const H = 460;

export default function WorldAtlas() {
  const [selectedPlace, setSelectedPlace] = useState<AtlasPlace | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [cursorTooltip, setCursorTooltip] = useState<{ name: string; isVisited: boolean } | null>(null);

  // ─── Generate Real Geo Projections & Paths from countries-50m ───────────
  const { countriesList, graticulePath, projection } = useMemo(() => {
    const topology = worldDataRaw as unknown as Topology<Objects>;
    const featureCollection = feature(
      topology,
      topology.objects.countries
    ) as FeatureCollection<Geometry, { name?: string }>;

    // Exclude Antarctica (ISO "010") for clean balanced framing
    const filteredFeatures = featureCollection.features.filter(
      (f) => String(f.id) !== "010" && f.properties?.name !== "Antarctica"
    );

    const filteredCollection: FeatureCollection<Geometry, { name?: string }> = {
      type: "FeatureCollection",
      features: filteredFeatures,
    };

    // Fit equal earth projection nicely to 900x460 canvas
    const proj = geoEqualEarth().fitExtent(
      [
        [10, 16],
        [890, 444],
      ],
      filteredCollection
    );

    const geoPathGenerator = geoPath(proj);

    const paths = filteredFeatures.map((f) => ({
      id: String(f.id),
      name: f.properties?.name ?? "Unknown",
      d: geoPathGenerator(f) ?? "",
    }));

    const grat = geoPathGenerator(geoGraticule10()) ?? "";

    return {
      countriesList: paths,
      graticulePath: grat,
      projection: proj,
    };
  }, []);

  // Map of visited place IDs
  const visitedMap = useMemo(() => {
    const map = new Map<string, AtlasPlace>();
    for (const p of PLACES) {
      map.set(p.id, p);
    }
    return map;
  }, []);

  // Compute projected [x, y] for pins
  const pinPositions = useMemo(() => {
    return PLACES.map((p) => {
      const projected = projection(p.coords) ?? [0, 0];
      return {
        ...p,
        x: projected[0],
        y: projected[1],
      };
    });
  }, [projection]);

  // Compute smooth SVG transform for region zoom
  const currentTransform = useMemo(() => {
    if (!selectedPlace) {
      return "translate(0px, 0px) scale(1)";
    }
    const pin = pinPositions.find((p) => p.id === selectedPlace.id);
    if (!pin) return "translate(0px, 0px) scale(1)";

    const S = selectedPlace.zoomScale;
    const tx = W / 2 - pin.x * S;
    const ty = H / 2 - pin.y * S;
    return `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${S})`;
  }, [selectedPlace, pinPositions]);

  // Reset to full world view
  const handleReset = () => {
    setSelectedPlace(null);
    setHoveredPlaceId(null);
    setCursorTooltip(null);
  };

  // Step through places (Previous / Next)
  const activePlace = selectedPlace ?? pinPositions.find((p) => p.id === hoveredPlaceId) ?? null;
  const currentPlaceIndex = selectedPlace ? PLACES.findIndex((p) => p.id === selectedPlace.id) : -1;

  const handlePrevPlace = () => {
    const prevIdx = currentPlaceIndex <= 0 ? PLACES.length - 1 : currentPlaceIndex - 1;
    setSelectedPlace(PLACES[prevIdx]);
  };

  const handleNextPlace = () => {
    const nextIdx = currentPlaceIndex === -1 || currentPlaceIndex === PLACES.length - 1 ? 0 : currentPlaceIndex + 1;
    setSelectedPlace(PLACES[nextIdx]);
  };

  // Dynamic pin scaling: scale pins down proportionally when zoomed in so London, Amsterdam, Berlin never overlap
  const currentScale = selectedPlace ? selectedPlace.zoomScale : 1;
  const pinRadius = selectedPlace ? Math.max(1.7, 5.5 / Math.sqrt(currentScale)) : 5.2;

  const isExpandedStage = selectedPlace !== null;

  return (
    <div style={{ padding: "0 0 10px" }}>
      {/* ── Top-level Atlas Header ── */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "var(--cobalt)",
              boxShadow: "0 0 8px var(--cobalt)",
              display: "inline-block",
            }}
          />
          <div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--cobalt)",
              }}
            >
              Personal World Atlas
            </span>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                margin: "2px 0 0",
              }}
            >
              7 countries explored across North Africa, Europe, Eurasia &amp; the Middle East
            </p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--crimson)",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--crimson)",
                boxShadow: "0 0 6px var(--crimson)",
              }}
            />
            Home Base
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--cobalt)",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--cobalt)",
                boxShadow: "0 0 6px var(--cobalt)",
              }}
            />
            Visited
          </span>
        </div>
      </div>

      {/* ── Compact Horizontal Pill Bar (Visible when in Expanded Focus Stage) ── */}
      {isExpandedStage && (
        <div
          style={{
            padding: "12px 20px",
            backgroundColor: "var(--bg-card)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginRight: 4,
              flexShrink: 0,
            }}
          >
            The Places:
          </span>
          {PLACES.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            const accent = place.isHome ? "var(--crimson)" : "var(--cobalt)";
            return (
              <button
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 600,
                  border: `1px solid ${isSelected ? accent : "var(--border)"}`,
                  backgroundColor: isSelected
                    ? place.isHome
                      ? "var(--crimson-bg)"
                      : "var(--cobalt-bg)"
                    : "var(--bg)",
                  color: isSelected ? accent : "var(--text-primary)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: accent,
                  }}
                />
                {place.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Main Map Canvas + Sidebar Layout ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          borderBottom: "1px solid var(--border)",
          transition: "all 0.4s ease",
        }}
      >
        {/* Main Map Viewport Stage */}
        <div
          style={{
            flex: isExpandedStage ? "1 1 100%" : "1 1 68%",
            width: isExpandedStage ? "100%" : undefined,
            position: "relative",
            minHeight: isExpandedStage ? 620 : 480,
            backgroundColor: "var(--map-ocean, #F8FAFC)",
            overflow: "hidden",
            borderRight: isExpandedStage ? "none" : "1px solid var(--border)",
            transition: "min-height 0.45s ease, flex 0.45s ease",
          }}
        >
          {/* Top-Left Status Pill */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 16,
              zIndex: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 14px",
              borderRadius: 999,
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-primary)",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: selectedPlace
                  ? selectedPlace.isHome
                    ? "var(--crimson)"
                    : "var(--cobalt)"
                  : "var(--text-muted)",
              }}
            />
            {selectedPlace ? `${selectedPlace.name} · ${selectedPlace.region}` : (cursorTooltip ? cursorTooltip.name : "World View · Click Any Country")}
          </div>

          {/* Prominent "Reset / World View ↗" Button */}
          {selectedPlace && (
            <button
              onClick={handleReset}
              aria-label="Reset to World View"
              style={{
                position: "absolute",
                top: 14,
                right: 16,
                zIndex: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 18px",
                borderRadius: 999,
                backgroundColor: "var(--cobalt)",
                color: "#FFFFFF",
                border: "none",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(2, 132, 199, 0.35)",
                transition: "all 0.15s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Reset / World View ↗
            </button>
          )}

          {/* Interactive SVG World Map with 50m High Resolution */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{
              width: "100%",
              height: "100%",
              minHeight: isExpandedStage ? 620 : 480,
              display: "block",
              userSelect: "none",
            }}
            aria-label="Interactive World Atlas map"
          >
            <defs>
              {/* Editorial Dotted Texture Overlay */}
              <pattern
                id="atlas-dots"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="0.8"
                  fill="var(--map-grid, rgba(148, 163, 184, 0.25))"
                />
              </pattern>
            </defs>

            {/* Ocean Surface + Dotted Grid */}
            <rect width={W} height={H} fill="var(--map-ocean, #F8FAFC)" />
            <rect width={W} height={H} fill="url(#atlas-dots)" />

            {/* Zoomable & Pannable Group */}
            <g
              style={{
                transform: currentTransform,
                transformOrigin: "0 0",
                transition: "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Subtle Latitude/Longitude Graticule Lines */}
              {graticulePath && (
                <path
                  d={graticulePath}
                  fill="none"
                  stroke="var(--map-grid, rgba(148, 163, 184, 0.25))"
                  strokeWidth="0.5"
                  strokeDasharray="2 3"
                  opacity="0.6"
                />
              )}

              {/* All Real World Countries (50m High Resolution) */}
              <g id="world-polygons">
                {countriesList.map((country) => {
                  const place = visitedMap.get(country.id);
                  const isSelected = selectedPlace?.id === country.id;
                  const isHovered = hoveredPlaceId === country.id;

                  // High-contrast clean polygon styling
                  let fill = "var(--map-land, #CBD5E1)";
                  let stroke = "var(--map-land-border, #FFFFFF)";
                  let strokeWidth = "0.5";

                  if (place) {
                    if (isSelected) {
                      fill = place.isHome ? "var(--crimson)" : "var(--cobalt)";
                      stroke = "#FFFFFF";
                      strokeWidth = "1.2";
                    } else if (isHovered) {
                      fill = place.isHome ? "var(--crimson-bg)" : "var(--cobalt-bg)";
                      stroke = place.isHome ? "var(--crimson)" : "var(--cobalt)";
                      strokeWidth = "1.0";
                    } else {
                      // Visited unselected
                      fill = place.isHome ? "var(--crimson-bg)" : "var(--map-visited-land, #BAE6FD)";
                      stroke = place.isHome ? "var(--crimson-border)" : "var(--map-visited-border, #38BDF8)";
                      strokeWidth = "0.7";
                    }
                  } else if (cursorTooltip?.name === country.name) {
                    // Unvisited country hover highlight
                    fill = "var(--border)";
                  }

                  return (
                    <path
                      key={country.id}
                      d={country.d}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      style={{
                        cursor: "pointer",
                        transition: "fill 0.2s ease, stroke 0.2s ease",
                      }}
                      onClick={() => {
                        if (place) {
                          if (selectedPlace?.id === place.id) {
                            handleReset();
                          } else {
                            setSelectedPlace(place);
                          }
                        }
                      }}
                      onMouseEnter={() => {
                        setCursorTooltip({ name: country.name, isVisited: Boolean(place) });
                        if (place) setHoveredPlaceId(place.id);
                      }}
                      onMouseLeave={() => {
                        setCursorTooltip(null);
                        if (place && hoveredPlaceId === place.id) setHoveredPlaceId(null);
                      }}
                    >
                      <title>{country.name}</title>
                    </path>
                  );
                })}
              </g>

              {/* Scaled Pins for the 7 Places */}
              <g id="atlas-pins">
                {pinPositions.map((pin) => {
                  const isSelected = selectedPlace?.id === pin.id;
                  const isHovered = hoveredPlaceId === pin.id;
                  const color = pin.isHome ? "var(--crimson)" : "var(--cobalt)";

                  // Floating label logic: Only show for hovered or selected (and always show for Tunisia home base when not zoomed far)
                  const showLabel =
                    isSelected ||
                    isHovered ||
                    (pin.isHome && !selectedPlace);

                  // Dynamic sizing to prevent overlaps
                  const outerRadius = isSelected ? pinRadius * 2.8 : pinRadius * 2.1;
                  const ringRadius = pinRadius * 1.5;

                  return (
                    <g
                      key={pin.id}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedPlace?.id === pin.id) {
                          handleReset();
                        } else {
                          setSelectedPlace(pin);
                        }
                      }}
                      onMouseEnter={() => {
                        setHoveredPlaceId(pin.id);
                        setCursorTooltip({ name: pin.name, isVisited: true });
                      }}
                      onMouseLeave={() => {
                        if (hoveredPlaceId === pin.id) setHoveredPlaceId(null);
                        setCursorTooltip(null);
                      }}
                    >
                      {/* Outer pulse / glow ring */}
                      <circle
                        cx={pin.x}
                        cy={pin.y}
                        r={outerRadius}
                        fill={color}
                        opacity={isSelected ? 0.35 : 0.18}
                      />

                      {/* Middle crisp ring */}
                      <circle
                        cx={pin.x}
                        cy={pin.y}
                        r={ringRadius}
                        fill="none"
                        stroke={color}
                        strokeWidth={isSelected ? 1.5 : 1.0}
                      />

                      {/* Center dot pin */}
                      <circle
                        cx={pin.x}
                        cy={pin.y}
                        r={pinRadius}
                        fill={isSelected ? "#FFFFFF" : color}
                        stroke={isSelected ? color : "#FFFFFF"}
                        strokeWidth={0.8}
                      />

                      {/* Floating Label Pill (Avoids crowding across Europe) */}
                      {showLabel && (
                        <g style={{ pointerEvents: "none" }}>
                          {/* Label Box Background */}
                          <rect
                            x={pin.x + pinRadius * 2}
                            y={pin.y - 10 / Math.sqrt(currentScale)}
                            width={pin.name.length * (5.8 / Math.sqrt(currentScale)) + 14 / Math.sqrt(currentScale)}
                            height={15 / Math.sqrt(currentScale)}
                            rx={7.5 / Math.sqrt(currentScale)}
                            fill="var(--bg-card)"
                            stroke={isSelected ? color : "var(--border)"}
                            strokeWidth={isSelected ? 1.2 : 0.8}
                            style={{
                              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))",
                            }}
                          />
                          {/* Indicator mini dot */}
                          <circle
                            cx={pin.x + pinRadius * 2 + 5 / Math.sqrt(currentScale)}
                            cy={pin.y - 2.5 / Math.sqrt(currentScale)}
                            r={2 / Math.sqrt(currentScale)}
                            fill={color}
                          />
                          {/* Label Text */}
                          <text
                            x={pin.x + pinRadius * 2 + 9 / Math.sqrt(currentScale)}
                            y={pin.y - 1.5 / Math.sqrt(currentScale)}
                            fontSize={7.8 / Math.sqrt(currentScale)}
                            fontWeight="700"
                            letterSpacing="0.02em"
                            fill="var(--text-primary)"
                            dominantBaseline="central"
                          >
                            {pin.name}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
        </div>

        {/* Right Sidebar: "THE PLACES" (Hidden when in expanded global focus stage) */}
        {!isExpandedStage && (
          <div
            style={{
              flex: "1 1 240px",
              padding: "24px 22px 20px",
              backgroundColor: "var(--bg-card)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                paddingBottom: 14,
                marginBottom: 12,
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                The Places
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                7 countries
              </span>
            </div>

            {/* Clickable Country List (Strict rule: NO item numbers) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {PLACES.map((place) => {
                const isHovered = hoveredPlaceId === place.id;
                const accent = place.isHome ? "var(--crimson)" : "var(--cobalt)";

                return (
                  <button
                    key={place.id}
                    onClick={() => {
                      setSelectedPlace(place);
                    }}
                    onMouseEnter={() => setHoveredPlaceId(place.id)}
                    onMouseLeave={() => {
                      if (hoveredPlaceId === place.id) setHoveredPlaceId(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 11,
                      border: `1px solid ${
                        isHovered
                          ? "var(--border)"
                          : "transparent"
                      }`,
                      backgroundColor: isHovered
                        ? "var(--bg-hover, var(--tag-bg))"
                        : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: accent,
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            lineHeight: 1.25,
                          }}
                        >
                          {place.name}
                        </p>
                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: 11.5,
                            color: "var(--text-muted)",
                            lineHeight: 1.2,
                          }}
                        >
                          {place.isHome ? "Home Base · Tunisia" : place.region.replace(" · Visited", "")}
                        </p>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        opacity: 0.6,
                      }}
                    >
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Editorial Detail Bar with Previous / Next Stepper ── */}
      <div
        style={{
          padding: "22px 26px",
          backgroundColor: "var(--bg-card)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 18,
        }}
      >
        <div style={{ flex: "1 1 440px" }}>
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: activePlace?.isHome ? "var(--crimson)" : "var(--cobalt)",
              marginBottom: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: activePlace?.isHome ? "var(--crimson)" : "var(--cobalt)",
              }}
            />
            {activePlace?.isHome ? "STARTING POINT" : "COUNTRY VISITED"}
          </div>

          {/* Large Editorial Heading */}
          <h3
            style={{
              margin: 0,
              fontSize: "clamp(1.5rem, 2.6vw, 1.95rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            {activePlace ? activePlace.name : "Sousse, Tunisia & The World"}
          </h3>

          {/* Subtitle */}
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13.5,
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            {activePlace ? activePlace.subtitle : "Click any country or pin to inspect regional geography"}
          </p>

          {/* Description */}
          {activePlace && (
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 13.5,
                lineHeight: 1.75,
                color: "var(--text-secondary)",
                maxWidth: 720,
              }}
            >
              {activePlace.description}
            </p>
          )}
        </div>

        {/* Right Action Stack: Coordinates Badge + "← Previous" / "Next →" Stepper */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {/* Geographic Coordinates Display */}
          {activePlace && (
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                backgroundColor: "var(--tag-bg)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                textAlign: "right",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Coordinates
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {activePlace.coordinatesDisplay}
              </span>
            </div>
          )}

          {/* Stepper Navigation: ← Previous / Next → */}
          {selectedPlace && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={handlePrevPlace}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--cobalt)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                ← Previous
              </button>

              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  padding: "0 4px",
                }}
              >
                {currentPlaceIndex + 1} / {PLACES.length}
              </span>

              <button
                onClick={handleNextPlace}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--cobalt)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
