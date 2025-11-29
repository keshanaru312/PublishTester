import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllArticleSlugs, getArticleBySlug } from '../../../strapi';
import ArticleContent from '../../components/ArticleContent';

type Props = {
  params: { slug: string };
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <Link className="read-link" href="/">
        ← Back to articles
      </Link>
      <ArticleContent article={article} />
    </>
  );
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();

  return slugs.map(({ slug }) => ({
    slug
  }));
}
