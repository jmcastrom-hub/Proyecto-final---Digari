# Verificación del rediseño Digari Studio

## Medición antes y después

Se usó Chrome headless 157, viewport de escritorio 1440 × 900, DPR 1, caché desactivada y servidor Next.js en desarrollo sobre `localhost:3100`. Se calentó cada ruta y luego se hicieron cuatro navegaciones completas con `Page.navigate`; la cifra es la mediana de `PerformanceNavigationTiming.loadEventEnd - startTime`. El tamaño corresponde a `transferSize` del documento.

| Ruta | Antes: mediana carga | Después: mediana carga | Antes: documento | Después: documento |
| --- | ---: | ---: | ---: | ---: |
| Inicio `/` | 733 ms | 1 953 ms | 11 307 B | 11 083 B |
| Tienda `/tienda` | 757 ms | 2 023 ms | 7 656 B | 7 652 B |
| Asesoría `/asesoria` | 694 ms | 1 865 ms | 8 535 B | 8 705 B |

La medición de desarrollo posterior es más lenta, así que no se declara una mejora de carga al comparar ese modo. El perfil de recursos de Tienda localizó el principal costo en el cliente de desarrollo de Next (`main-app.js`, aproximadamente 1,76 MB transferidos y 764 ms en esa captura), no en el arte de producto ni en el visor 3D. El build de producción sí completó y reporta 103 kB compartidos de JavaScript inicial; la medición de producción se presenta por separado a continuación.

Para la vista previa que se deja activa, repetí el mismo protocolo sobre el build de producción (`next start`, Chrome, viewport y caché iguales): Inicio 230 ms / 4 860 B; Tienda 256 ms / 3 945 B; Asesoría 205 ms / 5 102 B. Esa medición confirma que servir el build evita el costo del cliente de desarrollo y es el motivo de dejar la vista previa en modo producción. No se compara esta cifra de producción como si fuera la medición de desarrollo de la tabla anterior.

## Comprobaciones funcionales y visuales

- La portada original optimizada se guarda como WebP (1536 × 1024, 115 418 B); el encuadre se revisó con captura de 1440 × 900 y de 390 × 844. En móvil la guitarra se mantiene al lado derecho y el texto usa una capa oscura de contraste.
- Se sirven 15 ilustraciones SVG originales por ID de catálogo; verificación HTTP de fichas: 15/15 en respuesta 200. Cada imagen declara 960 × 640, texto alternativo y `loading="lazy"` salvo la ficha principal. El texto aclara que son ilustraciones, no fotos exactas.
- En 390 × 844, `/asesoria` muestra el campo de consulta y el botón de envío sin desplazarse; los filtros quedan inmediatamente debajo. La captura confirmó consulta en `y=507` y botón en `y=666`.
- La asesoría acepta montos enteros desde ₡0 hasta ₡10 000 000, separadores de miles usuales y vacío distinto de cero. Se rechazan −1 y 10 000 001. Las pruebas unitarias cubren estos casos y el respaldo local simulado para errores 429/503.
- El endpoint real de asesoría respondió HTTP 200 en modo local, con una recomendación filtrada. Gemini no se confirmó en línea; la última respuesta observada fue el fallback de formato del proveedor.
- La carga inicial no importa `three` en el cliente de Inicio/Tienda/Asesoría: `ModelViewer` pide el motor con `import('three')` al montar el visor; el audio se crea al activar un control del estudio. Este flujo se verificó en código, no se hizo una prueba de escucha física.
- Se mantuvieron intactas las rutas de catálogo, comparación, favoritos, carrito, pedidos, seguimiento, servicios y contacto. Pendientes complementarios: escucha en equipo real y ensayo táctil en teléfono físico.

## Evidencia y comandos

- Pruebas: `npm.cmd test`, `npm.cmd run lint` y `npm.cmd run build`.
- Smoke API: `npm.cmd run test:api` con `DIGARI_BASE_URL=http://localhost:3100` y el token operador de demostración configurado en el entorno local.
- Capturas y scripts de medición temporales están en `.p4-verify/` (ignorado por Git); no se agregan al commit.
