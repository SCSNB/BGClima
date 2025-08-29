-- Create Banners table in bgclima schema
CREATE TABLE IF NOT EXISTS bgclima."Banners"
(
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "ImageUrl" VARCHAR(500) NOT NULL,
    "TargetUrl" VARCHAR(1000),
    "DisplayOrder" INTEGER NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "Type" INTEGER NOT NULL
);

-- Add comment for the Type column
COMMENT ON COLUMN bgclima."Banners"."Type" IS '0=HeroSlider, 1=MainLeft, 2=TopRight, 3=MiddleRight, 4=BottomRight';
