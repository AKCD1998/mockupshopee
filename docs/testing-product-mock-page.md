# Testing Product / Storefront Module

เอกสารนี้อธิบาย test foundation และ test modules ที่เพิ่มเข้ามาสำหรับหน้า `ProductMockPage` และ `ShopStorePage` ของโปรเจคนี้ โดยตั้งใจให้เหมาะกับสถานะปัจจุบันที่ยังเป็น mock/frontend-first และยังไม่มี backend จริง

## จุดประสงค์ของ Testing Module นี้

- จับ regression ของหน้า product และ storefront ได้เร็วขึ้น
- ตรวจ behavior สำคัญของหน้าโดยไม่ต้องพึ่ง backend
- ทำให้ refactor จาก single mock ไป multi-product, dynamic route และ API mode ในอนาคตปลอดภัยขึ้น
- ใช้ test เป็น living documentation สำหรับ editable content, variant flow และ product route behavior

## Test Stack ที่ใช้

- `Vitest`
- `React Testing Library`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jsdom`

เหตุผลที่เลือก:

- โปรเจคนี้ใช้ `Vite` อยู่แล้ว จึงใช้ `Vitest` ได้ตรง stack และ config เบา
- หน้า product/storefront เป็น React UI-driven flow จึงเหมาะกับ user-centric tests ของ React Testing Library
- ยังไม่จำเป็นต้องลง e2e framework หนักในระยะนี้

## ไฟล์ที่เกี่ยวข้อง

config และ setup:

- `package.json`
- `vite.config.js`
- `src/test/setupTests.js`
- `src/test/test-utils.jsx`

test suites:

- `src/pages/__tests__/ProductMockPage.test.jsx`
- `src/pages/__tests__/ShopStorePage.test.jsx`

production files ที่ถูกแตะเล็กน้อยเพื่อให้ testability ดีขึ้น:

- `src/components/ProductInfoPanel.jsx`

## วิธีรัน Test

รัน test ทั้งหมด:

```bash
npm run test
```

รันแบบ watch:

```bash
npm run test:watch
```

## วิธีรัน Test เฉพาะไฟล์

รันเฉพาะ `ProductMockPage`:

```bash
npm run test -- src/pages/__tests__/ProductMockPage.test.jsx
```

รันเฉพาะ `ShopStorePage`:

```bash
npm run test -- src/pages/__tests__/ShopStorePage.test.jsx
```

รันด้วยชื่อ test บางส่วน:

```bash
npm run test -- -t "ProductMockPage"
```

## วิธีดูว่าทดสอบอะไรบ้าง

test ปัจจุบันเน้น integration/component behavior ที่ user มองเห็นจริง:

- หน้า product render ได้ครบ section หลัก
- title, gallery, shop info, specs, description, reviews, same-shop carousel แสดงผล
- variant selection เปลี่ยนข้อมูลที่หน้าเห็น
- inactive variant ถูก disable
- quantity controls clamp ค่าได้ถูกต้อง
- add to cart / buy now โชว์ mock toast
- review filter ทำงาน
- editable overrides จาก localStorage สะท้อนใน title / description / gallery / specs
- storefront cards ลิงก์ไป product route ตาม slug ของสินค้าจริง

ถ้าต้องการดูรายละเอียด ให้เปิดไฟล์ใน `src/pages/__tests__/`

## โครงสร้าง Test ปัจจุบัน

`src/test/setupTests.js`

- โหลด `jest-dom`
- cleanup หลังแต่ละ test
- clear `localStorage`
- polyfill browser APIs ที่ jsdom ไม่มีครบ เช่น `scrollTo`, `scrollBy`, `URL.createObjectURL`

`src/test/test-utils.jsx`

- export `render`, `screen`, `within` และ utilities ของ RTL
- helper `renderProductMockPage()`
- helper `renderShopStorePage()`
- helper `seedEditableContent()`
- helper `getMockProduct()`

`src/pages/__tests__/ProductMockPage.test.jsx`

- suite หลักสำหรับ regression ของหน้าสินค้า

`src/pages/__tests__/ShopStorePage.test.jsx`

- smoke/integration suite สำหรับ storefront card linking

## ข้อควรระวังเวลาแก้ UI/Component แล้ว Test พัง

- ถ้าเปลี่ยนข้อความปุ่ม/heading/aria-label อาจทำให้ query แบบ role + name พัง
- ถ้าเปลี่ยน behavior ของ variant หรือ quantity ให้แก้ test ให้สะท้อน behavior ใหม่ ไม่ใช่แค่เปลี่ยน selector
- ถ้าเปลี่ยน localStorage key ของ editable content ให้แก้ helper ใน `src/test/test-utils.jsx` ด้วย
- ถ้าเปลี่ยน route format ของสินค้า ให้แก้ assertions ที่อิง `getProductRoute()`
- ถ้าจะ refactor component tree ของหน้า product พยายามรักษา semantic roles และ `aria-label` ไว้ก่อน เพื่อไม่ให้ test เปราะโดยไม่จำเป็น

## วิธีเพิ่ม Test Case ใหม่

แนวทางที่แนะนำ:

1. เริ่มจาก user-visible behavior ก่อน
2. ใช้ `getByRole`, `findByRole`, `within` เป็นหลัก
3. ใช้ `localStorage` seed ผ่าน helper ถ้าต้องทดสอบ editable overrides
4. ใช้ product จริงจาก mock collection แทนสร้าง object จำลองใหม่ ถ้าไม่จำเป็น
5. สร้าง helper เพิ่มเฉพาะเมื่อ logic ถูกใช้ซ้ำจริงหลาย test

ตัวอย่าง pattern:

```jsx
const { user, product } = renderProductMockPage({
  editableContent: {
    productTitle: "ชื่อ override",
  },
});

