# Storefront / Product Roadmap

เอกสารนี้เป็น roadmap ระยะยาวสำหรับพัฒนา `shop/storefront` และ `product page` จาก mock SPA ปัจจุบันไปสู่ระบบที่รองรับ backend + database จริงในอนาคต โดยตั้งใจให้ agent / Codex รุ่นถัดไปเข้ามาอ่านแล้วทำงานต่อได้ทันที

## Scope

- ครอบคลุมหน้าที่เกี่ยวข้องหลักคือ `src/pages/ShopStorePage.jsx`, `src/pages/ProductMockPage.jsx`, `src/App.jsx`, `src/data/mockProduct.js`, `src/utils/appRoutes.js`
- เน้นการทำให้โครงปัจจุบัน migrate ต่อได้ ไม่ใช่เขียนทิ้งแล้วเริ่มใหม่
- เอกสารนี้ไม่บังคับ implementation เดียว แต่กำหนดทิศทางที่ควรรักษาไว้

## ภาพรวมปัญหาปัจจุบัน

- ตอนนี้ระบบรองรับ multi-product mock data, dynamic route และ per-product editable content แล้ว แต่ยังอ่านข้อมูลจาก mock files เป็นหลัก
- `ShopStorePage.jsx` ยังมีหลาย section ที่ใช้ config หรือ marketing copy ภายในไฟล์หน้าโดยตรง จึงยังไม่ data-driven เต็มทั้งหน้า
- `App.jsx` ยังใช้ manual SPA router ด้วย `window.history.pushState` แทน data/router layer ที่พร้อมต่อ backend จริง
- `ProductMockPage.jsx` ใช้ `normalizeProduct()` ได้ดี แต่ data fetching, loading state, cache และ API error handling ยังไม่มี
- export/publish flow ของ editable content เริ่มมี `productId` / `productSlug` แล้ว แต่ tooling ฝั่ง script ยังอิง single-product publish flow เป็นหลัก
- ยังไม่มี service layer กลางสำหรับสลับระหว่าง mock mode กับ API mode
- ยังไม่มี backend contract enforcement จริงนอกจากเอกสาร roadmap

## เป้าหมายปลายทาง

- shop page แสดงสินค้าได้หลายตัวจาก collection เดียวกัน
- คลิกการ์ดสินค้าแต่ละใบแล้วเข้า URL ของสินค้านั้น เช่น `/product/:slug`
- product page render ข้อมูลตาม `slug` หรือ `id` ที่ route ระบุ
- แต่ละสินค้าแสดงชื่อ รูป ราคา specs description reviews และ same-shop items ไม่เหมือนกันได้
- editable content แยกต่อสินค้า ไม่ทับกันข้ามสินค้า
- เปลี่ยนแหล่งข้อมูลจาก mock file ไปเป็น API/backend ได้โดยไม่ต้องรื้อ component tree หลัก
- `normalizeProduct()` ยังคงอยู่เป็น compatibility layer ระหว่าง mock data / API data / editable overrides

## สถาปัตยกรรมที่ต้องการ

- เปลี่ยนจาก `mockProduct` object เดียว เป็น `mockProducts` collection
- ทุกสินค้าต้องมี `id` และ `slug`
- storefront/shop page render การ์ดทั้งหมดจาก array เดียวกัน
- route ฝั่ง product page ต้องอ่าน `slug` หรือ `id` จาก router
- product page ต้องหา product object ที่ตรงกับ route ก่อน render
- ถ้าหาไม่เจอ ต้องมี not-found state ที่ชัดเจน
- `normalizeProduct(rawProduct)` ต้องเป็นทางผ่านก่อนส่งข้อมูลให้ component ย่อยเสมอ
- editable content ต้องอิง `product.id` หรือ `product.slug` ทั้งใน localStorage key, export payload, import payload, admin edit state
- same-shop items และ recommendation blocks ควรอิง `id` หรือ `slug` ของสินค้าจริง ไม่อิง index ล้วน ๆ

## Current Baseline

- `src/App.jsx`: manual SPA routing ที่รองรับ `/product/:slug` และ `/shop/dr-morepen-medical-th`
- `src/pages/ShopStorePage.jsx`: storefront ใช้ `mockProducts` collection และผูกการ์ดหลักกับ slug route แล้ว แต่ยังมีบาง section ที่ใช้ page-level config
- `src/pages/ProductMockPage.jsx`: product page หา product ตาม slug, ส่งเข้า `normalizeProduct()`, และมี fallback/not-found notice
- `src/hooks/useEditableContent.js`: local overrides ถูก scope ต่อสินค้าแล้ว และรองรับ migration จาก legacy storage keys

## Principles

- หลีกเลี่ยงการสร้าง page file แยกตามสินค้า
- หลีกเลี่ยงการผูก component กับสินค้าตัวเดียว
- รักษา shape ของ product object ให้สม่ำเสมอ
- เพิ่ม compatibility layer มากกว่ากระจาย conditional logic ไปทั่ว component
- ให้ storefront และ product page consume data source เดียวกัน
- ระบุ boundary ชัดเจนระหว่าง `raw data`, `normalized data`, `editable overrides`, `render props`

## Implementation Task List

