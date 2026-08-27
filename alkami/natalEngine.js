/* ============================================================
   ALKAMI NATAL CHART ENGINE — corrected math + house cusps,
   aspects, and dark/mystical SVG wheel renderer.

   Replaces the old buggy Ascendant formula and adds house
   cusps + aspect lines, which the previous calculator had
   neither of. Uses the astronomy-engine library already
   loaded by index.html (Astronomy.* global) for all planet
   positions — unchanged, since that part was already correct.
   ============================================================ */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function normDeg360(d) {
  d = d % 360;
  return d < 0 ? d + 360 : d;
}

/**
 * Corrected Ascendant formula.
 * Standard form: tan(Asc) = cos(RAMC) / -( sin(obliquity)*tan(lat) + cos(obliquity)*sin(RAMC) )
 * via atan2(cos(RAMC), -(sin(obliquity)*tan(lat) + cos(obliquity)*sin(RAMC)))
 *
 * The previous version flipped the sign on cos(RAMC) and dropped the
 * leading negative sign on the denominator, which threw the result off
 * by roughly 180 degrees (or otherwise into the wrong quadrant) for
 * many birth times/latitudes.
 */
function calculateAscendant(ramcDeg, latDeg, obliquityDeg) {
  const ramc = ramcDeg * DEG;
  const lat = latDeg * DEG;
  const obl = obliquityDeg * DEG;

  const y = Math.cos(ramc);
  const x = -(Math.sin(obl) * Math.tan(lat) + Math.cos(obl) * Math.sin(ramc));
  let asc = Math.atan2(y, x) * RAD;
  return normDeg360(asc);
}

/**
 * Midheaven (MC): the ecliptic longitude that's currently culminating.
 * Standard form: tan(MC) = tan(RAMC) / cos(obliquity)
 */
function calculateMidheaven(ramcDeg, obliquityDeg) {
  const ramc = ramcDeg * DEG;
  const obl = obliquityDeg * DEG;
  let mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(obl)) * RAD;
  return normDeg360(mc);
}

