import Link from 'next/link';
import Image from 'next/image';
import { Article } from '../../strapi';

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="card">
      {article.featuredImage?.url && (
        <Image
          src={article.featuredImage.url}
          alt={article.featuredImage.alt}
          width={article.featuredImage.width}
          height={article.featuredImage.height}
        />
      )}
      <div className="meta">
        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        {article.category && (
          <span className="pill">{article.category.name}</span>
        )}
      </div>
      <h3>{article.title}</h3>
      {article.excerpt && <p className="excerpt">{article.excerpt}</p>}
      <div className="meta">
        {article.author && (
          <span>
            By <strong>{article.author}</strong>
          </span>
        )}
        <span>{article.locale.toUpperCase()}</span>
      </div>
      <Link className="read-link" href={`/articles/${article.slug}`}>
        Read article →
      </Link>
    </article>
  );
}
