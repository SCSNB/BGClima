-- Задаваме схемата по подразбиране
SET search_path TO bgclima;

-- Добавяне на марки
INSERT INTO Brands (Name, Description, LogoUrl, WebsiteUrl)
VALUES 
('Mitsubishi Electric', 'Японски производител на климатични системи с високо качество и надеждност', 'https://example.com/logos/mitsubishi-electric.png', 'https://www.mitsubishielectric.com/'),
('Daikin', 'Световен лидер в производството на климатични системи', 'https://example.com/logos/daikin.png', 'https://www.daikin.com/'),
('Fujitsu', 'Японски производител на климатици с иновативни технологии', 'https://example.com/logos/fujitsu.png', 'https://www.fujitsu.com/'),
('Toshiba', 'Известен японски бранд с висококачествени климатични системи', 'https://example.com/logos/toshiba.png', 'https://www.toshiba.com/'),
('Hitachi', 'Интелигентни климатични системи с висока енергийна ефективност', 'https://example.com/logos/hitachi.png', 'https://www.hitachi.com/');

-- Добавяне на категории продукти
INSERT INTO ProductCategories (Name, Description, ParentCategoryId)
VALUES 
('Климатици', 'Всички видове климатични системи', NULL),
('Настен климатик', 'Настен климатик за битови и офис помещения', 1),
('Канален климатик', 'Канални климатични системи за потапян монтаж', 1),
('Касов климатик', 'Касови климатици за търговски обекти и офиси', 1),
('Топлинни помпи', 'Енергийно ефективни системи за отопление и охлаждане', NULL),
('Въздухо-въздушни помпи', 'Топлинни помпи тип въздух-въздух', 5),
('Въздухо-водни помпи', 'Топлинни помпи тип въздух-вода', 5);

-- Добавяне на продукти (общи данни)
INSERT INTO Products (
    ProductType, Name, Description, Model, BrandId, CategoryId, 
    Price, DiscountPrice, IsFeatured, IsNewArrival, IsOnSale, 
    StockQuantity, Sku, MetaTitle, MetaDescription, MetaKeywords, Slug
)
VALUES 
(1, 'Mitsubishi Electric MSZ-LN35VGV', 'Инверторен настен климатик с WiFi управление', 'MSZ-LN35VGV', 1, 2, 
 2199.00, 1999.00, TRUE, TRUE, FALSE, 
 5, 'MSZ-LN35VGV-BG', 'Mitsubishi Electric MSZ-LN35VGV - Настен климатик', 'Висококачествен инверторен климатик с WiFi управление', 'климатик, mitsubishi, инверторен, wifi', 'mitsubishi-electric-msz-ln35vgv'),
 
(1, 'Daikin FTXF35B', 'Инверторен настен климатик с енергиен клас A+++', 'FTXF35B', 2, 2, 
 1899.00, 1799.00, TRUE, FALSE, TRUE, 
 8, 'FTXF35B-BG', 'Daikin FTXF35B - Инверторен климатик', 'Иновативен климатик с ниско енергийно потребление', 'daikin, климатик, инверторен, енергиен клас a+++', 'daikin-ftxf35b'),
 
(2, 'Mitsubishi Electric PUHZ-SW75VHA', 'Въздухо-водна топлинна помпа за цялостно отопление', 'PUHZ-SW75VHA', 1, 7, 
 6899.00, 6499.00, TRUE, TRUE, FALSE, 
 3, 'PUHZ-SW75VHA-BG', 'Mitsubishi Electric PUHZ-SW75VHA - Топлинна помпа', 'Мощна топлинна помпа за цялостно отопление и топла вода', 'топлинна помпа, mitsubishi, отопление, топла вода', 'mitsubishi-puhz-sw75vha');

-- Добавяне на данни за климатици
INSERT INTO AirConditioners (
    Id, Type, CoolingCapacityBtu, CoolingCapacityWatts, HeatingCapacityBtu, 
    HeatingCapacityWatts, EnergyEfficiencyRatio, SeasonalEnergyEfficiencyRatio, 
    HeatingSeasonalPerformanceFactor, EnergyClass, NoiseLevelIndoorDbA, 
    NoiseLevelOutdoorDbA, RefrigerantType, RefrigerantQuantityGrams, 
    AirFlowIndoorCubicMetersPerHour, AirFlowOutdoorCubicMetersPerHour, 
    OperatingTemperatureCoolingMin, OperatingTemperatureCoolingMax, 
    OperatingTemperatureHeatingMin, OperatingTemperatureHeatingMax, 
    PowerSupplyVoltageV, PowerSupplyFrequencyHz, PowerInputCoolingW, 
    PowerInputHeatingW, CurrentInputCoolingA, CurrentInputHeatingA, 
    MaxCurrentA, PowerFactor, IndoorUnitDimensionsWxHxDmm, 
    OutdoorUnitDimensionsWxHxDmm, IndoorUnitWeightKg, OutdoorUnitWeightKg, 
    IndoorUnitSoundPressureLevelDbA, OutdoorUnitSoundPressureLevelDbA, 
    IsInverter, HasWiFi, HasPlasmaFilter, HasIonizer, HasSelfCleaning, 
    HasFollowMe, HasTurboMode, HasSleepMode, WarrantyYears, CompressorWarrantyYears
)
VALUES 
(1, 1, 12000, 3500, 13500, 4000, 4.20, 6.10, 4.40, 'A+', 19, 45, 'R32', 1100, 
 520, 1800, -10, 46, -15, 24, 220, 50, 800, 900, 3.6, 4.1, 5.0, 0.95, 
 '800x295x200', '800x550x290', 9.5, 32.0, 19.0, 45.0, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, 5, 10),
 
