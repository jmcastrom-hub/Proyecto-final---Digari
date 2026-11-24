import Link from 'next/link';

const categories = [
  { name: 'Instrumentos', note: 'Guitarras, bajos, teclas y vientos', href: '/tienda?category=Instrumentos', number: '01' },
  { name: 'Audio profesional', note: 'Micrófonos y parlantes', href: '/tienda?category=Audio%20profesional', number: '02' },
  { name: 'Home Studio', note: 'Monitoreo y grabación en casa', href: '/tienda?category=Home%20Studio', number: '03' },
  { name: 'DJ', note: 'Controladores para mezclar', href: '/tienda?category=DJ', number: '04' },
];

export default function HomePage() {
  return <>
    <section className="hero-studio">
      <div className="hero-studio-image" role="img" aria-label="Estudio íntimo de grabación con una guitarra acústica" />
      <div className="hero-studio-shade" />
      <div className="container hero-studio-copy"><span className="eyebrow">DIGARI STUDIO / EQUIPO CON INTENCIÓN</span><h1>Encontrá el sonido que ya imaginás.</h1><p>Un espacio para explorar instrumentos y audio, comparar con calma y elegir según tu presupuesto, tu música y tu forma de tocar.</p><div className="hero-actions"><Link className="button" href="/tienda">Explorar el catálogo <span aria-hidden="true">↗</span></Link><Link className="button button-outline" href="/asesoria">Pedir una recomendación</Link></div><small>Prototipo académico. Productos, precios, existencias y pedidos de demostración.</small></div>
      <span className="hero-caption">ESTUDIO / SAN JOSÉ · SESIÓN 01</span>
    </section>
    <section className="promise-band"><div className="container promise-grid"><span>Asesoría según tu presupuesto</span><span>Compatibilidad visible</span><span>Pedido y seguimiento demo</span><span>Sin cobros reales</span></div></section>
    <section className="container section-block"><div className="section-heading"><div><span className="eyebrow">ENCONTRÁ TU ESPACIO</span><h2>¿Qué querés explorar?</h2></div><Link className="text-button" href="/tienda">Ver todo el catálogo ↗</Link></div><div className="category-grid">{categories.map((item) => <Link href={item.href} className="category-tile" key={item.name}><span className="category-number">{item.number}</span><div><h3>{item.name}</h3><p>{item.note}</p></div><span className="arrow">↗</span></Link>)}</div></section>
    <section className="studio-promo"><div className="container promo-inner"><div><span className="eyebrow">PROBÁ ANTES DE DECIDIR</span><h2>Un estudio para imaginar cómo encaja.</h2><p>Explorá modelos 3D ilustrativos y escuchá simulaciones sintéticas con controles claros.</p><Link className="button button-light" href="/estudio">Entrar al estudio 3D</Link></div><div className="promo-disc" aria-hidden="true"><span>♫</span></div></div></section>
    <section className="container section-block service-strip"><div><span className="eyebrow">UN FLUJO SENCILLO</span><h2>De la idea al seguimiento.</h2></div><div className="steps"><div><span>01</span><b>Elegí</b><p>Buscá por uso, estilo y presupuesto.</p></div><div><span>02</span><b>Compará</b><p>Revisá compatibilidad y detalles.</p></div><div><span>03</span><b>Seguí</b><p>Probá el pedido y consultá su estado.</p></div></div></section>
    <section className="source-note container"><p><strong>Proyecto académico:</strong> los productos, precios, existencias y pedidos son ficticios. Para información original de la tienda, visitá <a href="https://www.digaricr.com/" target="_blank" rel="noreferrer">digaricr.com ↗</a>.</p></section>
  </>;
}
