-- Insert Brands
INSERT INTO bgclima."Brand" ("Name", "Country") VALUES 
('Daikin', 'Япония'),
('Mitsubishi Electric', 'Япония'),
('Toshiba', 'Япония'),
('Fujitsu', 'Япония'),
('Gree', 'Китай'),
('Haier', 'Китай'),
('LG', 'Южна Корея'),
('Samsung', 'Южна Корея'),
('Ballu', 'Русия'),
('Hyundai', 'Южна Корея');

-- Insert Energy Classes
INSERT INTO bgclima."EnergyClass" ("Class") VALUES 
('A+++'),
('A++'),
('A+'),
('A'),
('B'),
('C'),
('D');

-- Insert BTU Values
INSERT INTO bgclima."BTU" ("Value") VALUES 
('9000 BTU'),
('12000 BTU'),
('18000 BTU'),
('24000 BTU'),
('30000 BTU'),
('36000 BTU');

-- Insert Product Types
INSERT INTO bgclima."ProductType" ("Name") VALUES 
('Стандартен климатик'),
('Инверторен климатик'),
('Мулти сплит система'),
('Канален климатик'),
('Касетъчен климатик'),
('Топлинна помпа');

-- Insert Products
-- Note: We need to get IDs from the tables we just inserted
-- Let's use a transaction to ensure all inserts are successful
DO $$
DECLARE
    brand_id INTEGER;
    btu_id INTEGER;
    energy_class_id INTEGER;
    product_type_id INTEGER;
    product_id INTEGER;