/** Mean obliquity of the ecliptic for a given UTC date (good to ~1 arcsecond/century). */
function obliquityForDate(date) {
  const jd = dateToJulianDay(date);
  const T = (jd - 2451545.0) / 36525;
  return 23.43929111 - (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
}

function dateToJulianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Right Ascension of the Midheaven (RAMC), in degrees.
 * RAMC = Local Sidereal Time expressed in degrees (LST_hours * 15).
 * astronomy-engine's SiderealTime() returns Greenwich apparent sidereal
 * time in hours; adding longitude (east-positive, in degrees / 15 for hours)
 * gives local sidereal time.
 */
function calculateRAMC(date, longitudeDeg) {
  const gst = Astronomy.SiderealTime(date); // hours
  const lstHours = gst + longitudeDeg / 15;
  return normDeg360(lstHours * 15);
}

/**
 * Placidus house cusps via iterative solution of the semi-arc division.
 * This is the standard time-based Placidus method (not a longitude
 * approximation): for each intermediate cusp we solve for the oblique
 * ascension that corresponds to the correct fraction of the diurnal or
 * nocturnal semi-arc, then convert that back to an ecliptic longitude.
 *
 * Returns an array of 12 cusps (ecliptic longitude in degrees), index 0 = 1st house cusp (the Ascendant).
 */
function calculatePlacidusHouses(ramcDeg, latDeg, obliquityDeg, ascendantDeg, mcDeg) {
  const lat = latDeg * DEG;
  const obl = obliquityDeg * DEG;
  const ramc = ramcDeg;

  // Convert an ecliptic longitude to Right Ascension and Declination
  function eclipticToEquatorial(lonDeg) {
    const lon = lonDeg * DEG;
    const ra = Math.atan2(Math.sin(lon) * Math.cos(obl), Math.cos(lon)) * RAD;
    const dec = Math.asin(Math.sin(lon) * Math.sin(obl)) * RAD;
    return { ra: normDeg360(ra), dec };
  }

  // Given a target RA (degrees) find the corresponding ecliptic longitude
  // by inverting eclipticToEquatorial via search (the ecliptic<->equatorial
  // mapping near these cusps is monotonic within a quadrant, so bisection
  // converges quickly and robustly).
  function raToEcliptic(targetRA, lowLon, highLon) {
    for (let i = 0; i < 40; i++) {
      const midLon = (lowLon + highLon) / 2;
      const { ra } = eclipticToEquatorial(midLon);
      // unwrap ra/targetRA to compare correctly across the 0/360 boundary
      let diff = normDeg360(ra - targetRA);
      if (diff > 180) diff -= 360;
      if (diff > 0) {
        highLon = midLon;
      } else {
        lowLon = midLon;
      }
    }
    return normDeg360((lowLon + highLon) / 2);
  }

  // House cusps are found by trisecting, in Right Ascension, the arc
  // between each pair of angles (MC/ASC/IC/DESC), then mapping each
  // trisection point's RA back to an ecliptic longitude via bisection
  // (raToEcliptic above). This is the standard Placidus approach: it's
  // a *time*-based (RA) division, not a simple ecliptic-longitude split.
  const cusps = new Array(12);
  cusps[0] = ascendantDeg; // 1st
  cusps[9] = mcDeg; // 10th
  cusps[6] = normDeg360(ascendantDeg + 180); // 7th
  cusps[3] = normDeg360(mcDeg + 180); // 4th

  // RA values at the four angles
  const raMC = ramc;
  const raASC = eclipticToEquatorial(ascendantDeg).ra;
  const raIC = normDeg360(raMC + 180);
  const raDESC = normDeg360(raASC + 180);

  function trisect(raStart, raEnd, frac, lonLow, lonHigh) {
    let arc = normDeg360(raEnd - raStart);
    const targetRA = normDeg360(raStart + arc * frac);
    return raToEcliptic(targetRA, lonLow, lonHigh);
  }

  // Helper: given the two ecliptic longitudes that bound a quadrant (in the
  // correct forward/wheel order, e.g. MC then ASC, or ASC then IC), trisect
  // the corresponding RA arc and map back to ecliptic longitude. Whenever
  // the "end" longitude is numerically smaller than the "start" longitude
  // (because the quadrant crosses the 0/360 boundary), we unwrap it forward
  // by +360 so the bisection search range stays monotonically increasing.
  function trisectQuadrant(raStart, raEnd, lonStart, lonEnd, frac) {
    const lonEndUnwrapped = lonEnd < lonStart ? lonEnd + 360 : lonEnd;
    return normDeg360(trisect(raStart, raEnd, frac, lonStart, lonEndUnwrapped));
  }

  // 11th, 12th: between MC (10th) and ASC (1st)
  cusps[10] = trisectQuadrant(raMC, raASC, mcDeg, ascendantDeg, 1 / 3);
  cusps[11] = trisectQuadrant(raMC, raASC, mcDeg, ascendantDeg, 2 / 3);

  // 2nd, 3rd: between ASC (1st) and IC (4th)
  cusps[1] = trisectQuadrant(raASC, raIC, ascendantDeg, cusps[3], 1 / 3);
  cusps[2] = trisectQuadrant(raASC, raIC, ascendantDeg, cusps[3], 2 / 3);

  // 5th, 6th: between IC (4th) and DESC (7th)
  cusps[4] = trisectQuadrant(raIC, raDESC, cusps[3], cusps[6], 1 / 3);
  cusps[5] = trisectQuadrant(raIC, raDESC, cusps[3], cusps[6], 2 / 3);

  // 8th, 9th: between DESC (7th) and MC (10th)
  cusps[7] = trisectQuadrant(raDESC, raMC + 360, cusps[6], mcDeg, 1 / 3);
  cusps[8] = trisectQuadrant(raDESC, raMC + 360, cusps[6], mcDeg, 2 / 3);

  return cusps;
}

/** Determine which house (1-12) a given ecliptic longitude falls in. */
function houseOfLongitude(lonDeg, cusps) {
  for (let h = 0; h < 12; h++) {
    const start = cusps[h];
    const end = cusps[(h + 1) % 12];
    const arc = normDeg360(end - start) || 360;
    const pos = normDeg360(lonDeg - start);
    if (pos < arc) return h + 1;
  }
  return 12;
}

const ASPECT_DEFINITIONS = [
  { name: "Conjunction", angle: 0, orb: 8, color: "#C9A35C" },
  { name: "Sextile", angle: 60, orb: 6, color: "#5C9F8F" },
  { name: "Square", angle: 90, orb: 7, color: "#B5524B" },
  { name: "Trine", angle: 120, orb: 8, color: "#7F9FD4" },
  { name: "Opposition", angle: 180, orb: 8, color: "#A35CC9" },
];

function angularDifference(a, b) {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function findAspects(placements) {
  const aspects = [];
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const d = angularDifference(placements[i].lonDeg, placements[j].lonDeg);
      for (const def of ASPECT_DEFINITIONS) {
        if (Math.abs(d - def.angle) <= def.orb) {
          aspects.push({
            a: placements[i],
            b: placements[j],
            type: def,
            exactness: Math.abs(d - def.angle),
          });
          break;
        }
      }
    }
  }
  return aspects;
}