section นี้เป็น source of truth สำหรับสถานะงานล่าสุดของ repo ถ้ามีจุดที่ phase checklist ด้านล่างยังไม่ถูกติ๊กครบ แต่สถานะจริงเปลี่ยนแล้ว ให้เชื่อ section นี้ก่อน

### ตอนนี้ทำแล้ว

#### Task: Multi-Product Mock Data Foundation

- เป้าหมาย: เปลี่ยนจาก single product mock เป็น collection กลางที่ storefront และ product page ใช้ร่วมกันได้
- ไฟล์ที่น่าจะเกี่ยวข้อง: `src/data/mockProducts.js`, `src/data/mockProduct.js`, `src/pages/ShopStorePage.jsx`, `src/pages/ProductMockPage.jsx`
- ความเสี่ยง: shape ของสินค้าแต่ละตัวอาจ drift กันเองถ้าเพิ่ม field แบบ ad hoc หรือถ้า same-shop items ไม่อิง product ตัวจริง
- Definition of done: มีสินค้า mock หลายตัวใน collection เดียว, ทุกตัวมี `id` และ `slug`, มี helper lookup ที่เรียกใช้จากหน้า product และ storefront ได้

#### Task: Dynamic Product Route

- เป้าหมาย: ให้การเข้า product page ใช้ URL แบบ `/product/:slug` และหา product ที่ตรงกับ slug ก่อน render
- ไฟล์ที่น่าจะเกี่ยวข้อง: `src/App.jsx`, `src/utils/appRoutes.js`, `src/pages/ProductMockPage.jsx`
- ความเสี่ยง: route matcher อาจ parse path ผิด, refresh แล้วหลุด fallback, หรือ unknown slug ทำให้หน้า render พัง
- Definition of done: route builder/matcher กลางทำงานได้, product page อ่าน slug ได้, มี fallback/not-found notice โดยไม่ crash

#### Task: Storefront Card Linking

- เป้าหมาย: ให้การ์ดสินค้าใน storefront ลิงก์ไปยัง product route ของสินค้าตัวเองแทน `href="/"` แบบตายตัว
- ไฟล์ที่น่าจะเกี่ยวข้อง: `src/pages/ShopStorePage.jsx`, `src/utils/appRoutes.js`, `src/styles/store-page.css`
- ความเสี่ยง: card บางชุดอาจยังใช้ mock card config ที่ไม่ผูก product จริง หรือ anchor intercept อาจทำให้ keyboard / modified-click behavior เพี้ยน
- Definition of done: `.store-recommend-card` และ card listing หลักใช้ `slug` ของสินค้า, `aria-label` และ `alt` สอดคล้องกับ product object, styling เดิมไม่พัง

#### Task: Per-Product Editable Content Persistence

- เป้าหมาย: แยก editable state ต่อสินค้าเพื่อไม่ให้ title, gallery, specs หรือ variants ของสินค้าหนึ่งไปทับอีกสินค้า
- ไฟล์ที่น่าจะเกี่ยวข้อง: `src/hooks/useEditableContent.js`, `src/pages/ProductMockPage.jsx`, `src/utils/publishProduct.js`
- ความเสี่ยง: localStorage key migration อาจทำให้ข้อมูลเก่าหาย, export payload อาจไม่บอกชัดว่าเป็นของสินค้าไหน, หรือ reset ไปลบ key ผิดสินค้า
- Definition of done: storage key ถูก scope ตาม `product.slug` หรือ `product.id`, legacy key ยังอ่านได้, export payload มี product identity ชัดเจน

#### Task: API Contract Baseline

- เป้าหมาย: เขียน contract เบื้องต้นให้ backend/frontend เข้าใจ field และ endpoint ตรงกันก่อนเริ่มทำ API จริง
- ไฟล์ที่น่าจะเกี่ยวข้อง: `docs/storefront-product-roadmap.md`
- ความเสี่ยง: เอกสารอาจไม่ตามโค้ดจริงหรือใช้ field names ที่ไม่ตรงกับ `normalizeProduct()`
- Definition of done: มี endpoint inventory, product list/detail response, editable-content payload และ migration notes อยู่ใน roadmap เดียวกัน

### กำลังทำ

#### Task: Backend Migration Readiness Boundary

- เป้าหมาย: ลด coupling ระหว่าง page components กับ mock imports เพื่อให้ย้ายไป API ได้โดยเปลี่ยนแค่ data layer
- ไฟล์ที่น่าจะเกี่ยวข้อง: `src/pages/ShopStorePage.jsx`, `src/pages/ProductMockPage.jsx`, `src/data/mockProducts.js`, `src/utils/publishProduct.js`, `docs/storefront-product-roadmap.md`
- ความเสี่ยง: ถ้าปล่อยให้ page components lookup mock data เองหลายจุด จะเกิดหลาย source of truth และย้ายไป service layer ยาก
- Definition of done: มีขอบเขตที่ชัดว่าจุดไหนยังผูก mock data ตรงอยู่, จุดไหนพร้อมย้ายเข้า service layer, และ roadmap ระบุลำดับ migration ไว้ชัด

#### Task: Multi-Product Publish / Import Tooling Alignment

