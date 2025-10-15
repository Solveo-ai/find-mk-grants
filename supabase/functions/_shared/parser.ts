import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export interface Grant {
   title: string;
   url: string;
   description?: string;
   deadline?: string;
   amount?: number;
   currency?: string;
   type?: string;
   tags?: string[];
}

export interface Source {
  url: string;
  parser_hint?: any;
}

const domainParsers: Record<string, (html: string, source: Source) => Grant[]> = {
  'biddetail.com': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Find all tender rows
    const tenderRows = document.querySelectorAll('.tender_row');
    for (const row of tenderRows) {
      const titleEl = row.querySelector('h2 a');
      const title = titleEl?.textContent?.trim();
      const url = titleEl?.getAttribute('href');

      const descEl = row.querySelector('.workDesc');
      const description = descEl?.textContent?.trim();

      const priceEl = row.querySelector('.price');
      const amountText = priceEl?.textContent?.replace(/[^\d,]/g, '').replace(',', '');
      const amount = amountText && amountText !== 'ReferDocument' ? parseFloat(amountText) : undefined;

      const deadlineEl = row.querySelector('.dd');
      const deadlineText = deadlineEl?.textContent?.replace('Closing Date', '').trim();
      let deadline: string | undefined;
      if (deadlineText && deadlineText !== 'Refer Document') {
        // Parse date like "14 Oct 2025"
        const dateMatch = deadlineText.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          const monthMap: Record<string, string> = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
            'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
          };
          deadline = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T00:00:00.000Z`;
        }
      }

      if (title && url) {
        grants.push({
          title,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          description,
          deadline,
          amount,
          currency: 'USD',
          type: 'tenders',
          tags: []
        });
      }
    }

    return grants;
  },
  'ceedhub.mk': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Look for the investment readiness program
    const programHeading = document.querySelector('h2.elementor-heading-title');
    if (programHeading && programHeading.textContent?.includes('INVESTMENT READINESS PROGRAM')) {
      const title = programHeading.textContent.trim();
      const descriptionEl = programHeading.closest('.elementor-element')?.nextElementSibling?.querySelector('.elementor-text-editor p');
      const description = descriptionEl?.textContent?.trim();

      grants.push({
        title,
        url: source.url,
        description,
        type: 'grants',
        tags: ['investment', 'startup', 'program']
      });
    }

    return grants;
  },
  'webalkans.eu': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Look for opportunity cards
    const opportunityCards = document.querySelectorAll('.umb-card, .opportunities-list__item');
    for (const card of opportunityCards) {
      const titleEl = card.querySelector('.umb-card__title, .opportunities-list__item__title');
      const title = titleEl?.textContent?.trim();
      
      const linkEl = card.querySelector('a[href]');
      const url = linkEl?.getAttribute('href');
      
      const descEl = card.querySelector('.umb-card__desc, .opportunities-list__item__description');
      const description = descEl?.textContent?.trim();

      // Extract deadline
      let deadline: string | undefined;
      const deadlineText = card.textContent;
      const dateMatch = deadlineText?.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        deadline = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T17:00:00.000Z`;
      }

      if (title && url) {
        grants.push({
          title,
          url: url.startsWith('http') ? url : new URL(url, 'https://webalkans.eu').href,
          description,
          deadline,
          type: 'grants',
          tags: ['eu-funding', 'western-balkans']
        });
      }
    }

    return grants;
  },
  'euro-access.eu': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // This is likely a SPA that loads content dynamically
    // Look for any funding opportunities in the static content
    const links = document.querySelectorAll('a[href*="funding"], a[href*="grant"], a[href*="call"]');
    for (const link of links) {
      const title = link.textContent?.trim();
      const url = link.getAttribute('href');
      
      if (title && url && title.length > 10) {
        grants.push({
          title,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          description: 'European funding opportunity',
          type: 'grants',
          tags: ['eu-funding']
        });
      }
    }

    return grants;
  },
  'eitfood.eu': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Look for blog posts and funding opportunities
    const cards = document.querySelectorAll('.card');
    for (const card of cards) {
      const titleEl = card.querySelector('h3 a');
      const title = titleEl?.textContent?.trim();
      const url = titleEl?.getAttribute('href');
      
      const descEl = card.querySelector('.redactor');
      const description = descEl?.textContent?.trim();

      if (title && url) {
        grants.push({
          title,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          description,
          type: 'grants',
          tags: ['food', 'innovation', 'research']
        });
      }
    }

    return grants;
  },
  'e-nabavki.gov.mk': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // This is an Angular SPA, so we look for any static tender information
    // The content is mostly loaded via JavaScript, but we can extract basic info
    if (html.includes('Јавни набавки') || html.includes('тендери')) {
      grants.push({
        title: 'Централен електронски регистар на јавни набавки',
        url: source.url,
        description: 'Платформа за јавни набавки и тендерски можности во Северна Македонија',
        type: 'tenders',
        tags: ['macedonia', 'public-procurement', 'tenders']
      });
    }

    return grants;
  },
  'impactventures.mk': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Look for venture capital and investment opportunities
    const sections = document.querySelectorAll('h2, .wpb_text_column');
    let foundInvestmentOpportunity = false;
    
    for (const section of sections) {
      const text = section.textContent?.toLowerCase();
      if (text?.includes('investment') || text?.includes('funding') || text?.includes('venture')) {
        foundInvestmentOpportunity = true;
        break;
      }
    }

    if (foundInvestmentOpportunity) {
      grants.push({
        title: 'Impact Ventures Investment Opportunities',
        url: source.url,
        description: 'Venture capital and investment opportunities for companies and entrepreneurs in Macedonia',
        type: 'private-funding',
        tags: ['venture-capital', 'investment', 'startups', 'macedonia']
      });
    }

    return grants;
  },
  'pcb.mk': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Look for banking and financing opportunities
    const menuItems = document.querySelectorAll('a[href*="kredit"], a[href*="credit"], a[href*="loan"]');
    for (const item of menuItems) {
      const title = item.textContent?.trim();
      const url = item.getAttribute('href');
      
      if (title && url && title.length > 5) {
        grants.push({
          title,
          url: url.startsWith('http') ? url : new URL(url, 'https://www.pcb.mk').href,
          description: 'Banking and financing services from ProCredit Bank',
          type: 'loans',
          tags: ['banking', 'loans', 'finance']
        });
      }
    }

    return grants;
  },
  'ec.europa.eu': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // This is typically a SPA, but we can look for static content
    // EU Funding & Tenders Portal content is mostly dynamic
    if (html.includes('funding') || html.includes('opportunities')) {
      grants.push({
        title: 'EU Funding & Tenders Portal',
        url: source.url,
        description: 'European Commission funding and tender opportunities',
        type: 'grants',
        tags: ['eu-funding', 'european-commission']
      });
    }

    return grants;
  },
  'tendersontime.com': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Look for tender listings - use correct selectors for the actual HTML structure
    const listingBoxes = document.querySelectorAll('.listingbox.mt10');
    for (const box of listingBoxes) {
      const titleEl = box.querySelector('a[href]');
      const title = titleEl?.textContent?.trim();
      const url = titleEl?.getAttribute('href');

      // Extract deadline from the box - look for deadline in p.list-data strong
      let deadline: string | undefined;
      const deadlineEl = box.querySelector('p.list-data strong');
      const deadlineText = deadlineEl?.textContent?.trim();
      if (deadlineText) {
        // Parse date like "24 Oct 2025"
        const dateMatch = deadlineText.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          const monthMap: Record<string, string> = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
            'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
          };
          deadline = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T00:00:00.000Z`;
        }
      }

      if (title && url && title.length > 10) {
        grants.push({
          title,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          description: 'Tender opportunity from Macedonia',
          deadline,
          type: 'tenders',
          tags: ['macedonia', 'tenders']
        });
      }
    }

    return grants;
  },
  'tenderimpulse.com': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Look for tender listings - use correct selectors for the actual HTML structure
    const tenderBoxes = document.querySelectorAll('.list-box.background-grey');
    for (const box of tenderBoxes) {
      const titleEl = box.querySelector('h2 a');
      const title = titleEl?.textContent?.trim();
      const url = titleEl?.getAttribute('href');

      // Extract deadline from the box - look for "Deadline :" text
      let deadline: string | undefined;
      const deadlineEls = box.querySelectorAll('p.list-sector');
      for (const el of deadlineEls) {
        const text = el.textContent?.trim();
        if (text && text.includes('Deadline :')) {
          const deadlineText = text.replace('Deadline :', '').trim();
          // Parse date like "11 Aug 2025"
          const dateMatch = deadlineText.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            const monthMap: Record<string, string> = {
              'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
              'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };
            deadline = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T00:00:00.000Z`;
          }
          break;
        }
      }

      if (title && url && title.length > 10) {
        grants.push({
          title,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          description: 'Macedonia tender opportunity',
          deadline,
          type: 'tenders',
          tags: ['macedonia', 'procurement']
        });
      }
    }

    return grants;
  },
  'tenderi.mk': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Look for tender listings in Macedonian portal
    const tenderElements = document.querySelectorAll('.tender, .announce, .post, article');
    for (const element of tenderElements) {
      const titleEl = element.querySelector('h1, h2, h3, .title, a');
      const title = titleEl?.textContent?.trim();
      const url = titleEl?.getAttribute('href');

      if (title && url && title.length > 5) {
        grants.push({
          title,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          description: 'Tender from Macedonian procurement portal',
          type: 'tenders',
          tags: ['macedonia', 'tenders', 'procurement']
        });
      }
    }

    return grants;
  },
  'slvesnik.com.mk': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Look for official gazette tender announcements
    const announcements = document.querySelectorAll('.announcement, .tender, tr, .document');
    for (const item of announcements) {
      const titleEl = item.querySelector('a, .title, td');
      const title = titleEl?.textContent?.trim();
      const url = item.querySelector('a')?.getAttribute('href');

      if (title && (title.includes('тендер') || title.includes('набавк') || title.includes('конкурс'))) {
        grants.push({
          title,
          url: url ? (url.startsWith('http') ? url : new URL(url, source.url).href) : source.url,
          description: 'Official gazette tender announcement',
          type: 'tenders',
          tags: ['macedonia', 'official', 'tenders']
        });
      }
    }

    return grants;
  },
  'redi-ngo.eu': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Look for NGO tender opportunities
    const tenderItems = document.querySelectorAll('.tender, .opportunity, .call, article');
    for (const item of tenderItems) {
      const titleEl = item.querySelector('h1, h2, h3, .title, a');
      const title = titleEl?.textContent?.trim();
      const url = item.querySelector('a')?.getAttribute('href');

      if (title && url && title.length > 10) {
        grants.push({
          title,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          description: 'NGO tender opportunity',
          type: 'tenders',
          tags: ['ngo', 'tenders', 'civil-society']
        });
      }
    }

    return grants;
  },
  'developmentaid.org': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // This site needs JavaScript, but look for any static content
    const tenderLinks = document.querySelectorAll('a[href*="tender"], a[href*="procurement"]');
    for (const link of tenderLinks) {
      const title = link.textContent?.trim();
      const url = link.getAttribute('href');
      
      if (title && url && title.length > 10) {
        grants.push({
          title,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          description: 'International development tender opportunity',
          type: 'tenders',
          tags: ['international', 'development', 'tenders']
        });
      }
    }

    return grants;
  },
  'eib.org': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Look for EIB loan products and financing opportunities
    const products = document.querySelectorAll('.product, .loan, .financing, article, .content-block');
    for (const product of products) {
      const titleEl = product.querySelector('h1, h2, h3, .title, a');
      const title = titleEl?.textContent?.trim();
      const url = product.querySelector('a')?.getAttribute('href');

      if (title && (title.toLowerCase().includes('loan') || title.toLowerCase().includes('financ'))) {
        grants.push({
          title,
          url: url ? (url.startsWith('http') ? url : new URL(url, source.url).href) : source.url,
          description: 'European Investment Bank financing opportunity',
          type: 'loans',
          tags: ['eib', 'loans', 'financing', 'europe']
        });
      }
    }

    return grants;
  },
  'ebrdgeff.com': (html: string, source: Source) => {
   const { document } = new DOMParser().parseFromString(html, 'text/html');
   if (!document) return [];

   const grants: Grant[] = [];

   // Look for news posts and case studies that contain funding opportunities
   const newsPosts = document.querySelectorAll('.news-post');
   for (const post of newsPosts) {
     const linkEl = post.querySelector('a[href]');
     const titleEl = post.querySelector('h2');
     const title = titleEl?.textContent?.trim();
     const url = linkEl?.getAttribute('href');

     // Extract date
     let deadline: string | undefined;
     const dateEl = post.querySelector('.date');
     const dateText = dateEl?.textContent?.trim();
     if (dateText) {
       // Parse date like "18 Feb 2022"
       const dateMatch = dateText.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
       if (dateMatch) {
         const [, day, month, year] = dateMatch;
         const monthMap: Record<string, string> = {
           'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
           'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
         };
         deadline = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T00:00:00.000Z`;
       }
     }

     if (title && url && title.length > 10) {
       grants.push({
         title,
         url: url.startsWith('http') ? url : new URL(url, source.url).href,
         description: 'EBRD Green Economy Financing Facility opportunity',
         deadline,
         type: 'loans',
         tags: ['ebrd', 'green-finance', 'sustainable']
       });
     }
   }

   return grants;
 },
  'ausschreibungen.giz.de': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // GIZ procurement platform
    const tenders = document.querySelectorAll('.tender, .ausschreibung, .procurement, tr, .row');
    for (const tender of tenders) {
      const titleEl = tender.querySelector('.title, a, td');
      const title = titleEl?.textContent?.trim();
      const url = tender.querySelector('a')?.getAttribute('href');

      if (title && title.length > 10) {
        grants.push({
          title,
          url: url ? (url.startsWith('http') ? url : new URL(url, source.url).href) : source.url,
          description: 'GIZ procurement opportunity',
          type: 'tenders',
          tags: ['giz', 'procurement', 'international']
        });
      }
    }

    return grants;
  },
  'procurement-notices.undp.org': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // UNDP procurement notices
    const notices = document.querySelectorAll('.notice, .procurement, .tender, tr, article');
    for (const notice of notices) {
      const titleEl = notice.querySelector('.title, a, h1, h2, h3');
      const title = titleEl?.textContent?.trim();
      const url = notice.querySelector('a')?.getAttribute('href');

      if (title && title.length > 10) {
        grants.push({
          title,
          url: url ? (url.startsWith('http') ? url : new URL(url, source.url).href) : source.url,
          description: 'UNDP procurement opportunity',
          type: 'tenders',
          tags: ['undp', 'procurement', 'international']
        });
      }
    }

    return grants;
  },
  'mtsp.gov.mk': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];
    const content = document.querySelector('.full-article');
    if (!content) return grants;

    const text = content.textContent || '';
    const links = content.querySelectorAll('a[href]');

    // Extract IPA program information
    if (text.includes('ИПА') || text.includes('IPA')) {
      for (const link of links) {
        const href = link.getAttribute('href');
        const linkText = link.textContent?.trim() || '';

        if (href && (href.includes('.pdf') || href.includes('content/pdf'))) {
          const url = href.startsWith('http') ? href : `https://mtsp.gov.mk${href}`;

          grants.push({
            title: linkText || 'MTSP IPA Program Document',
            url,
            description: `IPA program document from Ministry of Labor and Social Policy: ${linkText}`,
            type: 'grants',
            tags: ['ipa', 'eu-funding', 'social-policy', 'macedonia']
          });
        }
      }

      // Extract program amounts and descriptions
      const amountMatches = text.match(/(\d+(?:\.\d+)?)\s*(мил\.?\s*еура?|€|EUR)/gi);
      if (amountMatches && amountMatches.length > 0) {
        grants.push({
          title: 'MTSP IPA Program Funding',
          url: source.url,
          description: `EU IPA funding program for social policy: ${text.substring(0, 200)}...`,
          amount: parseFloat(amountMatches[0].replace(/[^\d.]/g, '')),
          currency: 'EUR',
          type: 'grants',
          tags: ['ipa', 'eu-funding', 'social-policy', 'macedonia']
        });
      }
    }

    return grants;
  },
  'www.pcb.mk': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];
    const title = document.querySelector('title')?.textContent || '';
    const content = document.querySelector('.full-article') || document.body;

    if (!content) return grants;

    const text = content.textContent || '';

    // Check for entrepreneur packages
    if (title.includes('млади претприемачи') || title.includes('жени претприемачи') ||
        text.includes('Youth in Business') || text.includes('Women in Business')) {

      grants.push({
        title: title.replace('ProCredit Bank - ', ''),
        url: source.url,
        description: `ProCredit Bank entrepreneur financing package: ${text.substring(0, 300)}...`,
        type: 'loans',
        tags: ['banking', 'entrepreneurship', 'loans', 'macedonia']
      });
    }

    return grants;
  },
  'na.org.mk': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];
    const title = document.querySelector('title')?.textContent || '';
    const content = document.body;

    if (!content) return grants;

    const text = content.textContent || '';
    const links = content.querySelectorAll('a[href]');

    // Check for Erasmus+ and EU educational programs
    if (text.includes('Erasmus') || text.includes('Еразмус') ||
        text.includes('European Solidarity Corps') || text.includes('Европски солидарен корпус')) {

      for (const link of links) {
        const href = link.getAttribute('href');
        const linkText = link.textContent?.trim() || '';

        if (href && (linkText.toLowerCase().includes('erasmus') ||
            linkText.toLowerCase().includes('еразмус') ||
            linkText.toLowerCase().includes('program') ||
            linkText.toLowerCase().includes('програм'))) {

          const url = href.startsWith('http') ? href : `https://na.org.mk${href}`;

          grants.push({
            title: linkText || 'Erasmus+ Program Opportunity',
            url,
            description: `EU educational program opportunity: ${linkText}`,
            type: 'grants',
            tags: ['erasmus', 'education', 'eu-funding', 'macedonia']
          });
        }
      }

      // Add general Erasmus+ program entry
      if (grants.length === 0) {
        grants.push({
          title: 'Erasmus+ Programs in North Macedonia',
          url: source.url,
          description: 'EU-funded educational and youth programs including mobility, partnerships, and capacity building',
          type: 'grants',
          tags: ['erasmus', 'education', 'youth', 'eu-funding', 'macedonia']
        });
      }
    }

    return grants;
  },
  'generic': (html: string, source: Source) => {
    const { document } = new DOMParser().parseFromString(html, 'text/html');
    if (!document) return [];

    const grants: Grant[] = [];

    // Enhanced generic parser: look for funding-related content
    const fundingKeywords = ['grant', 'funding', 'финансирање', 'грант', 'кредит', 'tender', 'тендер', 'набавк', 'конкурс', 'повик', 'investment', 'loan', 'call', 'opportunity', 'scholarship', 'стипендии'];
    
    // Look for content that contains funding keywords
    const elements = document.querySelectorAll('a, h1, h2, h3, .title, .program, .opportunity, .call, article, .card, .post, .news, .event, .announcement, .funding, .grant');
    
    for (const element of elements) {
      const text = element.textContent?.toLowerCase() || '';
      const hasKeyword = fundingKeywords.some(keyword => text.includes(keyword.toLowerCase()));
      
      if (hasKeyword) {
        let title = element.textContent?.trim();
        let url = element.getAttribute('href');
        
        // If element is not a link, look for a link inside
        if (!url && element.tagName !== 'A') {
          const linkEl = element.querySelector('a');
          url = linkEl?.getAttribute('href');
          title = linkEl?.textContent?.trim() || title;
        }

        if (title && title.length > 10 && title.length < 200) {
          let finalUrl = source.url;
          if (url) {
            try {
              finalUrl = url.startsWith('http') ? url : new URL(url, source.url).href;
            } catch (e) {
              // Invalid URL, use source URL
              finalUrl = source.url;
            }
          }

          // Detect type based on keywords
          let type = 'grants';
          if (text.includes('tender') || text.includes('тендер') || text.includes('набавк') || text.includes('procurement')) {
            type = 'tenders';
          } else if (text.includes('loan') || text.includes('кредит') || text.includes('financing')) {
            type = 'loans';
          } else if (text.includes('investment') || text.includes('venture') || text.includes('equity')) {
            type = 'private-funding';
          }

          grants.push({
            title: title.substring(0, 150), // Limit title length
            url: finalUrl,
            description: `Funding opportunity from ${new URL(source.url).hostname}`,
            type,
            tags: ['funding-opportunity']
          });
        }
      }
    }

    // Remove duplicates based on title and URL
    const uniqueGrants = grants.filter((grant, index, self) =>
      index === self.findIndex(g => g.title === grant.title && g.url === grant.url)
    );

    return uniqueGrants.slice(0, 20); // Limit to 20 grants per source to avoid spam
  }
};

