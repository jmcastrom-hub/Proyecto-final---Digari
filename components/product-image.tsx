import Image from 'next/image';

type Props = { productId: string; productName: string; className?: string; priority?: boolean };

export function ProductImage({ productId, productName, className = '', priority = false }: Props) {
  return <Image className={`product-image ${className}`.trim()} src={`/products/${productId}.svg`} alt={`Ilustración demo de ${productName}; no es una foto del modelo exacto`} width={960} height={640} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'} unoptimized />;
}