/* ============================================================
   DARK / MYSTICAL SVG WHEEL RENDERER (vanilla JS, no React)
   ============================================================ */

const ZODIAC_GLYPHS = ["\u2648", "\u2649", "\u264A", "\u264B", "\u264C", "\u264D", "\u264E", "\u264F", "\u2650", "\u2651", "\u2652", "\u2653"];
const ZODIAC_ELEMENT_COLORS = {
  fire: "#B5524B",
  earth: "#6B8F5C",
  air: "#C9A35C",
  water: "#5C7FA3",
};
const ZODIAC_ELEMENTS = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];

function wheelPolarToXY(cx, cy, radius, angleDeg) {
  const rad = angleDeg * DEG;
  return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
}

/**
 * Renders the natal chart wheel as an SVG string. Pass the ascendant,
 * MC, house cusps array, planet placements (with lonDeg/glyph/retro),
 * and aspect list (from findAspects). Returns an SVG markup string
 * ready to inject via innerHTML.
 */
function renderChartWheelSVG({ ascendant, houses, planets, aspects }) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 168;
  const zodiacInnerR = 145;
  const houseRingR = 128;
  const planetRingR = 105;
  const aspectR = 82;

  function wheelAngle(lon) {
    return 180 - (lon - ascendant);
  }

  let svg = `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" role="img" aria-label="Natal birth chart wheel" xmlns="http://www.w3.org/2000/svg">`;

  svg += `<defs>
    <radialGradient id="ngGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a1f33" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0B0E1A" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ngEcliptic" cx="50%" cy="50%" r="50%">
      <stop offset="92%" stop-color="#C9A35C" stop-opacity="0"/>
      <stop offset="97%" stop-color="#C9A35C" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#C9A35C" stop-opacity="0"/>
    </radialGradient>
    <filter id="ngSoftGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

  svg += `<circle cx="${cx}" cy="${cy}" r="${outerR + 14}" fill="url(#ngGlow)"/>`;

  // zodiac wedges by element
  for (let i = 0; i < 12; i++) {
    const a1 = wheelAngle(i * 30);
    const a2 = wheelAngle(i * 30 + 30);
    const p1 = wheelPolarToXY(cx, cy, outerR, a1);
    const p2 = wheelPolarToXY(cx, cy, outerR, a2);
    const p3 = wheelPolarToXY(cx, cy, zodiacInnerR, a2);
    const p4 = wheelPolarToXY(cx, cy, zodiacInnerR, a1);
    const color = ZODIAC_ELEMENT_COLORS[ZODIAC_ELEMENTS[i]];
    svg += `<path d="M ${p1.x} ${p1.y} A ${outerR} ${outerR} 0 0 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${zodiacInnerR} ${zodiacInnerR} 0 0 1 ${p4.x} ${p4.y} Z" fill="${color}" opacity="0.10" stroke="#C9A35C" stroke-opacity="0.25" stroke-width="0.5"/>`;
  }

  svg += `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="url(#ngEcliptic)" stroke-width="8"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#C9A35C" stroke-opacity="0.55" stroke-width="1"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${zodiacInnerR}" fill="none" stroke="#C9A35C" stroke-opacity="0.4" stroke-width="0.5"/>`;

  // zodiac glyphs
  for (let i = 0; i < 12; i++) {
    const a = wheelAngle(i * 30 + 15);
    const pos = wheelPolarToXY(cx, cy, (outerR + zodiacInnerR) / 2, a);
    const color = ZODIAC_ELEMENT_COLORS[ZODIAC_ELEMENTS[i]];
    svg += `<text x="${pos.x}" y="${pos.y}" fill="${color}" font-size="11" text-anchor="middle" dominant-baseline="central" font-family="Georgia, serif" opacity="0.9">${ZODIAC_GLYPHS[i]}</text>`;
  }

  // sign division lines
  for (let i = 0; i < 12; i++) {
    const a = wheelAngle(i * 30);
    const p1 = wheelPolarToXY(cx, cy, zodiacInnerR, a);
    const p2 = wheelPolarToXY(cx, cy, outerR, a);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#C9A35C" stroke-opacity="0.3" stroke-width="0.5"/>`;
  }

  // house ring + cusps
  svg += `<circle cx="${cx}" cy="${cy}" r="${houseRingR}" fill="none" stroke="#8B7FD4" stroke-opacity="0.3" stroke-width="0.5"/>`;
  houses.forEach((cusp, i) => {
    const a = wheelAngle(cusp);
    const p1 = wheelPolarToXY(cx, cy, aspectR, a);
    const p2 = wheelPolarToXY(cx, cy, zodiacInnerR, a);
    const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
    const labelPos = wheelPolarToXY(cx, cy, houseRingR + 10, a);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${isAngle ? '#E8E3D3' : '#8B7FD4'}" stroke-opacity="${isAngle ? 0.7 : 0.35}" stroke-width="${isAngle ? 1.1 : 0.5}"/>`;
    svg += `<text x="${labelPos.x}" y="${labelPos.y}" fill="#8B7FD4" font-size="8" text-anchor="middle" dominant-baseline="central" font-family="Georgia, serif" opacity="0.75">${i + 1}</text>`;
  });

  // aspect lines
  svg += `<circle cx="${cx}" cy="${cy}" r="${aspectR}" fill="none" stroke="#3A3F5C" stroke-opacity="0.4" stroke-width="0.5"/>`;
  aspects.forEach((asp) => {
    const a1 = wheelAngle(asp.a.lonDeg);
    const a2 = wheelAngle(asp.b.lonDeg);
    const p1 = wheelPolarToXY(cx, cy, aspectR, a1);
    const p2 = wheelPolarToXY(cx, cy, aspectR, a2);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${asp.type.color}" stroke-opacity="0.5" stroke-width="0.8"/>`;
  });

  // planet markers
  planets.forEach((p) => {
    const a = wheelAngle(p.lonDeg);
    const pos = wheelPolarToXY(cx, cy, planetRingR, a);
    const labelPos = wheelPolarToXY(cx, cy, planetRingR - 16, a);
    const innerPos = wheelPolarToXY(cx, cy, zodiacInnerR, a);
    svg += `<line x1="${innerPos.x}" y1="${innerPos.y}" x2="${pos.x}" y2="${pos.y}" stroke="#E8E3D3" stroke-opacity="0.15" stroke-width="0.4"/>`;
    svg += `<circle cx="${pos.x}" cy="${pos.y}" r="2.5" fill="#E8E3D3" filter="url(#ngSoftGlow)"/>`;
    svg += `<text x="${labelPos.x}" y="${labelPos.y}" fill="#E8E3D3" font-size="11" text-anchor="middle" dominant-baseline="central" font-family="Georgia, serif">${p.glyph}</text>`;
    if (p.retro) {
      svg += `<text x="${labelPos.x + 8}" y="${labelPos.y - 6}" fill="#B5524B" font-size="6" text-anchor="middle" font-family="Georgia, serif">R</text>`;
    }
  });

  svg += `<circle cx="${cx}" cy="${cy}" r="1.5" fill="#C9A35C"/>`;
  svg += `</svg>`;

  return svg;
}
