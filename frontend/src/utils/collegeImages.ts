// System-Wide Stream-Aware Campus Photo Map & Failsafe Resolver

import { College } from "../types";

export const STREAM_CAMPUS_BANNERS: Record<string, string[]> = {
  engineering: [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"
  ],
  medical: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80"
  ],
  management: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
  ],
  commerce: [
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
  ],
  pharmacy: [
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
  ],
  science: [
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80"
  ],
  polytechnic: [
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80"
  ],
  law: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
  ],
  default: [
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80"
  ]
};

export const REAL_CAMPUS_MAP: Record<string, string> = {
  "pdeu": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "daiict": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Daiict-campus.jpg/1024px-Daiict-campus.jpg",
  "nirma": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "ldce": "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
  "vgec": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "bjmc": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
  "gnlu": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  "hl": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  "charusat": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Charotar_University_of_Science_and_Technology.jpg/960px-Charotar_University_of_Science_and_Technology.jpg",
  "msu": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg/1280px-D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg"
};

export function getCollegeImage(
  collegeOrName?: string | College | any,
  index: number = 0
): { banner: string; logo: string } {
  let collegeObj: College | null = null;
  let collegeName = "";

  if (typeof collegeOrName === "object" && collegeOrName !== null) {
    collegeObj = collegeOrName as College;
    collegeName = collegeObj.name || "";
  } else if (typeof collegeOrName === "string") {
    collegeName = collegeOrName;
  }

  // 1. Direct name/ID map lookup
  if (collegeObj?.id && REAL_CAMPUS_MAP[String(collegeObj.id)]) {
    return { banner: REAL_CAMPUS_MAP[String(collegeObj.id)], logo: REAL_CAMPUS_MAP[String(collegeObj.id)] };
  }

  if (collegeName) {
    const lower = collegeName.toLowerCase();
    for (const key in REAL_CAMPUS_MAP) {
      if (lower.includes(key)) {
        return { banner: REAL_CAMPUS_MAP[key], logo: REAL_CAMPUS_MAP[key] };
      }
    }
  }

  // 2. Stream-aware dynamic banner selection based on primary_stream
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
  if (fallbackUrl && target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  } else {
    target.src = STREAM_CAMPUS_BANNERS.default[0];
  }
}
