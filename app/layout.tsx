import type { Metadata } from 'next';
import './globals.css';
import './studio.css';
import './advice.css';
import './redesign.css';
import './product-images.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: { default: 'Digari Studio | Elegí tu próximo sonido', template: '%s | Digari Studio' },
  description: 'Prototipo académico de catálogo, asesoría y seguimiento para Digari Music Store. Datos y pedidos de demostración.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><a className="skip-link" href="#contenido">Saltar al contenido</a><SiteHeader /><main id="contenido">{children}</main><SiteFooter /></body></html>;
}
