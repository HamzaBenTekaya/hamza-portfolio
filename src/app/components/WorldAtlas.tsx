"use client";

import { useMemo, useState } from "react";
import { geoEqualEarth, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, Objects } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import worldDataRaw from "world-atlas/countries-110m.json";

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

// ─── 7 Editorial Places ───────────────────────────────────────────────────
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
    zoomScale: 2.8,
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
    zoomScale: 2.6,
  },
  {
    id: "276",
    name: "Germany",
    countryName: "Germany",
    region: "Europe · Visited",
    coords: [10.4515, 51.1657], // Berlin / Munich
    coordinatesDisplay: "51.17° N / 10.45° E",
    subtitle: "A country I have visited in Europe",
    description:
      "Visited central European engineering and cultural hubs; certified in German (ÖSD) and preparing for prospective study and research.",
    zoomScale: 2.8,
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
      "Experienced pioneering urban design, sustainable infrastructure, and maritime engineering heritage.",
    zoomScale: 3.2,
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
    zoomScale: 2.8,
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
    zoomScale: 2.6,
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
      "Traveled across the Arabian Peninsula, visiting Riyadh, Jeddah, and holy landmarks.",
    zoomScale: 2.4,
  },
];

const W = 900;
const H = 460;

export default function WorldAtlas() {
  const [selectedPlace, setSelectedPlace] = useState<AtlasPlace | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);

  // ─── Generate Real Geo Projections & Paths ──────────────────────────────
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

    // Fit equal earth projection nicely to 900x460
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
  };

  // Active or hovered place for floating pill / detail card
  const activePlace = selectedPlace ?? pinPositions.find((p) => p.id === hoveredPlaceId) ?? null;

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

      {/* ── Two-Column Layout: Main SVG Map (74%) + Sidebar (26%) ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Main Map Canvas Area */}
        <div
          style={{
            flex: "1 1 560px",
            position: "relative",
            minHeight: 380,
            backgroundColor: "var(--map-ocean, #F8FAFC)",
            overflow: "hidden",
            borderRight: "1px solid var(--border)",
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
              padding: "5px 12px",
              borderRadius: 999,
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
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
                backgroundColor: selectedPlace ? (selectedPlace.isHome ? "var(--crimson)" : "var(--cobalt)") : "var(--text-muted)",
              }}
            />
            {selectedPlace ? `${selectedPlace.name} · ${selectedPlace.region}` : "World View · Click a Country"}
          </div>

          {/* Top-Right "World ↗" Reset Button */}
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
                gap: 6,
                padding: "6px 14px",
                borderRadius: 999,
                backgroundColor: "var(--cobalt-bg)",
                color: "var(--cobalt)",
                border: "1px solid var(--cobalt-border)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.15s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--cobalt)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--cobalt-bg)";
                e.currentTarget.style.color = "var(--cobalt)";
              }}
            >
              World ↗
            </button>
          )}

          {/* Interactive SVG World Map */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{
              width: "100%",
              height: "auto",
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

              {/* All Real World Countries (110m resolution) */}
              <g id="world-polygons">
                {countriesList.map((country) => {
                  const place = visitedMap.get(country.id);
                  const isSelected = selectedPlace?.id === country.id;
                  const isHovered = hoveredPlaceId === country.id;

                  // Dynamic color styling
                  let fill = "var(--map-land, #CBD5E1)";
                  let stroke = "var(--map-land-border, #FFFFFF)";
                  let strokeWidth = "0.5";
                  let cursor = "default";

                  if (place) {
                    cursor = "pointer";
                    if (isSelected) {
                      fill = place.isHome ? "var(--crimson)" : "var(--cobalt)";
                      stroke = "#FFFFFF";
                      strokeWidth = "1.5";
                    } else if (isHovered) {
                      fill = place.isHome ? "var(--crimson-bg)" : "var(--cobalt-bg)";
                      stroke = place.isHome ? "var(--crimson)" : "var(--cobalt)";
                      strokeWidth = "1.2";
                    } else {
                      // Visited unselected
                      fill = place.isHome ? "var(--crimson-bg)" : "var(--map-visited-land, #BAE6FD)";
                      stroke = place.isHome ? "var(--crimson-border)" : "var(--map-visited-border, #38BDF8)";
                      strokeWidth = "0.8";
                    }
                  }

                  return (
                    <path
                      key={country.id}
                      d={country.d}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      style={{
                        cursor,
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
                        if (place) setHoveredPlaceId(place.id);
                      }}
                      onMouseLeave={() => {
                        if (place && hoveredPlaceId === place.id) setHoveredPlaceId(null);
                      }}
                    >
                      <title>{country.name}</title>
                    </path>
                  );
                })}
              </g>

              {/* Geographic Pins for the 7 Places */}
              <g id="atlas-pins">
                {pinPositions.map((pin) => {
                  const isSelected = selectedPlace?.id === pin.id;
                  const isHovered = hoveredPlaceId === pin.id;
                  const color = pin.isHome ? "var(--crimson)" : "var(--cobalt)";

                  // Floating label logic: Only show for hovered or selected (and always show for Tunisia home base when not zoomed far)
                  const showLabel =
                    isSelected ||
                    isHovered ||
                    (pin.isHome && (!selectedPlace || selectedPlace.id === pin.id));

                  const pinRadius = selectedPlace ? 4 : 5;

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
                      onMouseEnter={() => setHoveredPlaceId(pin.id)}
                      onMouseLeave={() => {
                        if (hoveredPlaceId === pin.id) setHoveredPlaceId(null);
                      }}
                    >
                      {/* Outer pulse / glow ring */}
                      <circle
                        cx={pin.x}
                        cy={pin.y}
                        r={isSelected ? 14 : isHovered ? 12 : 9}
                        fill={color}
                        opacity={isSelected ? 0.35 : 0.18}
                      />

                      {/* Middle crisp ring */}
                      <circle
                        cx={pin.x}
                        cy={pin.y}
                        r={pinRadius + 2.5}
                        fill="none"
                        stroke={color}
                        strokeWidth={isSelected ? 2 : 1.2}
                      />

                      {/* Center dot pin */}
                      <circle
                        cx={pin.x}
                        cy={pin.y}
                        r={pinRadius}
                        fill={isSelected ? "#FFFFFF" : color}
                        stroke={isSelected ? color : "#FFFFFF"}
                        strokeWidth="1.2"
                      />

                      {/* Floating Label Pill (Avoids crowding across Europe) */}
                      {showLabel && (
                        <g style={{ pointerEvents: "none" }}>
                          {/* Label Box Background */}
                          <rect
                            x={pin.x + 9}
                            y={pin.y - 12}
                            width={pin.name.length * 6.5 + 16}
                            height={18}
                            rx={9}
                            fill="var(--bg-card)"
                            stroke={isSelected ? color : "var(--border)"}
                            strokeWidth={isSelected ? 1.5 : 1}
                            style={{
                              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))",
                            }}
                          />
                          {/* Indicator mini dot */}
                          <circle
                            cx={pin.x + 16}
                            cy={pin.y - 3}
                            r={2.5}
                            fill={color}
                          />
                          {/* Label Text */}
                          <text
                            x={pin.x + 22}
                            y={pin.y + 0.5}
                            fontSize="9"
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

        {/* Right Sidebar: "THE PLACES" (26% width) */}
        <div
          style={{
            flex: "1 1 240px",
            padding: "20px 20px 16px",
            backgroundColor: "var(--bg-card)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              paddingBottom: 12,
              marginBottom: 10,
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
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PLACES.map((place) => {
              const isSelected = selectedPlace?.id === place.id;
              const isHovered = hoveredPlaceId === place.id;
              const accent = place.isHome ? "var(--crimson)" : "var(--cobalt)";

              return (
                <button
                  key={place.id}
                  onClick={() => {
                    if (selectedPlace?.id === place.id) {
                      handleReset();
                    } else {
                      setSelectedPlace(place);
                    }
                  }}
                  onMouseEnter={() => setHoveredPlaceId(place.id)}
                  onMouseLeave={() => {
                    if (hoveredPlaceId === place.id) setHoveredPlaceId(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: `1px solid ${
                      isSelected
                        ? accent
                        : isHovered
                        ? "var(--border)"
                        : "transparent"
                    }`,
                    backgroundColor: isSelected
                      ? place.isHome
                        ? "var(--crimson-bg)"
                        : "var(--cobalt-bg)"
                      : isHovered
                      ? "var(--bg-hover, var(--tag-bg))"
                      : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        backgroundColor: accent,
                        boxShadow: isSelected ? `0 0 6px ${accent}` : "none",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13.5,
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? accent : "var(--text-primary)",
                          lineHeight: 1.2,
                        }}
                      >
                        {place.name}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: 11,
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
                      fontSize: 11,
                      fontWeight: 700,
                      color: isSelected ? accent : "var(--text-muted)",
                      opacity: isSelected ? 1 : 0.6,
                    }}
                  >
                    {isSelected ? "●" : "→"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Editorial Detail Bar ── */}
      <div
        style={{
          padding: "20px 24px",
          backgroundColor: "var(--bg-card)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ flex: "1 1 420px" }}>
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
              fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
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
                fontSize: 13,
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                maxWidth: 680,
              }}
            >
              {activePlace.description}
            </p>
          )}
        </div>

        {/* Geographic Coordinates Display */}
        {activePlace && (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              backgroundColor: "var(--tag-bg)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 2,
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
      </div>
    </div>
  );
}
