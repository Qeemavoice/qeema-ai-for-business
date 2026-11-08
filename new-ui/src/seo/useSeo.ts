import { useEffect } from 'react';
import { BASE_SITE_URL, DEFAULT_OG_IMAGE, SeoConfigItem } from './seoConfig';

function setMetaTag(attributeName: string, attributeValue: string, content: string) {
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonicalTag(url: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

function setJsonLdScript(data: object | object[]) {
  let script = document.getElementById('qeema-schema-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'qeema-schema-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

export function useSeo(config: SeoConfigItem) {
  useEffect(() => {
    // 1. Language & Direction
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';

    // 2. Title
    if (config.title) {
      document.title = config.title;
    }

    // 3. Meta Description (Strictly never empty)
    const description = config.description && config.description.trim().length > 0 
      ? config.description 
      : 'قيمة فويس: المنصة العربية المتكاملة للأصوات البشرية والذكاء الاصطناعي الصوتي المرخص للشركات وصناع المحتوى.';
    setMetaTag('name', 'description', description);
    if (config.keywords?.trim()) setMetaTag('name', 'keywords', config.keywords.trim());
    else document.querySelector('meta[name="keywords"]')?.remove();

    // 4. Canonical URL logic
    // Always https://qeemavoice.com + path, without query EXCEPT ?category= on /ar/voices
    let canonicalPath = config.path.startsWith('/') ? config.path : `/${config.path}`;
    let categoryParam = '';
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (canonicalPath === '/ar/voices' && searchParams.has('category')) {
        const cat = searchParams.get('category');
        if (cat) {
          categoryParam = `?category=${encodeURIComponent(cat)}`;
        }
      }
    }
    const fullCanonicalUrl = `${BASE_SITE_URL}${canonicalPath}${categoryParam}`;
    setCanonicalTag(fullCanonicalUrl);

    // 5. OpenGraph Tags
    const ogTitle = config.title;
    const ogDescription = description;
    const ogType = config.ogType || 'website';
    const ogImage = config.ogImage || DEFAULT_OG_IMAGE;

    setMetaTag('property', 'og:title', ogTitle);
    setMetaTag('property', 'og:description', ogDescription);
    setMetaTag('property', 'og:url', fullCanonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:locale', 'ar_AR');
    setMetaTag('property', 'og:site_name', 'قيمة فويس');

    // 6. Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', ogTitle);
    setMetaTag('name', 'twitter:description', ogDescription);
    setMetaTag('name', 'twitter:image', ogImage);

    // 7. Robots (Critical Preview Protection)
    // If not qeemavoice.com, enforce noindex, nofollow everywhere to avoid duplicate staging indexing!
    const isProdHost = typeof window !== 'undefined' && window.location.hostname === 'qeemavoice.com';
    if (!isProdHost || config.noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }

    // 8. JSON-LD Structured Data
    const schemas: any[] = [];

    // Home schema
    if (config.path === '/ar' || config.jsonLdType === 'Organization') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'قيمة فويس',
        'alternateName': 'Qeemavoice',
        'url': BASE_SITE_URL,
        'logo': `${BASE_SITE_URL}/assets/logo.png`,
        'description': 'منصة التعليق الصوتي العربي المتكاملة التي تجمع نخبة من المعلقين المحترفين بكل اللهجات مع تقنيات الذكاء الاصطناعي الأخلاقي المرخص.',
        'sameAs': [
          'https://twitter.com/qeemavoice',
          'https://linkedin.com/company/qeemavoice',
          'https://instagram.com/qeemavoice'
        ]
      });
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'قيمة فويس',
        'url': BASE_SITE_URL,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${BASE_SITE_URL}/ar/voices?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      });
    }

    // Breadcrumbs Schema for all internal pages
    if (config.breadcrumbs && config.breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': config.breadcrumbs.map((b, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': b.name,
          'item': b.item.startsWith('http') ? b.item : `${BASE_SITE_URL}${b.item}`
        }))
      });
    }

    // Service Schema for commercial and dialect pages
    if (config.jsonLdType === 'Service') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': config.h1 || config.title,
        'serviceType': config.serviceType || 'Voice Over Production',
        'description': description,
        'provider': {
          '@type': 'Organization',
          'name': 'قيمة فويس',
          'url': BASE_SITE_URL
        },
        'areaServed': [
          { '@type': 'Country', 'name': 'Saudi Arabia', 'identifier': 'SA' },
          { '@type': 'Country', 'name': 'United Arab Emirates', 'identifier': 'AE' },
          { '@type': 'Country', 'name': 'Qatar', 'identifier': 'QA' },
          { '@type': 'Country', 'name': 'Kuwait', 'identifier': 'KW' },
          { '@type': 'Country', 'name': 'Egypt', 'identifier': 'EG' },
          { '@type': 'Country', 'name': 'Palestine', 'identifier': 'PS' }
        ]
      });
    }

    // FAQPage Schema
    if (config.faqs && config.faqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': config.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      });
    }

    if (schemas.length > 0) {
      setJsonLdScript(schemas.length === 1 ? schemas[0] : schemas);
    }
  }, [config.path, config.title, config.description, config.h1, config.noindex, config.keywords]);
}
