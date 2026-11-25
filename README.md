# Digari Studio

Prototipo académico para orientar a una persona que compara instrumentos/equipo por presupuesto y para mostrar seguimiento de pedidos y servicios. Está inspirado en Digari Music Store (Costa Rica), pero no es un producto oficial ni está conectado con la empresa. Autor: **José Manuel Castro Moya**. Desarrollo asistido con Codex; la revisión y aprobación final del estudiante siguen pendientes.

## Propuesta y alcance actual

El catálogo precargado contiene 15 fichas demo: Yamaha F310, Squier Affinity Strat, Ibanez GSR180, Casio WK-1800, Kala Makala, Yamaha YRS-24B, Ernie Ball Cobalt Slinky 10–52, cable TS genérico, cañas Vandoren, Behringer C-1, PreSonus Eris E4.5, Behringer Eurolive B212D, Numark Mixtrack, Audio-Technica ATH-M50 y M-Audio Fast Track Pro. Los nombres/modelos, imágenes, compatibilidad, precios CRC y existencias son datos ilustrativos del prototipo; no acreditan precio, inventario, licencia de marca ni disponibilidad actual de Digari. La cantidad de fichas no equivale a cinco alternativas por familia.

El flujo demostrable es: consulta libre en Asesoría → revisar opciones y abrir fichas → comparar dos o más productos → abrir Estudio 3D/audio → crear un pedido de demostración → recargar y consultar Seguimiento. También se registra y consulta una solicitud ficticia de servicio. No se realizan compras, pagos, reservas, envíos, mensajes ni solicitudes reales. El checkout no pide datos de tarjeta.

Asesoría recibe una consulta por mensaje y evalúa el catálogo vigente completo de SQLite antes de escoger hasta tres recomendaciones. La selección y los datos comerciales los determina el servidor; Gemini es opcional y solo explica candidatos ya seleccionados. Sin proveedor disponible, responde el asesor local. La interfaz informa el modo. El historial de conversación está en el navegador y no se envía a Gemini.

## Requisitos

- Windows 10/11
- Node.js 22.13+ y npm (el proyecto usa `node:sqlite`)
- Chrome o navegador moderno para la demostración; WebGL y salida de audio son opcionales

## Instalación y ejecución (PowerShell)

```powershell
npm ci
npm run dev
```

Abrí <http://localhost:3000>. SQLite crea `data/digari.sqlite` al iniciar y carga datos demo. La base está ignorada por Git. Para una prueba aislada, define antes de iniciar `$env:DIGARI_DB_PATH = Join-Path $env:TEMP 'digari-final.sqlite'`. El código del operador `local-demo-only` solo habilita transiciones locales de demostración; no es autenticación productiva.

La aplicación funciona sin clave externa y muestra Asesoría local. Gemini requiere una clave propia en `.env.local` (no versionar ese archivo). No es requisito de ejecución ni de las pruebas locales. CI verifica el fallback con proveedor simulado/sin clave. No se afirma una llamada real a Gemini para este candidato.

## Verificación reproducible

```powershell
npm test
npm run lint
$env:DIGARI_DB_PATH = Join-Path $env:TEMP 'digari-final-build.sqlite'
node -e "require('./.test-dist/lib/db.js')"
npm run build
```

Para smoke HTTP, inicia la aplicación compilada en una terminal con una base temporal:

```powershell
$env:DIGARI_DB_PATH = Join-Path $env:TEMP 'digari-final-api.sqlite'
$env:DIGARI_DEMO_OPERATOR_TOKEN = 'local-demo-only'
npm run start
```

En otra terminal usa la misma ruta SQLite y token:

```powershell
$env:DIGARI_DB_PATH = Join-Path $env:TEMP 'digari-final-api.sqlite'
$env:DIGARI_DEMO_OPERATOR_TOKEN = 'local-demo-only'
npm run test:api
```

El smoke ejercita páginas/API, catálogo, asesoría local y entradas inválidas, pedido idempotente, códigos privados, stock y estados de servicio. Resultados por SHA y límites están en [`docs/validacion-entrega.md`](docs/validacion-entrega.md). La auditoría histórica de 100 perfiles simulados en [`docs/qa/informe-usabilidad.md`](docs/qa/informe-usabilidad.md) se hizo sobre otra versión: no es un resultado de aceptación de este candidato ni una prueba con 100 personas reales.

## Demo y documentación

El guion de operación de 12 minutos y 3 minutos de preguntas, el caso comparable y las contingencias están en [`docs/demo.md`](docs/demo.md). El caso de negocio con objetivo medible y resultados aún no medidos está en [`docs/negocio.md`](docs/negocio.md). Intención, especificación y relación requisito–prueba–commit: [`intent.md`](intent.md), [`spec.md`](spec.md), [`plan.md`](plan.md). Los ciclos de trabajo asistido y las revisiones del estudiante registradas con su corrección y evidencia se describen en [`docs/uso-ia.md`](docs/uso-ia.md).

## Datos, privacidad y límites

No ingresar datos reales de clientes. El seguimiento usa códigos aleatorios de alta entropía, guarda hashes y devuelve campos mínimos. El token de operador es solo para demo local. SQLite en un solo equipo no ofrece identidad, control multiusuario ni garantías de producción. No se envían datos personales, conversación, códigos ni pedidos a Gemini. Antes de un piloto se requieren autorización de Digari, validación humana del catálogo y licencias, seguridad, retención, soporte y evaluación de privacidad.

Los 15 visores son geometrías procedurales ilustrativas, no reproducciones exactas. Three.js y Web Audio se cargan al activar el estudio; el audio es síntesis etiquetada, no muestra grabada de los productos. Si WebGL no está disponible se ofrece una vista alternativa identificada. Revisión del estudiante, ensayo oral, escucha en equipo real, tacto en teléfono, medición con participantes y Gemini online permanecen pendientes.
