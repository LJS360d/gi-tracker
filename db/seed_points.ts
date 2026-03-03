type Waypoint = { lat: number; lng: number };
type SegmentType = "ground" | "plane" | "boat";
export type Leg = {
  from: Waypoint;
  to: Waypoint;
  segment_type: SegmentType;
  steps: number;
};

function interpolate(
  from: Waypoint,
  to: Waypoint,
  steps: number,
): Waypoint[] {
  const out: Waypoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    out.push({
      lat: from.lat + t * (to.lat - from.lat),
      lng: from.lng + t * (to.lng - from.lng),
    });
  }
  return out;
}

export const legs: Leg[] = [
  { from: { lat: 43.87, lng: 10.52 }, to: { lat: 43.72, lng: 10.4 }, segment_type: "ground", steps: 12 },
  { from: { lat: 43.72, lng: 10.4 }, to: { lat: 43.77, lng: 11.25 }, segment_type: "ground", steps: 18 },
  { from: { lat: 43.77, lng: 11.25 }, to: { lat: 44.49, lng: 11.34 }, segment_type: "ground", steps: 15 },
  { from: { lat: 44.49, lng: 11.34 }, to: { lat: 44.84, lng: 11.62 }, segment_type: "ground", steps: 10 },
  { from: { lat: 44.84, lng: 11.62 }, to: { lat: 45.4, lng: 11.88 }, segment_type: "ground", steps: 14 },
  { from: { lat: 45.4, lng: 11.88 }, to: { lat: 45.44, lng: 12.32 }, segment_type: "ground", steps: 10 },
  { from: { lat: 45.44, lng: 12.32 }, to: { lat: 45.67, lng: 12.24 }, segment_type: "ground", steps: 8 },
  { from: { lat: 45.67, lng: 12.24 }, to: { lat: 46.07, lng: 13.23 }, segment_type: "ground", steps: 22 },
  { from: { lat: 46.07, lng: 13.23 }, to: { lat: 45.65, lng: 13.78 }, segment_type: "ground", steps: 12 },
  { from: { lat: 45.65, lng: 13.78 }, to: { lat: 45.55, lng: 13.73 }, segment_type: "ground", steps: 5 },
  { from: { lat: 45.55, lng: 13.73 }, to: { lat: 45.77, lng: 14.21 }, segment_type: "ground", steps: 14 },
  { from: { lat: 45.77, lng: 14.21 }, to: { lat: 46.06, lng: 14.51 }, segment_type: "ground", steps: 12 },
  { from: { lat: 46.06, lng: 14.51 }, to: { lat: 46.24, lng: 14.36 }, segment_type: "ground", steps: 8 },
  { from: { lat: 46.24, lng: 14.36 }, to: { lat: 46.56, lng: 15.65 }, segment_type: "ground", steps: 22 },
  { from: { lat: 46.56, lng: 15.65 }, to: { lat: 46.42, lng: 15.87 }, segment_type: "ground", steps: 8 },
  { from: { lat: 46.42, lng: 15.87 }, to: { lat: 45.81, lng: 15.98 }, segment_type: "ground", steps: 14 },
  { from: { lat: 45.81, lng: 15.98 }, to: { lat: 45.49, lng: 15.55 }, segment_type: "ground", steps: 12 },
  { from: { lat: 45.49, lng: 15.55 }, to: { lat: 45.33, lng: 14.44 }, segment_type: "ground", steps: 20 },
  { from: { lat: 45.33, lng: 14.44 }, to: { lat: 45.0, lng: 14.9 }, segment_type: "ground", steps: 14 },
  { from: { lat: 45.0, lng: 14.9 }, to: { lat: 44.12, lng: 15.23 }, segment_type: "ground", steps: 22 },
  { from: { lat: 44.12, lng: 15.23 }, to: { lat: 43.73, lng: 15.89 }, segment_type: "ground", steps: 18 },
  { from: { lat: 43.73, lng: 15.89 }, to: { lat: 43.51, lng: 16.44 }, segment_type: "ground", steps: 14 },
  { from: { lat: 43.51, lng: 16.44 }, to: { lat: 43.3, lng: 17.02 }, segment_type: "ground", steps: 16 },
  { from: { lat: 43.3, lng: 17.02 }, to: { lat: 42.65, lng: 18.09 }, segment_type: "ground", steps: 24 },
  { from: { lat: 42.65, lng: 18.09 }, to: { lat: 42.71, lng: 18.35 }, segment_type: "ground", steps: 8 },
  { from: { lat: 42.71, lng: 18.35 }, to: { lat: 43.34, lng: 17.81 }, segment_type: "ground", steps: 18 },
  { from: { lat: 43.34, lng: 17.81 }, to: { lat: 43.65, lng: 17.96 }, segment_type: "ground", steps: 10 },
  { from: { lat: 43.65, lng: 17.96 }, to: { lat: 43.85, lng: 18.36 }, segment_type: "ground", steps: 12 },
  { from: { lat: 43.85, lng: 18.36 }, to: { lat: 43.81, lng: 18.57 }, segment_type: "ground", steps: 6 },
  { from: { lat: 43.81, lng: 18.57 }, to: { lat: 43.17, lng: 18.53 }, segment_type: "ground", steps: 16 },
  { from: { lat: 43.17, lng: 18.53 }, to: { lat: 42.78, lng: 18.94 }, segment_type: "ground", steps: 16 },
  { from: { lat: 42.78, lng: 18.94 }, to: { lat: 42.43, lng: 19.26 }, segment_type: "ground", steps: 12 },
  { from: { lat: 42.43, lng: 19.26 }, to: { lat: 42.39, lng: 18.92 }, segment_type: "ground", steps: 10 },
  { from: { lat: 42.39, lng: 18.92 }, to: { lat: 42.28, lng: 18.84 }, segment_type: "ground", steps: 6 },
  { from: { lat: 42.28, lng: 18.84 }, to: { lat: 42.09, lng: 19.09 }, segment_type: "ground", steps: 10 },
  { from: { lat: 42.09, lng: 19.09 }, to: { lat: 42.07, lng: 19.51 }, segment_type: "ground", steps: 12 },
  { from: { lat: 42.07, lng: 19.51 }, to: { lat: 41.78, lng: 19.65 }, segment_type: "ground", steps: 10 },
  { from: { lat: 41.78, lng: 19.65 }, to: { lat: 41.33, lng: 19.82 }, segment_type: "ground", steps: 14 },
  { from: { lat: 41.33, lng: 19.82 }, to: { lat: 41.32, lng: 19.45 }, segment_type: "ground", steps: 10 },
  { from: { lat: 41.32, lng: 19.45 }, to: { lat: 41.11, lng: 20.08 }, segment_type: "ground", steps: 16 },
  { from: { lat: 41.11, lng: 20.08 }, to: { lat: 40.47, lng: 19.49 }, segment_type: "ground", steps: 20 },
  { from: { lat: 40.47, lng: 19.49 }, to: { lat: 40.08, lng: 20.14 }, segment_type: "ground", steps: 16 },
  { from: { lat: 40.08, lng: 20.14 }, to: { lat: 40.62, lng: 20.78 }, segment_type: "ground", steps: 18 },
  { from: { lat: 40.62, lng: 20.78 }, to: { lat: 41.12, lng: 20.8 }, segment_type: "ground", steps: 14 },
  { from: { lat: 41.12, lng: 20.8 }, to: { lat: 41.18, lng: 20.68 }, segment_type: "ground", steps: 5 },
  { from: { lat: 41.18, lng: 20.68 }, to: { lat: 41.03, lng: 21.33 }, segment_type: "ground", steps: 16 },
  { from: { lat: 41.03, lng: 21.33 }, to: { lat: 41.34, lng: 21.55 }, segment_type: "ground", steps: 10 },
  { from: { lat: 41.34, lng: 21.55 }, to: { lat: 41.99, lng: 21.43 }, segment_type: "ground", steps: 16 },
  { from: { lat: 41.99, lng: 21.43 }, to: { lat: 41.72, lng: 21.79 }, segment_type: "ground", steps: 10 },
  { from: { lat: 41.72, lng: 21.79 }, to: { lat: 40.64, lng: 22.94 }, segment_type: "ground", steps: 28 },
  { from: { lat: 40.64, lng: 22.94 }, to: { lat: 41.09, lng: 23.55 }, segment_type: "ground", steps: 18 },
  { from: { lat: 41.09, lng: 23.55 }, to: { lat: 41.68, lng: 26.56 }, segment_type: "ground", steps: 35 },
  { from: { lat: 41.68, lng: 26.56 }, to: { lat: 41.01, lng: 28.98 }, segment_type: "ground", steps: 28 },
  { from: { lat: 41.01, lng: 28.98 }, to: { lat: 40.77, lng: 29.92 }, segment_type: "ground", steps: 22 },
  { from: { lat: 40.77, lng: 29.92 }, to: { lat: 40.74, lng: 31.61 }, segment_type: "ground", steps: 20 },
  { from: { lat: 40.74, lng: 31.61 }, to: { lat: 39.93, lng: 32.85 }, segment_type: "ground", steps: 28 },
  { from: { lat: 39.93, lng: 32.85 }, to: { lat: 40.55, lng: 34.95 }, segment_type: "ground", steps: 25 },
  { from: { lat: 40.55, lng: 34.95 }, to: { lat: 40.65, lng: 35.83 }, segment_type: "ground", steps: 18 },
  { from: { lat: 40.65, lng: 35.83 }, to: { lat: 41.29, lng: 36.33 }, segment_type: "ground", steps: 18 },
  { from: { lat: 41.29, lng: 36.33 }, to: { lat: 40.98, lng: 37.88 }, segment_type: "ground", steps: 28 },
  { from: { lat: 40.98, lng: 37.88 }, to: { lat: 41.0, lng: 39.73 }, segment_type: "ground", steps: 32 },
  { from: { lat: 41.0, lng: 39.73 }, to: { lat: 41.62, lng: 41.62 }, segment_type: "ground", steps: 28 },
  { from: { lat: 41.62, lng: 41.62 }, to: { lat: 41.82, lng: 41.78 }, segment_type: "ground", steps: 8 },
  { from: { lat: 41.82, lng: 41.78 }, to: { lat: 42.27, lng: 42.7 }, segment_type: "ground", steps: 22 },
  { from: { lat: 42.27, lng: 42.7 }, to: { lat: 41.72, lng: 44.78 }, segment_type: "ground", steps: 28 },
  { from: { lat: 41.72, lng: 44.78 }, to: { lat: 41.55, lng: 60.63 }, segment_type: "plane", steps: 10 },
  { from: { lat: 41.55, lng: 60.63 }, to: { lat: 41.38, lng: 60.36 }, segment_type: "ground", steps: 8 },
  { from: { lat: 41.38, lng: 60.36 }, to: { lat: 42.46, lng: 59.61 }, segment_type: "ground", steps: 25 },
  { from: { lat: 42.46, lng: 59.61 }, to: { lat: 41.84, lng: 59.97 }, segment_type: "ground", steps: 18 },
  { from: { lat: 41.84, lng: 59.97 }, to: { lat: 39.77, lng: 64.43 }, segment_type: "ground", steps: 55 },
  { from: { lat: 39.77, lng: 64.43 }, to: { lat: 38.86, lng: 65.8 }, segment_type: "ground", steps: 22 },
  { from: { lat: 38.86, lng: 65.8 }, to: { lat: 37.6, lng: 61.83 }, segment_type: "ground", steps: 45 },
  { from: { lat: 37.6, lng: 61.83 }, to: { lat: 37.95, lng: 58.38 }, segment_type: "ground", steps: 40 },
  { from: { lat: 37.95, lng: 58.38 }, to: { lat: 37.38, lng: 60.51 }, segment_type: "ground", steps: 28 },
  { from: { lat: 37.38, lng: 60.51 }, to: { lat: 39.65, lng: 66.96 }, segment_type: "ground", steps: 55 },
  { from: { lat: 39.65, lng: 66.96 }, to: { lat: 40.12, lng: 67.84 }, segment_type: "ground", steps: 18 },
  { from: { lat: 40.12, lng: 67.84 }, to: { lat: 41.3, lng: 69.24 }, segment_type: "ground", steps: 28 },
  { from: { lat: 41.3, lng: 69.24 }, to: { lat: 42.34, lng: 69.59 }, segment_type: "ground", steps: 25 },
  { from: { lat: 42.34, lng: 69.59 }, to: { lat: 43.3, lng: 68.25 }, segment_type: "ground", steps: 25 },
  { from: { lat: 43.3, lng: 68.25 }, to: { lat: 44.85, lng: 65.5 }, segment_type: "ground", steps: 40 },
  { from: { lat: 44.85, lng: 65.5 }, to: { lat: 45.96, lng: 63.31 }, segment_type: "ground", steps: 28 },
  { from: { lat: 45.96, lng: 63.31 }, to: { lat: 47.78, lng: 67.71 }, segment_type: "ground", steps: 40 },
  { from: { lat: 47.78, lng: 67.71 }, to: { lat: 46.85, lng: 74.98 }, segment_type: "ground", steps: 55 },
  { from: { lat: 46.85, lng: 74.98 }, to: { lat: 43.22, lng: 76.85 }, segment_type: "ground", steps: 55 },
  { from: { lat: 43.22, lng: 76.85 }, to: { lat: 43.88, lng: 77.07 }, segment_type: "ground", steps: 18 },
  { from: { lat: 43.88, lng: 77.07 }, to: { lat: 45.02, lng: 78.37 }, segment_type: "ground", steps: 28 },
  { from: { lat: 45.02, lng: 78.37 }, to: { lat: 44.17, lng: 79.2 }, segment_type: "ground", steps: 22 },
  { from: { lat: 44.17, lng: 79.2 }, to: { lat: 46.1, lng: 81.7 }, segment_type: "ground", steps: 45 },
  { from: { lat: 46.1, lng: 81.7 }, to: { lat: 48.97, lng: 89.97 }, segment_type: "ground", steps: 65 },
  { from: { lat: 48.97, lng: 89.97 }, to: { lat: 47.0, lng: 91.65 }, segment_type: "ground", steps: 45 },
  { from: { lat: 47.0, lng: 91.65 }, to: { lat: 46.37, lng: 96.26 }, segment_type: "ground", steps: 55 },
  { from: { lat: 46.37, lng: 96.26 }, to: { lat: 46.19, lng: 100.72 }, segment_type: "ground", steps: 55 },
  { from: { lat: 46.19, lng: 100.72 }, to: { lat: 46.26, lng: 102.78 }, segment_type: "ground", steps: 35 },
  { from: { lat: 46.26, lng: 102.78 }, to: { lat: 47.92, lng: 106.91 }, segment_type: "ground", steps: 55 },
  { from: { lat: 47.92, lng: 106.91 }, to: { lat: 49.49, lng: 105.92 }, segment_type: "ground", steps: 40 },
  { from: { lat: 49.49, lng: 105.92 }, to: { lat: 49.03, lng: 104.04 }, segment_type: "ground", steps: 35 },
  { from: { lat: 49.03, lng: 104.04 }, to: { lat: 48.81, lng: 103.53 }, segment_type: "ground", steps: 12 },
  { from: { lat: 48.81, lng: 103.53 }, to: { lat: 49.64, lng: 100.16 }, segment_type: "ground", steps: 45 },
  { from: { lat: 49.64, lng: 100.16 }, to: { lat: 49.98, lng: 92.07 }, segment_type: "ground", steps: 75 },
  { from: { lat: 49.98, lng: 92.07 }, to: { lat: 48.97, lng: 89.97 }, segment_type: "ground", steps: 35 },
  { from: { lat: 48.97, lng: 89.97 }, to: { lat: 47.92, lng: 106.91 }, segment_type: "ground", steps: 95 },
  { from: { lat: 47.92, lng: 106.91 }, to: { lat: 46.36, lng: 108.36 }, segment_type: "ground", steps: 45 },
  { from: { lat: 46.36, lng: 108.36 }, to: { lat: 44.9, lng: 110.12 }, segment_type: "ground", steps: 55 },
  { from: { lat: 44.9, lng: 110.12 }, to: { lat: 43.73, lng: 111.9 }, segment_type: "ground", steps: 45 },
  { from: { lat: 43.73, lng: 111.9 }, to: { lat: 43.65, lng: 111.97 }, segment_type: "ground", steps: 8 },
  { from: { lat: 43.65, lng: 111.97 }, to: { lat: 39.9, lng: 116.41 }, segment_type: "ground", steps: 75 },
  { from: { lat: 39.9, lng: 116.41 }, to: { lat: 39.08, lng: 117.2 }, segment_type: "ground", steps: 25 },
  { from: { lat: 39.08, lng: 117.2 }, to: { lat: 31.23, lng: 121.47 }, segment_type: "ground", steps: 85 },
  { from: { lat: 31.23, lng: 121.47 }, to: { lat: 37.57, lng: 126.98 }, segment_type: "boat", steps: 18 },
  { from: { lat: 37.57, lng: 126.98 }, to: { lat: 35.1, lng: 129.04 }, segment_type: "ground", steps: 35 },
  { from: { lat: 35.1, lng: 129.04 }, to: { lat: 35.68, lng: 139.69 }, segment_type: "boat", steps: 22 },
  { from: { lat: 35.65, lng: 139.7 }, to: { lat: 35.68, lng: 139.69 }, segment_type: "ground", steps: 5 },
];

