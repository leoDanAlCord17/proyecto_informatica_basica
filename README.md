# leo._.dac · Página personal de Leo Álvarez

Página web personal de una sola página hecha para la materia **Informática Básica** del Instituto Universitario Adventista de Venezuela (IUNAV). Incluye biografía, foto personal, experiencia laboral, tecnologías que uso y mi experiencia en la materia.

La estética es de terminal retro con efecto CRT y detalles pixel art: pantalla de arranque, efecto de escritura, logros desbloqueados y una terminal interactiva escondida (pulsa `~` o baja hasta el final).

Está hecha a mano con **HTML, CSS y JavaScript puro**: sin frameworks, sin dependencias y sin paso de build. Lo único externo son las fuentes de Google Fonts (Press Start 2P, VT323 y JetBrains Mono).

## Estructura

```
index.html       Página principal
favicon.svg      Icono pixel art de la pestaña
css/styles.css   Estilos
css/leo.css      Estilos de Mini Leo y su franja
js/main.js       Arranque, escritura, menú, animaciones, fotos y terminal
js/leo.js        Mini Leo: sprite, animaciones y reacciones
img/             Aquí van las fotos (ver tabla)
```

## Cómo verla en local

Basta con abrir `index.html` en el navegador (doble clic).

Si prefieres un servidor local, desde la carpeta del proyecto:

```bash
npx serve .
# o bien
python -m http.server 8000
```

Y abre `http://localhost:3000` (con `serve`) o `http://localhost:8000` (con Python).

> La pantalla de arranque solo aparece la primera vez en cada sesión del navegador. Para volver a verla, abre la página en una pestaña nueva de incógnito.

## Cómo poner las fotos

Cada imagen tiene un nombre de archivo fijo. Mientras el archivo no exista, la página muestra un marcador con un icono de cámara y el texto «📷 Aquí va: …». En cuanto copies la foto en `img/` **con el nombre exacto**, aparecerá sola, sin tocar el código.

| Archivo | Dónde aparece | Foto sugerida |
|---|---|---|
| `img/perfil.jpg` | Portada (hero) | Foto tuya de frente, con buena luz y fondo limpio **(obligatoria)** |
| `img/barquisimeto.jpg` | Biografía | Una foto tuya en Barquisimeto o de la ciudad |
| `img/madrid.jpg` | Biografía | Una foto tuya en Madrid |
| `img/trabajo-dev.jpg` | Experiencia: Full Stack | Tu puesto de trabajo programando o una captura de una app que hiciste |
| `img/trabajo-it.jpg` | Experiencia: Soporte IT | Tú trabajando: cableado, rack de red o un equipo abierto |
| `img/materia.jpg` | Mi experiencia en la materia | Tu juego de memoria con material reciclado o una captura de tus trabajos |
| `img/galeria-1.jpg` | Galería | Tú programando (tu portátil o una pantalla con código) |
| `img/galeria-2.jpg` | Galería | Tú arreglando un equipo o montando una red |
| `img/galeria-3.jpg` | Galería | Tú creando videojuegos en Godot o jugando |
| `img/galeria-4.jpg` | Galería | Tú haciendo algo que te guste en tu tiempo libre |
| `img/galeria-5.jpg` | Galería | Otra foto tuya haciendo algo que te represente |

Consejos:

- El nombre debe coincidir exactamente, en minúsculas y con extensión `.jpg` (no `.jpeg` ni `.JPG`).
- La foto de perfil se recorta en formato vertical 4:5; el resto, en horizontal (4:3 o 16:9 según el tamaño de pantalla). Centra bien lo importante.
- Para que la página cargue rápido, reduce las fotos a unos 1200 px de ancho como máximo.

## Mini Leo

Mini Leo es un pequeño personaje pixel art que vive en la franja inferior de la pantalla y acompaña el recorrido. Se dibuja con código en un `<canvas>` a partir de matrices de píxeles (archivos `js/leo.js` y `css/leo.css`).

### Cambiar su aspecto

Al principio de `js/leo.js` está el objeto `APARIENCIA`. Cambia los colores (formato `#rrggbb`) y las opciones, guarda y recarga la página:

```js
const APARIENCIA = {
  piel: '#c68a5e',      // tono de piel (las sombras se calculan solas)
  pelo: '#1a1110',      // color del pelo (también se usa para la barba)
  camiseta: '#39ff7a',  // verde fósforo de la página
  pantalon: '#2b3a55',  // color del pantalón
  zapatos: '#111111',   // color de los zapatos
  lentes: false,        // true para dibujar lentes
  barba: false,         // true para dibujar barba
};
```

### Qué hace

- **Camina con el scroll**: su posición va de izquierda a derecha según lo que hayas bajado en la página, y vuelve a reposo al dejar de hacer scroll.
- **Barra de XP y niveles**: la barra se llena con el progreso y sube de nivel con cada sección nueva (`+LVL UP!`).
- **Reacciones por sección**: la primera vez que llegas a cada sección hace una acción (saludar, escribir en su portátil, celebrar…) y dice algo en un bocadillo. En el logro «Página web» hay lluvia de confeti.
- **Clic o toque**: salta y dice una frase al azar. Si le insistes varias veces seguidas, se enfada un poco… Tocar el bocadillo lo cierra.
- **Inactividad**: si no haces nada durante 12 segundos se duerme; al volver a moverte, despierta.
- **Ojos que siguen al cursor** en escritorio.
- **Terminal**: los comandos `leo` (baila) y `dormir` (se duerme).
- **Botones de la franja**: `[ocultar a Leo]` / `[mostrar a Leo]` y 🔇/🔊 para activar sonidos chiptune generados con Web Audio API. Ambas opciones se recuerdan en el navegador; el sonido viene apagado por defecto.
- Hay un **easter egg secreto**. 😉

Con «reducir movimiento» activado en el sistema, Mini Leo se queda quieto, no hay confeti y los diálogos aparecen sin efecto de escritura.

## Cómo desplegarla en Vercel

1. Sube el repositorio a GitHub.
2. Entra en [vercel.com/new](https://vercel.com/new) e importa el repositorio.
3. En **Framework Preset** elige **Other**.
4. Deja vacíos el comando de build y el directorio de salida.
5. Pulsa **Deploy**. Cada vez que hagas push, Vercel publicará la nueva versión.

## Accesibilidad

- Navegación completa con teclado y foco visible.
- Si el sistema tiene activado «reducir movimiento», se desactivan la pantalla de arranque, el efecto de escritura y las animaciones.
- Textos alternativos y etiquetas en español.

---

© 2026 Leo Álvarez · Informática Básica — IUNAV
