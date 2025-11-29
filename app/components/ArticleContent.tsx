import Image from 'next/image';
import { Article } from '../../strapi';

export default function ArticleContent({ article }: { article: Article }) {
  return (
    <article className="detail">
      <div className="detail-hero">
        <div className="meta">
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          {article.author && (
            <span>
              By <strong>{article.author}</strong>
            </span>
          )}
          {article.category && <span className="pill">{article.category.name}</span>}
        </div>
        <h1 className="hero-title">{article.title}</h1>
        {article.featuredImage?.url && (
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.alt}
            width={article.featuredImage.width}
            height={article.featuredImage.height}
          />
        )}
      </div>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: article.content || article.excerpt || '' }}
      />
    </article>
  );
}
