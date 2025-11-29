import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllArticleSlugs, getArticleBySlug } from '../../../../strapi';
import ArticleContent from '../../../components/ArticleContent';

type Props = {
  params: { slug: string; locale: 'en' | 'bm' };
};

export default async function ArticlePage({ params }: Props) {
  const { slug, locale } = params;
  const article = await getArticleBySlug(slug, locale);

  if (!article) {
    notFound();
  }

  return (
    <>
      <Link className="read-link" href={`/${locale}`}>
        ← Back to articles
      </Link>
      <ArticleContent article={article} />
    </>
  );
}

export async function generateStaticParams() {
  const locales: ('en' | 'bm')[] = ['en', 'bm'];

  const params = await Promise.all(
    locales.map(async (locale) => {
      const slugs = await getAllArticleSlugs(locale);
      return slugs.map(({ slug }) => ({
        slug,
        locale
      }));
    })
  );

  return params.flat();
}
