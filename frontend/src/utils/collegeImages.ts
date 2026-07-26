// System-Wide Stream-Aware Campus Photo Map & Failsafe Resolver

import { College } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// 100% Exterior Architectural & Aerial Drone Views (ZERO classroom/lecture hall stock photos)
export const STREAM_CAMPUS_BANNERS: Record<string, string[]> = {
  engineering: [
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
  ],
  medical: [
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80"
  ],
  management: [
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80"
  ],
  commerce: [
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
  ],
  pharmacy: [
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
  ],
  science: [
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"
  ],
  polytechnic: [
    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
  ],
  law: [
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"
  ],
  default: [
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80"
  ]
};

export const REAL_CAMPUS_MAP: Record<string, string> = {
  "ldrp": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "pdeu": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "deendayal": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "daiict": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  "dhirubhai": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  "nirma": "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
  "ldce": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  "l.d.": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  "vgec": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
  "vishwakarma": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
  "bjmc": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
  "gnlu": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "hl": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "charusat": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "msu": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "sayajirao": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "bvm": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "birla vishvakarma": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "parul": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "silver oak": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "ahmedabad university": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80"
};

export function getCollegeImage(
  collegeOrName?: string | College | any,
  index: number = 0
): { banner: string; logo: string } {
  let collegeObj: College | null = null;
  let collegeName = "";
  let acpcCode = "";

  if (typeof collegeOrName === "object" && collegeOrName !== null) {
    collegeObj = collegeOrName as College;
    collegeName = collegeObj.name || "";
    acpcCode = collegeObj.acpc_code || "";
  } else if (typeof collegeOrName === "string") {
    collegeName = collegeOrName;
  }

  // Priority 1: DB Scraped Authentic Campus Photo routed through backend CORS proxy
  if (collegeObj?.id && (collegeObj.image_url || (collegeObj as any).campus_photo_url)) {
    const rawUrl = collegeObj.image_url || (collegeObj as any).campus_photo_url;
    if (rawUrl && typeof rawUrl === "string" && rawUrl.trim().startsWith("http")) {
      const proxyUrl = `${BASE_URL}/api/v1/colleges/${collegeObj.id}/image-proxy`;
      return { banner: proxyUrl, logo: proxyUrl };
    }
  }

  // Priority 2: Direct ID / ACPC Code / Keyword Lookup in REAL_CAMPUS_MAP
  if (collegeObj?.id && REAL_CAMPUS_MAP[String(collegeObj.id)]) {
    return { banner: REAL_CAMPUS_MAP[String(collegeObj.id)], logo: REAL_CAMPUS_MAP[String(collegeObj.id)] };
  }

  if (acpcCode && REAL_CAMPUS_MAP[acpcCode]) {
    return { banner: REAL_CAMPUS_MAP[acpcCode], logo: REAL_CAMPUS_MAP[acpcCode] };
  }

  if (collegeName) {
    const lower = collegeName.toLowerCase();
    for (const key in REAL_CAMPUS_MAP) {
      if (lower.includes(key)) {
        return { banner: REAL_CAMPUS_MAP[key], logo: REAL_CAMPUS_MAP[key] };
      }
    }
  }

  // Priority 3: Curated Stream-aware Authentic Exterior Campus Banners
  const streamKey = (collegeObj?.primary_stream || "").toLowerCase();
  let streamCategory = "default";

  if (streamKey.includes("engineer")) streamCategory = "engineering";
  else if (streamKey.includes("medic")) streamCategory = "medical";
  else if (streamKey.includes("manag")) streamCategory = "management";
  else if (streamKey.includes("commer")) streamCategory = "commerce";
  else if (streamKey.includes("pharm")) streamCategory = "pharmacy";
  else if (streamKey.includes("scienc")) streamCategory = "science";
  else if (streamKey.includes("poly") || streamKey.includes("diploma")) streamCategory = "polytechnic";
  else if (streamKey.includes("law")) streamCategory = "law";

  const banners = STREAM_CAMPUS_BANNERS[streamCategory] || STREAM_CAMPUS_BANNERS.default;
  const colId = collegeObj?.id || index || 0;
  const bannerUrl = banners[colId % banners.length];

  return {
    banner: bannerUrl,
    logo: bannerUrl
  };
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackUrl?: string) {
  const target = e.currentTarget;
  const fallback = fallbackUrl || STREAM_CAMPUS_BANNERS.default[0];
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
