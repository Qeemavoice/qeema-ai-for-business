import { useEffect } from 'react';

export interface SeoFaq {
  question: string;
  answer: string;
}

interface SeoOptions {
  path: string;
  title: string;
  description: string;
  type?: 'website' | 'service';
  faqs?: SeoFaq[];
}

const productionOrigin = 'https://qeemavoice.com';

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function useSeo({ path, title, description, type = 'website', faqs = [] }: SeoOptions) {
  useEffect(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    document.title = title;

    const canonical = `${productionOrigin}${path}`;
    let canonicalElement = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.rel = 'canonical';
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.href = canonical;

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:locale', 'ar_AR');
    setMeta('property', 'og:site_name', 'قيمة');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    const isProduction = window.location.hostname === 'qeemavoice.com' || window.location.hostname === 'www.qeemavoice.com';
    setMeta('name', 'robots', isProduction ? 'index, follow, max-image-preview:large' : 'noindex, nofollow');

    const schema: Record<string, unknown>[] = [{
      '@context': 'https://schema.org',
      '@type': type === 'service' ? 'Service' : 'Organization',
      name: title,
      description,
      url: canonical,
      provider: type === 'service' ? { '@type': 'Organization', name: 'قيمة', url: productionOrigin } : undefined,
    }];

    if (faqs.length) {
      schema.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }

    let script = document.getElementById('qeema-public-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'qeema-public-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }, [path, title, description, type, faqs]);
}