BEGIN
    -- Get IDs for the first product
    SELECT "Id" INTO brand_id FROM bgclima."Brand" WHERE "Name" = 'Daikin' LIMIT 1;
    SELECT "Id" INTO btu_id FROM bgclima."BTU" WHERE "Value" = '9000 BTU' LIMIT 1;
    SELECT "Id" INTO energy_class_id FROM bgclima."EnergyClass" WHERE "Class" = 'A++' LIMIT 1;
    SELECT "Id" INTO product_type_id FROM bgclima."ProductType" WHERE "Name" = 'Инверторен климатик' LIMIT 1;
    
    -- Insert first product
    INSERT INTO bgclima."Product" (
        "Name", 
        "Description", 
        "BrandId", 
        "BTUId", 
        "EnergyClassId", 
        "ProductTypeId", 
        "Price", 
        "OldPrice", 
        "StockQuantity", 
        "IsActive", 
        "IsFeatured", 
        "IsOnSale", 
        "IsNew", 
        "Sku", 
        "SeoTitle", 
        "SeoDescription", 
        "SeoKeywords", 
        "ImageUrl",
        "meta_description",
        "meta_keywords"
    ) VALUES (
        'Daikin FTXB-E/RXB-E', 
        'Инверторен климатик с висок енергиен клас A++', 
        brand_id, 
        btu_id, 
        energy_class_id, 
        product_type_id, 
        1299.00, 
        1399.00, 
        10, 
        true, 
        true, 
        true, 
        true, 
        'DAI-FTXBE-9000', 
        'Daikin FTXB-E/RXB-E - Инверторен климатик 9000 BTU', 
        'Високоефективен инверторен климатик Daikin FTXB-E/RXB-E с енергиен клас A++', 
        'инверторен климатик, daikin, 9000 btu, a++', 
        '/images/daikin-ftxbe-rxbe.jpg',
        'Daikin FTXB-E/RXB-E - Високоефективен инверторен климатик с ниско енергоразходене',
        'daikin, климатик, инверторен, евтин, енергоспестяващ'
    ) RETURNING "Id" INTO product_id;
    
    -- Insert product images
    INSERT INTO bgclima."ProductImage" ("ProductId", "ImageUrl", "AltText", "DisplayOrder", "IsPrimary") VALUES 
    (product_id, '/images/daikin-ftxbe-rxbe-1.jpg', 'Daikin FTXB-E/RXB-E - преден изглед', 1, true),
    (product_id, '/images/daikin-ftxbe-rxbe-2.jpg', 'Daikin FTXB-E/RXB-E - страничен изглед', 2, false);
    
    -- Insert product attributes
    INSERT INTO bgclima."ProductAttribute" ("ProductId", "AttributeKey", "AttributeValue", "DisplayOrder", "GroupName", "IsVisible") VALUES 
    (product_id, 'Тип на инсталацията', 'Настен', 1, 'Основни характеристики', true),
    (product_id, 'Отдавана мощност (охлаждане)', '2.6 kW', 2, 'Основни характеристики', true),
    (product_id, 'Отдавана мощност (отопление)', '3.4 kW', 3, 'Основни характеристики', true),
    (product_id, 'Енергиен клас (охлаждане)', 'A++', 4, 'Енергийна ефективност', true),
    (product_id, 'Енергиен клас (отопление)', 'A+', 5, 'Енергийна ефективност', true),
    (product_id, 'Ниво на шум (вътрешно тяло)', '19 dB', 6, 'Допълнителни характеристики', true),
    (product_id, 'Ниво на шум (външно тяло)', '45 dB', 7, 'Допълнителни характеристики', true),
    (product_id, 'Гаранция', '3 години', 8, 'Гаранция и поддръжка', true);
    
    -- Get IDs for the second product
    SELECT "Id" INTO brand_id FROM bgclima."Brand" WHERE "Name" = 'Mitsubishi Electric' LIMIT 1;
    SELECT "Id" INTO btu_id FROM bgclima."BTU" WHERE "Value" = '12000 BTU' LIMIT 1;
    SELECT "Id" INTO energy_class_id FROM bgclima."EnergyClass" WHERE "Class" = 'A+++' LIMIT 1;
    SELECT "Id" INTO product_type_id FROM bgclima."ProductType" WHERE "Name" = 'Инверторен климатик' LIMIT 1;
    
    -- Insert second product
    INSERT INTO bgclima."Product" (
        "Name", 
        "Description", 
        "BrandId", 
        "BTUId", 
        "EnergyClassId", 
        "ProductTypeId", 
        "Price", 
        "OldPrice", 
        "StockQuantity", 
        "IsActive", 
        "IsFeatured", 
        "IsOnSale", 
        "IsNew", 
        "Sku", 
        "SeoTitle", 
        "SeoDescription", 
        "SeoKeywords", 
        "ImageUrl",
        "meta_description",
        "meta_keywords"
    ) VALUES (
        'Mitsubishi Electric MSZ-LN35VG2B / MUZ-LN35VG2', 
        'Сензорен инверторен климатик с висок енергиен клас A+++', 
        brand_id, 
        btu_id, 
        energy_class_id, 
        product_type_id, 
        1599.00, 
        1699.00, 
        5, 
        true, 
        true, 
        false, 
        true, 
        'MIT-LN35VG2', 
        'Mitsubishi Electric MSZ-LN35VG2B - Инверторен климатик 12000 BTU', 
        'Високоефективен сензорен инверторен климатик Mitsubishi Electric с енергиен клас A+++', 
        'mitsubishi electric, инверторен климатик, 12000 btu, a+++', 
        '/images/mitsubishi-ln35vg2.jpg',
        'Mitsubishi Electric MSZ-LN35VG2B - Сензорен инверторен климатик с висока енергийна ефективност',
        'mitsubishi, климатик, инверторен, сензорен, a+++'
    ) RETURNING "Id" INTO product_id;
    
    -- Insert product images
    INSERT INTO bgclima."ProductImage" ("ProductId", "ImageUrl", "AltText", "DisplayOrder", "IsPrimary") VALUES 
    (product_id, '/images/mitsubishi-ln35vg2-1.jpg', 'Mitsubishi Electric MSZ-LN35VG2B - преден изглед', 1, true),
    (product_id, '/images/mitsubishi-ln35vg2-2.jpg', 'Mitsubishi Electric MSZ-LN35VG2B - страничен изглед', 2, false);
    
    -- Insert product attributes
    INSERT INTO bgclima."ProductAttribute" ("ProductId", "AttributeKey", "AttributeValue", "DisplayOrder", "GroupName", "IsVisible") VALUES 
    (product_id, 'Тип на инсталацията', 'Настен', 1, 'Основни характеристики', true),
    (product_id, 'Отдавана мощност (охлаждане)', '3.5 kW', 2, 'Основни характеристики', true),
    (product_id, 'Отдавана мощност (отопление)', '4.0 kW', 3, 'Основни характеристики', true),
    (product_id, 'Енергиен клас (охлаждане)', 'A+++', 4, 'Енергийна ефективност', true),
    (product_id, 'Енергиен клас (отопление)', 'A++', 5, 'Енергийна ефективност', true),
    (product_id, 'Ниво на шум (вътрешно тяло)', '20 dB', 6, 'Допълнителни характеристики', true),
    (product_id, 'Ниво на шум (външно тяло)', '43 dB', 7, 'Допълнителни характеристики', true),
    (product_id, 'Гаранция', '5 години', 8, 'Гаранция и поддръжка', true);
    
END $$;
