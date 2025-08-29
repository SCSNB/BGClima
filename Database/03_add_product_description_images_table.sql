-- 03_add_product_description_images_table.sql

CREATE TABLE "ProductDescriptionImages" (
    "Id" SERIAL PRIMARY KEY,
    "ImageUrl" TEXT NOT NULL,
    "AltText" TEXT,
    "DisplayOrder" INTEGER NOT NULL DEFAULT 0,
    "ProductId" INTEGER NOT NULL,
    CONSTRAINT "FK_ProductDescriptionImages_Products_ProductId" FOREIGN KEY ("ProductId")
        REFERENCES "Products" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_ProductDescriptionImages_ProductId" ON "ProductDescriptionImages" ("ProductId");
