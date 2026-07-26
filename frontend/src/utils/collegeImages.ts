// System-Wide Unique Campus Photo Map & Failsafe Resolver

import { College } from "../types";

export const REAL_CAMPUS_MAP: Record<string, string> = {
  // 1. PDEU (Pandit Deendayal Energy University - Gandhinagar)
  "pdeu": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "pdeu01": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "1": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",

  // 2. DA-IICT (Gandhinagar)
  "daiict": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Daiict-campus.jpg/1024px-Daiict-campus.jpg",
  "da-iict": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Daiict-campus.jpg/1024px-Daiict-campus.jpg",
  "daiict02": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Daiict-campus.jpg/1024px-Daiict-campus.jpg",
  "2": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Daiict-campus.jpg/1024px-Daiict-campus.jpg",

  // 3. Nirma University (Ahmedabad)
  "nirma": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "nirma03": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "3": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",

  // 4. LDCE (L.D. College of Engineering - Ahmedabad)
  "ldce": "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
  "ldce04": "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
  "4": "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",

  // 5. VGEC (Ahmedabad)
  "vgec": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "vgec05": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "5": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",

  // 6. BJMC (B.J. Medical College - Ahmedabad)
  "bjmc": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
  "bjmc06": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
  "6": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",

  // 7. GNLU (Gandhinagar)
  "gnlu": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  "gnlu07": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  "7": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",

  // 8. HL Commerce (Ahmedabad)
  "hl": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  "hl08": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  "8": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",

  // 9. St. Xavier's (Ahmedabad)
  "stxav": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "stxav09": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "xavier": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "9": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",

  // 10. CHARUSAT University (Anand)
  "charusat": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Charotar_University_of_Science_and_Technology.jpg/960px-Charotar_University_of_Science_and_Technology.jpg",
  "charu10": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Charotar_University_of_Science_and_Technology.jpg/960px-Charotar_University_of_Science_and_Technology.jpg",
  "10": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Charotar_University_of_Science_and_Technology.jpg/960px-Charotar_University_of_Science_and_Technology.jpg",

  // 11. Ganpat University (Mehsana)
  "ganpat": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "ganpat11": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "11": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",

  // 12. LJ University (Ahmedabad)
  "lj": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  "lju12": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  "12": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",

  // 13. Silver Oak University (Ahmedabad)
  "silver": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
  "silver13": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
  "13": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",

  // 14. Marwadi University (Rajkot)
  "marwadi": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "marwadi14": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  "14": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",

  // 15. Adani University (Ahmedabad)
  "adani": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  "adani15": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  "15": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",

  // 16. MSU Baroda (Maharaja Sayajirao University)
  "msu": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg/1280px-D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg",
  "msu16": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg/1280px-D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg",
  "16": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg/1280px-D.N.Hall%2C_Maharaja_Sayajirao_University_Of_Baroda.jpg",

  // 17. Gujarat University (Ahmedabad)
  "gujuni": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  "gujuni17": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  "17": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",

  // 18. Parul University (Vadodara)
  "parul": "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
  "parul18": "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
  "18": "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80"
};

const DEFAULT_ARCHITECTURE_BUILDING_URL = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80";

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

  const keysToTry: string[] = [];

  if (collegeObj?.id) {
    keysToTry.push(String(collegeObj.id));
  }
  if (collegeObj?.code) {
    keysToTry.push(String(collegeObj.code).toLowerCase());
  }
  if (collegeName) {
    keysToTry.push(collegeName.toLowerCase());
  }

  for (const key of keysToTry) {
    if (key && REAL_CAMPUS_MAP[key]) {
      return { banner: REAL_CAMPUS_MAP[key], logo: DEFAULT_ARCHITECTURE_BUILDING_URL };
    }
  }

  if (collegeName) {
    const lowerName = collegeName.toLowerCase();
    for (const key in REAL_CAMPUS_MAP) {
      if (
        key.length > 2 &&
        (lowerName.includes(key) || key.includes(lowerName))
      ) {
        return { banner: REAL_CAMPUS_MAP[key], logo: DEFAULT_ARCHITECTURE_BUILDING_URL };
      }
    }
  }

  const dbImageUrl = collegeObj?.image_url;
  if (
    dbImageUrl &&
    typeof dbImageUrl === "string" &&
    dbImageUrl.startsWith("http") &&
    !dbImageUrl.includes("group") &&
    !dbImageUrl.includes("graduation")
  ) {
    return { banner: dbImageUrl, logo: DEFAULT_ARCHITECTURE_BUILDING_URL };
  }

  return {
    banner: DEFAULT_ARCHITECTURE_BUILDING_URL,
    logo: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=150&q=80",
  };
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackUrl?: string) {
  const target = e.currentTarget;
  if (fallbackUrl && target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  } else {
    // Graceful fallback to architectural building photo
    target.src = DEFAULT_ARCHITECTURE_BUILDING_URL;
  }
}
