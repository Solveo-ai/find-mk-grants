-- Restore the original grant sources data that the website depends on

INSERT INTO grant_sources (name, description, url, status) VALUES
('Zephyr Angels LinkedIn', 'Можности за финансирање и објави од Zephyr Angels на LinkedIn', 'https://www.linkedin.com/company/zephyr-angels/posts/?feedView=all', 'pending'),
('Impact Ventures', 'Венчур капитал и инвестициски можности во Северна Македонија', 'https://impactventures.mk/', 'pending'),
('Бизнис Ангели Македонија', 'Мрежа на бизнис ангели за стартапи во Македонија', 'http://biznisangeli.mk/', 'pending'),
('Министерство за економија', 'Владини грантови и програми за економски развој', 'https://www.economy.gov.mk', 'pending'),
('SeeLegal', 'Правна поддршка и финансирање за стартапи', 'seelegal.org', 'pending'),
('Euro-Access', 'Европски онлајн портал кој собира можности за финансирање од ЕУ програми', 'https://euro-access.eu/en', 'pending'),
('WeBalkans Можности', 'ЕУ-базиранa платформа која листа финансирање, стипендии и можности за организации и поединци од Западен Балкан', 'https://webalkans.eu/en/opportunities/', 'pending'),
('EBRD Green Economy Financing Facility (GEFF)', 'Иницијатива на ЕБРД за зелено финансирање и техничка поддршка во Северна Македонија', 'https://ebrdgeff.com/?country%5B%5D=36', 'pending'),
('ProCredit Bank - StartAPI', 'Банкарски пакет за поддршка на стартапи и претприемачи', 'https://www.pcb.mk/startapi.nspx', 'pending'),
('IPARD - Платежна Агенција', 'Инструмент за претпристапна помош за рурален развој во Северна Македонија', 'https://ipard.gov.mk/mk/pocetna/', 'pending')
ON CONFLICT (url) DO NOTHING;