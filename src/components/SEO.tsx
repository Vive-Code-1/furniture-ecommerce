import { Helmet } from "react-helmet-async";

const SITE_URL = "https://furniture-ecommerce.lovable.app";
const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/a7uxPWDUuQTJL38PxBQzg0idiRd2/social-images/social-1770596993181-Furniture_Ecommerce.png";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  /** Defaults to "website". Use "article" for blog posts, "product" for product pages. */
  ogType?: "website" | "article" | "product";
  /** Absolute URL. Defaults to the sitewide social image. */
  image?: string;
  /** Block this route from search engines (e.g. checkout, account). */
  noindex?: boolean;
  /** One or more JSON-LD objects to embed. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SEO = ({
  title,
  description,
  path,
  ogType = "website",
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
}: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  const schemas = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
