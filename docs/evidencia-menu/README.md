# Verificación del menú

Comprobación en Chromium local (`http://localhost:3113`) con emulación táctil y teclado. El panel se abrió desde Inicio y quedó cerrado al navegar; las imágenes no contienen datos privados.

- `estudio-movil-menu-cerrado.png`: al tocar «Estudio 3D» desde Inicio, se abre `/estudio` y el panel ya no está en el DOM.
- `estudio-200-menu-cerrado.png`: ancho de viewport de 720 px, equivalente a 200 % sobre 1440 px; Estudio visible, panel cerrado, Bolsa dentro del viewport.
- `verificacion.json`: resumen de las comprobaciones de navegación, filtros, foco, Escape, clic exterior, breakpoint, toque y límites del panel.

La prueba automatizada de interacción confirmó: selección táctil de Estudio, Tienda y filtro de categoría cierra el panel; el enlace de la página actual también lo cierra; Escape cierra y devuelve el foco al disparador; el clic exterior y el cambio a escritorio cierran; el desplegable de escritorio cierra al filtrar y Escape devuelve el foco; Bolsa permanece visible y navega al carrito; en el ancho equivalente a 200 % el panel comienza justo debajo del encabezado.
