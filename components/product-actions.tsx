'use client';

import { useState } from 'react';
import type { Product } from '@/lib/catalog';

type Line={productId:string;variant?:string;quantity:number};
export function ProductActions({product}:{product:Product}){const[variant,setVariant]=useState(product.variants[0]);const[message,setMessage]=useState('');
  function add(){try{const cart:Line[]=JSON.parse(localStorage.getItem('digari-cart')||'[]');const found=cart.find((item)=>item.productId===product.id&&item.variant===variant);if(found)found.quantity+=1;else cart.push({productId:product.id,variant,quantity:1});localStorage.setItem('digari-cart',JSON.stringify(cart));window.dispatchEvent(new Event('digari-cart-updated'));setMessage(`${product.name} (${variant}) agregado al carrito demo.`);}catch{setMessage('No se pudo actualizar el carrito de este navegador.');}}
  return <div className="product-actions"><label htmlFor="product-variant">{product.variantLabel||'Variante'}</label><select id="product-variant" value={variant} onChange={(e)=>setVariant(e.target.value)}>{product.variants.map((item)=><option key={item}>{item}</option>)}</select><button className="button full-width" disabled={product.stock<1} onClick={add}>Agregar al carrito demo</button>{message&&<p className="notice" role="status">{message}</p>}</div>;
}
