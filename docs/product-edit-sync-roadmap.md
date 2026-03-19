# Product Edit Sync Roadmap

เอกสารนี้อธิบาย logic ที่ใช้ sync ข้อมูลจากหน้า `ProductMockPage.jsx` ไปยัง product cards ในหน้า shop/storefront ของสินค้าเดียวกัน โดยยังอยู่บนสถาปัตยกรรม mock/SPA และวางโครงให้ย้ายไป backend จริงได้ในอนาคต

## เป้าหมายของ Sync Layer

- ให้ product page และ storefront cards อ่านข้อมูลจาก logic merge ชุดเดียวกัน
- ให้ editable content ของสินค้าหนึ่งไม่ไปทับอีกสินค้า
- ให้ local overrides ใน `localStorage` สะท้อนทั้งหน้า product และ card ของสินค้านั้น
- ลดการกระจาย logic merge หลายชุดในหลาย component

## โครงสร้างที่ใช้ตอนนี้

### Canonical Source

- base products อยู่ที่ `src/data/mockProducts.js`
- lookup ผ่าน `getAllMockProducts()`, `getProductBySlug()`, `getDefaultMockProduct()`

### Editable Storage

- storage keys และการอ่าน override อยู่ที่ `src/utils/editableContentStorage.js`
- key หลักต่อสินค้าคือ `pm_editable_content_v2:${product.slug || product.id}`
- ยังรองรับ legacy keys เพื่อ migration

### Merge Layer

- merge logic กลางอยู่ที่ `src/utils/displayProduct.js`
- `buildDisplayProductFromEditableContent(baseProduct, editableContent)`
- `getStoredDisplayProduct(baseProduct)`
- `getStoredDisplayProducts(products)`

utility นี้เรียก `buildPublishedProduct()` จาก `src/utils/publishProduct.js` เพื่อรวม:

- base product data
- editable overrides ของสินค้าตัวนั้น

ให้กลายเป็น display-ready product object

## ตอนนี้ Sync อะไรได้แล้ว

field ที่ sync จาก product edit ไป storefront cards ได้ตอนนี้:

- `title`
  - มาจาก `productTitle`
- `main image`
  - มาจาก `productGalleryOverrides[0]`
- `current price`
  - มาจาก `productVariantsOverrides`
- `original price`
  - มาจาก `productVariantsOverrides.compareAtPrice`
- `variant label / short muted tag`
  - มาจาก label ของ variant ที่ถูก merge แล้ว
- `alt text`
  - อิงชื่อสินค้าที่ถูก merge แล้ว

section/card ที่อ่าน merged display product แล้วตอนนี้:

- `.store-recommend-card`
- `.store-shop-products__card`
- top sales cards ที่ reuse `StoreProductCard`
- recommendation card
- sold-out listing cards
- featured product บางส่วนใน storefront ที่ derive จากสินค้าแรกใน catalog

## Field ที่ยังไม่ Sync

field ต่อไปนี้ยังไม่ได้ sync จาก product edit ไป storefront เพราะตอนนี้ยังไม่มี editable source หรือยังเป็น page-level config:

- badge เช่น `Mall`, `ขายดี`, `ช้อปปี้ถูกชัวร์`
- promo tags เช่น `ส่งฟรี`, `มีโค้ดลด`
- voucher text
- `rating`
- `sold count`
- short marketing copy / description ที่ใช้เฉพาะบาง storefront sections

หมายเหตุ:

- rating และ sold count ตอนนี้ยังมาจาก canonical mock product data
- ถ้าต้องการให้ sync ได้ในอนาคต ควรเพิ่ม editable fields ใหม่หรือย้ายให้มาจาก backend/API ตรง

## Product Page ใช้ Logic นี้อย่างไร

`src/pages/ProductMockPage.jsx` ตอนนี้แยกเป็น 2 layer:

- `baseProduct`
  - ใช้สำหรับ restore default, editor defaults, และ product identity
- `displayProduct`
  - มาจากการ merge `baseProduct + editableContent`
  - ใช้ render UI จริงของหน้า product

แนวคิดนี้สำคัญมาก เพราะทำให้:

