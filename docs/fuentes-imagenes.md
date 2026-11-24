# Fotografías de producto y atribuciones

Las imágenes se obtuvieron de Wikimedia Commons y se transforman a WebP para el prototipo. Se conservan autor, fuente y licencia de cada archivo. La marca/modelo de la foto no implica que Digari tenga ese inventario; precios, existencias y pedidos siguen siendo datos de demostración. El visor 3D continúa siendo una representación procedural ilustrativa.

| ID | Producto identificado en la fuente | Foto, autor y licencia | Modificación |
|---|---|---|---|
| `acustica-luz` | Yamaha F310, guitarra acústica | [Archivo](https://commons.wikimedia.org/wiki/File:Yamaha_F310.jpg), Glama1, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Conversión WebP, lienzo neutro |
| `electrica-bruma` | Squier Affinity Strat, acabado rojo | [Archivo](https://commons.wikimedia.org/wiki/File:Squier_Affinity_Strat.jpg), Prog138, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Conversión WebP, lienzo neutro |
| `bajo-marea` | Ibanez GSR180 BS | [Archivo](https://commons.wikimedia.org/wiki/File:Bass_Ibanez_GSR180_BS_noBG.jpg), Auge=mit, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Conversión WebP, lienzo neutro |
| `teclado-nube` | Casio WK-1800, 76 teclas | [Archivo](https://commons.wikimedia.org/wiki/File:Casio_WK-1800_76-key_Keyboard.jpg), radiantradon, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Conversión WebP, lienzo neutro |
| `ukelele-sol` | Kala Makala, ukelele | [Archivo](https://commons.wikimedia.org/wiki/File:Red_Ukulele.JPG), Declan M. Martin, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Conversión WebP, lienzo neutro |
| `flauta-rio` | Yamaha YRS-24B y estuche | [Archivo](https://commons.wikimedia.org/wiki/File:Japanese_YAMAHA_Instruments_Recorders_1.JPG), RoxRox, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) y GFDL 1.2+ | Conversión WebP, lienzo neutro |
| `cuerdas-onda` | D’Addario EXL110-7 (juego de siete cuerdas) | [Archivo](https://commons.wikimedia.org/wiki/File:D%27Addario_EXL110-7_(9897215333).jpg), Mekkjp, Commons marca CC0, con aviso comunitario de licencia disputada | **No integrada** por disputa de licencia; buscar alternativa |
| `cable-pulso` | Tres cables de audio; se identifica un cable TS de 3 m, sin marca | [Archivo](https://commons.wikimedia.org/wiki/File:Audio_cables.jpg), Juliana Bastos Marques, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Conversión WebP, lienzo neutro |
| `cana-viento` | Cañas Vandoren para clarinete B♭, E♭ y A♭; fuerza no indicada | [Archivo](https://commons.wikimedia.org/wiki/File:B-flat_e-flat_a-flat_reeds.jpg), Michael Scott Cuthbert, [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/) | Conversión WebP, lienzo neutro |
| `microfono-claro` | Behringer C-1, condensador | [Archivo](https://commons.wikimedia.org/wiki/File:Behringer_C-1.jpg), LiquidMolly, [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | Fuente/licencia verificadas; archivo no descargado por HTTP 429 |
| `monitor-alfar` | PreSonus Eris E4.5 | [Archivo](https://commons.wikimedia.org/wiki/File:PreSonus_Eris_E4.5_HD_Active_Studio_Monitor_-_2014_NAMM_Show_(by_Matt_Vanacoro).jpg), Matt Vanacoro, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Fuente/licencia verificadas; archivo no descargado por HTTP 429 |
| `parlante-brisa` | Behringer Eurolive B212D | [Archivo](https://commons.wikimedia.org/wiki/File:Behringer_Eurolive_B212D_Loudspeaker.jpg), TaurusEmerald, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Fuente/licencia verificadas; archivo no descargado por HTTP 429 |
| `controlador-eco` | Numark Mixtrack Pro | [Archivo](https://commons.wikimedia.org/wiki/File:Numark_Mixtrack_Pro_DJ_Controller.jpg), Raidarmax, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Fuente/licencia verificadas; archivo no descargado por HTTP 429 |
| `audifonos-senda` | Audio-Technica ATH-M50 | [Archivo](https://commons.wikimedia.org/wiki/File:Audio_Technica_ATH-M50_Headphones.jpg), Fletcher6, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Fuente/licencia verificadas; archivo no descargado por HTTP 429 |
| `interfaz-faro` | M-Audio Fast Track Pro | [Archivo](https://commons.wikimedia.org/wiki/File:M-Audio_-_Fast_Track_Pro.jpg), Matthew Keefe, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Fuente/licencia verificadas; archivo no descargado por HTTP 429 |

## Verificación y alcance

- **8/15 fotografías descargadas y verificadas localmente** como WebP; siete fotos quedan pendientes, seis por HTTP 429 durante la descarga y una por disputa de licencia.
- Las 15 fichas conservan sus IDs estables. Los ocho WebP se sirven desde `public/product-photos/` mediante `ProductImage`.
- Las licencias con condición ShareAlike se deben respetar al distribuir o modificar las imágenes; la transformación de tamaño/color se atribuye como modificación.
- La licencia del archivo D’Addario EXL110-7 está expresamente disputada en Commons; no se integra. Buscar una foto alternativa con licencia no disputada.
- La foto de YRS-24B incluye el estuche; la de los cables muestra más de un cable. No se presentan como fotografías de existencias locales.
- Las ocho fotos verificadas se comparten desde `ProductImage` en tienda, ficha, favoritos, comparación, carrito y recomendaciones. Estudio usa esa ruta para fallback WebGL. Las otras fichas muestran su SVG con etiqueta explícita de ilustración pendiente.
- Revisión visual final en escritorio y teléfono debe confirmar encuadre y correspondencia antes de liberar fuera del prototipo académico.
