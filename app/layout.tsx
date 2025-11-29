import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
});

export const metadata: Metadata = {
  title: 'PublishTester',
  description: 'Mobile-first article reader powered by Strapi Cloud'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        <div className="app-shell">
          <header className="app-header">
            <div className="brand">
              <span className="brand-mark">PT</span>
              <div className="brand-text">
                <p className="brand-name">PublishTester</p>
                <p className="brand-tagline">Articles from Strapi Cloud</p>
              </div>
            </div>
            <a className="cta" href="https://strapi.io" target="_blank" rel="noreferrer">
              Powered by Strapi
            </a>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            <p>Built for mobile-first reading. Updated from Strapi Cloud.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