await user.click(screen.getByRole("button", { name: product.variants[0].label }));
expect(screen.getByRole("heading", { level: 1, name: "ชื่อ override" })).toBeInTheDocument();
```

## แนวทางเมื่ออนาคตเปลี่ยนจาก Mock Data ไปเป็น Backend/API

เมื่อเริ่มมี service layer หรือ API จริง:

- อย่าย้าย test ทั้งหมดไป mock fetch ทันที
- เก็บ integration tests ระดับ page ไว้ แต่ย้าย source ของ data ผ่าน service layer
- ให้ `renderProductMockPage()` และ `renderShopStorePage()` รองรับ dependency injection หรือ mocking ของ service layer ในจุดเดียว
- รักษา assertion ที่อิง user-visible output ไว้ และลด assertion ที่ผูกกับ implementation detail
- `normalizeProduct()` ควรถูกทดสอบแยกเพิ่มเมื่อเริ่มมี API จริง เพื่อกัน shape drift จาก backend

ลำดับที่ควรทำภายหลัง:

1. เพิ่ม service layer tests
2. เพิ่ม API error/loading state tests
3. เพิ่ม tests สำหรับ not-found route และ per-product editable content fetch
4. ค่อยพิจารณา e2e ถ้าระบบเริ่มมี routing และ data flow ซับซ้อนขึ้น

## Known Limitations

- ตอนนี้ tests ยังเน้น mock/localStorage flow ยังไม่ได้ครอบ fetch/network layer
- ยังไม่มี tests สำหรับ admin edit modal/editor flows แบบเต็ม
- ยังไม่ได้ครอบ `scripts/publish-product.mjs`
- ยังไม่มี snapshot tests และไม่มี visual regression tests
- storefront tests ตอนนี้เน้น product-card linking ยังไม่ได้ครอบทุก section marketing block

## Checklist เวลาเพิ่มสินค้า / Variant / Editable Content ใหม่

- เพิ่ม `id` และ `slug` ให้สินค้าทุกตัว
- ตรวจว่าการ์ด storefront ลิงก์ด้วย `getProductRoute(slug)` ได้
- ถ้าเพิ่ม variant behavior ใหม่ ให้เพิ่มอย่างน้อย 1 test สำหรับ active/inactive/stock rule
- ถ้าเพิ่ม editable field ใหม่ ให้:
  - เพิ่ม field ใน storage/export contract
  - เพิ่ม helper seed สำหรับ field นั้นถ้าจำเป็น
  - เพิ่มอย่างน้อย 1 render test ว่า override สะท้อนใน UI
- ถ้าเปลี่ยน route หรือ data contract ให้ update docs และ test utilities พร้อมกัน

## หมายเหตุด้านแนวคิด

test ชุดนี้ตั้งใจเป็น `minimal-but-scalable`

- minimal: ไม่ลง e2e framework, ไม่สร้าง provider abstraction เกินจำเป็น
- scalable: มี setup file, test utilities กลาง, และ query แบบ user-centric ที่ขยายต่อไปสู่ multi-product / dynamic route / API mode ได้

ถ้าต้องเลือกว่าจะเพิ่ม test ตรงไหนก่อน ให้เริ่มจาก:

1. user-visible regression ที่ critical
2. route/data binding
3. editable content persistence
4. loading/error states หลังเริ่มเชื่อม backend
