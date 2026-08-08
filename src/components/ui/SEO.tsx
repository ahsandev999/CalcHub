import { Helmet } from 'react-helmet-async';

export interface BreadcrumbSchemaItem {
  name: string;
  path: string;
}

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  type?: string;
  image?: string;
  faqSchema?: { question: string; answer: string }[];
  breadcrumbSchema?: BreadcrumbSchemaItem[];
}

const SITE_URL = 'https://calccode.com';
const SITE_NAME = 'CalcHub';

export default function SEO({ title, description, path = '', type = 'website', image, faqSchema, breadcrumbSchema }: SEOProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === '/' || path === '' ? title : `${title} — ${SITE_NAME}`;
  const imageUrl = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : `${SITE_URL}/og-image.png`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    description,
    url: url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  const faqJsonLd = faqSchema && faqSchema.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqSchema.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null;

  const breadcrumbJsonLd = breadcrumbSchema && breadcrumbSchema.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbSchema.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  } : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      {faqJsonLd && (
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      )}
      {breadcrumbJsonLd && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      )}
    </Helmet>
  );
}

