import { screen, seedEditableContent, within } from "../../test/test-utils";
import { renderShopStorePage } from "../../test/test-utils";
import { getAllMockProducts } from "../../data/mockProduct";
import { getProductRoute } from "../../utils/appRoutes";

describe("ShopStorePage", () => {
  it("renders storefront product cards with product-specific routes instead of root links", () => {
    renderShopStorePage();

    const recommendCardLinks = screen.getAllByRole("link", {
      name: /เปิดหน้าสินค้า /,
    });

    expect(recommendCardLinks.length).toBeGreaterThan(0);
    recommendCardLinks.forEach((link) => {
      expect(link).toHaveAttribute("href");
      expect(link.getAttribute("href")).toMatch(/^#\/product\//);
      expect(link).not.toHaveAttribute("href", "#/");
    });
  });

  it("maps storefront recommendation cards to the slug of their own product", () => {
    const mockProducts = getAllMockProducts();
    const expectedProduct = mockProducts[1];

    renderShopStorePage();

    expect(
      screen.getAllByRole("link", {
        name: `เปิดหน้าสินค้า ${expectedProduct.name}`,
      })[0]
    ).toHaveAttribute("href", getProductRoute(expectedProduct.slug));
  });

  it("reflects editable product overrides in storefront cards for the same product", () => {
    const targetProduct = getAllMockProducts().find(
      (product) => product.slug === "dr-morepen-glucoone-bg03-meter-only"
    );
    const overrideTitle = "ชื่อสินค้าหน้าร้านที่แก้จาก product page";
    const overrideImage = "https://example.com/storefront-sync-image.jpg";

    expect(targetProduct).toBeDefined();

    seedEditableContent(targetProduct, {
      productTitle: overrideTitle,
      productGalleryOverrides: {
        0: overrideImage,
      },
      productVariantsOverrides: {
        mode: "full-list-v1",
        rows: [
          {
            id: "meter-only",
            label: "รุ่นแก้ไขสำหรับ storefront",
            price: 999,
            compareAtPrice: 1299,
            stock: 50,
            active: true,
            sku: "BG03-MTR",
          },
        ],
      },
    });

    renderShopStorePage();

    const syncedCard = screen.getAllByRole("link", {
      name: `เปิดหน้าสินค้า ${overrideTitle}`,
    })[0];

    expect(syncedCard).toHaveAttribute("href", getProductRoute(targetProduct.slug));
    expect(within(syncedCard).getByRole("img", { name: overrideTitle })).toHaveAttribute(
      "src",
      overrideImage
    );
    expect(within(syncedCard).getByText("฿999")).toBeInTheDocument();
  });

  it("renders separate shop listing cards for the meter-only and strip bundle variants", () => {
    renderShopStorePage();

    const shopListingSection = screen.getByLabelText("สินค้าทั้งหมดในร้าน");
    const shopListingGrid = shopListingSection.querySelector(".store-shop-products__grid");

    expect(shopListingGrid).toBeTruthy();

    const meterCard = within(shopListingGrid).getByRole("link", {
      name: /DR\.MOREPEN GLUCOONE BG-03 เครื่องวัดน้ำตาลอย่างเดียว/i,
    });
    const stripBundleCard = within(shopListingGrid).getByRole("link", {
      name: /DR\.MOREPEN GLUCOONE BG-03 เครื่อง \+ แถบตรวจ 25-50 ชิ้น/i,
    });
    const meterImage = within(meterCard).getByRole("img", {
      name: /DR\.MOREPEN GLUCOONE BG-03 เครื่องวัดน้ำตาลอย่างเดียว/i,
    });
    const stripBundleImage = within(stripBundleCard).getByRole("img", {
      name: /DR\.MOREPEN GLUCOONE BG-03 เครื่อง \+ แถบตรวจ 25-50 ชิ้น/i,
    });

    expect(meterImage).toHaveAttribute("src");
    expect(stripBundleImage).toHaveAttribute("src");
    expect(meterImage.getAttribute("src")).not.toBe(stripBundleImage.getAttribute("src"));
    expect(meterCard).toHaveAttribute("href", getProductRoute("dr-morepen-glucoone-bg03-meter-only"));
    expect(stripBundleCard).toHaveAttribute(
      "href",
      getProductRoute("dr-morepen-glucoone-bg03-meter-strip-kit")
    );
    expect(within(meterCard).getByText("฿159")).toBeInTheDocument();
    expect(within(meterCard).getByText("฿1,090")).toBeInTheDocument();
    expect(within(stripBundleCard).getByText("฿359")).toBeInTheDocument();
    expect(within(stripBundleCard).getByText("฿1,390")).toBeInTheDocument();
  });

  it("uses unique product routes across the top sales cards instead of repeating the same product", () => {
    renderShopStorePage();

    const topSalesSection = screen.getByLabelText("สินค้าขายดีของร้าน");
    const topSalesLinks = within(topSalesSection).getAllByRole("link", {
      name: /เปิดหน้าสินค้า /,
    });
    const topSalesHrefs = topSalesLinks.map((link) => link.getAttribute("href"));

    expect(new Set(topSalesHrefs).size).toBe(topSalesLinks.length);
    expect(topSalesHrefs).toContain(getProductRoute("dr-morepen-glucoone-bg03-meter-strip-kit"));
    expect(topSalesHrefs).toContain(
      getProductRoute("dr-morepen-professionals-deluxe-stethoscope")
    );
    expect(topSalesHrefs).toContain(getProductRoute("dr-morepen-glucoone-bg03-test-strips"));
    expect(topSalesHrefs).toContain(getProductRoute("dr-morepen-glucoone-bg03"));
    expect(topSalesHrefs).toContain(getProductRoute("dr-morepen-glucoone-bg03-meter-only"));
  });

  it("normalizes legacy relative generated-assets overrides from storage", () => {
    const targetProduct = getAllMockProducts().find(
      (product) => product.slug === "dr-morepen-professionals-deluxe-stethoscope"
    );

    expect(targetProduct).toBeDefined();

    seedEditableContent(targetProduct, {
      productGalleryOverrides: {
        0: "./generated-assets/dr-morepen-glucoone-bg03/store-overview-feature-8.jpg",
      },
    });

    renderShopStorePage();

    const topSalesSection = screen.getByLabelText("สินค้าขายดีของร้าน");
    const stethoscopeCard = within(topSalesSection).getByRole("link", {
      name: /หูฟังทางการแพทย์ Dr\. Morepen Professionals Deluxe Stethoscope/i,
    });
    const stethoscopeImage = within(stethoscopeCard).getByRole("img", {
      name: /หูฟังทางการแพทย์ Dr\. Morepen Professionals Deluxe Stethoscope/i,
    });

    expect(stethoscopeImage).toHaveAttribute(
      "src",
      "/generated-assets/dr-morepen-glucoone-bg03/store-overview-feature-8.jpg"
    );
  });
});
