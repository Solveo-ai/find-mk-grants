const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function addNewSources() {
  const newSources = [
    {
      name: 'Министерство за економија - Јавни објави',
      description: 'Јавни објави и информации за економски развој',
      url: 'https://www.economy.gov.mk/mk-MK/javni-objavi'
    },
    {
      name: 'Министерство за економија - Секторски програми',
      description: 'Секторски програми и стратегии за економски развој',
      url: 'https://www.economy.gov.mk/mk-MK/dokumenti/sektorski-programi'
    },
    {
      name: 'КБ ЕИБ VII МСП Капитализирани претпријатија и зелена транзиција',
      description: 'ЕИБ финансирање за мали и средни претпријатија и зелена транзиција',
      url: 'https://kb.mk/eib-vii-msp-kapitalizirani-pretprijatija-i-zelena-tranzicija.nspx'
    },
    {
      name: 'Шпаркасе - Посебни програми за финансирање',
      description: 'Посебни банкарски програми за финансирање на бизниси',
      url: 'https://www.sparkasse.mk/mk/business-clients/finansiranje/posebni-programi-za-finansiranje'
    },
    {
      name: 'Шпаркасе - Инвестициски кредити и проекти',
      description: 'Инвестициски кредити и финансирање на проекти',
      url: 'https://www.sparkasse.mk/mk/business-clients/finansiranje/investiciski-krediti-proekti'
    },
    {
      name: 'Министерство за труд и социјална политика - Настани',
      description: 'Информации за настани и програми за социјална заштита',
      url: 'https://www.mzsv.gov.mk/Events.aspx?IdLanguage=1&IdRoot=1&News=3977'
    },
    {
      name: 'ИПАРД Платежна агенција',
      description: 'Платежна агенција за ИПАРД програмата во Северна Македонија',
      url: 'https://www.ipardpa.gov.mk/mk/Home/Index'
    },
    {
      name: 'Македонска банка за поддршка на развојот - Кредитна линија',
      description: 'Кредитни линии и финансиски производи за развој',
      url: 'https://www.mbdp.com.mk/mk/Products/KreditnaLinijaProizvod/16'
    }
  ];

  console.log('Adding new grant sources...');

  for (const source of newSources) {
    try {
      const { data, error } = await supabase
        .from('grant_sources')
        .insert(source)
        .select();

      if (error) {
        console.error(`Error adding ${source.name}:`, error.message);
      } else {
        console.log(`✅ Added: ${source.name}`);
      }
    } catch (err) {
      console.error(`Failed to add ${source.name}:`, err.message);
    }
  }

  console.log('Finished adding sources.');
}

addNewSources().catch(console.error);