# LEO-OS · Página personal de Leo Álvarez

Página web personal de una sola página hecha para la materia **Informática Básica** del Instituto Universitario Adventista de Venezuela (IUNAV). Incluye biografía, foto personal, experiencia laboral, tecnologías que uso y mi experiencia en la materia.

La estética es de terminal retro con efecto CRT y detalles pixel art: pantalla de arranque, efecto de escritura, logros desbloqueados y una terminal interactiva escondida (pulsa `~` o baja hasta el final).

Está hecha a mano con **HTML, CSS y JavaScript puro**: sin frameworks, sin dependencias y sin paso de build. Lo único externo son las fuentes de Google Fonts (Press Start 2P, VT323 y JetBrains Mono).

## Estructura

```
index.html       Página principal
favicon.svg      Icono pixel art de la pestaña
css/styles.css   Estilos
js/main.js       Arranque, escritura, menú, animaciones, fotos y terminal
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
| `img/setup.jpg` | Galería (foto grande) | Tu escritorio o tu setup |
| `img/extra-1.jpg` | Galería | Una foto con quien quieras (familia o amigos) |
| `img/extra-2.jpg` | Galería | Otra foto con quien quieras (familia o amigos) |

Consejos:

- El nombre debe coincidir exactamente, en minúsculas y con extensión `.jpg` (no `.jpeg` ni `.JPG`).
- La foto de perfil se recorta en formato vertical 4:5; el resto, en horizontal 4:3. Centra bien lo importante.
- Para que la página cargue rápido, reduce las fotos a unos 1200 px de ancho como máximo.

## Fechas pendientes

En la línea de tiempo (sección Biografía, archivo `index.html`) hay dos fechas marcadas como `[----]` para rellenar:

- Técnico Superior Universitario en Informática — Barquisimeto
- Mudanza a Madrid, España

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
