/**
 * Strapi API Client
 * Handles all communication with Strapi Cloud CMS
 */

import { marked } from 'marked';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

interface StrapiBlock {
  __component: string;
  id: number;
  body?: string;
  title?: string;
}

interface StrapiAuthor {
  id: number;
  documentId: string;
  name: string;
  email?: string;
  avatar?: StrapiImage;
}

interface StrapiLocalization {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  locale: string;
  publishedAt?: string;
}



interface StrapiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  locale?: string;
  localizations?: StrapiLocalization[];
}

interface StrapiArticleAttributes {
  title: string;
  slug: string;
  description?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  cover?: StrapiImage; // Direct object in v5
  author?: StrapiAuthor; // Direct object in v5
  blocks?: StrapiBlock[];
  locale?: string;
  localizations?: StrapiLocalization[];
  category?: StrapiCategory; // Category relation
}

interface StrapiArticle {
  id: number;
  documentId: string; // Strapi v5 uses documentId
  attributes?: StrapiArticleAttributes; // Attributes might be flattened
  // Flattened fields (Strapi v5)
  title?: string;
  slug?: string;
  description?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: string | StrapiAuthor;
  locale?: string;
  cover?: StrapiImage;
  blocks?: StrapiBlock[];
  localizations?: StrapiLocalization[];
  category?: StrapiCategory; // Category relation
}

interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
  locale: string;
  featuredImage?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  localizations?: {
    locale: string;
    slug: string;
  }[];

  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

/**
 * Fetch headers with optional authentication
 */
function getHeaders() {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  return headers;
}

/**
 * Transform Strapi article response to simplified format
 * Handles both Strapi v4 (nested attributes) and v5 (flattened) formats
 */
function transformArticle(strapiArticle: StrapiArticle): Article {
  // Check if using Strapi v5 flattened format or v4 nested format
  const data = strapiArticle.attributes || strapiArticle;

  const title = data.title || '';
  const slug = data.slug || '';
  const description = data.description || '';
  const publishedAt = data.publishedAt || new Date().toISOString();
  const createdAt = data.createdAt || new Date().toISOString();
  const updatedAt = data.updatedAt || new Date().toISOString();
  const locale = data.locale || 'en';

  // Extract content from blocks (for Strapi v5 with block system)
  let content = '';
  if (data.blocks && Array.isArray(data.blocks)) {
    const markdownContent = data.blocks
      .filter((block: StrapiBlock) => block.__component === 'shared.rich-text' && block.body)
      .map((block: StrapiBlock) => block.body)
      .join('\n\n');

    // Convert Markdown blocks to HTML
    content = marked.parse(markdownContent) as string;
  }

  // Handle rich text field directly stored on the entry (Strapi WYSIWYG returns HTML)
  if (!content && typeof (data as any).content === 'string') {
    content = (data as any).content;
  }

  // Some entries might use `body` as the rich text field name
  if (!content && typeof (data as any).body === 'string') {
    content = (data as any).body;
  }

  // Handle author - could be string or object
  const authorName = typeof data.author === 'string'
    ? data.author
    : data.author?.name || undefined;

  // Handle cover image (Strapi v5) or featuredImage (Strapi v4)
  const imageData = data.cover;

  return {
    id: strapiArticle.id,
    title,
    slug,
    content: content || description, // Fallback to description if no blocks
    excerpt: description,
    publishedAt,
    createdAt,
    updatedAt,
    author: authorName,
    locale,
    featuredImage: imageData
      ? {
        url: imageData.url.startsWith('http') ? imageData.url : `${STRAPI_URL}${imageData.url}`,
        alt: imageData.alternativeText || title,
        width: imageData.width,
        height: imageData.height,
      }
      : undefined,
    localizations: data.localizations?.map((loc: StrapiLocalization) => ({
      locale: loc.locale,
      slug: loc.slug,
    })),

    category: data.category ? {
      id: data.category.id,
      name: data.category.name,
      slug: data.category.slug,
    } : undefined,
  };
}

/**
 * Get all published articles for a specific language
 */
export async function getArticles(
  locale: 'en' | 'bm' = 'en',
  options?: {
    page?: number;
    pageSize?: number;
  }
): Promise<{ articles: Article[]; pagination?: StrapiResponse<StrapiArticle[]>['meta']['pagination'] }> {
  const { page = 1, pageSize = 10 } = options || {};

  try {
    const params = new URLSearchParams({
      'sort[0]': 'publishedAt:desc',
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
    });

    // Add populate fields individually
    params.append('populate[0]', 'cover');
    params.append('populate[1]', 'author');
    // params.append('populate[1]', 'author');
    params.append('populate[2]', 'category');

    // Map 'bm' to 'ms' for Strapi (Strapi uses 'ms' for Malay)
    const strapiLocale = locale === 'bm' ? 'ms' : locale;

    // Add locale parameter to fetch translated content
    params.append('locale', strapiLocale);

    const response = await fetch(`${STRAPI_URL}/api/articles?${params}`, {
      headers: getHeaders(),
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      // Log the URL and response for debugging
      console.error('Strapi API Error:', {
        url: `${STRAPI_URL}/api/articles?${params}`,
        status: response.status,
        statusText: response.statusText,
      });
      const errorBody = await response.text();
      console.error('Error body:', errorBody);
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }

    const data: StrapiResponse<StrapiArticle[]> = await response.json();

    return {
      articles: data.data.map(transformArticle),
      pagination: data.meta.pagination,
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { articles: [] };
  }
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string, locale: 'en' | 'bm' = 'en'): Promise<Article | null> {
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
    });

    // Add populate fields individually
    params.append('populate[0]', 'cover');
    params.append('populate[1]', 'author');
    params.append('populate[2]', 'blocks');
    params.append('populate[3]', 'localizations');
    params.append('populate[4]', 'category');

    // Map 'bm' to 'ms' for Strapi (Strapi uses 'ms' for Malay)
    const strapiLocale = locale === 'bm' ? 'ms' : locale;

    // Add locale parameter to fetch translated content
    params.append('locale', strapiLocale);

    const response = await fetch(`${STRAPI_URL}/api/articles?${params}`, {
      headers: getHeaders(),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    const data: StrapiResponse<StrapiArticle[]> = await response.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }

    return transformArticle(data.data[0]);
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }
}

/**
 * Get all article slugs for static generation
 */
export async function getAllArticleSlugs(): Promise<{ slug: string; locale: string }[]> {
  try {
    const allSlugs: { slug: string; locale: string }[] = [];

    const params = new URLSearchParams({
      'fields[0]': 'slug',
      'pagination[pageSize]': '100', // Get all articles
    });

    const response = await fetch(`${STRAPI_URL}/api/articles?${params}`, {
      headers: getHeaders(),
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (response.ok) {
      const data: StrapiResponse<StrapiArticle[]> = await response.json();
      allSlugs.push(...data.data.map((article) => ({
        slug: article.attributes?.slug || article.slug || '',
        locale: 'en', // Default to 'en' since i18n is not enabled yet
      })));
    }

    return allSlugs;
  } catch (error) {
    console.error('Error fetching article slugs:', error);
    return [];
  }
}