const placeHints: { city: string; suburb: string; address: string }[] = [
  { city: "Lucca", suburb: "Vinchiana", address: "Vinchiana, Lucca, Tuscany, Italy" },
  { city: "Pisa", suburb: "", address: "Pisa, Tuscany, Italy" },
  { city: "Florence", suburb: "", address: "Florence, Italy" },
  { city: "Bologna", suburb: "", address: "Bologna, Emilia-Romagna, Italy" },
  { city: "Ferrara", suburb: "", address: "Ferrara, Italy" },
  { city: "Padua", suburb: "", address: "Padua, Veneto, Italy" },
  { city: "Venice", suburb: "", address: "Venice, Italy" },
  { city: "Treviso", suburb: "", address: "Treviso, Italy" },
  { city: "Udine", suburb: "", address: "Udine, Friuli, Italy" },
  { city: "Trieste", suburb: "", address: "Trieste, Italy" },
  { city: "Koper", suburb: "", address: "Koper, Slovenia" },
  { city: "Postojna", suburb: "", address: "Postojna, Slovenia" },
  { city: "Ljubljana", suburb: "", address: "Ljubljana, Slovenia" },
  { city: "Kranj", suburb: "", address: "Kranj, Slovenia" },
  { city: "Maribor", suburb: "", address: "Maribor, Slovenia" },
  { city: "Ptuj", suburb: "", address: "Ptuj, Slovenia" },
  { city: "Zagreb", suburb: "", address: "Zagreb, Croatia" },
  { city: "Karlovac", suburb: "", address: "Karlovac, Croatia" },
  { city: "Rijeka", suburb: "", address: "Rijeka, Croatia" },
  { city: "Senj", suburb: "", address: "Senj, Croatia" },
  { city: "Zadar", suburb: "", address: "Zadar, Croatia" },
  { city: "Šibenik", suburb: "", address: "Šibenik, Croatia" },
  { city: "Split", suburb: "", address: "Split, Croatia" },
  { city: "Makarska", suburb: "", address: "Makarska, Croatia" },
  { city: "Dubrovnik", suburb: "", address: "Dubrovnik, Croatia" },
  { city: "Trebinje", suburb: "", address: "Trebinje, Bosnia and Herzegovina" },
  { city: "Mostar", suburb: "", address: "Mostar, Bosnia and Herzegovina" },
  { city: "Konjic", suburb: "", address: "Konjic, Bosnia and Herzegovina" },
  { city: "Sarajevo", suburb: "", address: "Sarajevo, Bosnia and Herzegovina" },
  { city: "Pale", suburb: "", address: "Pale, Bosnia and Herzegovina" },
  { city: "Gacko", suburb: "", address: "Gacko, Bosnia and Herzegovina" },
  { city: "Nikšić", suburb: "", address: "Nikšić, Montenegro" },
  { city: "Podgorica", suburb: "", address: "Podgorica, Montenegro" },
  { city: "Cetinje", suburb: "", address: "Cetinje, Montenegro" },
  { city: "Budva", suburb: "", address: "Budva, Montenegro" },
  { city: "Bar", suburb: "", address: "Bar, Montenegro" },
  { city: "Shkodër", suburb: "", address: "Shkodër, Albania" },
  { city: "Lezhë", suburb: "", address: "Lezhë, Albania" },
  { city: "Tirana", suburb: "", address: "Tirana, Albania" },
  { city: "Durrës", suburb: "", address: "Durrës, Albania" },
  { city: "Elbasan", suburb: "", address: "Elbasan, Albania" },
  { city: "Vlorë", suburb: "", address: "Vlorë, Albania" },
  { city: "Gjirokastër", suburb: "", address: "Gjirokastër, Albania" },
  { city: "Korçë", suburb: "", address: "Korçë, Albania" },
  { city: "Ohrid", suburb: "", address: "Ohrid, North Macedonia" },
  { city: "Struga", suburb: "", address: "Struga, North Macedonia" },
  { city: "Bitola", suburb: "", address: "Bitola, North Macedonia" },
  { city: "Prilep", suburb: "", address: "Prilep, North Macedonia" },
  { city: "Skopje", suburb: "", address: "Skopje, North Macedonia" },
  { city: "Veles", suburb: "", address: "Veles, North Macedonia" },
  { city: "Thessaloniki", suburb: "", address: "Thessaloniki, Greece" },
  { city: "Serres", suburb: "", address: "Serres, Greece" },
  { city: "Edirne", suburb: "", address: "Edirne, Turkey" },
  { city: "Istanbul", suburb: "Sultanahmet", address: "Istanbul, Turkey" },
  { city: "Izmit", suburb: "", address: "Izmit, Turkey" },
  { city: "Bolu", suburb: "", address: "Bolu, Turkey" },
  { city: "Ankara", suburb: "", address: "Ankara, Turkey" },
  { city: "Çorum", suburb: "", address: "Çorum, Turkey" },
  { city: "Amasya", suburb: "", address: "Amasya, Turkey" },
  { city: "Samsun", suburb: "", address: "Samsun, Turkey" },
  { city: "Ordu", suburb: "", address: "Ordu, Turkey" },
  { city: "Trabzon", suburb: "", address: "Trabzon, Turkey" },
  { city: "Batumi", suburb: "", address: "Batumi, Georgia" },
  { city: "Kobuleti", suburb: "", address: "Kobuleti, Georgia" },
  { city: "Kutaisi", suburb: "", address: "Kutaisi, Georgia" },
  { city: "Tbilisi", suburb: "Old Tbilisi", address: "Tbilisi, Georgia" },
  { city: "Urgench", suburb: "", address: "Urgench, Khorezm, Uzbekistan" },
  { city: "Khiva", suburb: "", address: "Khiva, Uzbekistan" },
  { city: "Nukus", suburb: "", address: "Nukus, Uzbekistan" },
  { city: "Daşoguz", suburb: "", address: "Daşoguz, Turkmenistan" },
  { city: "Bukhara", suburb: "", address: "Bukhara, Uzbekistan" },
  { city: "Karshi", suburb: "", address: "Karshi, Uzbekistan" },
  { city: "Mary", suburb: "", address: "Mary, Turkmenistan" },
  { city: "Ashgabat", suburb: "", address: "Ashgabat, Turkmenistan" },
  { city: "Tejen", suburb: "", address: "Tejen, Turkmenistan" },
  { city: "Samarkand", suburb: "", address: "Samarkand, Uzbekistan" },
  { city: "Jizzakh", suburb: "", address: "Jizzakh, Uzbekistan" },
  { city: "Tashkent", suburb: "", address: "Tashkent, Uzbekistan" },
  { city: "Shymkent", suburb: "", address: "Shymkent, Kazakhstan" },
  { city: "Turkistan", suburb: "", address: "Turkistan, Kazakhstan" },
  { city: "Kyzylorda", suburb: "", address: "Kyzylorda, Kazakhstan" },
  { city: "Baikonur", suburb: "", address: "Baikonur, Kazakhstan" },
  { city: "Zhezkazgan", suburb: "", address: "Zhezkazgan, Kazakhstan" },
  { city: "Balkhash", suburb: "", address: "Balkhash, Kazakhstan" },
  { city: "Almaty", suburb: "", address: "Almaty, Kazakhstan" },
  { city: "Taldykorgan", suburb: "", address: "Taldykorgan, Kazakhstan" },
  { city: "Ölgii", suburb: "", address: "Ölgii, Mongolia" },
  { city: "Khovd", suburb: "", address: "Khovd, Mongolia" },
  { city: "Altai", suburb: "", address: "Altai, Mongolia" },
  { city: "Bayankhongor", suburb: "", address: "Bayankhongor, Mongolia" },
  { city: "Arvaikheer", suburb: "", address: "Arvaikheer, Mongolia" },
  { city: "Ulaanbaatar", suburb: "", address: "Ulaanbaatar, Mongolia" },
  { city: "Darkhan", suburb: "", address: "Darkhan, Mongolia" },
  { city: "Erdenet", suburb: "", address: "Erdenet, Mongolia" },
  { city: "Bulgan", suburb: "", address: "Bulgan, Mongolia" },
  { city: "Mörön", suburb: "", address: "Mörön, Mongolia" },
  { city: "Ulaangom", suburb: "", address: "Ulaangom, Mongolia" },
  { city: "Choir", suburb: "", address: "Choir, Mongolia" },
  { city: "Sainshand", suburb: "", address: "Sainshand, Mongolia" },
  { city: "Zamyn-Üüd", suburb: "", address: "Zamyn-Üüd, Mongolia" },
  { city: "Erenhot", suburb: "", address: "Erenhot, China" },
  { city: "Beijing", suburb: "Dongcheng", address: "Beijing, China" },
  { city: "Tianjin", suburb: "", address: "Tianjin, China" },
  { city: "Shanghai", suburb: "Pudong", address: "Shanghai, China" },
  { city: "Seoul", suburb: "Jongno", address: "Seoul, South Korea" },
  { city: "Busan", suburb: "", address: "Busan, South Korea" },
  { city: "Tokyo", suburb: "Shibuya", address: "Tokyo, Japan" },
];