export function parseGrants(html: string, source: Source): Grant[] {
  try {
    const url = new URL(source.url);
    const hostname = url.hostname.replace('www.', '');

    // Use domain-specific parser if available, otherwise generic
    const parser = domainParsers[hostname] || domainParsers['generic'];

    let grants = parser(html, source);

    // Apply parser_hint overrides if provided
    if (source.parser_hint) {
      // For now, simple override example - can be extended
      if (source.parser_hint.currency) {
        grants = grants.map(g => ({ ...g, currency: source.parser_hint.currency }));
      }
    }

    return grants;
  } catch (error) {
    console.error('Error parsing grants:', error);
    return [];
  }
}

export function classifyGrantType(title: string, description?: string): string {
   const text = `${title} ${description || ''}`.toLowerCase();

   // Keywords for different types matching the Macedonian categories
   const typeKeywords = {
     'grants': ['grant', 'funding', 'research', 'innovation', 'scholarship', 'fellowship', 'stipend', 'award', 'residency', 'postdoctoral'],
     'tenders': ['tender', 'procurement', 'contract', 'bid', 'competition', 'call for proposals'],
     'private-funding': ['private', 'investment', 'venture', 'equity', 'fund', 'capital', 'investor'],
     'loans': ['loan', 'credit', 'financing', 'microfinance', 'borrow', 'interest']
   };

   for (const [type, keywords] of Object.entries(typeKeywords)) {
     if (keywords.some(keyword => text.includes(keyword))) {
       return type;
     }
   }

   return 'grants'; // Default to grants if no match
}

export function normalizeGrant(grant: Grant, source: Source): Omit<Grant, 'tags'> & { tags: string[]; type: string } {
   const type = grant.type || classifyGrantType(grant.title, grant.description);

   return {
     title: grant.title.trim(),
     url: grant.url,
     description: grant.description?.trim(),
     deadline: grant.deadline ? new Date(grant.deadline).toISOString() : undefined,
     amount: grant.amount,
     currency: grant.currency || 'USD',
     type,
     tags: grant.tags || []
   };
}

export async function computeContentHash(title: string, url: string, deadline?: string, sourceUrl?: string): Promise<string> {
  const data = `${title.toLowerCase()}${url.toLowerCase()}${deadline || ''}${sourceUrl || ''}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hash = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}