- เป้าหมาย: ทำให้ tooling ฝั่ง admin/export/publish เข้าใจว่า editable payload เป็นของสินค้าตัวใด และพร้อม evolve ไปเป็น per-product backend flow
- ไฟล์ที่น่าจะเกี่ยวข้อง: `src/utils/publishProduct.js`, `scripts/publish-product.mjs`, `src/pages/ProductMockPage.jsx`
- ความเสี่ยง: script ปัจจุบันยังเน้น single-product output, อาจ publish payload ผิดสินค้า, หรือ overwrite ไฟล์ compatibility โดยไม่ตั้งใจ
- Definition of done: export payload มี `productId` / `productSlug` / `storageKey`, script และเอกสารสามารถ validate target product ได้ชัดเจนก่อนเขียนผลลัพธ์

### ต้องทำต่อ

#### Task: Build Products Service Layer

- เป้าหมาย: สร้าง interface กลางสำหรับ `fetchProducts()`, `fetchProductBySlug()`, `fetchShopProducts()` โดยเริ่มจาก mock adapter ก่อน
- ไฟล์ที่น่าจะเกี่ยวข้อง: `src/services/products.js`, `src/data/mockProducts.js`, `src/utils/appRoutes.js`
- ความเสี่ยง: ถ้าข้าม step นี้แล้วให้ทุก page เรียก API เอง จะได้ data contract กระจัดกระจายและทดสอบยาก
- Definition of done: มี service functions กลาง, mock mode ใช้งานผ่าน interface เดียวกับ API mode, pages ไม่ import mock collection ตรงในระยะถัดไป

#### Task: Move Storefront to Service-Driven Data Loading

- เป้าหมาย: ให้ `ShopStorePage.jsx` อ่าน product list จาก service layer แทน `getAllMockProducts()` โดยตรง
- ไฟล์ที่น่าจะเกี่ยวข้อง: `src/pages/ShopStorePage.jsx`, `src/services/products.js`, `src/App.jsx`
- ความเสี่ยง: storefront มีหลาย section ที่ derive data คนละแบบ ถ้า migration ไม่ครบอาจเกิด mix ระหว่าง service data กับ page-local config
- Definition of done: storefront อ่าน data ผ่าน service layer, card sections หลักใช้ source เดียวกัน, และมี loading/error/empty state ขั้นพื้นฐาน

#### Task: Move Product Detail to Service-Driven Data Loading

- เป้าหมาย: ให้ `ProductMockPage.jsx` fetch product detail ตาม slug แล้วส่งเข้า `normalizeProduct()` ก่อน render
- ไฟล์ที่น่าจะเกี่ยวข้อง: `src/pages/ProductMockPage.jsx`, `src/services/products.js`, `src/utils/appRoutes.js`
- ความเสี่ยง: ถ้า normalize logic ถูก bypass จะเกิด optional field checks กระจายทั่ว component tree
- Definition of done: product detail page อ่านผ่าน service layer, `normalizeProduct()` ยังเป็น entry point เดียว, และ not-found/error state ชัดเจน

#### Task: Add Editable Content API Flow

- เป้าหมาย: เตรียม frontend ให้เรียก `GET/PATCH /products/:id/editable-content` แทน localStorage-only flow เมื่อ backend พร้อม
- ไฟล์ที่น่าจะเกี่ยวข้อง: `src/hooks/useEditableContent.js`, `src/pages/ProductMockPage.jsx`, `src/services/products.js`, `src/utils/publishProduct.js`
- ความเสี่ยง: ถ้า merge ระหว่าง canonical product data กับ editable overrides ไม่ชัด อาจแสดง preview ไม่ตรงหรือ overwrite ข้อมูลหลัก
- Definition of done: มี seam สำหรับอ่าน/เขียน editable content จาก service layer, localStorage fallback ยังใช้ได้ใน dev mode, และ payload shape ตรงกับ contract

#### Task: Add Loading / Error / Cache Behavior

- เป้าหมาย: รองรับสภาพจริงเมื่ออ่านข้อมูลจาก backend เช่น loading spinner, retry, empty states, stale cache
- ไฟล์ที่น่าจะเกี่ยวข้อง: `src/pages/ShopStorePage.jsx`, `src/pages/ProductMockPage.jsx`, `src/App.jsx`, `src/styles/store-page.css`, `src/styles/product-mock.css`
- ความเสี่ยง: ถ้าไม่มี states เหล่านี้ เมื่อย้ายไป API จริง UX จะกระตุกและ debug ยาก
- Definition of done: storefront และ product page มี loading/error/empty states ที่ไม่ทำให้ layout พัง, และสามารถ refresh route ได้อย่างเสถียร

#### Task: Backend Handoff and Contract Validation

- เป้าหมาย: ทำให้ backend team ใช้ contract ใน roadmap ได้จริง และลดการตีความ field names / endpoint behavior ไม่ตรงกัน
- ไฟล์ที่น่าจะเกี่ยวข้อง: `docs/storefront-product-roadmap.md`, `src/utils/publishProduct.js`, `src/data/mockProducts.js`
- ความเสี่ยง: ถ้าไม่มี sample request/response หรือ validation checklist จะเกิด API shape drift ระหว่าง implement จริง
- Definition of done: มี handoff doc หรือ appendix เพิ่มเติม, มีตัวอย่าง request/response จริง, และ frontend/backend ยืนยัน field naming และ endpoint behavior ร่วมกัน

