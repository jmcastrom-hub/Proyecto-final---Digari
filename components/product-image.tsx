import Image from 'next/image';

type Props = { productId: string; productName: string; className?: string; priority?: boolean };

/** One canonical mapping keeps catalog, cart, recommendations and study fallback aligned. */
export const productPhoto = (productId: string) => `/product-photos/${productId}.webp`;
const photoIds = new Set(['acustica-luz', 'electrica-bruma', 'bajo-marea', 'teclado-nube', 'ukelele-sol', 'flauta-rio', 'cable-pulso', 'cana-viento']);
export const hasProductPhoto = (productId: string) => photoIds.has(productId);
export const productImageSource = (productId: string) => hasProductPhoto(productId) ? productPhoto(productId) : `/products/${productId}.svg`;

export function ProductImage({ productId, productName, className = '', priority = false }: Props) {
  return <Image
    className={`product-image ${className}`.trim()}
    src={productImageSource(productId)}
    alt={hasProductPhoto(productId) ? `Fotografía de referencia de ${productName}` : `Ilustración de demostración de ${productName}; su fotografía está pendiente`}
    width={1200}
    height={800}
    sizes="(max-width: 700px) 92vw, (max-width: 1100px) 45vw, 30vw"
    loading={priority ? 'eager' : 'lazy'}
    decoding="async"
    fetchPriority={priority ? 'high' : 'auto'}
  />;
}
