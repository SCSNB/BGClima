-- Създаване на схемата
CREATE SCHEMA IF NOT EXISTS bgclima;

-- Таблица за марките
CREATE TABLE bgclima.Brands (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(250) NOT NULL,
    Description TEXT,
    LogoUrl VARCHAR(500),
    WebsiteUrl VARCHAR(500),
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица за категориите продукти
CREATE TABLE bgclima.ProductCategories (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    ParentCategoryId INT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT FK_ProductCategories_ParentCategory 
        FOREIGN KEY (ParentCategoryId) 
        REFERENCES bgclima.ProductCategories(Id) 
        ON DELETE SET NULL
);

-- Таблица за продуктите
CREATE TABLE bgclima.Products (
    Id SERIAL PRIMARY KEY,
    ProductType INT NOT NULL,
    Name VARCHAR(250) NOT NULL,
    Description TEXT,
    Model VARCHAR(100),
    BrandId INT,
    CategoryId INT,
    Price DECIMAL(18, 2),
    DiscountPrice DECIMAL(18, 2),
    IsFeatured BOOLEAN DEFAULT FALSE,
    IsNewArrival BOOLEAN DEFAULT FALSE,
    IsOnSale BOOLEAN DEFAULT FALSE,
    StockQuantity INT DEFAULT 0,
    Sku VARCHAR(100),
    MetaTitle VARCHAR(100),
    MetaDescription VARCHAR(500),
    MetaKeywords VARCHAR(250),
    Slug VARCHAR(300) NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT FK_Products_Brand 
        FOREIGN KEY (BrandId) 
        REFERENCES bgclima.Brands(Id) 
        ON DELETE SET NULL,
        
    CONSTRAINT FK_Products_Category 
        FOREIGN KEY (CategoryId) 
        REFERENCES bgclima.ProductCategories(Id) 
        ON DELETE SET NULL,
        
    CONSTRAINT UQ_Products_Slug UNIQUE (Slug)
);

-- Таблица за климатиците
CREATE TABLE bgclima.AirConditioners (
    Id INT PRIMARY KEY,
    Type INT NOT NULL,
    CoolingCapacityBtu INT,
    CoolingCapacityWatts INT,
    HeatingCapacityBtu INT,
    HeatingCapacityWatts INT,
    EnergyEfficiencyRatio DECIMAL(5, 2),
    SeasonalEnergyEfficiencyRatio DECIMAL(5, 2),
    HeatingSeasonalPerformanceFactor DECIMAL(5, 2),
    EnergyClass VARCHAR(2),
    NoiseLevelIndoorDbA DECIMAL(5, 2),
    NoiseLevelOutdoorDbA DECIMAL(5, 2),
    RefrigerantType VARCHAR(50),
    RefrigerantQuantityGrams INT,
    AirFlowIndoorCubicMetersPerHour INT,
    AirFlowOutdoorCubicMetersPerHour INT,
    OperatingTemperatureCoolingMin INT,
    OperatingTemperatureCoolingMax INT,
    OperatingTemperatureHeatingMin INT,
    OperatingTemperatureHeatingMax INT,
    PowerSupplyVoltageV INT,
    PowerSupplyFrequencyHz INT,
    PowerInputCoolingW INT,
    PowerInputHeatingW INT,
    CurrentInputCoolingA DECIMAL(5, 2),
    CurrentInputHeatingA DECIMAL(5, 2),
    MaxCurrentA DECIMAL(5, 2),
    PowerFactor DECIMAL(3, 2),
    IndoorUnitDimensionsWxHxDmm VARCHAR(100),
    OutdoorUnitDimensionsWxHxDmm VARCHAR(100),
    IndoorUnitWeightKg DECIMAL(5, 2),
    OutdoorUnitWeightKg DECIMAL(5, 2),
    IndoorUnitSoundPressureLevelDbA DECIMAL(5, 2),
    OutdoorUnitSoundPressureLevelDbA DECIMAL(5, 2),
    IsInverter BOOLEAN DEFAULT FALSE,
    HasWiFi BOOLEAN DEFAULT FALSE,
    HasPlasmaFilter BOOLEAN DEFAULT FALSE,
    HasIonizer BOOLEAN DEFAULT FALSE,
    HasSelfCleaning BOOLEAN DEFAULT FALSE,
    HasFollowMe BOOLEAN DEFAULT FALSE,
    HasTurboMode BOOLEAN DEFAULT FALSE,
    HasSleepMode BOOLEAN DEFAULT FALSE,
    WarrantyYears INT,
    CompressorWarrantyYears INT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT FK_AirConditioners_Product 
        FOREIGN KEY (Id) 
        REFERENCES bgclima.Products(Id) 
        ON DELETE CASCADE
);

-- Таблица за топлинните помпи
CREATE TABLE bgclima.HeatPumps (
    Id INT PRIMARY KEY,
    Type INT NOT NULL,
    HeatingCapacityKw DECIMAL(8, 2),
    CoolingCapacityKw DECIMAL(8, 2),
    CoefficientOfPerformance DECIMAL(5, 2),
    SeasonalCoefficientOfPerformance DECIMAL(5, 2),
    EnergyEfficiencyRatio DECIMAL(5, 2),
    SeasonalEnergyEfficiencyRatio DECIMAL(5, 2),
    HeatingSeasonalPerformanceFactor DECIMAL(5, 2),
    EnergyClassHeating VARCHAR(2),
    EnergyClassCooling VARCHAR(2),
    NoiseLevelIndoorDbA DECIMAL(5, 2),
    NoiseLevelOutdoorDbA DECIMAL(5, 2),
    RefrigerantType VARCHAR(50),
    RefrigerantQuantityKg DECIMAL(8, 3),
    FlowTemperatureMin INT,
    FlowTemperatureMax INT,
    ReturnTemperatureMin INT,
    ReturnTemperatureMax INT,
    MaxWaterTemperatureC INT,
    WaterFlowRateCubicMetersPerHour DECIMAL(8, 2),
    OperatingTemperatureCoolingMin INT,
    OperatingTemperatureCoolingMax INT,
    OperatingTemperatureHeatingMin INT,
    OperatingTemperatureHeatingMax INT,
    PowerSupplyVoltageV INT,
    PowerSupplyFrequencyHz INT,
    PowerInputHeatingW INT,
    PowerInputCoolingW INT,
    CurrentInputHeatingA DECIMAL(5, 2),
    CurrentInputCoolingA DECIMAL(5, 2),
    MaxCurrentA DECIMAL(5, 2),
    PowerFactor DECIMAL(3, 2),
    IndoorUnitDimensionsWxHxDmm VARCHAR(100),
    OutdoorUnitDimensionsWxHxDmm VARCHAR(100),
    IndoorUnitWeightKg DECIMAL(8, 2),
    OutdoorUnitWeightKg DECIMAL(8, 2),
    HasHotWaterTank BOOLEAN DEFAULT FALSE,
    TankCapacityLiters INT,
    HasBackupHeater BOOLEAN DEFAULT FALSE,
    BackupHeaterPowerW INT,
    HasSmartControl BOOLEAN DEFAULT FALSE,
    HasWeatherCompensation BOOLEAN DEFAULT FALSE,
    HasDomesticHotWater BOOLEAN DEFAULT FALSE,
    WarrantyYears INT,
    CompressorWarrantyYears INT,
    HeatExchangerWarrantyYears INT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT FK_HeatPumps_Product 
        FOREIGN KEY (Id) 
        REFERENCES bgclima.Products(Id) 
        ON DELETE CASCADE
);

-- Таблица за изображенията на продуктите
CREATE TABLE bgclima.ProductImages (
    Id SERIAL PRIMARY KEY,
    ProductId INT NOT NULL,
    ImageUrl VARCHAR(500) NOT NULL,
    AltText VARCHAR(250),
    DisplayOrder INT DEFAULT 0,
    IsPrimary BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT FK_ProductImages_Product 
        FOREIGN KEY (ProductId) 
        REFERENCES bgclima.Products(Id) 
        ON DELETE CASCADE
);

-- Таблица за спецификациите на продуктите
CREATE TABLE bgclima.ProductSpecifications (
    Id SERIAL PRIMARY KEY,
    ProductId INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Value TEXT NOT NULL,
    DisplayOrder INT DEFAULT 0,
    GroupName VARCHAR(100),
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT FK_ProductSpecifications_Product 
        FOREIGN KEY (ProductId) 
        REFERENCES bgclima.Products(Id) 
        ON DELETE CASCADE
);

-- Създаване на индекси за подобрена производителност
CREATE INDEX IX_Products_BrandId ON bgclima.Products(BrandId);
CREATE INDEX IX_Products_CategoryId ON bgclima.Products(CategoryId);
CREATE INDEX IX_Products_Slug ON bgclima.Products(Slug);
CREATE INDEX IX_ProductImages_ProductId ON bgclima.ProductImages(ProductId);
CREATE INDEX IX_ProductSpecifications_ProductId ON bgclima.ProductSpecifications(ProductId);

-- Функция за автоматично обновяване на UpdatedAt полето
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.UpdatedAt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Създаване на тригери за автоматично обновяване на UpdatedAt полетата
CREATE TRIGGER update_brands_modtime
BEFORE UPDATE ON bgclima.Brands
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_product_categories_modtime
BEFORE UPDATE ON bgclima.ProductCategories
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON bgclima.Products
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_air_conditioners_modtime
BEFORE UPDATE ON bgclima.AirConditioners
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_heat_pumps_modtime
BEFORE UPDATE ON bgclima.HeatPumps
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