## Phase 1: เปลี่ยนเป็น mock multi-product SPA

เป้าหมาย: ทำให้ระบบรองรับหลายสินค้าใน frontend/mock layer ก่อน โดยยังไม่ต้องมี backend จริง

### Checklist

- [ ] สร้างไฟล์ collection เช่น `src/data/mockProducts.js`
- [ ] ย้ายข้อมูลจาก `mockProduct` เดิมไปเป็นหนึ่ง item ใน `mockProducts`
- [ ] เพิ่มสินค้า mock อื่นอย่างน้อย 3-5 ตัวที่มี `id`, `slug`, `name`, `images`, `variants`, `shop`, `specs`, `description`
- [ ] เพิ่ม helper สำหรับหา product by `id` / `slug`
- [ ] ปรับ `ShopStorePage.jsx` ให้ render การ์ดสินค้าจาก collection จริง แทนการ derive จากสินค้าเดียว
- [ ] ลดการใช้ข้อความ hardcoded ต่อสินค้าใน storefront sections ให้เป็น data-driven เท่าที่ทำได้
- [ ] คง `mockProduct` export ชั่วคราวได้ ถ้าจำเป็นต่อ backward compatibility ระยะสั้น แต่ต้องระบุว่า deprecated

### Definition of Done

- [ ] storefront render การ์ดหลายสินค้าได้จาก array เดียว
- [ ] สินค้าแต่ละใบมี `id` และ `slug`
- [ ] ไม่มีจุดสำคัญใน storefront ที่ต้องอาศัย `mockProduct` ตัวเดียวแบบ hard dependency

## Phase 2: แยก route แบบ dynamic

เป้าหมาย: ให้การคลิกสินค้าแต่ละใบไปยัง product page ของสินค้านั้นจริง

### Checklist

- [ ] ตัดสินใจว่าจะใช้ router library หรือ extend manual router ชั่วคราว
- [ ] เพิ่ม route format เช่น `/product/:slug`
- [ ] ปรับ `src/utils/appRoutes.js` ให้มี route builder เช่น `getProductRoute(slug)`
- [ ] ปรับ `ShopStorePage.jsx` ให้ลิงก์การ์ดไปยัง route ของสินค้านั้น
- [ ] ปรับ `App.jsx` ให้ parse path แบบ dynamic
- [ ] ปรับ `ProductMockPage.jsx` ให้รับ `slug` หรือ `productId` จาก router layer
- [ ] ถ้าหา slug ไม่เจอ ให้ render not-found / fallback ที่ชัดเจน

### Definition of Done

- [ ] คลิกสินค้าคนละใบแล้วได้ URL คนละเส้นทาง
- [ ] refresh หน้า product แล้วยังเข้าได้จาก URL นั้น
- [ ] product page render ข้อมูลตาม slug จริง ไม่ใช่สินค้าเดียวทุกกรณี

## Phase 3: ผูก editable content ต่อสินค้า

เป้าหมาย: ให้ content ที่แก้ไขได้แยกตามสินค้าอย่างแท้จริง และไม่ overwrite กัน

### Checklist

- [ ] ตรวจทุกจุดที่ใช้ `useEditableContent()` และ storage/export/import key
- [ ] บังคับให้ override key อิง `product.id` หรือ `product.slug`
- [ ] แยก editable scopes ให้ชัด เช่น product title, description, gallery, specs, variants, review overrides
- [ ] ออกแบบ payload export/import ให้มี `productId`, `slug`, `version`
- [ ] ป้องกันการ import payload ของสินค้าผิดตัวแล้วทับข้อมูลสินค้าอื่น
- [ ] เพิ่ม migration fallback สำหรับ payload เก่าที่อาจยังไม่มี slug

### Definition of Done

- [ ] แก้ content ของสินค้า A แล้วสินค้า B ไม่เปลี่ยนตาม
- [ ] export/import editable payload แยกตามสินค้าได้
- [ ] local storage keys ไม่มีการชนกันระหว่างสินค้า

## Phase 4: เตรียม data contract สำหรับ backend

เป้าหมาย: ทำให้ shape ของข้อมูลชัดพอที่จะเปลี่ยนจาก mock file เป็น API response ได้

### Checklist

- [ ] ระบุ required fields และ optional fields ของ product object
- [ ] ระบุ shape ของ `variants`, `shop`, `specs`, `description`, `ratingSummary`, `reviews`, `sameShopItems`
- [ ] ตัดสินใจเรื่อง field naming ให้คงที่ เช่น `compareAtPrice`, `shipFrom`, `avatarSrc`, `categoryPath`
- [ ] แยก raw API shape กับ normalized UI shape ให้ชัด
- [ ] ปรับ `normalizeProduct()` ให้รองรับ nulls / missing fields / legacy fields
- [ ] เตรียม sample API response JSON สำหรับ backend team
- [ ] ระบุ versioning strategy เบื้องต้นของ payload ถ้าจำเป็น

### Definition of Done

- [ ] มี documented data shape ที่ frontend และ backend เข้าใจตรงกัน
- [ ] `normalizeProduct()` ครอบ edge cases หลักได้
- [ ] component หลัก consume normalized data อย่างสม่ำเสมอ

