import { SHOP_PROMO_PRODUCT_IMAGES } from "./shopPromoAssets";

const ASSET_BASE = "/generated-assets/dr-morepen-glucoone-bg03";

const BG03_GALLERY_IMAGES = [
  SHOP_PROMO_PRODUCT_IMAGES.meterOnly,
  SHOP_PROMO_PRODUCT_IMAGES.meterStrip25,
  SHOP_PROMO_PRODUCT_IMAGES.meterStrip50,
];

const BG03_STRIP_KIT_IMAGES = [
  SHOP_PROMO_PRODUCT_IMAGES.meterStrip25,
  SHOP_PROMO_PRODUCT_IMAGES.meterStrip50,
  SHOP_PROMO_PRODUCT_IMAGES.meterOnly,
];

const BG03_TEST_STRIP_50_IMAGES = [
  SHOP_PROMO_PRODUCT_IMAGES.testStrips50,
  SHOP_PROMO_PRODUCT_IMAGES.testStrips50,
  SHOP_PROMO_PRODUCT_IMAGES.testStrips50,
];

const STETHOSCOPE_PROMO_IMAGES = [
  SHOP_PROMO_PRODUCT_IMAGES.stethoscope,
  SHOP_PROMO_PRODUCT_IMAGES.stethoscope,
  SHOP_PROMO_PRODUCT_IMAGES.stethoscope,
];

const SAFE_AQ_PROMO_IMAGES = [
  SHOP_PROMO_PRODUCT_IMAGES.meterStrip50,
  SHOP_PROMO_PRODUCT_IMAGES.meterStrip50,
  SHOP_PROMO_PRODUCT_IMAGES.testStrips25,
];

const DEFAULT_INTERNAL_NOTICE = {
  badge: "Mockup สำหรับพิจารณาภายใน",
  ctaNote: "หน้านี้เป็นตัวอย่างการแสดงผล ยังไม่เชื่อมต่อระบบขายจริง",
};

const DEFAULT_SHOP = {
  id: "dr-morepen-medical-th",
  slug: "dr-morepen-medical-th",
  name: "Dr. Morepen Medical TH",
  onlineStatus: "ออนไลน์ล่าสุดเมื่อ 5 นาทีที่แล้ว",
  score: 4.8,
  responseRate: "97%",
  joinedAt: "เม.ย. 2021",
  productCount: 248,
  responseTime: "ภายใน 1 ชั่วโมง",
  followers: "12.3K",
  avatarSrc: `${ASSET_BASE}/shop-avatar.jpg`,
};

const getActiveVariants = (product = {}) => {
  if (!Array.isArray(product.variants)) {
    return [];
  }

  const activeVariants = product.variants.filter((variant) => variant?.active !== false);
  return activeVariants.length ? activeVariants : product.variants;
};

const getBasePrice = (product = {}) => {
  const prices = getActiveVariants(product)
    .map((variant) => variant?.price)
    .filter((price) => Number.isFinite(price));

  return prices.length ? Math.min(...prices) : 0;
};

const getCompareAtPrice = (product = {}) => {
  const prices = getActiveVariants(product)
    .map((variant) => variant?.compareAtPrice)
    .filter((price) => Number.isFinite(price));

  return prices.length ? Math.max(...prices) : null;
};

const toSameShopItem = (product = {}) => ({
  id: product.id || "mock-item",
  slug: product.slug || "",
  name: product.name || "สินค้าจากร้านเดียวกัน",
  price: getBasePrice(product),
  originalPrice: getCompareAtPrice(product),
  rating: Number.isFinite(product.ratingSummary?.score) ? product.ratingSummary.score : 0,
  sold: Number.isFinite(product.soldCount) ? product.soldCount : 0,
  image: Array.isArray(product.images) && product.images.length ? product.images[0] : "",
});

const buildSameShopItems = (products = [], currentId = "") =>
  products
    .filter((product) => product?.id && product.id !== currentId)
    .slice(0, 6)
    .map(toSameShopItem);

