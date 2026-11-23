# Digari Studio

Prototipo académico de asesoría, catálogo demo y seguimiento inspirado en Digari Music Store, Costa Rica. No es un sistema oficial ni está conectado a la empresa.

## Estado actual

P1 implementa tienda y seguimiento demo; P2 añade un estudio 3D procedural y audio sintético; P3 añade asesoría con filtro local y Gemini opcional. La revisión manual P2 en navegador sigue pendiente.

Los 15 productos, precios CRC, existencias, compatibilidad, contacto y pedidos de prueba no deben interpretarse como inventario/oferta vigente. Las opciones de retiro/envío no se ejecutan. No se solicitan tarjetas ni se hacen reservas, compras o envíos reales.

## Requisitos

- Windows 10/11
- Node.js 22.13 o posterior (se usa `node:sqlite`, sin servicio de base de datos externo)
- npm incluido con Node

## Instalación y ejecución (PowerShell)

```powershell
npm ci
npm run dev
```

Abrí http://localhost:3000. En el primer uso, SQLite crea `data/digari.sqlite` y precarga 15 fichas sintéticas. La base queda fuera de Git. En desarrollo, el panel local admite `local-demo-only` como código de demostración; la app completa no está preparada para uso productivo, aunque se configure otro token.

La ruta `/asesoria` funciona sin clave con filtro local. Para habilitar Gemini, copia `.env.example` como `.env.local` y completa allí tu clave propia de Gemini AI Studio; deja ese archivo fuera de Git. El modelo predeterminado es `gemini-3.8-flash`. El proveedor usa Interactions API con `store:false`, recibe selecciones estructuradas y candidatos demo, no el texto libre ni el historial local. Si falta la clave o el proveedor falla, el modo local sigue disponible.

## Pruebas

```powershell
npm test
npm run lint
npm run build
```

Las pruebas unitarias cubren catálogo/filtros, reglas de cantidades/stock, total del servidor, idempotencia, códigos privados y transiciones. Para la prueba HTTP integrada, inicia el servidor en otra terminal y define la misma clave demo en ambas:

```powershell
$env:DIGARI_DEMO_OPERATOR_TOKEN = 'local-demo-only'
npm run start
```

En otra terminal, desde la carpeta del proyecto:

```powershell
$env:DIGARI_DEMO_OPERATOR_TOKEN = 'local-demo-only'
npm run test:api
```

La suite HTTP prueba once páginas, el filtro local de asesoría y su validación, filtros de catálogo, idempotencia, consulta/actualización de pedido/servicio y stock insuficiente. La verificación visual manual y la revisión del estudiante deben registrarse por separado.

## Recorrido breve de demo

1. En Tienda, busca guitarra, elige tipo y presupuesto, guarda favoritos y marca dos opciones para comparar.
2. Abre una ficha y revisa origen sintético, variantes, compatibilidad y existencias demo.
3. Agrega al carrito, cambia retiro/envío demo, confirma “Pedido de demostración” y guarda el código privado.
4. En Seguimiento, consulta el código. Después en Servicios crea una afinación demo, consulta su código y usa el panel local de operador para moverla a diagnóstico.
5. Usa cantidad/stock inválidos para ver la validación. No se transmite información a Digari.

P2 incorpora estudio 3D y audio sintético; P3 añade asesoría determinista/Gemini. Contactos y enlaces a asesoría/financiamiento apuntan a páginas públicas originales y deben verificarse al presentar la aplicación.

## Documentación

- [`intent.md`](intent.md), [`spec.md`](spec.md) y [`plan.md`](plan.md): intención, reglas y trazabilidad.
- [`docs/auditoria-digari.md`](docs/auditoria-digari.md): hechos reportados, alcance y validaciones del sitio pendientes.
- [`docs/uso-ia.md`](docs/uso-ia.md): ciclos P1/P2/P3; revisión humana del estudiante pendiente.

## Privacidad y límites

No capturar datos personales reales. El código privado se genera aleatoriamente, se persiste como hash y solo se presenta al crear la solicitud. El operador demo usa un token solo de desarrollo. Esta app local y SQLite no tienen controles para producción, personal multiusuario o datos comerciales.

## Estudio 3D y audio (P2)

Abre `/estudio` o la ficha de cualquier producto y activa el visor o el audio de forma explícita. El catálogo enlaza cada una de sus 15 fichas a una geometría Three.js procedural; todas son maquetas ilustrativas, no réplicas exactas. El motor 3D y el componente de audio se cargan al activar cada panel. El visor acepta arrastre con ratón/tacto, botones y flechas/+/−/R al enfocar el canvas; ante error WebGL presenta una ilustración alternativa claramente identificada.

Los tonos y acordes son síntesis Web Audio iniciada por el usuario. Los perfiles A/B de equipo usan una misma señal sintética; B simula un realce EQ y compensa su RMS calculado localmente. No son grabaciones ni mediciones de productos reales. Cuerdas, cable y caña se identifican como accesorios pasivos sin timbre ficticio. Repite las comprobaciones manuales de escritorio/móvil y escucha antes de presentar; la revisión visual/auditiva y la revisión del estudiante aún están pendientes.