(2, 1, 12000, 3500, 13600, 4000, 4.35, 6.15, 4.50, 'A+', 19, 45, 'R32', 1000, 
 510, 1700, -10, 46, -15, 24, 220, 50, 780, 850, 3.5, 3.9, 4.8, 0.96, 
 '798x295x195', '780x540x285', 9.0, 30.0, 19.0, 44.0, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, 3, 10);

-- Добавяне на данни за топлинни помпи
INSERT INTO HeatPumps (
    Id, Type, HeatingCapacityKw, CoolingCapacityKw, CoefficientOfPerformance, 
    SeasonalCoefficientOfPerformance, EnergyEfficiencyRatio, 
    SeasonalEnergyEfficiencyRatio, HeatingSeasonalPerformanceFactor, 
    EnergyClassHeating, EnergyClassCooling, NoiseLevelIndoorDbA, 
    NoiseLevelOutdoorDbA, RefrigerantType, RefrigerantQuantityKg, 
    FlowTemperatureMin, FlowTemperatureMax, ReturnTemperatureMin, 
    ReturnTemperatureMax, MaxWaterTemperatureC, WaterFlowRateCubicMetersPerHour, 
    OperatingTemperatureCoolingMin, OperatingTemperatureCoolingMax, 
    OperatingTemperatureHeatingMin, OperatingTemperatureHeatingMax, 
    PowerSupplyVoltageV, PowerSupplyFrequencyHz, PowerInputHeatingW, 
    PowerInputCoolingW, CurrentInputHeatingA, CurrentInputCoolingA, 
    MaxCurrentA, PowerFactor, IndoorUnitDimensionsWxHxDmm, 
    OutdoorUnitDimensionsWxHxDmm, IndoorUnitWeightKg, OutdoorUnitWeightKg, 
    HasHotWaterTank, TankCapacityLiters, HasBackupHeater, BackupHeaterPowerW, 
    HasSmartControl, HasWeatherCompensation, HasDomesticHotWater, 
    WarrantyYears, CompressorWarrantyYears, HeatExchangerWarrantyYears
)
VALUES 
(3, 2, 8.0, 6.5, 4.5, 4.8, 4.2, 4.5, 4.7, 'A+', 'A+', 35, 55, 'R32', 2.5, 
 20, 55, 15, 45, 60, 1.8, -10, 43, -15, 24, 400, 50, 1800, 1500, 2.6, 2.2, 3.0, 0.95, 
 '900x600x300', '900x1000x400', 45, 95, TRUE, 180, TRUE, 2000, TRUE, TRUE, TRUE, 5, 10, 10);

-- Добавяне на изображения за продуктите
INSERT INTO ProductImages (ProductId, ImageUrl, AltText, DisplayOrder, IsPrimary)
VALUES 
(1, 'https://example.com/images/mitsubishi-msz-ln35vgv-1.jpg', 'Mitsubishi Electric MSZ-LN35VGV - преден изглед', 1, TRUE),
(1, 'https://example.com/images/mitsubishi-msz-ln35vgv-2.jpg', 'Mitsubishi Electric MSZ-LN35VGV - страничен изглед', 2, FALSE),
(1, 'https://example.com/images/mitsubishi-msz-ln35vgv-3.jpg', 'Mitsubishi Electric MSZ-LN35VGV - дистанционно управление', 3, FALSE),
(2, 'https://example.com/images/daikin-ftxf35b-1.jpg', 'Daikin FTXF35B - преден изглед', 1, TRUE),
(2, 'https://example.com/images/daikin-ftxf35b-2.jpg', 'Daikin FTXF35B - страничен изглед', 2, FALSE),
(3, 'https://example.com/images/mitsubishi-puhz-sw75vha-1.jpg', 'Mitsubishi Electric PUHZ-SW75VHA - външна единица', 1, TRUE),
(3, 'https://example.com/images/mitsubishi-puhz-sw75vha-2.jpg', 'Mitsubishi Electric PUHZ-SW75VHA - вътрешна единица', 2, FALSE);

