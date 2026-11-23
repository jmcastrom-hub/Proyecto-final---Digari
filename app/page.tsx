import Link from 'next/link';

const categories = [
  { name: 'Instrumentos', note: 'Guitarras, bajos, teclas y vientos', href: '/tienda?category=Instrumentos', number: '01' },
  { name: 'Audio profesional', note: 'Micrófonos y parlantes', href: '/tienda?category=Audio%20profesional', number: '02' },
  { name: 'Home Studio', note: 'Monitoreo y grabación en casa', href: '/tienda?category=Home%20Studio', number: '03' },
  { name: 'DJ', note: 'Controladores para mezclar', href: '/tienda?category=DJ', number: '04' },
];

export default function HomePage() {
  return <>
    <section className="hero container"><div className="hero-copy"><span className="eyebrow">ELEGÍ TU PRÓXIMO SONIDO</span><h1>Tu música empieza con la elección correcta.</h1><p>Explorá equipos, compará opciones y encontrá una combinación que vaya con tu presupuesto y tu forma de tocar.</p><div className="hero-actions"><Link className="button" href="/tienda">Explorar catálogo <span aria-hidden="true">↗</span></Link><Link className="button button-outline" href="/asesoria">Pedir recomendación</Link><Link className="button button-outline" href="/servicios">Conocer servicios demo</Link></div><small>Un prototipo académico con catálogo sintético. Ninguna compra se procesa.</small></div><div className="hero-visual" aria-label="Ilustración original de una guitarra" role="img"><div className="sun-disc"/><div className="string-lines"/><div className="guitar-shape"><span/></div><span className="hero-stamp">BUEN<br/>SONIDO<br/><b>01 / 25</b></span><span className="hero-caption">HECHO PARA HACER MÚSICA</span></div></section>
    <section className="promise-band"><div className="container promise-grid"><span>Asesoría a tu medida</span><span>Compatibilidad clara</span><span>Pedido y seguimiento demo</span><span>Sin cobros reales</span></div></section>
    <section className="container section-block"><div className="section-heading"><div><span className="eyebrow">ENCONTRÁ TU ESPACIO</span><h2>¿Qué querés explorar?</h2></div><Link className="text-button" href="/tienda">Ver todo el catálogo ↗</Link></div><div className="category-grid">{categories.map((item) => <Link href={item.href} className="category-tile" key={item.name}><span className="category-number">{item.number}</span><div><h3>{item.name}</h3><p>{item.note}</p></div><span className="arrow">↗</span></Link>)}</div></section>
    <section className="studio-promo"><div className="container promo-inner"><div><span className="eyebrow">PROBÁ ANTES DE DECIDIR</span><h2>Un estudio para imaginar cómo encaja.</h2><p>Giralo, explorá sus detalles y escuchá una muestra sintética. Todo con controles claros y sin instalar nada.</p><Link className="button button-light" href="/estudio">Entrar al estudio 3D</Link></div><div className="promo-disc" aria-hidden="true"><span>♪</span></div></div></section>
    <section className="container section-block service-strip"><div><span className="eyebrow">UN FLUJO SENCILLO</span><h2>De la idea al seguimiento.</h2></div><div className="steps"><div><span>01</span><b>Elegí</b><p>Buscá por uso, estilo y presupuesto.</p></div><div><span>02</span><b>Compará</b><p>Revisá compatibilidad y detalles.</p></div><div><span>03</span><b>Seguí</b><p>Probá el pedido y consultá su estado.</p></div></div></section>
    <section className="source-note container"><p><strong>Proyecto académico:</strong> los productos, precios, existencias y pedidos son datos ficticios. Para información original de la tienda, visitá <a href="https://www.digaricr.com/" target="_blank" rel="noreferrer">digaricr.com ↗</a>.</p></section>
  </>;
}
