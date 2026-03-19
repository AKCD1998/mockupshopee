import { fireEvent, screen, within } from "../../test/test-utils";
import { renderProductMockPage } from "../../test/test-utils";

describe("ProductMockPage", () => {
  it("renders the core product page sections without crashing", () => {
    const { product } = renderProductMockPage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: product.name,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: `${product.name} รูปหลัก`,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "ข้อมูลร้านค้า" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "รายละเอียดสินค้า" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "คำอธิบายสินค้า" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "คะแนนและรีวิวสินค้า" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "สินค้าจากร้านเดียวกัน" })).toBeInTheDocument();
  });

  it("uses default product content when no editable overrides are present", () => {
    const { product } = renderProductMockPage();
    const specsRegion = screen.getByRole("region", { name: "รายละเอียดสินค้า" });
    const descriptionRegion = screen.getByRole("region", { name: "คำอธิบายสินค้า" });

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: product.name,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: `${product.name} รูปหลัก`,
      })
    ).toHaveAttribute("src", product.images[0]);
    expect(within(specsRegion).getByText(product.specs.brand)).toBeInTheDocument();
    expect(
      within(descriptionRegion).getByText(product.description.intro.split("\n")[0], {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("renders the split meter-only product route with only the standalone meter variant", () => {
    const { product } = renderProductMockPage({
      slug: "dr-morepen-glucoone-bg03-meter-only",
    });
    const infoPanel = screen.getByRole("region", { name: "ข้อมูลสินค้า" });

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "DR.MOREPEN GLUCOONE BG-03 เครื่องวัดน้ำตาลอย่างเดียว",
      })
    ).toBeInTheDocument();
    expect(
      within(infoPanel).getByRole("button", {
        name: "เครื่องวัดน้ำตาลอย่างเดียว",
      })
    ).toBeInTheDocument();
    expect(
      within(infoPanel).queryByRole("button", {
        name: "เครื่อง + แถบตรวจ 25 ชิ้น",
      })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: `${product.name} รูปหลัก` })).toHaveAttribute(
      "src",
      product.images[0]
    );
  });

  it("renders the split bundle product route with its own bundle variants", () => {
    renderProductMockPage({
      slug: "dr-morepen-glucoone-bg03-meter-strip-kit",
    });
    const infoPanel = screen.getByRole("region", { name: "ข้อมูลสินค้า" });

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "DR.MOREPEN GLUCOONE BG-03 เครื่อง + แถบตรวจ 25-50 ชิ้น",
      })
    ).toBeInTheDocument();
    expect(
      within(infoPanel).getByRole("button", {
        name: "เครื่อง + แถบตรวจ 25 ชิ้น",
      })
    ).toBeInTheDocument();
    expect(
      within(infoPanel).getByRole("button", {
        name: "เครื่อง + แถบตรวจ 50 ชิ้น",
      })
    ).toBeInTheDocument();
    expect(
      within(infoPanel).queryByRole("button", {
        name: "เครื่องวัดน้ำตาลอย่างเดียว",
      })
    ).not.toBeInTheDocument();
  });

  it("updates selected variant information when the user changes variant", async () => {
    const { user, product } = renderProductMockPage();
    const infoPanel = screen.getByRole("region", { name: "ข้อมูลสินค้า" });
    const targetVariant = product.variants.find((variant) => variant.id === "meter-strip-25");

    await user.click(
      within(infoPanel).getByRole("button", {
        name: targetVariant.label,
      })
    );

    expect(
      within(infoPanel).getByRole("button", {
        name: targetVariant.label,
      })
    ).toHaveAttribute("aria-pressed", "true");
    expect(within(infoPanel).getByText("฿359")).toBeInTheDocument();
    expect(within(infoPanel).getByText("฿1,390")).toBeInTheDocument();
    expect(within(infoPanel).getByText("มีสินค้าทั้งหมด 24 ชิ้น")).toBeInTheDocument();
  });

  it("does not allow selecting inactive variants", async () => {
    const { user, product } = renderProductMockPage({
      editableContent: {
        productVariantsOverrides: {
          "meter-strip-25": {
            active: false,
          },
        },
      },
    });
    const infoPanel = screen.getByRole("region", { name: "ข้อมูลสินค้า" });
    const disabledVariant = product.variants.find((variant) => variant.id === "meter-strip-25");
    const disabledButton = within(infoPanel).getByRole("button", {
      name: disabledVariant.label,
    });

    expect(disabledButton).toBeDisabled();

    await user.click(disabledButton);

    expect(disabledButton).toHaveAttribute("aria-pressed", "false");
    expect(within(infoPanel).getByText("ยังไม่ได้เลือกตัวเลือกสินค้า")).toBeInTheDocument();
  });

  it("clamps quantity between 1 and the selected variant stock", async () => {
    const { user } = renderProductMockPage();
    const infoPanel = screen.getByRole("region", { name: "ข้อมูลสินค้า" });

    await user.click(
      within(infoPanel).getByRole("button", {
        name: "เครื่อง + แถบตรวจ 25 ชิ้น",
      })
    );

    const quantityInput = within(infoPanel).getByRole("spinbutton", {
      name: "จำนวนสินค้า",
    });
    const increaseButton = within(infoPanel).getByRole("button", {
      name: "เพิ่มจำนวนสินค้า",
    });
    const decreaseButton = within(infoPanel).getByRole("button", {
      name: "ลดจำนวนสินค้า",
    });

    expect(quantityInput).toHaveValue(1);

    await user.click(increaseButton);
    await user.click(increaseButton);
    expect(quantityInput).toHaveValue(3);

    await user.click(decreaseButton);
    expect(quantityInput).toHaveValue(2);

    fireEvent.change(quantityInput, { target: { value: "0" } });
    expect(quantityInput).toHaveValue(1);

    fireEvent.change(quantityInput, { target: { value: "999" } });
    expect(quantityInput).toHaveValue(24);
  });

  it("shows the mock toast for add to cart and buy now actions", async () => {
    const { user } = renderProductMockPage();
    const infoPanel = screen.getByRole("region", { name: "ข้อมูลสินค้า" });

    await user.click(
      within(infoPanel).getByRole("button", {
        name: "เครื่องวัดน้ำตาลอย่างเดียว",
      })
    );

    await user.click(
      within(infoPanel).getByRole("button", {
        name: "เพิ่มไปยังรถเข็น",
      })
    );

    expect(
      await screen.findByText("นี่คือ mockup page ยังไม่มี backend จริง")
    ).toBeInTheDocument();

    await user.click(
      within(infoPanel).getByRole("button", {
        name: "ซื้อสินค้า",
      })
    );

    expect(screen.getByText("นี่คือ mockup page ยังไม่มี backend จริง")).toBeInTheDocument();
  });

  it("filters the visible reviews when the review filter changes", async () => {
    const { user, product } = renderProductMockPage();
    const fourStarReview = product.reviews.find((review) => review.rating === 4);
    const fiveStarReview = product.reviews.find((review) => review.rating === 5);
    const reviewsRegion = screen.getByRole("region", { name: "รีวิวลูกค้า" });

    await user.click(screen.getByRole("button", { name: "4 ดาว" }));

    expect(within(reviewsRegion).getByText(`รีวิวจากผู้ซื้อ (1)`)).toBeInTheDocument();
    expect(within(reviewsRegion).getByText(fourStarReview.comment)).toBeInTheDocument();
    expect(within(reviewsRegion).queryByText(fiveStarReview.comment)).not.toBeInTheDocument();
  });

  it("renders product title and description overrides from localStorage", () => {
    const overrideTitle = "ชื่อสินค้าสำหรับทดสอบ override";
    const overrideDescription = "<p>คำอธิบาย override สำหรับทดสอบ</p>";

    renderProductMockPage({
      editableContent: {
        productTitle: overrideTitle,
        productDescriptionHtml: overrideDescription,
      },
    });

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: overrideTitle,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: `${overrideTitle} รูปหลัก` })).toBeInTheDocument();
    expect(screen.getByText("คำอธิบาย override สำหรับทดสอบ")).toBeInTheDocument();
  });

  it("renders gallery overrides from localStorage", () => {
    const overrideImage = "https://example.com/override-gallery-image.jpg";
    const { product } = renderProductMockPage({
      editableContent: {
        productGalleryOverrides: {
          0: overrideImage,
        },
      },
    });

    expect(
      screen.getByRole("img", {
        name: `${product.name} รูปหลัก`,
      })
    ).toHaveAttribute("src", overrideImage);
  });

  it("renders product specs overrides from localStorage", () => {
    renderProductMockPage({
      editableContent: {
        productSpecsOverrides: {
          brand: {
            label: "แบรนด์สินค้า",
            value: "Brand Override Test",
          },
        },
      },
    });
    const specsRegion = screen.getByRole("region", { name: "รายละเอียดสินค้า" });

    expect(within(specsRegion).getByText("แบรนด์สินค้า")).toBeInTheDocument();
    expect(within(specsRegion).getByText("Brand Override Test")).toBeInTheDocument();
  });
});