-- Добавяне на спецификации за продуктите
INSERT INTO ProductSpecifications (ProductId, Name, Value, DisplayOrder, GroupName)
VALUES 
-- Спецификации за Mitsubishi Electric MSZ-LN35VGV
(1, 'Тип', 'Настен климатик', 1, 'Основни характеристики'),
(1, 'Мощност охлаждане', '3.5 kW (12 000 BTU)', 2, 'Основни характеристики'),
(1, 'Мощност отопление', '4.0 kW (13 500 BTU)', 3, 'Основни характеристики'),
(1, 'Енергиен клас (охлаждане/отопление)', 'A+ / A+', 4, 'Енергийна ефективност'),
(1, 'SEER (сезонна ефективност на охлаждане)', '6.1', 5, 'Енергийна ефективност'),
(1, 'SCOP (сезонна ефективност на отоплението)', '4.4', 6, 'Енергийна ефективност'),
(1, 'Ниво на шум (вътре/вън)', '19/45 dB(A)', 7, 'Шумови характеристики'),
(1, 'Хладилен агент', 'R32', 8, 'Технически характеристики'),
(1, 'Размери вътрешна единица (ВxШxД)', '295x800x200 мм', 9, 'Размери и тегло'),
(1, 'Размери външна единица (ВxШxД)', '550x800x290 мм', 10, 'Размери и тегло'),
(1, 'Тегло вътрешна/външна единица', '9.5/32.0 кг', 11, 'Размери и тегло'),
(1, 'Гаранция', '5 години за уреда, 10 години за компресора', 12, 'Гаранция'),

-- Спецификации за Daikin FTXF35B
(2, 'Тип', 'Настен климатик', 1, 'Основни характеристики'),
(2, 'Мощност охлаждане', '3.5 kW (12 000 BTU)', 2, 'Основни характеристики'),
(2, 'Мощност отопление', '4.0 kW (13 600 BTU)', 3, 'Основни характеристики'),
(2, 'Енергиен клас (охлаждане/отопление)', 'A+ / A+', 4, 'Енергийна ефективност'),
(2, 'SEER (сезонна ефективност на охлаждане)', '6.15', 5, 'Енергийна ефективност'),
(2, 'SCOP (сезонна ефективност на отоплението)', '4.5', 6, 'Енергийна ефективност'),
(2, 'Ниво на шум (вътре/вън)', '19/44 dB(A)', 7, 'Шумови характеристики'),
(2, 'Хладилен агент', 'R32', 8, 'Технически характеристики'),
(2, 'Размери вътрешна единица (ВxШxД)', '295x798x195 мм', 9, 'Размери и тегло'),
(2, 'Размери външна единица (ВxШxД)', '540x780x285 мм', 10, 'Размери и тегло'),
(2, 'Тегло вътрешна/външна единица', '9.0/30.0 кг', 11, 'Размери и тегло'),
(2, 'Гаранция', '3 години за уреда, 10 години за компресора', 12, 'Гаранция'),

-- Спецификации за Mitsubishi Electric PUHZ-SW75VHA
(3, 'Тип', 'Въздухо-водна топлинна помпа', 1, 'Основни характеристики'),
(3, 'Топлинна мощност', '8.0 kW', 2, 'Основни характеристики'),
(3, 'Мощност охлаждане', '6.5 kW', 3, 'Основни характеристики'),
(3, 'Коефициент на топлинна ефективност (COP)', '4.5', 4, 'Енергийна ефективност'),
(3, 'Сезонен коефициент на топлинна ефективност (SCOP)', '4.8', 5, 'Енергийна ефективност'),
(3, 'Енергиен клас (отопление/охлаждане)', 'A+ / A+', 6, 'Енергийна ефективност'),
(3, 'Максимална температура на водата', '60°C', 7, 'Технически характеристики'),
(3, 'Работна температура на въздуха (отопление)', 'от -15°C до +24°C', 8, 'Работен диапазон'),
(3, 'Работна температура на въздуха (охлаждане)', 'от -10°C до +43°C', 9, 'Работен диапазон'),
(3, 'Захранване', '3x400V, 50Hz', 10, 'Електрически параметри'),
(3, 'Размери вътрешна единица (ВxШxД)', '600x900x300 мм', 11, 'Размери и тегло'),
(3, 'Размери външна единица (ВxШxД)', '1000x900x400 мм', 12, 'Размери и тегло'),
(3, 'Тегло вътрешна/външна единица', '45/95 кг', 13, 'Размери и тегло'),
(3, 'Вграден бойлер', 'Да, 180 литра', 14, 'Допълнителна информация'),
(3, 'Резервно електрическо отопление', 'Да, 2 kW', 15, 'Допълнителна информация'),
(3, 'Управление чрез WiFi', 'Да', 16, 'Допълнителна информация'),
(3, 'Гаранция', '5 години за уреда, 10 години за компресора и топлообменника', 17, 'Гаранция');
