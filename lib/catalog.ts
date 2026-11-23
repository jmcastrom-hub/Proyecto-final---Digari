export type Product = {
  id: string;
  name: string;
  family: string;
  category: string;
  priceCrc: number;
  stock: number;
  style: string[];
  compatible: string[];
  summary: string;
  variantLabel?: string;
  variants: string[];
  visual: string;
  icon: string;
};

export const products: Product[] = [
  { id: 'acustica-luz', name: 'Guitarra acústica Luz 39″', family: 'Guitarra acústica', category: 'Instrumentos', priceCrc: 74900, stock: 4, style: ['pop', 'folk'], compatible: ['principiante', 'cuerdas de acero'], summary: 'Tamaño cómodo para práctica y acompañamiento.', variantLabel: 'Color', variants: ['Natural', 'Sunburst'], visual: 'linear-gradient(145deg,#e8c99e,#926849)', icon: '♬' },
  { id: 'electrica-bruma', name: 'Guitarra eléctrica Bruma S', family: 'Guitarra eléctrica', category: 'Instrumentos', priceCrc: 169900, stock: 3, style: ['rock', 'indie'], compatible: ['amplificador de guitarra', 'cable ¼″'], summary: 'Formato sólido ilustrativo para explorar tonos eléctricos.', variantLabel: 'Color', variants: ['Negro', 'Marfil'], visual: 'linear-gradient(145deg,#a6b0ba,#343e4c)', icon: '♫' },
  { id: 'bajo-marea', name: 'Bajo eléctrico Marea 4', family: 'Bajo', category: 'Instrumentos', priceCrc: 158000, stock: 2, style: ['funk', 'rock'], compatible: ['amplificador de bajo', 'cable ¼″'], summary: 'Bajo de cuatro cuerdas, modelo de demostración.', variantLabel: 'Color', variants: ['Azul', 'Negro'], visual: 'linear-gradient(145deg,#85a9b5,#294653)', icon: '𝄢' },
  { id: 'teclado-nube', name: 'Teclado portátil Nube 61', family: 'Teclado', category: 'Instrumentos', priceCrc: 119000, stock: 5, style: ['pop', 'estudio'], compatible: ['adaptador 9V', 'audífonos'], summary: 'Teclas de tamaño estándar para práctica en casa.', variantLabel: 'Color', variants: ['Negro'], visual: 'linear-gradient(145deg,#616872,#222832)', icon: '▥' },
  { id: 'ukelele-sol', name: 'Ukelele soprano Sol', family: 'Ukelele', category: 'Instrumentos', priceCrc: 35900, stock: 6, style: ['folk', 'pop'], compatible: ['afinador clip'], summary: 'Tamaño soprano con cuatro cuerdas de nailon.', variantLabel: 'Color', variants: ['Miel', 'Azul cielo'], visual: 'linear-gradient(145deg,#eacb87,#a96337)', icon: '♫' },
  { id: 'flauta-rio', name: 'Flauta dulce Río', family: 'Viento', category: 'Instrumentos', priceCrc: 8900, stock: 8, style: ['clásico', 'educación'], compatible: ['limpieza para viento'], summary: 'Instrumento didáctico de viento, ficha sintética.', variantLabel: 'Afinación', variants: ['Do'], visual: 'linear-gradient(145deg,#e6e1d2,#899180)', icon: '♩' },
  { id: 'cuerdas-onda', name: 'Juego de cuerdas Onda 010', family: 'Cuerdas', category: 'Accesorios', priceCrc: 6900, stock: 12, style: ['rock', 'pop'], compatible: ['guitarra eléctrica escala estándar'], summary: 'Juego ilustrativo de seis cuerdas para guitarra eléctrica.', variantLabel: 'Calibre', variants: ['.010–.046'], visual: 'linear-gradient(145deg,#d9d6cb,#77766c)', icon: '〰' },
  { id: 'cable-pulso', name: 'Cable de instrumento Pulso 3 m', family: 'Cable', category: 'Accesorios', priceCrc: 8900, stock: 10, style: ['estudio', 'ensayo'], compatible: ['conector ¼″ TS', 'guitarra', 'bajo'], summary: 'Cable de instrumento con conectores de ¼ de pulgada.', variantLabel: 'Longitud', variants: ['3 m'], visual: 'linear-gradient(145deg,#4a5155,#252a2d)', icon: '⌁' },
  { id: 'cana-viento', name: 'Caña ilustrativa Viento 2.5', family: 'Caña', category: 'Accesorios', priceCrc: 4200, stock: 7, style: ['jazz', 'clásico'], compatible: ['saxofón alto'], summary: 'Accesorio demo compatible con saxofón alto.', variantLabel: 'Fuerza', variants: ['2.5'], visual: 'linear-gradient(145deg,#e8d5ac,#a27847)', icon: '♧' },
  { id: 'microfono-claro', name: 'Micrófono dinámico Claro', family: 'Micrófono', category: 'Audio profesional', priceCrc: 42900, stock: 4, style: ['voz', 'ensayo'], compatible: ['entrada XLR', 'cable XLR'], summary: 'Micrófono demo para voz y ensayos con conexión XLR.', variantLabel: 'Color', variants: ['Grafito'], visual: 'linear-gradient(145deg,#a5aaad,#42474a)', icon: '◉' },
  { id: 'monitor-alfar', name: 'Monitor de estudio Alfar 5″', family: 'Monitor', category: 'Home Studio', priceCrc: 82900, stock: 2, style: ['mezcla', 'estudio'], compatible: ['salida de línea', 'par estéreo'], summary: 'Monitor activo ilustrativo; precio por unidad demo.', variantLabel: 'Color', variants: ['Negro'], visual: 'linear-gradient(145deg,#737b80,#293036)', icon: '◉' },
  { id: 'parlante-brisa', name: 'Parlante activo Brisa 8″', family: 'Parlante', category: 'Audio profesional', priceCrc: 124900, stock: 3, style: ['eventos', 'voz'], compatible: ['entrada XLR', 'alimentación AC'], summary: 'Parlante activo sintético para explorar conexiones.', variantLabel: 'Color', variants: ['Negro'], visual: 'linear-gradient(145deg,#59626a,#1d2329)', icon: '◖' },
  { id: 'controlador-eco', name: 'Controlador DJ Eco 2', family: 'Controlador DJ', category: 'DJ', priceCrc: 149000, stock: 2, style: ['DJ', 'electrónica'], compatible: ['USB', 'software DJ compatible'], summary: 'Controlador compacto ilustrativo para práctica en casa.', variantLabel: 'Color', variants: ['Negro'], visual: 'linear-gradient(145deg,#626774,#252833)', icon: '⏵' },
  { id: 'audifonos-senda', name: 'Audífonos de monitoreo Senda', family: 'Audífonos', category: 'Home Studio', priceCrc: 28900, stock: 9, style: ['estudio', 'práctica'], compatible: ['salida 3.5 mm', 'adaptador 6.3 mm'], summary: 'Audífonos cerrados ilustrativos para escucha personal.', variantLabel: 'Color', variants: ['Negro'], visual: 'linear-gradient(145deg,#515965,#20252a)', icon: '◖' },
  { id: 'interfaz-faro', name: 'Interfaz de audio Faro 2×2', family: 'Interfaz', category: 'Home Studio', priceCrc: 97900, stock: 3, style: ['grabación', 'estudio'], compatible: ['USB-C', 'micrófono XLR'], summary: 'Interfaz demo de dos entradas para home studio.', variantLabel: 'Color', variants: ['Grafito'], visual: 'linear-gradient(145deg,#69757b,#252c31)', icon: '▣' },
];

export const families = [...new Set(products.map((product) => product.family))];
export function findProduct(id: string) { return products.find((product) => product.id === id); }
export function productSummary(product: Product) {
  return { id: product.id, name: product.name, family: product.family, priceCrc: product.priceCrc, quantity: 1 };
}
