-- Създаване на схема за базата данни
CREATE SCHEMA IF NOT EXISTS bgclima;

-- Създаване на таблица за марки
CREATE TABLE IF NOT EXISTS bgclima.Brand (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Country VARCHAR(100) NULL
);

-- Създаване на таблица за BTU стойности
CREATE TABLE IF NOT EXISTS bgclima.BTU (
    Id SERIAL PRIMARY KEY,
    Value VARCHAR(50) NOT NULL -- Пример: "9000", "12000", "18000"
);

-- Създаване на таблица за енергийни класове
CREATE TABLE IF NOT EXISTS bgclima.EnergyClass (
    Id SERIAL PRIMARY KEY,
    Class VARCHAR(10) NOT NULL -- Пример: "A++", "A+++"
);

-- Създаване на таблица за типове продукти
CREATE TABLE IF NOT EXISTS bgclima.ProductType (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(50) NOT NULL -- Пример: "Климатик", "Термопомпа"
);

-- Създаване на таблица за продукти
CREATE TABLE IF NOT EXISTS bgclima.Product (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    BrandId INT NOT NULL,
    BTUId INT NULL,
    EnergyClassId INT NULL,
    ProductTypeId INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    OldPrice DECIMAL(10, 2) NULL,
    StockQuantity INT DEFAULT 0,
    IsActive BOOLEAN DEFAULT TRUE,
    IsFeatured BOOLEAN DEFAULT FALSE,
    IsOnSale BOOLEAN DEFAULT FALSE,
    IsNew BOOLEAN DEFAULT TRUE,
    Sku VARCHAR(100) NULL,
    SeoTitle VARCHAR(255) NULL,
    SeoDescription TEXT NULL,
    SeoKeywords VARCHAR(500) NULL,
    ImageUrl TEXT NULL,
    
    -- Връзки с други таблици
    CONSTRAINT FK_Product_Brand FOREIGN KEY (BrandId) REFERENCES bgclima.Brand(Id) ON DELETE RESTRICT,
    CONSTRAINT FK_Product_BTU FOREIGN KEY (BTUId) REFERENCES bgclima.BTU(Id) ON DELETE SET NULL,
    CONSTRAINT FK_Product_EnergyClass FOREIGN KEY (EnergyClassId) REFERENCES bgclima.EnergyClass(Id) ON DELETE SET NULL,
    CONSTRAINT FK_Product_ProductType FOREIGN KEY (ProductTypeId) REFERENCES bgclima.ProductType(Id) ON DELETE RESTRICT
);

-- Създаване на таблица за атрибути на продукти
CREATE TABLE IF NOT EXISTS bgclima.ProductAttribute (
    Id SERIAL PRIMARY KEY,
    ProductId INT NOT NULL,
    AttributeKey VARCHAR(100) NOT NULL,   -- Пример: "COP", "Шум", "Отоплителна мощност"
    AttributeValue VARCHAR(255) NOT NULL, -- Пример: "3.8", "21 dB", "5.2 kW"
    DisplayOrder INT DEFAULT 0,           -- Контролира реда при сравнение
    GroupName VARCHAR(100) NULL,          -- Пример: "Производителност", "Консумация"
    IsVisible BOOLEAN DEFAULT TRUE,       -- Скриване на вътрешни атрибути
    
    -- Връзка с таблицата за продукти
    CONSTRAINT FK_ProductAttribute_Product FOREIGN KEY (ProductId) 
        REFERENCES bgclima.Product(Id) ON DELETE CASCADE
);

-- Създаване на таблица за изображения на продукти
CREATE TABLE IF NOT EXISTS bgclima.ProductImage (
    Id SERIAL PRIMARY KEY,
    ProductId INT NOT NULL,
    ImageUrl TEXT NOT NULL,
    AltText VARCHAR(255) NULL,
    DisplayOrder INT DEFAULT 0,
    IsPrimary BOOLEAN DEFAULT FALSE,
    
    -- Връзка с таблицата за продукти
    CONSTRAINT FK_ProductImage_Product FOREIGN KEY (ProductId) 
        REFERENCES bgclima.Product(Id) ON DELETE CASCADE
);

-- Създаване на индекси за по-бързо търсене
CREATE INDEX IF NOT EXISTS IDX_Product_BrandId ON bgclima.Product(BrandId);
CREATE INDEX IF NOT EXISTS IDX_Product_ProductTypeId ON bgclima.Product(ProductTypeId);
CREATE INDEX IF NOT EXISTS IDX_ProductAttribute_ProductId ON bgclima.ProductAttribute(ProductId);
CREATE INDEX IF NOT EXISTS IDX_ProductImage_ProductId ON bgclima.ProductImage(ProductId);

-- Премахнати са CreatedAt/UpdatedAt и свързани тригери

-- Инициализиране на референтни данни
INSERT INTO bgclima.BTU (Value) VALUES 
('9000'), ('12000'), ('18000'), ('24000'), ('30000')
ON CONFLICT DO NOTHING;

INSERT INTO bgclima.EnergyClass (Class) VALUES 
('A+'), ('A++'), ('A+++'), ('A+++ -40')
ON CONFLICT DO NOTHING;

INSERT INTO bgclima.ProductType (Name) VALUES 
('Климатик'), ('Термопомпа'), ('Мулти сплит система'), ('Канален климатик')
ON CONFLICT DO NOTHING;

-- Съобщение за успешно създаване на базата данни
DO $$ 
BEGIN
    RAISE NOTICE 'Базата данни е успешно създадена и инициализирана.';
END $$;