## Phase 5: สลับจาก mock data เป็น API จริง

เป้าหมาย: เปลี่ยน data source โดยรักษา UI/component structure เดิมให้มากที่สุด

### Checklist

- [ ] สร้าง data access layer เช่น `src/services/products.js`
- [ ] เปลี่ยน storefront จาก import mock file เป็น fetch list API
- [ ] เปลี่ยน product page จาก import mock file เป็น fetch detail API ตาม slug
- [ ] เพิ่ม loading / error / empty states
- [ ] cache ข้อมูลตาม route ที่เหมาะสม
- [ ] ทำ fallback ให้ dev mode ยังใช้ mock data ได้ถ้า API ยังไม่พร้อม
- [ ] ตรวจความเข้ากันได้กับ editable overrides

### Definition of Done

- [ ] storefront ใช้ API list ได้
- [ ] product page ใช้ API detail ได้
- [ ] component เดิมยังใช้ต่อโดยไม่ต้อง rewrite หลัก
- [ ] mock mode และ API mode สลับได้ในระดับ data source

## รายการงานย่อยที่ควรทำตามลำดับ

- [ ] สร้าง `mockProducts` และย้าย `mockProduct` เดิมเข้า collection
- [ ] เพิ่ม `slug` ให้สินค้าทุกตัว
- [ ] สร้าง helper `getProductBySlug()` และ `getProductRoute()`
- [ ] ปรับ `ShopStorePage` ให้ render card จาก product array จริง
- [ ] ปรับ same-shop / recommendation sections ให้ใช้ product references จริง
- [ ] ปรับ `App.jsx` ให้รองรับ dynamic route
- [ ] ปรับ `ProductMockPage` ให้รับ product ตาม route
- [ ] ทบทวน editable keys ทั้งระบบให้ผูกกับ `product.id`
- [ ] แยก data access layer สำหรับ mock/API
- [ ] เขียน sample backend contract

## ข้อควรระวัง

- อย่า hardcode page ต่อสินค้าเป็นหลายไฟล์ เช่น `ProductA.jsx`, `ProductB.jsx`
- อย่าให้ component ย่อยผูกกับ field ของสินค้าตัวเดียวแบบกระจัดกระจาย
- อย่าให้ editable content ใช้ key เดียวทั้งระบบจนทับกันระหว่างสินค้า
- อย่าปล่อยให้ shape ของ product object แตกต่างกันแบบ ad hoc ต่อสินค้า
- อย่าให้ storefront มีข้อมูลซ้ำหลายแห่งโดยไม่มี source กลาง
- อย่าเอา business rules ของ data loading ไปฝังใน component presentational โดยตรง

## Proposed Data Shape

ตัวอย่าง shape ของสินค้า 1 ตัวใน collection:

```js
{
  id: "dr-morepen-deluxe-stethoscope",
  slug: "dr-morepen-professionals-deluxe-stethoscope",
  name: "Dr. Morepen Professionals Deluxe Stethoscope",
  status: "active",
  categoryPath: [
    "อุปกรณ์ทางการแพทย์",
    "วินิจฉัยเบื้องต้น",
    "หูฟังแพทย์"
  ],
  images: [
    "/generated-assets/dr-morepen-stethoscope/gallery-1.jpg",
    "/generated-assets/dr-morepen-stethoscope/gallery-2.jpg",
    "/generated-assets/dr-morepen-stethoscope/gallery-3.jpg"
  ],
  variants: [
    {
      id: "black-standard",
      slug: "black-standard",
      label: "สีดำ",
      price: 239,
      compareAtPrice: 279,
      stock: 42,
      active: true,
      sku: "STETH-BLK-STD"
    }
  ],
  shop: {
    id: "dr-morepen-medical-th",
    slug: "dr-morepen-medical-th",
    name: "Dr. Morepen Medical TH",
    avatarSrc: "/generated-assets/dr-morepen-medical-th/shop-avatar.jpg",
    joinedAt: "2021-04",
    responseTime: "ภายใน 1 ชั่วโมง",
    followers: "12.3K"
  },
  specs: {
    brand: "Dr. Morepen",
    shipFrom: "กรุงเทพมหานคร",
    material: "Stainless Steel + Silicone",
    length: "29 นิ้ว",
    headType: "Dual Head"
  },
  specRows: [
    { id: "material", label: "วัสดุ", value: "Stainless Steel + Silicone" },
    { id: "length", label: "ความยาว", value: "29 นิ้ว" },
    { id: "head-type", label: "ลักษณะหัวฟัง", value: "Dual Head" }
  ],
  description: {
    intro: "หูฟังแพทย์คุณภาพสูง ให้เสียงคมชัด แม่นยำ...",
    highlights: [
      "โครงสร้างแข็งแรง",
      "น้ำหนักเบา",
      "เหมาะกับคลินิกและโรงพยาบาล"
    ],
    inBox: [
      "ตัวหูฟังแพทย์",
      "ear tips สำรอง",
      "คู่มือการใช้งาน"
    ],
    notes: [
      "ภาพเป็นตัวอย่างสำหรับ mockup",
      "ควรตรวจสอบรุ่นและสีอีกครั้งก่อนสั่งซื้อ"
    ]
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
      { star: 1, count: 2 }
    ]
  },
  reviews: [
    {
      id: "rv-001",
      userName: "ผู้ใช้ A***8",
      rating: 5,
      date: "2026-03-01",
      variantLabel: "สีดำ",
      comment: "น้ำหนักดี ฟังเสียงชัด เหมาะกับใช้งานจริง",
      likes: 12,
      hasMedia: true
    }
  ],
  sameShopItems: [
    {
      id: "dr-morepen-bp-monitor",
      slug: "dr-morepen-blood-pressure-monitor",
      name: "เครื่องวัดความดัน Dr. Morepen",
      image: "/generated-assets/dr-morepen-bp/gallery-1.jpg",
      price: 799,
      compareAtPrice: 990,
      ratingLabel: "4.9",
      soldLabel: "ขายแล้ว 1.1K ชิ้น"
    }
  ]
}
```