const SEC_PER_DAY = 86400;
const SEC_PER_HOUR = 3600;
const SEC_PER_MIN = 60;

export type SeedPointRow = {
  lat: number;
  lng: number;
  deviceTs: number;
  serverTs: number;
  segmentType: SegmentType;
  address: string;
  rawAddress: { city: string; suburb: string };
};

export function getSeedPoints(nowMs: number): SeedPointRow[] {
  const nowSec = Math.floor(nowMs / 1000);
  const serverTs = nowSec;
  const rows: SeedPointRow[] = [];
  let placeIndex = 0;

  for (const leg of legs) {
    const pts = interpolate(leg.from, leg.to, leg.steps);
    for (let i = 0; i < pts.length; i++) {
      if (
        i === pts.length - 1 &&
        leg.from.lat === leg.to.lat &&
        leg.from.lng === leg.to.lng
      )
        continue;
      const hint = placeHints[placeIndex % placeHints.length];
      placeIndex += 1;
      rows.push({
        lat: pts[i].lat,
        lng: pts[i].lng,
        deviceTs: 0,
        serverTs,
        segmentType: leg.segment_type,
        address: hint.address,
        rawAddress: { city: hint.city, suburb: hint.suburb },
      });
    }
  }

  const n = rows.length;
  const oldThreshold = 0.65;
  const yesterdayThreshold = 0.80;
  const oldStart = nowSec - 28 * SEC_PER_DAY;
  const oldEnd = nowSec - 7 * SEC_PER_DAY;
  const yesterdayStart = nowSec - 24 * SEC_PER_HOUR;
  const yesterdayEnd = nowSec - 1 * SEC_PER_HOUR;
  const recentStart = nowSec - 30 * SEC_PER_MIN;
  const recentEnd = nowSec;

  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0;
    let deviceTs: number;
    if (t < oldThreshold) {
      const u = oldThreshold > 0 ? t / oldThreshold : 0;
      deviceTs = Math.round(oldStart + u * (oldEnd - oldStart));
    } else if (t < yesterdayThreshold) {
      const u = (yesterdayThreshold - oldThreshold) > 0
        ? (t - oldThreshold) / (yesterdayThreshold - oldThreshold)
        : 0;
      deviceTs = Math.round(yesterdayStart + u * (yesterdayEnd - yesterdayStart));
    } else {
      const u = (1 - yesterdayThreshold) > 0
        ? (t - yesterdayThreshold) / (1 - yesterdayThreshold)
        : 0;
      deviceTs = Math.round(recentStart + u * (recentEnd - recentStart));
    }
    rows[i].deviceTs = deviceTs;
  }

  return rows.sort((a, b) => a.deviceTs - b.deviceTs);
}
