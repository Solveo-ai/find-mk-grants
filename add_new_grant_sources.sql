-- Add new grant sources to the system
INSERT INTO grant_sources (name, description, url) VALUES
-- Ministry of Economy additional pages
('Министерство за економија - Јавни објави', 'Јавни објави и информации за економски развој', 'https://www.economy.gov.mk/mk-MK/javni-objavi'),
('Министерство за економија - Секторски програми', 'Секторски програми и стратегии за економски развој', 'https://www.economy.gov.mk/mk-MK/dokumenti/sektorski-programi'),

-- Komercijalna Banka - EIB programs
('КБ ЕИБ VII МСП Капитализирани претпријатија и зелена транзиција', 'ЕИБ финансирање за мали и средни претпријатија и зелена транзиција', 'https://kb.mk/eib-vii-msp-kapitalizirani-pretprijatija-i-zelena-tranzicija.nspx'),

-- Sparkasse Bank programs
('Шпаркасе - Посебни програми за финансирање', 'Посебни банкарски програми за финансирање на бизниси', 'https://www.sparkasse.mk/mk/business-clients/finansiranje/posebni-programi-za-finansiranje'),
('Шпаркасе - Инвестициски кредити и проекти', 'Инвестициски кредити и финансирање на проекти', 'https://www.sparkasse.mk/mk/business-clients/finansiranje/investiciski-krediti-proekti'),

-- Ministry of Labor and Social Policy
('Министерство за труд и социјална политика - Настани', 'Информации за настани и програми за социјална заштита', 'https://www.mzsv.gov.mk/Events.aspx?IdLanguage=1&IdRoot=1&News=3977'),

-- IPARD Paying Agency
('ИПАРД Платежна агенција', 'Платежна агенција за ИПАРД програмата во Северна Македонија', 'https://www.ipardpa.gov.mk/mk/Home/Index'),

-- Macedonian Bank for Development Promotion
('Македонска банка за поддршка на развојот - Кредитна линија', 'Кредитни линии и финансиски производи за развој', 'https://www.mbdp.com.mk/mk/Products/KreditnaLinijaProizvod/16');