## API / Data Contract Draft

เป้าหมายของ section นี้คือกำหนด contract ล่วงหน้าให้ frontend และ backend อ้างอิงร่วมกันได้ โดย shape ของ response ควรใกล้กับ `src/data/mockProducts.js` และสิ่งที่ `normalizeProduct()` รองรับอยู่ตอนนี้ให้มากที่สุด

### Endpoint Inventory

| Method | Path | Purpose | Notes |
| --- | --- | --- | --- |
| `GET` | `/products` | ดึงรายการสินค้าสำหรับ storefront / product listing | รองรับ pagination, sort, filter, `shopId`, `category`, `search` |
| `GET` | `/products/:slug` | ดึงรายละเอียดสินค้ารายตัวสำหรับ product page | ใช้ slug เป็น public route key |
| `GET` | `/shops/:shopId/products` | ดึงสินค้าของร้านเดียวกัน | ใช้กับ storefront sections และ same-shop carousel |
| `PATCH` | `/products/:id` | อัปเดต canonical product fields | สำหรับชื่อจริงสินค้า, ราคา, variants, specs, status |
| `GET` | `/products/:id/editable-content` | ดึง editable overrides ของสินค้ารายตัว | ใช้ใน admin/edit mode หรือ preview mode |
| `PATCH` | `/products/:id/editable-content` | บันทึก editable overrides ของสินค้ารายตัว | เก็บเฉพาะ fields ที่ frontend edit ได้ |

### Recommended Query Parameters

- `GET /products`
  - `page`, `limit`
  - `shopId`
  - `category`
  - `sort=popular|latest|best-selling|price-asc|price-desc`
  - `search`
  - `status=active|draft|archived`
- `GET /shops/:shopId/products`
  - `page`, `limit`
  - `sort`
  - `category`
  - `excludeProductId` สำหรับ same-shop section

### Product List Response

list endpoint ไม่จำเป็นต้องคืนทุก field แบบ product detail แต่ควรคืนพอให้ storefront render card ได้โดยไม่ต้อง derive เกินจำเป็น

```json
{
  "items": [
    {
      "id": "dr-morepen-professionals-deluxe-stethoscope",
      "slug": "dr-morepen-professionals-deluxe-stethoscope",
      "name": "หูฟังทางการแพทย์ Dr. Morepen Professionals Deluxe Stethoscope",
      "primaryImage": "/generated-assets/dr-morepen-glucoone-bg03/store-overview-feature-8.jpg",
      "priceRange": {
        "min": 239,
        "max": 249,
        "compareAtMax": 289
      },
      "ratingSummary": {
        "score": 4.8,
        "totalRatings": 320
      },
      "soldCount": 320,
      "badges": [
        "สินค้าขายดี"
      ],
      "shop": {
        "id": "dr-morepen-medical-th",
        "slug": "dr-morepen-medical-th",
        "name": "Dr. Morepen Medical TH"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 24,
    "totalItems": 120,
    "totalPages": 5
  }
}
```

### Product Detail Response

detail endpoint ควรคืน shape ที่ใกล้ `mockProducts` มากที่สุด เพื่อให้ frontend ส่งเข้า `normalizeProduct()` ได้เกือบตรง ๆ