const mockProductsBase = [
  {
    id: "dr-morepen-glucoone-bg03",
    slug: "dr-morepen-glucoone-bg03",
    name: "DR.MOREPEN GLUCOONE BG-03 เครื่องวัดน้ำตาล + ตัวเลือกแถบตรวจ",
    internalNotice: DEFAULT_INTERNAL_NOTICE,
    categoryPath: [
      "กลุ่มผลิตภัณฑ์เพื่อสุขภาพ",
      "เครื่องมือและอุปกรณ์ในการดูแลสุขภาพ",
      "อุปกรณ์ตรวจวัดสุขภาพ",
    ],
    soldCount: 1243,
    favoriteCount: 582,
    variants: [
      {
        id: "meter-only",
        label: "เครื่องวัดน้ำตาลอย่างเดียว",
        price: 159,
        compareAtPrice: 1090,
        stock: 50,
        active: true,
        sku: "BG03-MTR",
      },
      {
        id: "meter-strip-25",
        label: "เครื่อง + แถบตรวจ 25 ชิ้น",
        price: 359,
        compareAtPrice: 1390,
        stock: 24,
        active: true,
        sku: "BG03-STR25",
      },
      {
        id: "meter-strip-50",
        label: "เครื่อง + แถบตรวจ 50 ชิ้น",
        price: 459,
        compareAtPrice: null,
        stock: 50,
        active: true,
        sku: "BG03-STR50",
      },
    ],
    images: [...BG03_GALLERY_IMAGES],
    shop: {
      ...DEFAULT_SHOP,
    },
    specs: {
      brand: "Ace+Med",
      warranty: "ประกันจากผู้ผลิต",
      shelfLife: "24 เดือน",
      licenseNumber: "65-2-2-1-0014045",
      shipFrom: "กรุงเทพมหานคร",
    },
    trustIndicators: ["จัดส่งจากกรุงเทพฯ", "สินค้าแท้", "มีใบอนุญาต", "รับประกันโดยผู้ผลิต"],
    promoHighlights: ["ส่วนลดพิเศษ", "ส่งไว", "ร้านค้าตอบแชทเร็ว"],
    description: {
      intro:
        "ชุดเครื่องวัดน้ำตาลปลายนิ้ว DR.MOREPEN GLUCOONE BG-03 ใช้งานง่าย อ่านค่ารวดเร็ว เหมาะสำหรับผู้ที่ต้องติดตามระดับน้ำตาลที่บ้านเป็นประจำ\nผลิตภัณฑ์ออกแบบให้ผู้ใช้งานทั่วไปสามารถอ่านผลได้ง่าย และพกพาสะดวก\nเหมาะสำหรับการนำเสนอภายในทีมเพื่อรีวิว UX ของหน้าสินค้า",
      highlights: [
        "อ่านค่าในประมาณ 5 วินาที พร้อมหน้าจอแสดงผลชัดเจน",
        "รองรับหน่วยวัด mg/dL และมีระบบแจ้งเตือนแบตเตอรี่ต่ำ",
        "เครื่องขนาดกะทัดรัด พกพาง่าย ใช้งานได้ทั้งที่บ้านและนอกสถานที่",
        "ตัวเลือกชุดพร้อมแถบตรวจ 25 หรือ 50 ชิ้น เพื่อความคุ้มค่า",
      ],
      inBox: [
        "เครื่องวัดน้ำตาล BG-03",
        "เข็มเจาะเลือดและปากกาเจาะ",
        "คู่มือการใช้งานภาษาไทย",
        "แบตเตอรี่เริ่มต้น",
      ],
      notes: [
        "ภาพสินค้าสำหรับการนำเสนอภายใน อาจแตกต่างจากสินค้าจริงเล็กน้อย",
        "กรุณาตรวจสอบตัวเลือกสินค้าและ SKU ก่อนกดสั่งซื้อ",
      ],
    },
    ratingSummary: {
      score: 4.9,
      totalRatings: 326,
      totalReviews: 118,
      breakdown: [
        { star: 5, count: 286 },
        { star: 4, count: 28 },
        { star: 3, count: 8 },
        { star: 2, count: 2 },
        { star: 1, count: 2 },
      ],
    },
    reviews: [
      {
        id: "rv-001",
        userName: "ผู้ใช้ A***8",
        rating: 5,
        date: "2026-02-18",
        variantLabel: "เครื่อง + แถบตรวจ 25 ชิ้น",
        comment: "จัดส่งเร็ว แพ็กของแน่น เครื่องใช้งานไม่ยาก ตัวเลขอ่านง่ายมากครับ",
        likes: 14,
        hasMedia: true,
      },
      {
        id: "rv-002",
        userName: "คุณแอนนา",
        rating: 5,
        date: "2026-02-07",
        variantLabel: "เครื่องวัดน้ำตาลอย่างเดียว",
        comment: "ของแท้ มีคู่มือไทยครบ เหมาะกับผู้สูงอายุในบ้าน",
        likes: 9,
        hasMedia: false,
      },
      {
        id: "rv-003",
        userName: "M*****n",
        rating: 4,
        date: "2026-01-30",
        variantLabel: "เครื่อง + แถบตรวจ 50 ชิ้น",
        comment: "ใช้งานได้ดี ค่าค่อนข้างนิ่ง เทียบกับที่คลินิกแล้วใกล้เคียงครับ",
        likes: 5,
        hasMedia: true,
      },
    ],
    specRows: [
      {
        id: "category",
        label: "หมวดหมู่",
        value:
          "กลุ่มผลิตภัณฑ์เพื่อสุขภาพ > เครื่องมือและอุปกรณ์ในการดูแลสุขภาพ > อุปกรณ์ตรวจวัดสุขภาพ",
      },
      { id: "brand", label: "แบรนด์", value: "Ace+Med" },
      { id: "warranty", label: "การรับประกัน", value: "ประกันจากผู้ผลิต" },
      { id: "shelfLife", label: "อายุสินค้า", value: "24 เดือน" },
      { id: "licenseNumber", label: "เลขที่ใบอนุญาต/จดแจ้ง", value: "65-2-2-1-0014045" },
      { id: "shipFrom", label: "จัดส่งจาก", value: "กรุงเทพมหานคร" },
    ],
  },
  {
    id: "dr-morepen-professionals-deluxe-stethoscope",
    slug: "dr-morepen-professionals-deluxe-stethoscope",
    name: "หูฟังทางการแพทย์ Dr. Morepen Professionals Deluxe Stethoscope",
    internalNotice: DEFAULT_INTERNAL_NOTICE,
    categoryPath: ["อุปกรณ์ทางการแพทย์", "วินิจฉัยเบื้องต้น", "หูฟังแพทย์"],
    soldCount: 320,
    favoriteCount: 186,
    variants: [
      {
        id: "stethoscope-black",
        label: "สีดำ",
        price: 239,
        compareAtPrice: 279,
        stock: 45,
        active: true,
        sku: "STETH-BLK",
      },
      {
        id: "stethoscope-blue",
        label: "สีกรมท่า",
        price: 249,
        compareAtPrice: 289,
        stock: 18,
        active: true,
        sku: "STETH-NVY",
      },
    ],
    images: [...STETHOSCOPE_PROMO_IMAGES],
    shop: {
      ...DEFAULT_SHOP,
    },
    specs: {
      brand: "Dr. Morepen",
      material: "Stainless Steel + Silicone",
      length: "29 นิ้ว",
      headType: "Dual Head",
      warranty: "รับประกันร้าน 7 วัน",
      shipFrom: "กรุงเทพมหานคร",
    },
    trustIndicators: ["โครงสร้างแข็งแรง", "น้ำหนักเบา", "เสียงคมชัด", "พร้อมส่งจากไทย"],
    promoHighlights: ["สินค้าขายดี", "เสียงชัด", "เหมาะกับงานคลินิก"],
    description: {
      intro:
        "หูฟังแพทย์คุณภาพสูง ให้เสียงคมชัด แม่นยำ โครงสร้างทำจาก Stainless Steel แข็งแรง มาพร้อมหูฟังซิลิโคน 100% น้ำหนักเบา ใช้งานสบาย เหมาะสำหรับทั้งบุคลากรทางการแพทย์และผู้ใช้งานทั่วไปที่ต้องการอุปกรณ์มาตรฐานระดับมืออาชีพ",
      highlights: [
        "ตัวหัวฟังแบบ Dual Head สำหรับใช้งานได้หลากหลาย",
        "ท่อซิลิโคนยืดหยุ่น ลดเสียงรบกวนขณะตรวจ",
        "น้ำหนักเบา ใช้งานต่อเนื่องได้สบาย",
        "เหมาะกับคลินิก โรงพยาบาล และนักศึกษาแพทย์",
      ],
      inBox: ["ตัวหูฟังแพทย์", "ear tips สำรอง", "แผ่น diaphragm สำรอง", "คู่มือการใช้งาน"],
      notes: [
        "ภาพบางส่วนใช้เป็น placeholder สำหรับงาน mockup",
        "ควรตรวจสอบสีและรุ่นอีกครั้งก่อนสั่งซื้อ",
      ],
    },
    ratingSummary: {
      score: 4.8,
      totalRatings: 320,
      totalReviews: 96,
      breakdown: [
        { star: 5, count: 270 },
        { star: 4, count: 34 },
        { star: 3, count: 10 },
        { star: 2, count: 4 },
        { star: 1, count: 2 },
      ],
    },
    reviews: [
      {
        id: "rv-steth-001",
        userName: "Dr. P***n",
        rating: 5,
        date: "2026-03-03",
        variantLabel: "สีดำ",
        comment: "ฟังเสียงชัด น้ำหนักกำลังดี ใช้งานในคลินิกทุกวันได้สบาย",
        likes: 11,
        hasMedia: false,
      },
      {
        id: "rv-steth-002",
        userName: "M***k",
        rating: 4,
        date: "2026-02-21",
        variantLabel: "สีกรมท่า",
        comment: "วัสดุดูแข็งแรง คุ้มราคาสำหรับนักศึกษาแพทย์ครับ",
        likes: 6,
        hasMedia: false,
      },
    ],
    specRows: [
      { id: "category", label: "หมวดหมู่", value: "อุปกรณ์ทางการแพทย์ > วินิจฉัยเบื้องต้น > หูฟังแพทย์" },
      { id: "brand", label: "แบรนด์", value: "Dr. Morepen" },
      { id: "material", label: "วัสดุ", value: "Stainless Steel + Silicone" },
      { id: "length", label: "ความยาว", value: "29 นิ้ว" },
      { id: "headType", label: "ลักษณะหัวฟัง", value: "Dual Head" },
      { id: "shipFrom", label: "จัดส่งจาก", value: "กรุงเทพมหานคร" },
    ],
  },
  {
    id: "dr-morepen-glucoone-bg03-test-strips",
    slug: "dr-morepen-glucoone-bg03-test-strips",
    name: "Dr. Morepen GlucoOne BG-03 แผ่นตรวจน้ำตาล 25-50 ชิ้น",
    internalNotice: DEFAULT_INTERNAL_NOTICE,
    categoryPath: ["กลุ่มผลิตภัณฑ์เพื่อสุขภาพ", "อุปกรณ์ตรวจวัดสุขภาพ", "แผ่นตรวจน้ำตาล"],
    soldCount: 278,
    favoriteCount: 132,
    variants: [
      {
        id: "test-strips-25",
        label: "25 ชิ้น",
        price: 259,
        compareAtPrice: 299,
        stock: 36,
        active: true,
        sku: "BG03-TS25",
      },
      {
        id: "test-strips-50",
        label: "50 ชิ้น",
        price: 459,
        compareAtPrice: 529,
        stock: 41,
        active: true,
        sku: "BG03-TS50",
      },
    ],
    images: [...BG03_TEST_STRIP_50_IMAGES],
    shop: {
      ...DEFAULT_SHOP,
    },
    specs: {
      brand: "Dr. Morepen",
      compatibleWith: "GlucoOne BG-03",
      packSize: "25-50 ชิ้น",
      productType: "แผ่นตรวจน้ำตาล",
      warranty: "รับประกันตลอดอายุการใช้งาน",
      shipFrom: "กรุงเทพมหานคร",
    },
    trustIndicators: ["ใช้กับ BG-03 เท่านั้น", "มีเฉพาะแผ่นตรวจ", "สินค้าแท้", "พร้อมส่งจากไทย"],
    promoHighlights: ["เลือกได้ 25 หรือ 50 ชิ้น", "Official Store", "ใช้งานกับ BG-03"],
    description: {
      intro:
        "แผ่นตรวจน้ำตาลสำหรับเครื่อง Dr. Morepen GlucoOne BG-03 โดยเฉพาะ รายการนี้มีเฉพาะแผ่นตรวจ ไม่รวมตัวเครื่อง เหมาะสำหรับลูกค้าที่ต้องการซื้อเติมหรือสต็อกไว้ใช้งานต่อเนื่อง",
      highlights: [
        "ใช้กับเครื่อง BG-03 เท่านั้น",
        "มีตัวเลือก 25 ชิ้น และ 50 ชิ้น",
        "รายการนี้มีเฉพาะแผ่นตรวจ ไม่รวมอุปกรณ์อื่น",
        "รับประกันตลอดอายุการใช้งานตามข้อมูลในภาพโปรโมต",
      ],
      inBox: ["แผ่นตรวจตามตัวเลือกที่เลือก", "ฉลากสินค้าและข้อมูลล็อตการผลิต"],
      notes: [
        "ควรตรวจสอบรุ่นเครื่องก่อนสั่งซื้อทุกครั้ง",
        "ภาพสินค้าใช้เป็น mock reference ภายในโปรเจค",
      ],
    },
    ratingSummary: {
      score: 4.8,
      totalRatings: 74,
      totalReviews: 28,
      breakdown: [
        { star: 5, count: 59 },
        { star: 4, count: 10 },
        { star: 3, count: 3 },
        { star: 2, count: 1 },
        { star: 1, count: 1 },
      ],
    },
    reviews: [
      {
        id: "rv-bg03-strip-001",
        userName: "ผู้ใช้ K***2",
        rating: 5,
        date: "2026-03-05",
        variantLabel: "50 ชิ้น",
        comment: "ใช้กับ BG-03 ได้ตรงรุ่น ร้านส่งไวและแพ็กมาดีครับ",
        likes: 5,
        hasMedia: false,
      },
      {
        id: "rv-bg03-strip-002",
        userName: "คุณเมย์",
        rating: 4,
        date: "2026-02-24",
        variantLabel: "25 ชิ้น",
        comment: "สั่งมาเติมใช้งานต่อจากเครื่องเดิม สะดวกดีค่ะ",
        likes: 2,
        hasMedia: false,
      },
    ],
    specRows: [
      { id: "category", label: "หมวดหมู่", value: "กลุ่มผลิตภัณฑ์เพื่อสุขภาพ > อุปกรณ์ตรวจวัดสุขภาพ > แผ่นตรวจน้ำตาล" },
      { id: "brand", label: "แบรนด์", value: "Dr. Morepen" },
      { id: "productType", label: "ประเภทสินค้า", value: "แผ่นตรวจน้ำตาล" },
      { id: "compatibleWith", label: "ใช้กับเครื่อง", value: "GlucoOne BG-03" },
      { id: "packSize", label: "จำนวนต่อแพ็ก", value: "25-50 ชิ้น" },
      { id: "shipFrom", label: "จัดส่งจาก", value: "กรุงเทพมหานคร" },
    ],
  },
  {
    id: "dr-morepen-glucoone-bg03-meter-only",
    slug: "dr-morepen-glucoone-bg03-meter-only",
    name: "DR.MOREPEN GLUCOONE BG-03 เครื่องวัดน้ำตาลอย่างเดียว",
    internalNotice: DEFAULT_INTERNAL_NOTICE,
    categoryPath: [
      "กลุ่มผลิตภัณฑ์เพื่อสุขภาพ",
      "เครื่องมือและอุปกรณ์ในการดูแลสุขภาพ",
      "อุปกรณ์ตรวจวัดสุขภาพ",
    ],
    soldCount: 1243,
    favoriteCount: 582,
    variants: [
      {
        id: "meter-only",
        label: "เครื่องวัดน้ำตาลอย่างเดียว",
        price: 159,
        compareAtPrice: 1090,
        stock: 50,
        active: true,
        sku: "BG03-MTR",
      },
    ],
    images: [...BG03_GALLERY_IMAGES],
    shop: {
      ...DEFAULT_SHOP,
    },
    specs: {
      brand: "Ace+Med",
      warranty: "ประกันจากผู้ผลิต",
      shelfLife: "24 เดือน",
      licenseNumber: "65-2-2-1-0014045",
      shipFrom: "กรุงเทพมหานคร",
    },
    trustIndicators: ["จัดส่งจากกรุงเทพฯ", "สินค้าแท้", "มีใบอนุญาต", "รับประกันโดยผู้ผลิต"],
    promoHighlights: ["เครื่องอย่างเดียว", "พร้อมส่ง", "ร้านค้าตอบแชทเร็ว"],
    description: {
      intro:
        "เครื่องวัดน้ำตาลปลายนิ้ว DR.MOREPEN GLUCOONE BG-03 สำหรับผู้ที่ต้องการเฉพาะตัวเครื่อง ไม่รวมชุดแถบตรวจแบบ bundle เหมาะกับลูกค้าที่มีอุปกรณ์สิ้นเปลืองอยู่แล้วและต้องการเครื่องสำรองหรือเครื่องใหม่สำหรับใช้งานต่อเนื่องที่บ้าน",
      highlights: [
        "อ่านค่าในประมาณ 5 วินาที พร้อมหน้าจอแสดงผลชัดเจน",
        "เครื่องขนาดกะทัดรัด พกพาง่าย ใช้งานได้ทั้งที่บ้านและนอกสถานที่",
        "เหมาะสำหรับผู้ที่มีแถบตรวจอยู่แล้วและต้องการซื้อตัวเครื่องแยก",
        "รายการนี้เน้นเฉพาะตัวเครื่องตามภาพ mockup ภายในโปรเจค",
      ],
      inBox: [
        "เครื่องวัดน้ำตาล BG-03",
        "เข็มเจาะเลือดและปากกาเจาะ",
        "คู่มือการใช้งานภาษาไทย",
        "แบตเตอรี่เริ่มต้น",
      ],
      notes: [
        "ภาพสินค้าใช้สำหรับ mockup ภายในโปรเจค",
        "ควรตรวจสอบ SKU และอุปกรณ์ในกล่องก่อนสั่งซื้อ",
      ],
    },
    ratingSummary: {
      score: 4.9,
      totalRatings: 218,
      totalReviews: 81,
      breakdown: [
        { star: 5, count: 191 },
        { star: 4, count: 18 },
        { star: 3, count: 6 },
        { star: 2, count: 2 },
        { star: 1, count: 1 },
      ],
    },
    reviews: [
      {
        id: "rv-bg03-meter-only-001",
        userName: "ผู้ใช้ A***8",
        rating: 5,
        date: "2026-02-18",
        variantLabel: "เครื่องวัดน้ำตาลอย่างเดียว",
        comment: "จัดส่งเร็ว แพ็กของแน่น เครื่องใช้งานไม่ยาก ตัวเลขอ่านง่ายมากครับ",
        likes: 14,
        hasMedia: true,
      },
      {
        id: "rv-bg03-meter-only-002",
        userName: "คุณแอนนา",
        rating: 5,
        date: "2026-02-07",
        variantLabel: "เครื่องวัดน้ำตาลอย่างเดียว",
        comment: "ของแท้ มีคู่มือไทยครบ เหมาะกับผู้สูงอายุในบ้าน",
        likes: 9,
        hasMedia: false,
      },
    ],
    specRows: [
      {
        id: "category",
        label: "หมวดหมู่",
        value:
          "กลุ่มผลิตภัณฑ์เพื่อสุขภาพ > เครื่องมือและอุปกรณ์ในการดูแลสุขภาพ > อุปกรณ์ตรวจวัดสุขภาพ",
      },
      { id: "brand", label: "แบรนด์", value: "Ace+Med" },
      { id: "warranty", label: "การรับประกัน", value: "ประกันจากผู้ผลิต" },
      { id: "shelfLife", label: "อายุสินค้า", value: "24 เดือน" },
      { id: "licenseNumber", label: "เลขที่ใบอนุญาต/จดแจ้ง", value: "65-2-2-1-0014045" },
      { id: "shipFrom", label: "จัดส่งจาก", value: "กรุงเทพมหานคร" },
    ],
  },
  {
    id: "dr-morepen-glucoone-bg03-meter-strip-kit",
    slug: "dr-morepen-glucoone-bg03-meter-strip-kit",
    name: "DR.MOREPEN GLUCOONE BG-03 เครื่อง + แถบตรวจ 25-50 ชิ้น",
    internalNotice: DEFAULT_INTERNAL_NOTICE,
    categoryPath: [
      "กลุ่มผลิตภัณฑ์เพื่อสุขภาพ",
      "เครื่องมือและอุปกรณ์ในการดูแลสุขภาพ",
      "อุปกรณ์ตรวจวัดสุขภาพ",
    ],
    soldCount: 1243,
    favoriteCount: 582,
    variants: [
      {
        id: "meter-strip-25",
        label: "เครื่อง + แถบตรวจ 25 ชิ้น",
        price: 359,
        compareAtPrice: 1390,
        stock: 24,
        active: true,
        sku: "BG03-STR25",
      },
      {
        id: "meter-strip-50",
        label: "เครื่อง + แถบตรวจ 50 ชิ้น",
        price: 459,
        compareAtPrice: null,
        stock: 50,
        active: true,
        sku: "BG03-STR50",
      },
    ],
    images: [...BG03_STRIP_KIT_IMAGES],
    shop: {
      ...DEFAULT_SHOP,
    },
    specs: {
      brand: "Ace+Med",
      warranty: "ประกันจากผู้ผลิต",
      shelfLife: "24 เดือน",
      licenseNumber: "65-2-2-1-0014045",
      shipFrom: "กรุงเทพมหานคร",
    },
    trustIndicators: ["ส่งฟรี", "สินค้าแท้", "มีใบอนุญาต", "เลือกชุด 25 หรือ 50 ชิ้น"],
    promoHighlights: ["เลือกได้ 25 / 50 ชิ้น", "bundle พร้อมใช้งาน", "ส่งไว"],
    description: {
      intro:
        "ชุดเครื่องวัดน้ำตาล DR.MOREPEN GLUCOONE BG-03 พร้อมแถบตรวจสำหรับผู้ที่ต้องการเริ่มใช้งานได้ทันที มีตัวเลือกแบบ 25 ชิ้นและ 50 ชิ้น เหมาะสำหรับการใช้งานต่อเนื่องที่บ้านโดยไม่ต้องหาอุปกรณ์เสริมแยกในทันที",
      highlights: [
        "มีตัวเลือก bundle พร้อมแถบตรวจ 25 ชิ้น หรือ 50 ชิ้น",
        "อ่านค่าในประมาณ 5 วินาที พร้อมหน้าจอแสดงผลชัดเจน",
        "เหมาะสำหรับลูกค้าที่ต้องการชุดพร้อมเริ่มใช้งานทันที",
        "ขนาดกะทัดรัด พกพาง่าย ใช้งานได้ทั้งที่บ้านและนอกสถานที่",
      ],
      inBox: [
        "เครื่องวัดน้ำตาล BG-03",
        "แถบตรวจตามตัวเลือกที่เลือก",
        "เข็มเจาะเลือดและปากกาเจาะ",
        "คู่มือการใช้งานภาษาไทย",
        "แบตเตอรี่เริ่มต้น",
      ],
      notes: [
        "ควรตรวจสอบตัวเลือก 25 หรือ 50 ชิ้นก่อนสั่งซื้อ",
        "ภาพสินค้าใช้เป็น mock reference ภายในโปรเจค",
      ],
    },
    ratingSummary: {
      score: 4.9,
      totalRatings: 326,
      totalReviews: 118,
      breakdown: [
        { star: 5, count: 286 },
        { star: 4, count: 28 },
        { star: 3, count: 8 },
        { star: 2, count: 2 },
        { star: 1, count: 2 },
      ],
    },
    reviews: [
      {
        id: "rv-bg03-kit-001",
        userName: "ผู้ใช้ B***4",
        rating: 5,
        date: "2026-02-19",
        variantLabel: "เครื่อง + แถบตรวจ 25 ชิ้น",
        comment: "สั่งแบบ bundle มาแล้วใช้งานได้เลย สะดวกมาก ร้านแพ็กดีครับ",
        likes: 12,
        hasMedia: true,
      },
      {
        id: "rv-bg03-kit-002",
        userName: "M*****n",
        rating: 4,
        date: "2026-01-30",
        variantLabel: "เครื่อง + แถบตรวจ 50 ชิ้น",
        comment: "ใช้งานได้ดี ค่าค่อนข้างนิ่ง เทียบกับที่คลินิกแล้วใกล้เคียงครับ",
        likes: 5,
        hasMedia: true,
      },
    ],
    specRows: [
      {
        id: "category",
        label: "หมวดหมู่",
        value:
          "กลุ่มผลิตภัณฑ์เพื่อสุขภาพ > เครื่องมือและอุปกรณ์ในการดูแลสุขภาพ > อุปกรณ์ตรวจวัดสุขภาพ",
      },
      { id: "brand", label: "แบรนด์", value: "Ace+Med" },
      { id: "warranty", label: "การรับประกัน", value: "ประกันจากผู้ผลิต" },
      { id: "shelfLife", label: "อายุสินค้า", value: "24 เดือน" },
      { id: "licenseNumber", label: "เลขที่ใบอนุญาต/จดแจ้ง", value: "65-2-2-1-0014045" },
      { id: "shipFrom", label: "จัดส่งจาก", value: "กรุงเทพมหานคร" },
    ],
  },
  {
    id: "sinocare-safe-aq-test-strips-50",
    slug: "sinocare-safe-aq-test-strips-50",
    name: "Sinocare Safe AQ แถบตรวจน้ำตาล 50 ชิ้น",
    internalNotice: DEFAULT_INTERNAL_NOTICE,
    categoryPath: ["กลุ่มผลิตภัณฑ์เพื่อสุขภาพ", "อุปกรณ์ตรวจวัดสุขภาพ", "แถบตรวจน้ำตาล"],
    soldCount: 1810,
    favoriteCount: 522,
    variants: [
      {
        id: "safe-aq-25",
        label: "25 ชิ้น",
        price: 389,
        compareAtPrice: 450,
        stock: 90,
        active: true,
        sku: "AQ-25",
      },
      {
        id: "safe-aq-50",
        label: "50 ชิ้น",
        price: 737,
        compareAtPrice: 820,
        stock: 60,
        active: true,
        sku: "AQ-50",
      },
      {
        id: "safe-aq-100",
        label: "100 ชิ้น",
        price: 1439,
        compareAtPrice: 1590,
        stock: 22,
        active: true,
        sku: "AQ-100",
      },
    ],
    images: [...SAFE_AQ_PROMO_IMAGES],
    shop: {
      ...DEFAULT_SHOP,
    },
    specs: {
      brand: "Sinocare",
      compatibleWith: "Sinocare Safe AQ",
      shelfLife: "24 เดือน",
      packSize: "50 ชิ้น",
      shipFrom: "กรุงเทพมหานคร",
    },
    trustIndicators: ["ซีลโรงงาน", "ล็อตใหม่", "ส่งไว", "แพ็กป้องกันความชื้น"],
    promoHighlights: ["ขายดี", "ซื้อซ้ำสูง", "พร้อมส่ง"],
    description: {
      intro:
        "แถบตรวจน้ำตาล Sinocare Safe AQ สำหรับผู้ใช้งานเครื่องตรวจรุ่นที่รองรับ ช่วยให้วัดค่าได้ต่อเนื่องและเก็บสำรองใช้งานที่บ้านได้สะดวก",
      highlights: [
        "แถบตรวจบรรจุในขวดปิดสนิท ลดความชื้น",
        "รองรับการใช้งานกับเครื่อง Sinocare Safe AQ",
        "มีหลายขนาดแพ็กให้เลือกตามการใช้งาน",
        "เหมาะสำหรับผู้ที่ต้องตรวจน้ำตาลเป็นประจำ",
      ],
      inBox: ["แถบตรวจตามจำนวนที่เลือก", "ฉลากรุ่นและล็อตการผลิต"],
      notes: [
        "ควรปิดฝาขวดทันทีหลังหยิบแถบตรวจ",
        "ควรตรวจสอบรุ่นเครื่องที่รองรับก่อนสั่งซื้อ",
      ],
    },
    ratingSummary: {
      score: 4.9,
      totalRatings: 410,
      totalReviews: 133,
      breakdown: [
        { star: 5, count: 364 },
        { star: 4, count: 33 },
        { star: 3, count: 8 },
        { star: 2, count: 3 },
        { star: 1, count: 2 },
      ],
    },
    reviews: [
      {
        id: "rv-strip-001",
        userName: "N***a",
        rating: 5,
        date: "2026-02-28",
        variantLabel: "50 ชิ้น",
        comment: "ล็อตใหม่ ใช้กับเครื่อง Safe AQ ได้ปกติทุกแถบ",
        likes: 8,
        hasMedia: false,
      },
      {
        id: "rv-strip-002",
        userName: "ผู้ใช้ T***8",
        rating: 4,
        date: "2026-02-11",
        variantLabel: "25 ชิ้น",
        comment: "ร้านส่งเร็ว แพ็กมาดีครับ",
        likes: 3,
        hasMedia: false,
      },
    ],
    specRows: [
      { id: "category", label: "หมวดหมู่", value: "กลุ่มผลิตภัณฑ์เพื่อสุขภาพ > อุปกรณ์ตรวจวัดสุขภาพ > แถบตรวจน้ำตาล" },
      { id: "brand", label: "แบรนด์", value: "Sinocare" },
      { id: "compatibleWith", label: "ใช้กับเครื่อง", value: "Sinocare Safe AQ" },
      { id: "packSize", label: "จำนวนต่อแพ็ก", value: "50 ชิ้น" },
      { id: "shelfLife", label: "อายุสินค้า", value: "24 เดือน" },
      { id: "shipFrom", label: "จัดส่งจาก", value: "กรุงเทพมหานคร" },
    ],
  },
  {
    id: "sinocare-sterile-lancets-100",
    slug: "sinocare-sterile-lancets-100",
    name: "Sinocare Sterile Lancets เข็มเจาะเลือดปลายนิ้ว 100 ชิ้น",
    internalNotice: DEFAULT_INTERNAL_NOTICE,
    categoryPath: ["กลุ่มผลิตภัณฑ์เพื่อสุขภาพ", "เวชภัณฑ์ใช้ครั้งเดียว", "เข็มเจาะเลือด"],
    soldCount: 612,
    favoriteCount: 214,
    variants: [
      {
        id: "lancet-100",
        label: "100 ชิ้น",
        price: 54,
        compareAtPrice: 79,
        stock: 120,
        active: true,
        sku: "LANCET-100",
      },
      {
        id: "lancet-200",
        label: "200 ชิ้น",
        price: 99,
        compareAtPrice: 129,
        stock: 65,
        active: true,
        sku: "LANCET-200",
      },
    ],
    images: [...STETHOSCOPE_PROMO_IMAGES],
    shop: {
      ...DEFAULT_SHOP,
    },
    specs: {
      brand: "Sinocare",
      material: "Stainless Steel",
      packSize: "100 ชิ้น",
      compatibleWith: "ปากกาเจาะเลือดมาตรฐาน",
      shipFrom: "กรุงเทพมหานคร",
    },
    trustIndicators: ["ปลอดเชื้อ", "ใช้ครั้งเดียว", "พร้อมส่ง", "แพ็กประหยัด"],
    promoHighlights: ["ราคาคุ้ม", "ขายดี", "เหมาะกับใช้ประจำ"],
    description: {
      intro:
        "เข็มเจาะเลือดปลายนิ้วแบบปลอดเชื้อสำหรับใช้งานร่วมกับปากกาเจาะเลือดมาตรฐาน เหมาะสำหรับผู้ที่ต้องตรวจน้ำตาลเป็นประจำและต้องการสต็อกอุปกรณ์ไว้ที่บ้าน",
      highlights: [
        "บรรจุแพ็ก 100 ชิ้น ใช้งานคุ้มค่า",
        "ปลายเข็มคม ช่วยให้เจาะได้ง่าย",
        "เหมาะกับการใช้งานแบบใช้ครั้งเดียว",
        "รองรับปากกาเจาะเลือดมาตรฐานหลายรุ่น",
      ],
      inBox: ["เข็มเจาะเลือดตามจำนวนที่เลือก", "ฉลากสินค้าและข้อมูลล็อตการผลิต"],
      notes: [
        "ควรเปลี่ยนเข็มทุกครั้งเพื่อความสะอาด",
        "เก็บให้พ้นมือเด็กและหลีกเลี่ยงความชื้น",
      ],
    },
    ratingSummary: {
      score: 4.9,
      totalRatings: 204,
      totalReviews: 61,
      breakdown: [
        { star: 5, count: 183 },
        { star: 4, count: 15 },
        { star: 3, count: 4 },
        { star: 2, count: 1 },
        { star: 1, count: 1 },
      ],
    },
    reviews: [
      {
        id: "rv-lancet-001",
        userName: "ผู้ใช้ M***9",
        rating: 5,
        date: "2026-03-04",
        variantLabel: "100 ชิ้น",
        comment: "คมดี ใช้กับปากกาเจาะมาตรฐานได้พอดีครับ",
        likes: 4,
        hasMedia: false,
      },
      {
        id: "rv-lancet-002",
        userName: "คุณฝน",
        rating: 4,
        date: "2026-02-16",
        variantLabel: "200 ชิ้น",
        comment: "แพ็กคุ้มมากค่ะ ส่งจากกรุงเทพฯ ไวดี",
        likes: 2,
        hasMedia: false,
      },
    ],
    specRows: [
      { id: "category", label: "หมวดหมู่", value: "กลุ่มผลิตภัณฑ์เพื่อสุขภาพ > เวชภัณฑ์ใช้ครั้งเดียว > เข็มเจาะเลือด" },
      { id: "brand", label: "แบรนด์", value: "Sinocare" },
      { id: "material", label: "วัสดุ", value: "Stainless Steel" },
      { id: "packSize", label: "จำนวนต่อแพ็ก", value: "100 ชิ้น" },
      { id: "compatibleWith", label: "เหมาะกับ", value: "ปากกาเจาะเลือดมาตรฐาน" },
      { id: "shipFrom", label: "จัดส่งจาก", value: "กรุงเทพมหานคร" },
    ],
  },
  {
    id: "dr-morepen-blood-pressure-monitor-bp12",
    slug: "dr-morepen-blood-pressure-monitor-bp12",
    name: "Dr. Morepen เครื่องวัดความดันดิจิทัล BP-12",
    internalNotice: DEFAULT_INTERNAL_NOTICE,
    categoryPath: [
      "กลุ่มผลิตภัณฑ์เพื่อสุขภาพ",
      "เครื่องมือและอุปกรณ์ในการดูแลสุขภาพ",
      "เครื่องวัดความดัน",
    ],
    soldCount: 876,
    favoriteCount: 401,
    variants: [
      {
        id: "bp12-standard",
        label: "ชุดมาตรฐาน",
        price: 790,
        compareAtPrice: 990,
        stock: 32,
        active: true,
        sku: "BP12-STD",
      },
      {
        id: "bp12-adapter",
        label: "พร้อมอะแดปเตอร์",
        price: 890,
        compareAtPrice: 1090,
        stock: 17,
        active: true,
        sku: "BP12-ADP",
      },
    ],
    images: [
      "https://picsum.photos/seed/dr-morepen-bp12-1/900/900",
      "https://picsum.photos/seed/dr-morepen-bp12-2/900/900",
      "https://picsum.photos/seed/dr-morepen-bp12-3/900/900",
    ],
    shop: {
      ...DEFAULT_SHOP,
    },
    specs: {
      brand: "Dr. Morepen",
      cuffSize: "22-42 ซม.",
      power: "ถ่าน AA หรืออะแดปเตอร์",
      warranty: "รับประกัน 1 ปี",
      shipFrom: "กรุงเทพมหานคร",
    },
    trustIndicators: ["วัดค่าอัตโนมัติ", "หน้าจอใหญ่", "มีหน่วยความจำ", "รับประกันสินค้า"],
    promoHighlights: ["ใช้งานง่าย", "เหมาะกับผู้สูงอายุ", "ส่งไว"],
    description: {
      intro:
        "เครื่องวัดความดันดิจิทัลแบบต้นแขนสำหรับใช้งานที่บ้าน อ่านค่าง่ายด้วยหน้าจอขนาดใหญ่และระบบวัดอัตโนมัติ ช่วยให้ติดตามสุขภาพได้สะดวกทุกวัน",
      highlights: [
        "วัดความดันและชีพจรอัตโนมัติ",
        "หน้าจอขนาดใหญ่ ตัวเลขอ่านง่าย",
        "เหมาะกับผู้ใช้งานทั่วไปและผู้สูงอายุ",
        "มีตัวเลือกชุดพร้อมอะแดปเตอร์",
      ],
      inBox: ["ตัวเครื่อง", "ปลอกแขนวัดความดัน", "คู่มือภาษาไทย", "แบตเตอรี่เริ่มต้น"],
      notes: [
        "ควรวัดในท่านั่งพักและใช้อุปกรณ์ตามคู่มือ",
        "ผลลัพธ์เป็นข้อมูลเบื้องต้น ไม่ใช้แทนคำแนะนำแพทย์",
      ],
    },
    ratingSummary: {
      score: 4.8,
      totalRatings: 255,
      totalReviews: 82,
      breakdown: [
        { star: 5, count: 214 },
        { star: 4, count: 28 },
        { star: 3, count: 8 },
        { star: 2, count: 3 },
        { star: 1, count: 2 },
      ],
    },
    reviews: [
      {
        id: "rv-bp12-001",
        userName: "T***n",
        rating: 5,
        date: "2026-03-02",
        variantLabel: "ชุดมาตรฐาน",
        comment: "ตัวเลขใหญ่ ใช้งานง่าย ผู้ใหญ่ที่บ้านใช้เองได้",
        likes: 7,
        hasMedia: true,
      },
      {
        id: "rv-bp12-002",
        userName: "Jib",
        rating: 4,
        date: "2026-02-09",
        variantLabel: "พร้อมอะแดปเตอร์",
        comment: "เครื่องวัดไวและปลอกแขนใส่ง่ายค่ะ",
        likes: 3,
        hasMedia: false,
      },
    ],
    specRows: [
      { id: "category", label: "หมวดหมู่", value: "กลุ่มผลิตภัณฑ์เพื่อสุขภาพ > เครื่องมือและอุปกรณ์ในการดูแลสุขภาพ > เครื่องวัดความดัน" },
      { id: "brand", label: "แบรนด์", value: "Dr. Morepen" },
      { id: "cuffSize", label: "ขนาดปลอกแขน", value: "22-42 ซม." },
      { id: "power", label: "แหล่งพลังงาน", value: "ถ่าน AA หรืออะแดปเตอร์" },
      { id: "warranty", label: "การรับประกัน", value: "รับประกัน 1 ปี" },
      { id: "shipFrom", label: "จัดส่งจาก", value: "กรุงเทพมหานคร" },
    ],
  },
];

export const mockProducts = mockProductsBase.map((product) => ({
  ...product,
  sameShopItems: buildSameShopItems(mockProductsBase, product.id),
}));

export const getAllMockProducts = () => mockProducts;

export const getProductById = (productId) => {
  if (typeof productId !== "string" || !productId.trim()) {
    return null;
  }

  return mockProducts.find((product) => product.id === productId.trim()) || null;
};

export const getProductBySlug = (productSlug) => {
  if (typeof productSlug !== "string" || !productSlug.trim()) {
    return null;
  }

  return mockProducts.find((product) => product.slug === productSlug.trim()) || null;
};

export const getDefaultMockProduct = () => mockProducts[0] || null;

export default mockProducts;
