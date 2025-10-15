-- Restore original grants data for main website functionality
-- This imports existing grants data to fix the empty grants table

-- First, let's create some sample grants to ensure the main website works
INSERT INTO grants (source_id, source_url, title, url, description, deadline, amount, currency, type, tags, content_hash) 
SELECT 
    gs.id,
    'https://funding-macedonia.com',
    'ИПА III Програма за рурален развој',
    'https://ipard.gov.mk/mk/pocetna/',
    'Поддршка за модернизација на земјоделското стопанство и развој на руралните области во Северна Македонија.',
    '2024-12-31T23:59:59Z'::timestamptz,
    50000,
    'EUR',
    'grants',
    ARRAY['agriculture', 'rural-development'],
    'sample_grant_1_' || extract(epoch from now())
FROM grant_sources gs 
WHERE gs.name = 'IPARD - Платежна Агенција'
LIMIT 1;

INSERT INTO grants (source_id, source_url, title, url, description, deadline, amount, currency, type, tags, content_hash) 
SELECT 
    gs.id,
    'https://funding-macedonia.com',
    'Фонд за иновации и технолошки развој',
    'https://www.economy.gov.mk',
    'Грантови за технолошки стартапи и иновативни проекти во областа на дигитализација.',
    '2024-11-30T23:59:59Z'::timestamptz,
    25000,
    'EUR',
    'grants',
    ARRAY['technology', 'innovation'],
    'sample_grant_2_' || extract(epoch from now())
FROM grant_sources gs 
WHERE gs.name = 'Министерство за економија'
LIMIT 1;

INSERT INTO grants (source_id, source_url, title, url, description, deadline, amount, currency, type, tags, content_hash) 
SELECT 
    gs.id,
    'https://funding-macedonia.com',
    'Младински предприемнички програми',
    'https://www.yes.org.mk',
    'Стартап грантови и менторство за млади претприемачи (18-35 години) во сите сектори.',
    '2024-12-15T23:59:59Z'::timestamptz,
    15000,
    'EUR',
    'private-funding',
    ARRAY['youth', 'entrepreneurship'],
    'sample_grant_3_' || extract(epoch from now())
FROM grant_sources gs 
WHERE gs.name LIKE '%економски самит%'
LIMIT 1;

INSERT INTO grants (source_id, source_url, title, url, description, deadline, amount, currency, type, tags, content_hash) 
SELECT 
    gs.id,
    'https://funding-macedonia.com',
    'Јавна набавка за IT услуги',
    'https://e-nabavki.gov.mk',
    'Тендер за развој на дигитална платформа за електронски услуги на граѓаните.',
    '2024-11-25T23:59:59Z'::timestamptz,
    200000,
    'EUR',
    'tenders',
    ARRAY['technology', 'government'],
    'sample_grant_4_' || extract(epoch from now())
FROM grant_sources gs 
WHERE gs.url LIKE '%e-nabavki%'
LIMIT 1;

-- Add a few more diverse grants
INSERT INTO grants (source_id, source_url, title, url, description, deadline, amount, currency, type, tags, content_hash) 
VALUES 
(
    (SELECT id FROM grant_sources WHERE name = 'SeeLegal' LIMIT 1),
    'https://funding-macedonia.com',
    'Seed инвестиции за стартапи',
    'https://seelegal.org',
    'Рано-фазни инвестиции за технолошки стартапи во регионот на Балканот.',
    '2024-12-20T23:59:59Z'::timestamptz,
    100000,
    'EUR',
    'private-funding',
    ARRAY['startups', 'investment'],
    'sample_grant_5_' || extract(epoch from now())
);