- restore default ยังคืนค่าฐานเดิมได้
- หน้า product แสดงค่าที่ถูก edit แล้วจริง
- storefront สามารถใช้ merge logic เดียวกันได้

## Storefront ใช้ Logic นี้อย่างไร

`src/pages/ShopStorePage.jsx` ตอนนี้:

- เริ่มจาก `getAllMockProducts()`
- แล้ว map ผ่าน `getStoredDisplayProducts()`
- product cards derive summary จาก display product ที่ merge แล้ว ไม่ใช่ raw mock object ตรง ๆ

มี event listener เบา ๆ สำหรับ:

- `pm:editable-content-changed`
- `storage`

เพื่อให้ถ้า storefront ถูก mount อยู่และ editable content เปลี่ยน มันสามารถ re-read display products ได้

## ถ้าแก้ไขอะไรในหน้า Product แล้วอะไรจะสะท้อนทันที

ตัวอย่างที่ได้แล้ว:

- แก้ชื่อสินค้าใน Product page -> title บน storefront card เปลี่ยน
- แก้ gallery รูปแรก -> รูปบน storefront card เปลี่ยน
- แก้ราคา variant หลัก -> ราคาบน card เปลี่ยน
- restore default -> card กลับไปใช้ค่าจาก base product
- เปิดสินค้าคนละตัว -> card อ่าน override ของตัวเองตาม storage key

## ถ้าจะขยายให้ Sync มากขึ้นในอนาคต

ลำดับที่แนะนำ:

1. เพิ่ม editable fields ใหม่ใน contract เช่น:
   - `cardBadge`
   - `cardPromoTags`
   - `ratingOverride`
   - `soldCountOverride`
2. อัปเดต `buildPublishedProduct()` ให้ merge fields เหล่านั้น
3. อัปเดต storefront card view model ให้ consume fields ที่ merge แล้ว
4. เพิ่ม tests สำหรับ field ใหม่ทันที

## ถ้าอนาคตมี Backend จริง ควรย้าย Logic นี้ไปไหน

วันนี้:

- `localStorage` เป็น temporary persistence layer
- `buildDisplayProductFromEditableContent()` เป็น merge layer ฝั่ง client

เมื่อมี backend:

- canonical product data ควรมาจาก `GET /products` และ `GET /products/:slug`
- editable content ควรมาจาก `GET /products/:id/editable-content`
- merge layer อาจยังอยู่ฝั่ง frontend ต่อได้ในช่วงแรก
- ถ้า backend เริ่มส่ง merged preview มาแล้ว frontend ยังควรเก็บ compatibility layer ไว้ชั่วคราว

แนวทางที่แนะนำ:

- data fetching อยู่ใน service layer
- merge layer อยู่ใน utility/selector กลาง
- components ไม่ควร merge เองในหลายที่

## ไฟล์สำคัญที่เกี่ยวข้อง

- `src/pages/ProductMockPage.jsx`
- `src/pages/ShopStorePage.jsx`
- `src/utils/displayProduct.js`
- `src/utils/editableContentStorage.js`
- `src/utils/publishProduct.js`
- `src/hooks/useEditableContent.js`

## Known Limitations

- same-shop carousel ในหน้า product ยังไม่ได้ derive จาก merged product catalog ทั้งชุด
- storefront marketing sections บาง block ยังใช้ page-local config ไม่ได้อ่าน editable source โดยตรง
- sync ยังอิง `localStorage` เป็นหลัก ไม่ใช่ shared store หรือ backend state
- cross-device / server-render / multi-user sync ยังไม่มี

## Next Step ถ้าจะต่อ Backend จริง

1. สร้าง service layer สำหรับ product list/detail และ editable content
2. ให้ `ShopStorePage` กับ `ProductMockPage` อ่านผ่าน service layer แทน mock import ตรง
3. คง `buildDisplayProductFromEditableContent()` ไว้เป็น compatibility merge layer
4. ย้าย editable persistence จาก `localStorage` ไป `GET/PATCH /products/:id/editable-content`
5. เพิ่ม tests สำหรับ API-backed sync และ loading/error states