```json
{
  "id": "dr-morepen-professionals-deluxe-stethoscope",
  "slug": "dr-morepen-professionals-deluxe-stethoscope",
  "name": "หูฟังทางการแพทย์ Dr. Morepen Professionals Deluxe Stethoscope",
  "status": "active",
  "categoryPath": [
    "อุปกรณ์ทางการแพทย์",
    "วินิจฉัยเบื้องต้น",
    "หูฟังแพทย์"
  ],
  "images": [
    "/generated-assets/dr-morepen-glucoone-bg03/store-overview-feature-8.jpg"
  ],
  "variants": [
    {
      "id": "stethoscope-black",
      "label": "สีดำ",
      "price": 239,
      "compareAtPrice": 279,
      "stock": 45,
      "active": true,
      "sku": "STETH-BLK"
    }
  ],
  "shop": {
    "id": "dr-morepen-medical-th",
    "slug": "dr-morepen-medical-th",
    "name": "Dr. Morepen Medical TH",
    "avatarSrc": "/generated-assets/dr-morepen-glucoone-bg03/shop-avatar.jpg",
    "onlineStatus": "ออนไลน์ล่าสุดเมื่อ 5 นาทีที่แล้ว",
    "score": 4.8,
    "responseRate": "97%",
    "joinedAt": "2021-04",
    "productCount": 248,
    "responseTime": "ภายใน 1 ชั่วโมง",
    "followers": "12.3K"
  },
  "specs": {
    "brand": "Dr. Morepen",
    "material": "Stainless Steel + Silicone",
    "length": "29 นิ้ว",
    "headType": "Dual Head",
    "shipFrom": "กรุงเทพมหานคร"
  },
  "specRows": [
    {
      "id": "material",
      "label": "วัสดุ",
      "value": "Stainless Steel + Silicone"
    }
  ],
  "description": {
    "intro": "หูฟังแพทย์คุณภาพสูง...",
    "highlights": [
      "ตัวหัวฟังแบบ Dual Head",
      "น้ำหนักเบา"
    ],
    "inBox": [
      "ตัวหูฟังแพทย์"
    ],
    "notes": [
      "ควรตรวจสอบสีและรุ่นอีกครั้งก่อนสั่งซื้อ"
    ]
  },
  "descriptionHtml": "",
  "ratingSummary": {
    "score": 4.8,
    "totalRatings": 320,
    "totalReviews": 96,
    "breakdown": [
      { "star": 5, "count": 270 },
      { "star": 4, "count": 34 }
    ]
  },
  "reviews": [
    {
      "id": "rv-steth-001",
      "userName": "Dr. P***n",
      "rating": 5,
      "date": "2026-03-03",
      "variantLabel": "สีดำ",
      "comment": "ฟังเสียงชัด น้ำหนักกำลังดี",
      "likes": 11,
      "hasMedia": false
    }
  ],
  "sameShopItems": [
    {
      "id": "sinocare-sterile-lancets-100",
      "slug": "sinocare-sterile-lancets-100",
      "name": "Sinocare Sterile Lancets เข็มเจาะเลือดปลายนิ้ว 100 ชิ้น",
      "image": "/generated-assets/dr-morepen-glucoone-bg03/store-top-sales-product-5.jpg",
      "price": 54,
      "originalPrice": 79,
      "rating": 4.9,
      "sold": 612
    }
  ]
}
```

### Required Product Fields

- `id`
- `slug`
- `name`
- `images`
- `variants`
- `shop`
- `specs` หรือ `specRows`
- `description`

### Optional But Strongly Recommended Fields

- `status`
- `internalNotice`
- `categoryPath`
- `favoriteCount`
- `soldCount`
- `descriptionHtml`
- `trustIndicators`
- `promoHighlights`
- `ratingSummary`
- `reviews`
- `sameShopItems`

### Editable Content Contract

editable content ควรเก็บแยกจาก canonical product record เพื่อให้:

- track audit ได้ง่าย
- rollback ได้
- publish draft ได้ในอนาคต
- ไม่ทำให้ schema ของ `products` table ปนกับ per-page rich content มากเกินไป

proposed payload:

```json
{
  "productId": "dr-morepen-professionals-deluxe-stethoscope",
  "productSlug": "dr-morepen-professionals-deluxe-stethoscope",
  "storageKey": "pm_editable_content_v2:dr-morepen-professionals-deluxe-stethoscope",
  "version": "v1",
  "editableContent": {
    "productTitle": "หูฟังทางการแพทย์ Dr. Morepen Professionals Deluxe Stethoscope",
    "productGalleryOverrides": {
      "0": "/generated-assets/dr-morepen-glucoone-bg03/gallery-override-1.jpg"
    },
    "productVariantsOverrides": {
      "mode": "full-list-v1",
      "rows": [
        {
          "id": "stethoscope-black",
          "label": "สีดำ",
          "price": 239,
          "compareAtPrice": 279,
          "stock": 45,
          "active": true,
          "sku": "STETH-BLK"
        }
      ]
    },
    "shopName": "Dr. Morepen Medical TH",
    "shopAvatarOverride": "/generated-assets/dr-morepen-glucoone-bg03/shop-avatar-override.jpg",
    "productDescriptionHtml": "<p>...</p>",
    "productSpecsOverrides": {
      "material": {
        "label": "วัสดุ",
        "value": "Stainless Steel + Silicone"
      }
    }
  },
  "updatedAt": "2026-03-19T08:30:00.000Z",
  "updatedBy": {
    "id": "admin-user-1",
    "name": "Content Admin"
  }
}
```

editable fields ที่ควรเก็บแยก:

- `productTitle`
- `productGalleryOverrides`
- `productVariantsOverrides`
- `shopName`
- `shopAvatarOverride`
- `productDescriptionHtml`
- `productSpecsOverrides`

### Response and Persistence Rules

- public storefront/product page ควรอ่านข้อมูลที่ publish แล้วเป็นหลัก
- admin mode อาจอ่าน `editable-content` แยกแล้ว merge ฝั่ง client หรือให้ backend ส่ง merged preview ก็ได้
- `PATCH /products/:id` ใช้กับ canonical fields
- `PATCH /products/:id/editable-content` ใช้กับ override fields เท่านั้น
- `productSlug` ต้อง unique และ stable พอสำหรับใช้เป็น public URL
- `productId` เป็น internal primary key ที่ใช้กับ write operations และ editable storage

