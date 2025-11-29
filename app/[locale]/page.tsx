import Link from 'next/link';
import { getArticles } from '../../strapi';
import ArticleCard from '../components/ArticleCard';

type Props = {
  params: { locale: 'en' | 'bm' };
};

export default async function Home({ params }: Props) {
  const locale = params.locale;
  const { articles } = await getArticles(locale, { pageSize: 20 });

  return (
    <>
      <section className="hero">
        <div className="hero-card">
          <p className="pill">Fresh from Strapi</p>
          <h1 className="hero-title">Mobile-first articles for on-the-go readers</h1>
          <p className="hero-subtitle">
            Powered by Strapi Cloud and Next.js App Router. Browse the latest stories with a bold, readable layout.
          </p>
          <div className="filters">
            <span className="pill">Performance</span>
            <span className="pill">Headless CMS</span>
            <span className="pill">DX Focused</span>
          </div>
        </div>
        <div className="hero-card">
          <h3>Strapi connection</h3>
          <p className="hero-subtitle">
            Environment variables are already wired. Add entries in Strapi Cloud and they will flow here automatically.
          </p>
          <Link href={`/${locale}/articles/getting-started`} className="read-link">
            Try a sample slug →
          </Link>
        </div>
      </section>

      <section className="grid">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </section>
    </>
  );
}
