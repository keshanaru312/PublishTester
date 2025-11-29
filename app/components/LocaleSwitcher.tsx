'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function buildHref(pathname: string, targetLocale: 'en' | 'bm') {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return `/${targetLocale}`;
  }

  // Replace leading locale segment; if missing, prepend
  if (segments[0] === 'en' || segments[0] === 'bm') {
    segments[0] = targetLocale;
  } else {
    segments.unshift(targetLocale);
  }

  return `/${segments.join('/')}`;
}

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const currentLocale = pathname.split('/').filter(Boolean)[0] === 'bm' ? 'bm' : 'en';

  return (
    <div className="locale-switch">
      {(['en', 'bm'] as const).map((locale) => (
        <Link
          key={locale}
          href={buildHref(pathname, locale)}
          className={`pill ${locale === currentLocale ? 'pill-active' : ''}`}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