### normalizeProduct() Role When API Arrives

`normalizeProduct()` ไม่ควรถูกลบเมื่อเริ่มใช้ backend จริง แต่ควรมีบทบาทดังนี้:

- แปลง raw API response ให้เป็น UI shape เดียวกับที่ component ใช้อยู่
- เติม default values เมื่อ field บางตัวหายหรือเป็น `null`
- รองรับ legacy payload ชั่วคราวระหว่าง backend rollout
- ช่วย merge canonical product data + editable overrides ให้ได้ object เดียวก่อน render
- เป็นจุดเดียวที่จัดการ compatibility เพื่อลด conditional logic ใน component ย่อย

rule of thumb:

- service layer รับผิดชอบ fetch
- `normalizeProduct()` รับผิดชอบ transform raw response -> UI shape
- component รับผิดชอบ render normalized data เท่านั้น

### Frontend Migration Notes

เมื่อเริ่มเชื่อม backend จริง ฝั่ง frontend ควรเปลี่ยนตามลำดับนี้:

- เพิ่ม data access layer เช่น `src/services/products.js`
- ย้าย `getAllMockProducts()` ไปอยู่หลัง interface เดียวกับ `fetchProducts()`
- ย้าย `getProductBySlug()` ไปอยู่หลัง interface เดียวกับ `fetchProductBySlug()`
- ให้ `ShopStorePage.jsx` อ่าน product list จาก service layer แทน import mock data ตรง
- ให้ `ProductMockPage.jsx` อ่าน product detail ตาม `slug`
- ให้ edit mode เรียก `GET/PATCH /products/:id/editable-content`
- คง mock mode ไว้เป็น fallback ระหว่างพัฒนา โดยสลับที่ data layer ไม่ใช่ใน component

### Suggested Service Layer Interface

```js
export async function fetchProducts(params = {}) {}
export async function fetchProductBySlug(slug) {}
export async function fetchShopProducts(shopId, params = {}) {}
export async function fetchProductEditableContent(productId) {}
export async function patchProduct(productId, payload) {}
export async function patchProductEditableContent(productId, payload) {}
```

## Migration Strategy

วันนี้:

- ใช้ `mockProducts` เป็น source หลักใน frontend
- route ฝั่ง product เป็น `/product/:slug` บน manual SPA router
- editable content แยก key ต่อสินค้าใน localStorage แล้ว
- ยังไม่มี API, backend, database จริง

พรุ่งนี้:

- เปลี่ยนจาก mock data lookup เป็น service layer ที่เรียก API
- `normalizeProduct()` ยังอยู่และเป็น entry point ก่อน render
- component เดิมยังใช้ต่อได้ เพราะ consume normalized shape เดียวกัน

ระยะ backend:

- เปลี่ยน data source จาก `import mockProducts` เป็น `fetchProducts()` / `fetchProductBySlug()`
- แยก writable API ของ canonical product กับ editable content ออกจากกัน
- คง `normalizeProduct()` ไว้รองรับ API ที่ยังไม่สะอาดหรือยังเปลี่ยน shape ระหว่างช่วง rollout
- รักษา component boundary เดิมไว้เพื่อลด blast radius ของการย้ายระบบ

## Definition of Done สรุปรวม

- [ ] storefront render สินค้าได้หลายตัวจาก source กลาง
- [ ] การ์ดสินค้าแต่ละใบพาไป URL ของสินค้านั้น
- [ ] product page โหลดตาม `slug`
- [ ] `normalizeProduct()` เป็นจุดเดียวที่ normalize data ก่อนเข้า UI
- [ ] editable content แยกตาม `product.id` หรือ `slug`
- [ ] mock mode กับ API mode ใช้ component ชุดเดียวกันได้

## Next Codex Prompts

1. `สร้าง src/services/products.js ให้มี fetchProducts(), fetchProductBySlug(), fetchShopProducts() และมี mock adapter ชั่วคราว`
2. `ย้าย ShopStorePage ให้เรียกข้อมูลผ่าน service layer แทน import mock data ตรง`
3. `ย้าย ProductMockPage ให้เรียกข้อมูลผ่าน service layer แล้วส่งผลลัพธ์เข้า normalizeProduct()`
4. `เพิ่ม service สำหรับ GET/PATCH /products/:id/editable-content และผูกกับ edit mode`
5. `เพิ่ม loading / error / empty states สำหรับ storefront และ product detail`
6. `อัปเดต scripts/publish-product.mjs ให้รู้จัก productId/productSlug จาก export payload แบบ multi-product`
7. `เพิ่ม config หรือ env flag สำหรับสลับ mock mode กับ API mode ที่ data layer`
8. `ทำ backend handoff doc เพิ่มเติมจาก API / Data Contract Draft พร้อม sample request/response จริง`

## Notes for Future Agents

- ถ้าจะ refactor ใหญ่ ให้ preserve normalized product shape ก่อน preserve component internals
- ถ้าจะเปลี่ยน router library ให้แยก task นั้นออกจาก data-shape migration
- ถ้าจะเริ่ม backend integration ให้เริ่มจาก read-only product list + product detail ก่อน editable content
