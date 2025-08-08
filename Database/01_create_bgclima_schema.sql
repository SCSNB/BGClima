-- Drop database if exists and create a new one
DROP DATABASE IF EXISTS bgclima_db;
CREATE DATABASE bgclima_db
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the new database
\c bgclima_db

-- Create schema
CREATE SCHEMA bgclima;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE product_type_enum AS ENUM ('air_conditioner', 'heat_pump');
CREATE TYPE heat_pump_type_enum AS ENUM ('air_to_air', 'air_to_water', 'ground_source', 'water_source');

-- Table: brands
CREATE TABLE bgclima.brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: product_categories
CREATE TABLE bgclima.product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES bgclima.product_categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: products (main products table)
CREATE TABLE bgclima.products (
    id SERIAL PRIMARY KEY,
    product_type product_type_enum NOT NULL,
    product_id INTEGER NOT NULL, -- References id in the specific product table
    category_id INTEGER REFERENCES bgclima.product_categories(id),
    brand_id INTEGER REFERENCES bgclima.brands(id),
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(250) NOT NULL,
    short_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    promo_price DECIMAL(10, 2),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    meta_title VARCHAR(250),
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: air_conditioners
CREATE TABLE bgclima.air_conditioners (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(250) NOT NULL,
    description TEXT,
    cooling_energy_class VARCHAR(3),  -- A+, A++, A+++
    heating_energy_class VARCHAR(3),  -- A+, A++, A+++
    cooling_capacity_btu INTEGER,           -- Мощност на охлаждане в BTU
    heating_capacity_btu INTEGER,           -- Мощност на отопление в BTU
    cooling_capacity_kw DECIMAL(5, 2),      -- Мощност на охлаждане в kW
    heating_capacity_kw DECIMAL(5, 2),      -- Мощност на отопление в kW
    power_input_cooling DECIMAL(5, 2),      -- Консумация при охлаждане (kW)
    power_input_heating DECIMAL(5, 2),      -- Консумация при отопление (kW)
    seer_rating DECIMAL(3, 1),              -- SEER рейтинг (сезонна ефективност при охлаждане)
    scop_rating DECIMAL(3, 1),              -- SCOP рейтинг (сезонна ефективност при отопление)
    noise_level_indoor_db_min DECIMAL(4, 1),   -- Минимален шум на вътрешното тяло (dB)
    noise_level_indoor_db_max DECIMAL(4, 1),   -- Максимален шум на вътрешното тяло (dB)
    noise_level_outdoor_db DECIMAL(4, 1),      -- Шум на външното тяло (dB)
    indoor_unit_size VARCHAR(100),             -- Размери на вътрешното тяло (Ш x В x Д)
    outdoor_unit_size VARCHAR(100),            -- Размери на външното тяло (Ш x В x Д)
    weight_indoor_kg DECIMAL(5, 1),           -- Тегло на вътрешното тяло (kg)
    weight_outdoor_kg DECIMAL(5, 1),          -- Тегло на външното тяло (kg)
    refrigerant_type VARCHAR(50),             -- Тип хладилен агент (R32, R410A и т.н.)
    refrigerant_quantity_kg DECIMAL(4, 2),    -- Количество хладилен агент (kg)
    power_supply_voltage VARCHAR(50),         -- Напрежение на захранване (V/Ph/Hz)
    power_supply_voltage_outdoor VARCHAR(50), -- Напрежение на външното тяло (ако е различно)
    airflow_indoor_m3h INTEGER,               -- Въздушен дебит на вътрешното тяло (m³/h)
    airflow_outdoor_m3h INTEGER,              -- Въздушен дебит на външното тяло (m³/h)
    room_size_m2 INTEGER,                     -- Препоръчителен обхват за стая (m²)
    min_operating_temp_c DECIMAL(3, 1),       -- Минимална работна температура (°C)
    max_operating_temp_c DECIMAL(3, 1),       -- Максимална работна температура (°C)
    max_pipe_length_m DECIMAL(4, 1),          -- Максимална дължина на фреоновата тръба (m)
    max_height_diff_m DECIMAL(3, 1),          -- Максимална височинна разлика между вътрешно и външно тяло (m)
    warranty_years INTEGER,                   -- Гаранционен период (години)
    warranty_description TEXT,                -- Подробно описание на гаранцията
    has_wifi BOOLEAN DEFAULT false,           -- Вграден Wi-Fi модул
    has_ionizer BOOLEAN DEFAULT false,        -- Йонизатор на въздуха
    has_self_clean BOOLEAN DEFAULT false,     -- Функция за самоочистване
    is_inverter BOOLEAN DEFAULT false,        -- Инверторна технология
    has_plasma BOOLEAN DEFAULT false,         -- Плазмен филтър
    has_uv_light BOOLEAN DEFAULT false,       -- UV лампа за дезинфекция
    has_smart_control BOOLEAN DEFAULT false,  -- Управление чрез смартфон
    has_timer BOOLEAN DEFAULT false,          -- Вграден таймер
    has_sleep_mode BOOLEAN DEFAULT false,     -- Режим за сън
    has_follow_me BOOLEAN DEFAULT false,      -- Функция за проследяване на дистанционното
    has_auto_restart BOOLEAN DEFAULT false,   -- Автоматично рестартиране след прекъсване на тока
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: heat_pumps
CREATE TABLE bgclima.heat_pumps (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,           -- Модел (напр. ACHP-H10/5R3HA)
    description TEXT,                           -- Описание на продукта
    
    -- Основни характеристики
    has_wifi BOOLEAN DEFAULT false,            -- Wi-Fi модул в комплекта
    energy_class_cooling VARCHAR(5),           -- Енергиен клас на охлаждане (A+++)
    energy_class_heating VARCHAR(5),           -- Енергиен клас на отопление (A+++)
    
    -- Мощности (номинални стойности)
    cooling_capacity_nominal_kw DECIMAL(5, 2),  -- Номинална мощност на охлаждане (kW)
    heating_capacity_nominal_kw DECIMAL(5, 2),  -- Номинална мощност на отопление (kW)
    power_input_cooling_nominal_kw DECIMAL(5, 2), -- Номинална консумация при охлаждане (kW)
    power_input_heating_nominal_kw DECIMAL(5, 2), -- Номинална консумация при отопление (kW)
    
    -- Коефициенти на ефективност
    cop_rating DECIMAL(3, 1),                  -- COP (коефициент на трансформация при отопление)
    eer_rating DECIMAL(3, 1),                  -- EER (коефициент на ефективност при охлаждане)
    scop_rating DECIMAL(3, 1),                 -- SCOP (сезонен коефициент при отопление)
    
    -- Температурни характеристики
    operating_temp_cooling_min DECIMAL(4, 1),  -- Минимална работна температура при охлаждане (°C)
    operating_temp_cooling_max DECIMAL(4, 1),  -- Максимална работна температура при охлаждане (°C)
    operating_temp_heating_min DECIMAL(4, 1),  -- Минимална работна температура при отопление (°C)
    operating_temp_heating_max DECIMAL(4, 1),  -- Максимална работна температура при отопление (°C)
    
    -- Параметри на водата
    water_temp_cooling_min DECIMAL(4, 1),      -- Минимална температура на водата при охлаждане (°C)
    water_temp_cooling_max DECIMAL(4, 1),      -- Максимална температура на водата при охлаждане (°C)
    water_temp_heating_min DECIMAL(4, 1),      -- Минимална температура на водата при отопление (°C)
    water_temp_heating_max DECIMAL(4, 1),      -- Максимална температура на водата при отопление (°C)
    
    -- Хладилен агент
    refrigerant_type VARCHAR(20),              -- Тип хладилен агент (напр. R-32)
    
    -- Електрически параметри
    power_supply_voltage VARCHAR(50),          -- Напрежение на захранване (напр. 220-240V)
    power_supply_phase VARCHAR(20),            -- Брой фази (1~)
    power_supply_frequency DECIMAL(4, 1),      -- Честота (Hz)
    
    -- Вътрешно тяло
    indoor_unit_dimensions VARCHAR(100),        -- Размери на вътрешното тяло (В x Ш x Д в мм)
    indoor_unit_weight_kg DECIMAL(5, 1),        -- Тегло на вътрешното тяло (kg)
    indoor_unit_noise_cooling_db DECIMAL(4, 1), -- Ниво на шум при охлаждане (dB)
    indoor_unit_noise_heating_db DECIMAL(4, 1), -- Ниво на шум при отопление (dB)
    
    -- Външно тяло
    outdoor_unit_compressor_type VARCHAR(50),   -- Тип компресор (напр. DC Twin Rotary)
    outdoor_unit_dimensions VARCHAR(100),       -- Размери на външното тяло (В x Ш x Д в мм)
    outdoor_unit_weight_kg DECIMAL(5, 1),       -- Тегло на външното тяло (kg)
    outdoor_unit_noise_cooling_db DECIMAL(4, 1),-- Ниво на шум при охлаждане (dB)
    outdoor_unit_noise_heating_db DECIMAL(4, 1),-- Ниво на шум при отопление (dB)
    
    -- Тръбни връзки
    liquid_tube_diameter VARCHAR(20),           -- Диаметър на течната тръба (mm)
    gas_tube_diameter VARCHAR(20),              -- Диаметър на газообразната тръба (mm)
    
    -- Транспортна информация за вътрешно тяло
    indoor_package_count INTEGER,              -- Брой опаковки
    indoor_package_dimensions VARCHAR(100),    -- Размери на опаковката (В x Ш x Д в см)
    indoor_package_weight_kg DECIMAL(5, 1),    -- Тегло на опаковката (kg)
    
    -- Транспортна информация за външно тяло
    outdoor_package_count INTEGER,             -- Брой опаковки
    outdoor_package_dimensions VARCHAR(100),   -- Размери на опаковката (В x Ш x Д в см)
    outdoor_package_weight_kg DECIMAL(5, 1),   -- Тегло на опаковката (kg)
    
    -- Гаранция
    warranty_months INTEGER,                   -- Гаранционен период (месеци)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица за работни характеристики при различни температури
-- (може да бъде използвана за съхранение на данни за ефективност при различни условия)
CREATE TABLE bgclima.heat_pump_performance (
    id SERIAL PRIMARY KEY,
    heat_pump_id INTEGER NOT NULL,
    outside_temp_c DECIMAL(4, 1) NOT NULL,      -- Външна температура
    water_temp_c DECIMAL(4, 1),                 -- Температура на водата
    heating_capacity_kw DECIMAL(6, 2),          -- Топлинна мощност (kW)
    cooling_capacity_kw DECIMAL(6, 2),          -- Хладилна мощност (kW)
    power_consumption_kw DECIMAL(5, 2),         -- Консумирана мощност (kW)
    cop DECIMAL(3, 1),                          -- Коефициент на трансформация (COP)
    eer DECIMAL(3, 1),                          -- Коефициент на ефективност (EER)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (heat_pump_id) REFERENCES bgclima.heat_pumps(id) ON DELETE CASCADE
);

-- Индекс за бързо търсене на характеристики по модел на термопомпата
CREATE INDEX idx_heat_pump_performance ON bgclima.heat_pump_performance(heat_pump_id, outside_temp_c);

-- Table: ventilation_systems
CREATE TABLE bgclima.ventilation_systems (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(250) NOT NULL,
    description TEXT,
    ventilation_type ventilation_type_enum,     -- 'heat_recovery', 'energy_recovery', 'supply', 'extract'
    airflow_m3h INTEGER,                       -- Въздушен дебит (m³/h)
    max_airflow_m3h INTEGER,                   -- Максимален въздушен дебит (m³/h)
    heat_recovery_efficiency_percent DECIMAL(5, 2),  -- Ефективност на рекуперация на топлина (%)
    power_consumption_w DECIMAL(6, 1),         -- Консумирана мощност (W)
    power_consumption_max_w DECIMAL(6, 1),     -- Максимална консумирана мощност (W)
    noise_level_db DECIMAL(4, 1),              -- Ниво на шум (dB)
    noise_level_max_db DECIMAL(4, 1),          -- Максимално ниво на шум (dB)
    filter_class VARCHAR(10),                  -- Клас на филтрите (G4, F7 и т.н.)
    filter_efficiency_class VARCHAR(10),       -- Клас на ефективност на филтрите (ePM1, ePM2.5 и т.н.)
    dimensions VARCHAR(100),                   -- Размери (Ш x В x Д)
    weight_kg DECIMAL(6, 1),                   -- Тегло (kg)
    power_supply_voltage VARCHAR(50),          -- Напрежение на захранване (V/Ph/Hz)
    has_auto_bypass BOOLEAN DEFAULT false,     -- Автоматичен байпас
    has_heating_element BOOLEAN DEFAULT false, -- Допълнително електрическо нагряване
    has_cooling BOOLEAN DEFAULT false,         -- Възможност за охлаждане
    has_heat_exchanger BOOLEAN DEFAULT false,  -- Топлообменник
    has_heat_pump BOOLEAN DEFAULT false,       -- Вградена термопомпа
    has_smart_control BOOLEAN DEFAULT false,   -- Управление чрез смартфон/таблет
    has_wifi BOOLEAN DEFAULT false,            -- Вграден Wi-Fi модул
    warranty_years INTEGER,                    -- Гаранционен период (години)
    warranty_description TEXT,                 -- Подробно описание на гаранцията
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: product_images
CREATE TABLE bgclima.product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    product_type product_type_enum NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    alt_text VARCHAR(250),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: product_specifications
CREATE TABLE bgclima.product_specifications (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    product_type product_type_enum NOT NULL,
    specification_key VARCHAR(100) NOT NULL,
    specification_value TEXT NOT NULL,
    specification_group VARCHAR(100),        -- Група спецификации (напр. 'Основни характеристики', 'Размери', 'Енергийна ефективност')
    specification_unit VARCHAR(20),          -- Мерна единица (ако има)
    is_important BOOLEAN DEFAULT false,      -- Дали да се показва в основните характеристики
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: product_accessories
CREATE TABLE bgclima.product_accessories (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    accessory_name VARCHAR(250) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    is_included BOOLEAN DEFAULT false,      -- Дали е включен в комплекта
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES bgclima.products(id) ON DELETE CASCADE
);

-- Table: product_features
CREATE TABLE bgclima.product_features (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    product_type product_type_enum NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    feature_description TEXT,
    feature_icon VARCHAR(100),              -- Икона за визуализация
    is_highlighted BOOLEAN DEFAULT false,   -- Дали да се подчертае като предимство
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: product_documents (for manuals, certificates, etc.)
CREATE TABLE bgclima.product_documents (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    product_type product_type_enum NOT NULL,
    document_name VARCHAR(250) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    document_type VARCHAR(50), -- manual, certificate, diagram, etc.
    file_size_kb INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_brand_id ON bgclima.products(brand_id);
CREATE INDEX idx_products_category_id ON bgclima.products(category_id);
CREATE INDEX idx_products_product_type ON bgclima.products(product_type);
CREATE INDEX idx_product_images_product ON bgclima.product_images(product_id, product_type);
CREATE INDEX idx_product_specs_product ON bgclima.product_specifications(product_id, product_type);
CREATE INDEX idx_product_features_product ON bgclima.product_features(product_id, product_type);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_brands_modtime
BEFORE UPDATE ON bgclima.brands
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_product_categories_modtime
BEFORE UPDATE ON bgclima.product_categories
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON bgclima.products
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_air_conditioners_modtime
BEFORE UPDATE ON bgclima.air_conditioners
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_heat_pumps_modtime
BEFORE UPDATE ON bgclima.heat_pumps
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Create a function to generate SKU
CREATE OR REPLACE FUNCTION generate_sku(product_type_code CHAR(2), brand_code CHAR(3), model_name TEXT)
RETURNS VARCHAR(50) AS $$
DECLARE
    clean_model TEXT;
    sku_base TEXT;
    counter INTEGER := 1;
    final_sku TEXT;
BEGIN
    -- Clean model name (remove special chars, spaces, etc.)
    clean_model := regexp_replace(upper(model_name), '[^A-Z0-9]', '', 'g');
    
    -- Take first 6 chars of cleaned model name
    clean_model := substring(clean_model from 1 for 6);
    
    -- Create base SKU
    sku_base := product_type_code || '-' || brand_code || '-' || clean_model;
    final_sku := sku_base;
    
    -- Check if SKU already exists and append counter if needed
    WHILE EXISTS (SELECT 1 FROM bgclima.products WHERE sku = final_sku) LOOP
        final_sku := sku_base || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_sku;
END;
$$ LANGUAGE plpgsql;

-- Create a function to insert a new product
CREATE OR REPLACE FUNCTION insert_product(
    p_product_type product_type_enum,
    p_brand_id INTEGER,
    p_category_id INTEGER,
    p_model_name VARCHAR(250),
    p_description TEXT,
    p_price DECIMAL(10, 2),
    p_promo_price DECIMAL(10, 2) DEFAULT NULL,
    p_meta_title VARCHAR(250) DEFAULT NULL,
    p_meta_description TEXT DEFAULT NULL
) 
RETURNS INTEGER AS $$
DECLARE
    v_product_id INTEGER;
    v_brand_code TEXT;
    v_sku TEXT;
BEGIN
    -- Get first 3 chars of brand name for SKU
    SELECT substring(upper(name) from 1 for 3) INTO v_brand_code 
    FROM bgclima.brands 
    WHERE id = p_brand_id;
    
    -- Generate SKU
    SELECT generate_sku(
        CASE 
            WHEN p_product_type = 'air_conditioner' THEN 'AC'
            WHEN p_product_type = 'heat_pump' THEN 'HP'
            -- No ventilation products
        END,
        v_brand_code,
        p_model_name
    ) INTO v_sku;
    
    -- Insert into products table
    INSERT INTO bgclima.products (
        product_type,
        brand_id,
        category_id,
        sku,
        name,
        short_description,
        price,
        promo_price,
        meta_title,
        meta_description,
        meta_keywords
    ) VALUES (
        p_product_type,
        p_brand_id,
        p_category_id,
        v_sku,
        p_model_name,
        p_description,
        p_price,
        p_promo_price,
        COALESCE(p_meta_title, p_model_name || ' - ' || (SELECT name FROM bgclima.brands WHERE id = p_brand_id)),
        COALESCE(p_meta_description, p_description),
        p_model_name || ', ' || (SELECT name FROM bgclima.brands WHERE id = p_brand_id) || ', климатик, инвертор, енергийна клас'
    ) RETURNING id INTO v_product_id;
    
    RETURN v_product_id;
END;
$$ LANGUAGE plpgsql;
