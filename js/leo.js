/* =========================================================
   Mini Leo · compañero pixel art que acompaña el recorrido
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     APARIENCIA: cambia estos valores para que Mini Leo se
     parezca a ti. Acepta cualquier color en formato #rrggbb.
     --------------------------------------------------------- */
  const APARIENCIA = {
    piel: '#c68a5e',      // tono de piel (las sombras se calculan solas)
    pelo: '#1a1110',      // color del pelo (también se usa para la barba)
    camiseta: '#39ff7a',  // verde fósforo de la página
    pantalon: '#2b3a55',  // color del pantalón
    zapatos: '#111111',   // color de los zapatos
    lentes: false,        // true para dibujar lentes
    barba: false,         // true para dibujar barba
  };

  /* ---------------------------------------------------------
     Configuración general
     --------------------------------------------------------- */
  const ANCHO = 24;            // ancho del sprite en píxeles
  const ALTO = 32;             // alto del sprite en píxeles
  const BORDE = 1;             // contorno automático alrededor del sprite
  const LIENZO_ANCHO = ANCHO + BORDE * 2;
  const LIENZO_ALTO = ALTO + BORDE * 2;
  const INACTIVIDAD_MS = 12000;
  const DURACION_BOCADILLO_MS = 4000;

  const consultaReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const consultaEscritorio = window.matchMedia('(min-width: 768px) and (pointer: fine)');
  const raiz = document.documentElement;

  const reducido = () => consultaReducido.matches;
  const esMovil = () => window.innerWidth < 768;

  function leerPreferencia(clave) {
    try { return localStorage.getItem(clave); } catch (e) { return null; }
  }

  function guardarPreferencia(clave, valor) {
    try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ }
  }

  /* ---------------------------------------------------------
     Colores
     --------------------------------------------------------- */
  function hexARgb(hex) {
    let h = String(hex).replace('#', '');
    if (h.length === 3) { h = h.split('').map((c) => c + c).join(''); }
    const n = parseInt(h, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function mezclar(a, b, t) {
    const x = hexARgb(a);
    const y = hexARgb(b);
    return 'rgb(' + x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',') + ')';
  }

  function crearPaleta() {
    return {
      p: APARIENCIA.piel,
      P: mezclar(APARIENCIA.piel, '#000000', 0.22),
      h: APARIENCIA.pelo,
      H: mezclar(APARIENCIA.pelo, '#ffffff', 0.3),
      b: mezclar(APARIENCIA.pelo, '#ffffff', 0.08),
      c: APARIENCIA.camiseta,
      C: mezclar(APARIENCIA.camiseta, '#000000', 0.35),
      l: APARIENCIA.pantalon,
      L: mezclar(APARIENCIA.pantalon, '#000000', 0.3),
      z: APARIENCIA.zapatos,
      w: '#f2f2f2',   // blanco de los ojos
      i: '#101014',   // pupilas
      m: '#6b2b25',   // boca
      o: '#06080c',   // contorno
      g: '#9aa5b4',   // tapa del portátil
      G: '#6b7685',   // cara de la tapa
      v: '#39ff7a',   // piloto del portátil
      k: '#3a4454',   // base del portátil
      s: '#0b0b0d',   // gafas de sol
      S: '#6b7685',   // brillo de las gafas de sol
      f: '#15151a',   // montura de los lentes
    };
  }

  /* ---------------------------------------------------------
     Matrices de píxeles (cada letra es un color de la paleta;
     el punto es transparente). Rejilla de 24 × 32.
     --------------------------------------------------------- */
  const CABEZA = { y: 4, filas: [
    '.......hhhhhhhhhh.......',
    '.....hhhhhhhhhhhhhh.....',
    '....hhhHHhhhhhhhhhhh....',
    '...hhhhhhhhhhhhhhhhhh...',
    '...hhhHhhhhhhhhhhhhhh...',
    '...hhhpphpppppphpphhh...',
    '...hhpppppppppppppphh...',
    '...hhpphhpppppphhpphh...',
    '...hhppwwppppppwwpphh...',
    '...hhppwwppppppwwpphh...',
    '...hpppppppppppppppph...',
    '...hpppppppmmppppppph...',
    '....pppppppppppppppp....',
    '.....pppppppppppppp.....',
    '..........PPPP..........',
  ] };

  const TORSO = { y: 19, filas: [
    '.......ccccPPcccc.......',
    '......cccccccccccc......',
    '.......cCcccccccc.......',
    '.......ccCccccccc.......',
    '.......cCcCCccccc.......',
    '.......CCCCCCCCCC.......',
  ] };

  const BRAZO_IZQ = { y: 20, filas: ['.....cc', '.....cc', '.....pp', '.....pp', '.....pp'] };
  const BRAZO_IZQ_ARRIBA = { y: 13, filas: ['.pp', '.pp', '..pp', '..pp', '...cc', '...ccc', '....ccc', '.....cc'] };
  const BRAZO_IZQ_SALUDO = { y: 13, filas: ['pp', '.pp', '..pp', '..pp', '...cc', '...ccc', '....ccc', '.....cc'] };

  const BRAZOS_CORTOS = { y: 20, filas: [
    '.....cc..........cc.....',
    '.....cc..........cc.....',
    '.....pp..........pp.....',
  ] };

  const PORTATIL = { y: 21, filas: [
    '......gggggggggggg......',
    '......gGGGGGGGGGGg......',
    '......gGGGGGvGGGGg......',
    '......gGGGGGGGGGGg......',
    '.....kkkkkkkkkkkkkk.....',
  ] };

  const MANOS_A = { y: 23, filas: ['......pp................', '................pp......'] };
  const MANOS_B = { y: 23, filas: ['................pp......', '......pp................'] };

  const PIERNAS_QUIETO = { y: 25, filas: [
    '.......llllllllll.......',
    '.......llll..llll.......',
    '.......llll..llll.......',
    '.......llll..llll.......',
    '.......lllL..Llll.......',
    '......zzzzz..zzzzz......',
    '......zzzzz..zzzzz......',
  ] };

  const PIERNAS_ABIERTAS = { y: 25, filas: [
    '.......llllllllll.......',
    '......lllll..LLLLL......',
    '.....lllll....LLLLL.....',
    '....lllll......LLLLL....',
    '....llll........LLLL....',
    '...zzzzz........zzzzz...',
    '...zzzzz........zzzzz...',
  ] };

  const PIERNAS_PASO = { y: 25, filas: [
    '.......llllllllll.......',
    '.......llll..LLLL.......',
    '.......llll..LLLL.......',
    '.......llll...LLLL......',
    '.......llll...zzzzz.....',
    '......zzzzz.............',
    '......zzzzz.............',
  ] };

  function rellenar(fila) {
    return (fila + '.'.repeat(ANCHO)).slice(0, ANCHO);
  }

  function espejo(parte) {
    return { y: parte.y, filas: parte.filas.map((f) => rellenar(f).split('').reverse().join('')) };
  }

  function intercambiar(parte, a, b) {
    return {
      y: parte.y,
      filas: parte.filas.map((f) => f.replace(/./g, (c) => (c === a ? b : c === b ? a : c))),
    };
  }

  const BRAZO_DER = espejo(BRAZO_IZQ);
  const BRAZO_DER_ARRIBA = espejo(BRAZO_IZQ_ARRIBA);
  const BRAZO_DER_SALUDO = espejo(BRAZO_IZQ_SALUDO);

  // 4 frames de caminar: abierto, paso, abierto (piernas cambiadas), paso (espejo)
  const CAMINAR = [
    PIERNAS_ABIERTAS,
    PIERNAS_PASO,
    intercambiar(PIERNAS_ABIERTAS, 'l', 'L'),
    intercambiar(espejo(PIERNAS_PASO), 'l', 'L'),
  ];

  // Partes del cuerpo según la pose (la cabeza y la cara se añaden después)
  function partesDePose(pose, frame) {
    switch (pose) {
      case 'caminar':
        return [TORSO, BRAZO_IZQ, BRAZO_DER, CAMINAR[frame % 4]];
      case 'celebrar':
        return [BRAZO_IZQ_ARRIBA, BRAZO_DER_ARRIBA, TORSO, PIERNAS_QUIETO];
      case 'saludar':
        return [TORSO, BRAZO_IZQ, frame % 2 ? BRAZO_DER_SALUDO : BRAZO_DER_ARRIBA, PIERNAS_QUIETO];
      case 'laptop':
        return [TORSO, PIERNAS_QUIETO, BRAZOS_CORTOS, PORTATIL, frame % 2 ? MANOS_B : MANOS_A];
      default: // idle y dormir
        return [TORSO, BRAZO_IZQ, BRAZO_DER, PIERNAS_QUIETO];
    }
  }

  /* ---------------------------------------------------------
     Composición y dibujo del sprite
     --------------------------------------------------------- */
  function rejillaVacia() {
    const r = [];
    for (let y = 0; y < ALTO; y++) { r.push(new Array(ANCHO).fill('.')); }
    return r;
  }

  function pintar(rejilla, parte, dy) {
    parte.filas.forEach((fila, i) => {
      const y = parte.y + i + (dy || 0);
      if (y < 0 || y >= ALTO) { return; }
      for (let x = 0; x < fila.length && x < ANCHO; x++) {
        if (fila[x] !== '.') { rejilla[y][x] = fila[x]; }
      }
    });
  }

  function punto(rejilla, x, y, color) {
    if (y >= 0 && y < ALTO && x >= 0 && x < ANCHO) { rejilla[y][x] = color; }
  }

  function componer(e) {
    const r = rejillaVacia();
    partesDePose(e.pose, e.frame).forEach((p) => pintar(r, p));
    const dy = e.bob;
    pintar(r, CABEZA, dy);

    const ojoY = 12 + dy;
    if (e.ojosCerrados) {
      [7, 8, 15, 16].forEach((x) => { punto(r, x, ojoY, 'p'); punto(r, x, ojoY + 1, 'i'); });
    } else {
      const desplazamiento = e.mirada > 0 ? 1 : 0;
      punto(r, 7 + desplazamiento, ojoY, 'i');
      punto(r, 7 + desplazamiento, ojoY + 1, 'i');
      punto(r, 15 + desplazamiento, ojoY, 'i');
      punto(r, 15 + desplazamiento, ojoY + 1, 'i');
    }

    if (e.bocaAbierta) { punto(r, 11, 16 + dy, 'm'); punto(r, 12, 16 + dy, 'm'); }

    if (APARIENCIA.barba) {
      pintar(r, { y: 15, filas: ['....bb............bb....', '....bbbbbbbbbbbbbbbb....', '.....bbbbbbbbbbbbbb.....'] }, dy);
      punto(r, 11, 15 + dy, 'm'); punto(r, 12, 15 + dy, 'm');
    }

    if (e.gafas) {
      pintar(r, { y: 12, filas: ['.....sSssssssssSsss.....', '.....sssss....sssss.....'] }, dy);
    } else if (APARIENCIA.lentes) {
      pintar(r, { y: 11, filas: [
        '......ffff....ffff......',
        '......f..ffffff..f......',
        '......f..f....f..f......',
        '......ffff....ffff......',
      ] }, dy);
    }
    return r;
  }

  function dibujar(contexto, rejilla, paleta) {
    contexto.clearRect(0, 0, LIENZO_ANCHO, LIENZO_ALTO);
    const lleno = (x, y) => y >= 0 && y < ALTO && x >= 0 && x < ANCHO && rejilla[y][x] !== '.';
    // Contorno automático
    contexto.fillStyle = paleta.o;
    for (let y = -BORDE; y < ALTO + BORDE; y++) {
      for (let x = -BORDE; x < ANCHO + BORDE; x++) {
        if (!lleno(x, y) && (lleno(x - 1, y) || lleno(x + 1, y) || lleno(x, y - 1) || lleno(x, y + 1))) {
          contexto.fillRect(x + BORDE, y + BORDE, 1, 1);
        }
      }
    }
    for (let y = 0; y < ALTO; y++) {
      for (let x = 0; x < ANCHO; x++) {
        const c = rejilla[y][x];
        if (c !== '.') {
          contexto.fillStyle = paleta[c] || '#ff00ff';
          contexto.fillRect(x + BORDE, y + BORDE, 1, 1);
        }
      }
    }
  }

  /* ---------------------------------------------------------
     Sonido chiptune con Web Audio API (apagado por defecto)
     --------------------------------------------------------- */
  const Sonido = {
    activo: leerPreferencia('leoos-sonido') === '1',
    contexto: null,
    gesto: false,
    asegurar() {
      if (!this.gesto) { return null; }
      if (!this.contexto) {
        const Contexto = window.AudioContext || window.webkitAudioContext;
        if (!Contexto) { return null; }
        this.contexto = new Contexto();
      }
      if (this.contexto.state === 'suspended') { this.contexto.resume(); }
      return this.contexto;
    },
    tono(frecuencia, duracion, opciones) {
      if (!this.activo) { return; }
      const ctx = this.asegurar();
      if (!ctx) { return; }
      const o = Object.assign({ tipo: 'square', volumen: 0.03, hasta: null, retraso: 0 }, opciones);
      const t = ctx.currentTime + o.retraso;
      const osc = ctx.createOscillator();
      const ganancia = ctx.createGain();
      osc.type = o.tipo;
      osc.frequency.setValueAtTime(frecuencia, t);
      if (o.hasta) { osc.frequency.exponentialRampToValueAtTime(o.hasta, t + duracion); }
      ganancia.gain.setValueAtTime(o.volumen, t);
      ganancia.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
      osc.connect(ganancia);
      ganancia.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duracion + 0.02);
    },
    paso() { this.tono(140, 0.035, { tipo: 'triangle', volumen: 0.02 }); },
    blip() { this.tono(880, 0.03, { volumen: 0.015 }); },
    salto() { this.tono(320, 0.14, { volumen: 0.03, hasta: 760 }); },
    nivel() { [523, 659, 784, 1047].forEach((f, i) => this.tono(f, 0.09, { volumen: 0.03, retraso: i * 0.08 })); },
  };

  ['pointerdown', 'keydown', 'touchstart'].forEach((tipo) => {
    window.addEventListener(tipo, () => { Sonido.gesto = true; }, { passive: true, capture: true });
  });

  /* ---------------------------------------------------------
     Textos
     --------------------------------------------------------- */
  const REACCIONES = {
    inicio: { accion: 'saludar', texto: '¡Hola! Soy Leo. Te acompaño en el recorrido 👋' },
    bio: { accion: 'idle', texto: 'Esta es mi historia: de Barquisimeto a Madrid.' },
    experiencia: { accion: 'laptop', texto: 'Aquí es donde programo... y donde arreglo redes.' },
    stack: { accion: 'laptop', texto: 'Estas son mis herramientas favoritas.' },
    materia: { accion: 'celebrar', texto: '¡Logros desbloqueados! Vamos a ver qué aprendí.' },
    'logro-jefe': { accion: 'jefe', texto: '¡JEFE FINAL! Esta página la hice yo 😎' },
    galeria: { accion: 'idle', texto: 'Algunas fotos mías.' },
    contacto: { accion: 'saludar', texto: '¡Gracias por llegar hasta aquí!' },
    terminal: { accion: 'laptop', texto: 'Prueba a escribir help en la terminal.' },
  };

  const ORDEN = ['inicio', 'bio', 'experiencia', 'stack', 'materia', 'logro-jefe', 'galeria', 'contacto', 'terminal'];
  const SECCIONES_NIVEL = ['bio', 'experiencia', 'stack', 'materia', 'galeria', 'contacto'];

  const FRASES = [
    '¿Sabías que empecé a programar hace unos cuatro años?',
    'Flutter es mi favorito para apps móviles.',
    'Si se cae el internet en el trabajo, me llaman a mí.',
    'Sí, también hago videojuegos en Godot.',
    '¡No me hagas cosquillas!',
    'Esta página no usa ningún framework: todo está hecho a mano.',
    'De Barquisimeto a Madrid, siempre con un portátil en la mochila.',
    '¿Un cable suelto? Déjamelo a mí.',
    'Prueba a escribir help en la terminal de abajo.',
    'Mi café favorito es el que me tomo mientras compila el proyecto.',
  ];

  /* ---------------------------------------------------------
     Interfaz (se crea desde JS)
     --------------------------------------------------------- */
  const franja = document.createElement('div');
  franja.className = 'leo-franja leo-franja--esperando';
  franja.innerHTML =
    '<div class="leo-sombra" aria-hidden="true"></div>' +
    '<div class="leo" id="mini-leo">' +
      '<button class="leo__boton" type="button" aria-label="Mini Leo: pulsa para que te diga algo">' +
        '<canvas class="leo__lienzo" width="' + LIENZO_ANCHO + '" height="' + LIENZO_ALTO + '" role="img" aria-label="Mini Leo, personaje pixel art que acompaña el recorrido"></canvas>' +
      '</button>' +
      '<div class="leo__zetas" aria-hidden="true"></div>' +
    '</div>' +
    '<div class="leo-bocadillo" aria-hidden="true"><span class="leo-bocadillo__texto"></span><span class="leo-bocadillo__cola"></span></div>' +
    '<div class="leo-hud">' +
      '<span class="leo-hud__nivel" aria-live="polite">NIVEL 1</span>' +
      '<div class="leo-hud__xp" role="progressbar" aria-label="Progreso del recorrido" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="leo-hud__relleno"></span></div>' +
      '<button class="leo-hud__boton leo-hud__sonido" type="button"></button>' +
      '<button class="leo-hud__boton leo-hud__ocultar" type="button"></button>' +
    '</div>' +
    '<p class="sr-only" aria-live="polite" id="leo-anuncio"></p>';
  document.body.appendChild(franja);

  const el = {
    leo: franja.querySelector('.leo'),
    boton: franja.querySelector('.leo__boton'),
    lienzo: franja.querySelector('.leo__lienzo'),
    zetas: franja.querySelector('.leo__zetas'),
    sombra: franja.querySelector('.leo-sombra'),
    bocadillo: franja.querySelector('.leo-bocadillo'),
    textoBocadillo: franja.querySelector('.leo-bocadillo__texto'),
    cola: franja.querySelector('.leo-bocadillo__cola'),
    nivel: franja.querySelector('.leo-hud__nivel'),
    xp: franja.querySelector('.leo-hud__xp'),
    relleno: franja.querySelector('.leo-hud__relleno'),
    sonido: franja.querySelector('.leo-hud__sonido'),
    ocultar: franja.querySelector('.leo-hud__ocultar'),
    anuncio: franja.querySelector('#leo-anuncio'),
  };

  const contexto = el.lienzo.getContext('2d');
  const paleta = crearPaleta();

  /* ---------------------------------------------------------
     Estado
     --------------------------------------------------------- */
  const estado = {
    activo: false,
    oculto: leerPreferencia('leoos-leo-oculto') === '1',
    escala: 3,
    anchoSprite: 0,
    altoSprite: 0,
    altoHud: 0,
    x: -120,
    objetivoX: 0,
    mirando: 1,          // 1 derecha, -1 izquierda
    ultimoScroll: -Infinity,
    ultimoScrollY: window.scrollY,
    direccionScroll: 1,
    progreso: 0,
    caminando: false,
    frameCaminar: 0,
    accion: null,        // { tipo, restante, total }
    salto: null,         // { y, vy, giro, duracion, t }
    dormido: false,
    ignorarActividadHasta: 0,
    ultimaActividad: performance.now(),
    proximoParpadeo: performance.now() + 3000 + Math.random() * 3000,
    parpadeoHasta: 0,
    proximaZ: 0,
    gafas: false,
    ratonX: null,
    nivel: 1,
    clics: 0,
    ultimoClic: 0,
    ultimaFrase: -1,
    claveDibujo: '',
    bocadillo: null,     // { letras, mostradas, siguiente, cierre }
    cola: [],
  };

  /* ---------------------------------------------------------
     Medidas y visibilidad
     --------------------------------------------------------- */
  function medir() {
    estado.escala = esMovil() ? 2 : 3;
    estado.anchoSprite = LIENZO_ANCHO * estado.escala;
    estado.altoSprite = LIENZO_ALTO * estado.escala;
    estado.altoHud = esMovil() ? 34 : 38;
    el.lienzo.style.width = estado.anchoSprite + 'px';
    el.lienzo.style.height = estado.altoSprite + 'px';
    el.leo.style.width = estado.anchoSprite + 'px';
    el.leo.style.height = estado.altoSprite + 'px';
    franja.style.setProperty('--alto-hud', estado.altoHud + 'px');
    franja.style.setProperty('--alto-sprite', estado.altoSprite + 'px');
    const alto = estado.altoHud + (estado.oculto ? 0 : estado.altoSprite + 8);
    raiz.style.setProperty('--alto-leo', alto + 'px');
    calcularProgreso();
  }

  function aplicarOculto() {
    franja.classList.toggle('leo-franja--oculto', estado.oculto);
    el.ocultar.textContent = estado.oculto ? '[mostrar a Leo]' : '[ocultar a Leo]';
    el.ocultar.setAttribute('aria-pressed', String(estado.oculto));
    if (estado.oculto) { cerrarBocadillo(true); despertar(false); }
    medir();
  }

  function aplicarSonido() {
    el.sonido.textContent = Sonido.activo ? '🔊' : '🔇';
    el.sonido.setAttribute('aria-label', Sonido.activo ? 'Desactivar sonido' : 'Activar sonido');
    el.sonido.setAttribute('aria-pressed', String(Sonido.activo));
  }

  // Tocar el bocadillo lo cierra (útil en móvil)
  el.bocadillo.addEventListener('click', () => cerrarBocadillo(false));

  el.ocultar.addEventListener('click', () => {
    estado.oculto = !estado.oculto;
    guardarPreferencia('leoos-leo-oculto', estado.oculto ? '1' : '0');
    aplicarOculto();
  });

  el.sonido.addEventListener('click', () => {
    Sonido.activo = !Sonido.activo;
    Sonido.gesto = true;
    guardarPreferencia('leoos-sonido', Sonido.activo ? '1' : '0');
    aplicarSonido();
    Sonido.blip();
  });

  /* ---------------------------------------------------------
     Scroll, progreso y XP
     --------------------------------------------------------- */
  function calcularProgreso() {
    const maximo = document.documentElement.scrollHeight - window.innerHeight;
    estado.progreso = maximo > 0 ? Math.min(1, Math.max(0, window.scrollY / maximo)) : 0;
    const anchoPista = document.documentElement.clientWidth;
    const minimo = 8;
    const tope = Math.max(minimo, anchoPista - estado.anchoSprite - 8);
    estado.objetivoX = reducido() ? minimo : minimo + (tope - minimo) * estado.progreso;
    const porcentaje = Math.round(estado.progreso * 100);
    el.relleno.style.width = porcentaje + '%';
    if (el.xp.getAttribute('aria-valuenow') !== String(porcentaje)) {
      el.xp.setAttribute('aria-valuenow', String(porcentaje));
    }
  }

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y !== estado.ultimoScrollY) { estado.direccionScroll = y > estado.ultimoScrollY ? 1 : -1; }
    estado.ultimoScrollY = y;
    estado.ultimoScroll = performance.now();
    calcularProgreso();
    registrarActividad();
  }, { passive: true });

  window.addEventListener('resize', medir, { passive: true });

  function subirNivel() {
    estado.nivel += 1;
    el.nivel.textContent = 'NIVEL ' + estado.nivel;
    el.xp.classList.remove('destello');
    void el.xp.offsetWidth;
    el.xp.classList.add('destello');
    Sonido.nivel();
    if (estado.oculto) { return; }
    const flotante = document.createElement('span');
    flotante.className = 'leo__nivel-flotante';
    flotante.setAttribute('aria-hidden', 'true');
    flotante.textContent = '+LVL UP!';
    el.leo.appendChild(flotante);
    setTimeout(() => flotante.remove(), 1400);
  }

  /* ---------------------------------------------------------
     Bocadillo de diálogo
     --------------------------------------------------------- */
  function anunciar(texto) {
    el.anuncio.textContent = '';
    setTimeout(() => { el.anuncio.textContent = 'Mini Leo dice: ' + texto; }, 50);
  }

  function iniciarAccion(tipo) {
    const ahora = performance.now();
    switch (tipo) {
      case 'saludar': estado.accion = { tipo: 'saludar', restante: 2200 }; break;
      case 'laptop': estado.accion = { tipo: 'laptop', restante: 3200 }; break;
      case 'celebrar': estado.accion = { tipo: 'celebrar', restante: 2000 }; break;
      case 'jefe':
        estado.accion = { tipo: 'celebrar', restante: 2600 };
        saltar(85);
        setTimeout(() => saltar(70), 700);
        confeti();
        break;
      case 'bailar': estado.accion = { tipo: 'bailar', restante: 3600, inicio: ahora }; break;
      default: estado.accion = null;
    }
  }

  function decir(texto, accion, inmediato) {
    if (estado.oculto || !estado.activo) { return; }
    const peticion = { texto: texto, accion: accion };
    if (inmediato || !estado.bocadillo) {
      mostrarBocadillo(peticion);
    } else {
      estado.cola.push(peticion);
      if (estado.cola.length > 3) { estado.cola.shift(); }
    }
  }

  function mostrarBocadillo(peticion) {
    const letras = Array.from(peticion.texto);
    const ahora = performance.now();
    estado.bocadillo = {
      letras: letras,
      mostradas: reducido() ? letras.length : 0,
      siguiente: ahora,
      cierre: reducido() ? ahora + DURACION_BOCADILLO_MS : Infinity,
    };
    el.textoBocadillo.textContent = reducido() ? peticion.texto : '';
    el.bocadillo.classList.add('visible');
    anunciar(peticion.texto);
    if (peticion.accion) { iniciarAccion(peticion.accion); }
  }

  function cerrarBocadillo(vaciarCola) {
    estado.bocadillo = null;
    el.bocadillo.classList.remove('visible');
    if (vaciarCola) { estado.cola = []; }
  }

  function actualizarBocadillo(ahora) {
    const b = estado.bocadillo;
    if (!b) {
      if (estado.cola.length) { mostrarBocadillo(estado.cola.shift()); }
      return;
    }
    if (b.mostradas < b.letras.length && ahora >= b.siguiente) {
      b.mostradas += 1;
      el.textoBocadillo.textContent = b.letras.slice(0, b.mostradas).join('');
      b.siguiente = ahora + 32;
      if (b.mostradas % 2 === 0 && b.letras[b.mostradas - 1] !== ' ') { Sonido.blip(); }
      if (b.mostradas === b.letras.length) { b.cierre = ahora + DURACION_BOCADILLO_MS; }
    }
    if (ahora >= b.cierre) { cerrarBocadillo(false); }
  }

  function posicionarBocadillo() {
    if (!el.bocadillo.classList.contains('visible')) { return; }
    const anchoVista = document.documentElement.clientWidth;
    const ancho = el.bocadillo.offsetWidth;
    const centro = estado.x + estado.anchoSprite / 2;
    const izquierda = Math.min(Math.max(8, centro - ancho / 2), anchoVista - ancho - 8);
    const alturaSalto = estado.salto ? estado.salto.y * estado.escala : 0;
    el.bocadillo.style.transform = 'translate3d(' + Math.round(izquierda) + 'px,' + Math.round(-alturaSalto) + 'px,0)';
    el.cola.style.left = Math.round(Math.min(Math.max(12, centro - izquierda), ancho - 20)) + 'px';
  }

  /* ---------------------------------------------------------
     Acciones físicas: salto, voltereta, sueño, confeti
     --------------------------------------------------------- */
  function saltar(fuerza, giro) {
    if (reducido()) { return; }
    const v = fuerza || 60;
    estado.salto = { y: 0, vy: v, giro: !!giro, t: 0, duracion: (2 * v) / 260 };
    Sonido.salto();
  }

  function dormir() {
    if (estado.dormido) { return; }
    estado.dormido = true;
    estado.accion = null;
    estado.ignorarActividadHasta = performance.now() + 1500;
    cerrarBocadillo(true);
    el.zetas.classList.toggle('leo__zetas--estatico', reducido());
    if (reducido()) { el.zetas.textContent = 'Z z'; }
  }

  function despertar(conSaludo) {
    if (!estado.dormido) { return; }
    estado.dormido = false;
    el.zetas.textContent = '';
    el.zetas.classList.remove('leo__zetas--estatico');
    if (conSaludo !== false) {
      saltar(55);
      decir('¡Ah! Estaba descansando los ojos.', null, true);
    }
  }

  function registrarActividad() {
    const ahora = performance.now();
    estado.ultimaActividad = ahora;
    if (estado.dormido && ahora > estado.ignorarActividadHasta) { despertar(); }
  }

  ['mousemove', 'keydown', 'pointerdown', 'wheel', 'touchstart'].forEach((tipo) => {
    window.addEventListener(tipo, registrarActividad, { passive: true });
  });

  window.addEventListener('mousemove', (evento) => {
    estado.ratonX = evento.clientX;
  }, { passive: true });

  function soltarZeta(ahora) {
    if (reducido() || ahora < estado.proximaZ) { return; }
    estado.proximaZ = ahora + 900;
    const z = document.createElement('span');
    z.className = 'leo__zeta';
    z.textContent = 'Z';
    el.zetas.appendChild(z);
    setTimeout(() => z.remove(), 2400);
  }

  function confeti() {
    if (reducido()) { return; }
    const capa = document.createElement('div');
    capa.className = 'leo-confeti';
    capa.setAttribute('aria-hidden', 'true');
    const colores = ['var(--verde)', 'var(--ambar)', 'var(--magenta)', '#d3dde6'];
    for (let i = 0; i < 70; i++) {
      const pieza = document.createElement('span');
      const tam = Math.random() < 0.5 ? 6 : 8;
      pieza.style.left = Math.random() * 100 + '%';
      pieza.style.width = tam + 'px';
      pieza.style.height = tam + 'px';
      pieza.style.background = colores[i % colores.length];
      pieza.style.setProperty('--dx', (Math.random() * 160 - 80).toFixed(0) + 'px');
      pieza.style.setProperty('--giro', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      pieza.style.animationDuration = (1.6 + Math.random() * 1.4).toFixed(2) + 's';
      pieza.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
      capa.appendChild(pieza);
    }
    document.body.appendChild(capa);
    setTimeout(() => capa.remove(), 3800);
  }

  /* ---------------------------------------------------------
     Clic o tap en Mini Leo
     --------------------------------------------------------- */
  el.boton.addEventListener('click', () => {
    const ahora = performance.now();
    if (estado.dormido) { despertar(); return; }
    estado.clics = ahora - estado.ultimoClic < 1500 ? estado.clics + 1 : 1;
    estado.ultimoClic = ahora;
    if (estado.clics >= 5) {
      estado.clics = 0;
      saltar(90, true);
      decir('Vale, vale, ¡ya entendí!', null, true);
      return;
    }
    let indice;
    do { indice = Math.floor(Math.random() * FRASES.length); } while (indice === estado.ultimaFrase);
    estado.ultimaFrase = indice;
    saltar(60);
    decir(FRASES[indice], null, true);
  });

  /* ---------------------------------------------------------
     Código secreto
     --------------------------------------------------------- */
  const SECUENCIA = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let posicionSecuencia = 0;
  let temporizadorSecreto = null;

  document.addEventListener('keydown', (evento) => {
    if (esMovil()) { return; }
    const destino = evento.target;
    if (destino && (destino.tagName === 'INPUT' || destino.tagName === 'TEXTAREA' || destino.isContentEditable)) { return; }
    const tecla = String(evento.key || '').toLowerCase();
    if (tecla === SECUENCIA[posicionSecuencia]) {
      posicionSecuencia += 1;
      if (posicionSecuencia === SECUENCIA.length) {
        posicionSecuencia = 0;
        activarSecreto();
      }
    } else {
      posicionSecuencia = tecla === SECUENCIA[0] ? 1 : 0;
    }
  });

  function activarSecreto() {
    estado.gafas = true;
    raiz.classList.add('tema-ambar');
    saltar(70);
    decir('Modo retro activado. Gafas puestas 😎', 'celebrar', true);
    clearTimeout(temporizadorSecreto);
    temporizadorSecreto = setTimeout(() => {
      estado.gafas = false;
      raiz.classList.remove('tema-ambar');
    }, 10000);
  }

  /* ---------------------------------------------------------
     Reacciones por sección
     --------------------------------------------------------- */
  const reaccionadas = new Set();
  const visitadasNivel = new Set();
  const intersectando = new Set();
  let pendientes = new Set();
  let temporizadorReacciones = null;

  function procesarPendientes() {
    ORDEN.forEach((id) => {
      if (pendientes.has(id) && intersectando.has(id) && !reaccionadas.has(id) && !estado.oculto && !estado.dormido) {
        reaccionadas.add(id);
        const r = REACCIONES[id];
        decir(r.texto, r.accion, false);
      }
    });
    pendientes = new Set();
  }

  function alEntrar(id) {
    intersectando.add(id);
    if (SECCIONES_NIVEL.indexOf(id) !== -1 && !visitadasNivel.has(id)) {
      visitadasNivel.add(id);
      subirNivel();
    }
    if (!reaccionadas.has(id)) {
      pendientes.add(id);
      clearTimeout(temporizadorReacciones);
      temporizadorReacciones = setTimeout(procesarPendientes, id === 'inicio' ? 900 : 450);
    }
  }

  function observarSecciones() {
    if (!('IntersectionObserver' in window)) { return; }
    const llamada = (entradas) => {
      entradas.forEach((entrada) => {
        const id = entrada.target.id;
        if (entrada.isIntersecting) { alEntrar(id); } else { intersectando.delete(id); }
      });
    };
    const secciones = new IntersectionObserver(llamada, { rootMargin: '-40% 0px -40% 0px' });
    ['inicio', 'bio', 'experiencia', 'stack', 'materia', 'galeria', 'contacto'].forEach((id) => {
      const nodo = document.getElementById(id);
      if (nodo) { secciones.observe(nodo); }
    });
    const objetos = new IntersectionObserver(llamada, { threshold: 0.6 });
    ['logro-jefe', 'terminal'].forEach((id) => {
      const nodo = document.getElementById(id);
      if (nodo) { objetos.observe(nodo); }
    });
  }

  /* ---------------------------------------------------------
     Bucle principal (un solo requestAnimationFrame)
     --------------------------------------------------------- */
  let idBucle = null;
  let ultimoTiempo = 0;

  function paso(ahora) {
    idBucle = requestAnimationFrame(paso);
    const dt = Math.min(64, ahora - (ultimoTiempo || ahora));
    ultimoTiempo = ahora;
    const quieto = reducido();

    // Posición con interpolación suave
    const antes = estado.x;
    if (quieto) {
      estado.x = estado.objetivoX;
    } else {
      const factor = 1 - Math.pow(1 - 0.08, dt / 16.67);
      estado.x += (estado.objetivoX - estado.x) * factor;
    }
    const distancia = estado.objetivoX - estado.x;
    const scrollReciente = ahora - estado.ultimoScroll < 300;
    estado.caminando = !quieto && !estado.dormido && (Math.abs(distancia) > 1.5 || scrollReciente);
    if (estado.caminando) {
      if (Math.abs(estado.x - antes) > 0.05) { estado.mirando = estado.x > antes ? 1 : -1; }
      else if (scrollReciente) { estado.mirando = estado.direccionScroll; }
      const frame = Math.floor(ahora / 120) % 4;
      if (frame !== estado.frameCaminar && frame % 2 === 0) { Sonido.paso(); }
      estado.frameCaminar = frame;
    }

    // Acción en curso (solo avanza cuando no camina)
    if (estado.accion && !estado.caminando) {
      estado.accion.restante -= dt;
      if (estado.accion.restante <= 0) { estado.accion = null; }
    }

    // Salto
    let giro = 0;
    if (estado.salto) {
      const s = estado.salto;
      const segundos = dt / 1000;
      s.t += segundos;
      s.vy -= 260 * segundos;
      s.y += s.vy * segundos;
      if (s.giro) { giro = Math.min(1, s.t / s.duracion) * 360; }
      if (s.y <= 0 && s.vy < 0) { estado.salto = null; giro = 0; }
    }

    // Inactividad
    if (!estado.dormido && !estado.oculto && ahora - estado.ultimaActividad > INACTIVIDAD_MS) { dormir(); }
    if (estado.dormido) { soltarZeta(ahora); }

    // Parpadeo aleatorio cada 3 a 6 segundos
    if (ahora >= estado.proximoParpadeo) {
      estado.parpadeoHasta = ahora + 140;
      estado.proximoParpadeo = ahora + 3000 + Math.random() * 3000;
    }

    // Elegir pose
    let pose = 'idle';
    let frame = 0;
    let bob = quieto ? 0 : Math.floor(ahora / 600) % 2;
    let flip = estado.mirando;
    const enAire = !!estado.salto;
    if (estado.dormido) {
      pose = 'dormir';
      bob = quieto ? 1 : Math.floor(ahora / 1200) % 2;
    } else if (quieto) {
      pose = 'idle';
    } else if (estado.accion && !estado.caminando) {
      const t = ahora;
      pose = estado.accion.tipo;
      if (pose === 'saludar') { frame = Math.floor(t / 220) % 2; bob = 0; }
      if (pose === 'laptop') { frame = Math.floor(t / 140) % 2; bob = 0; }
      if (pose === 'celebrar') { bob = 0; }
      if (pose === 'bailar') {
        const paso4 = Math.floor((t - estado.accion.inicio) / 260) % 4;
        pose = paso4 % 2 === 0 ? 'celebrar' : 'saludar';
        frame = paso4 === 1 ? 0 : 1;
        bob = paso4 % 2;
        flip = Math.floor((t - estado.accion.inicio) / 520) % 2 ? -1 : 1;
        if (paso4 === 0 && !estado.salto && estado.accion.restante > 400) { saltar(35); }
      }
    } else if (estado.caminando) {
      pose = 'caminar';
      frame = estado.frameCaminar;
      bob = frame % 2;
    }
    if (enAire && pose !== 'dormir' && !estado.caminando && !(estado.accion && estado.accion.tipo === 'bailar')) {
      pose = 'celebrar';
      bob = 0;
    }

    // Mirada: hacia el ratón en escritorio; si no, hacia donde camina
    let mirada = flip;
    if (consultaEscritorio.matches && estado.ratonX !== null) {
      const centro = estado.x + estado.anchoSprite / 2;
      if (Math.abs(estado.ratonX - centro) > 12) { mirada = estado.ratonX > centro ? 1 : -1; }
    }
    // El lienzo se voltea, así que la mirada se expresa en coordenadas del sprite
    const miradaSprite = flip === -1 ? -mirada : mirada;

    const descripcion = {
      pose: pose,
      frame: frame,
      bob: bob,
      mirada: miradaSprite,
      ojosCerrados: estado.dormido || ahora < estado.parpadeoHasta,
      bocaAbierta: pose === 'celebrar' && !estado.dormido,
      gafas: estado.gafas,
    };
    const clave = [pose, frame, bob, miradaSprite, descripcion.ojosCerrados, descripcion.bocaAbierta, descripcion.gafas].join('|');
    if (clave !== estado.claveDibujo) {
      estado.claveDibujo = clave;
      dibujar(contexto, componer(descripcion), paleta);
    }

    // Transformaciones
    const alturaSalto = estado.salto ? estado.salto.y * estado.escala : 0;
    el.leo.style.transform = 'translate3d(' + estado.x.toFixed(1) + 'px,' + (-alturaSalto).toFixed(1) + 'px,0)';
    el.lienzo.style.transform = 'scaleX(' + flip + ')' + (giro ? ' rotate(' + giro.toFixed(0) + 'deg)' : '');
    const escalaSombra = Math.max(0.4, 1 - alturaSalto / 80);
    el.sombra.style.transform = 'translate3d(' + (estado.x + estado.anchoSprite * 0.2).toFixed(1) + 'px,0,0) scaleX(' + escalaSombra.toFixed(2) + ')';

    actualizarBocadillo(ahora);
    posicionarBocadillo();
  }

  function arrancarBucle() {
    if (idBucle !== null || document.hidden) { return; }
    ultimoTiempo = 0;
    idBucle = requestAnimationFrame(paso);
  }

  function detenerBucle() {
    if (idBucle !== null) { cancelAnimationFrame(idBucle); idBucle = null; }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { detenerBucle(); } else if (estado.activo) { arrancarBucle(); }
  });

  /* ---------------------------------------------------------
     API para la terminal
     --------------------------------------------------------- */
  window.MiniLeo = {
    bailar() {
      if (estado.oculto) { return 'oculto'; }
      if (estado.dormido) { despertar(false); }
      if (reducido()) {
        decir('Bailaría, pero tienes activado «reducir movimiento».', null, true);
        return 'quieto';
      }
      decir('¡Mira cómo bailo! ♪', 'bailar', true);
      return 'ok';
    },
    dormir() {
      if (estado.oculto) { return 'oculto'; }
      dormir();
      return 'ok';
    },
  };

  /* ---------------------------------------------------------
     Inicio: Mini Leo entra caminando cuando termina el arranque
     --------------------------------------------------------- */
  function activar() {
    if (estado.activo) { return; }
    estado.activo = true;
    franja.classList.remove('leo-franja--esperando');
    medir();
    estado.x = reducido() ? estado.objetivoX : -estado.anchoSprite - 10;
    estado.ultimaActividad = performance.now();
    observarSecciones();
    arrancarBucle();
  }

  aplicarSonido();
  aplicarOculto();

  if (window.LEOOS_LISTO) {
    activar();
  } else {
    document.addEventListener('leoos:listo', activar, { once: true });
  }
})();
