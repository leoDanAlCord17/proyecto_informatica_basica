/* =========================================================
   leo._.dac · Lógica de la página
   ========================================================= */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var consultaMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  function movimientoReducido() {
    return consultaMovimiento.matches;
  }

  function esperar(ms) {
    return new Promise(function (resolver) { setTimeout(resolver, ms); });
  }

  /* ---------------------------------------------------------
     1. Fotos: si el archivo existe se muestra; si no, el marcador
     --------------------------------------------------------- */
  function cargarFotos() {
    var figuras = document.querySelectorAll('[data-foto]');
    figuras.forEach(function (figura) {
      var marco = figura.querySelector('.foto__marco');
      var imagen = new Image();
      imagen.className = 'foto__img';
      imagen.alt = figura.getAttribute('data-alt') || '';
      imagen.decoding = 'async';
      imagen.addEventListener('load', function () {
        // El cuadro adopta la proporción real de la foto para que se vea completa
        if (imagen.naturalWidth && imagen.naturalHeight) {
          marco.style.aspectRatio = imagen.naturalWidth + ' / ' + imagen.naturalHeight;
        }
        marco.appendChild(imagen);
        figura.classList.add('foto--cargada');
      });
      imagen.addEventListener('error', function () {
        figura.classList.add('foto--vacia');
      });
      imagen.src = figura.getAttribute('data-foto');
    });
  }

  /* ---------------------------------------------------------
     2. Pantalla de arranque (solo la primera vez de la sesión)
     --------------------------------------------------------- */
  function arrancar() {
    var pantalla = document.getElementById('arranque');
    var texto = document.getElementById('arranque-texto');

    if (!raiz.classList.contains('con-arranque') || !pantalla || movimientoReducido()) {
      raiz.classList.remove('con-arranque');
      return Promise.resolve();
    }

    var lineas = [
      { t: 'leo._.dac BIOS v1.0 · 640 KB de memoria OK', espera: 250 },
      { t: 'Iniciando leo._.dac v1.0...', espera: 450 },
      { t: 'Cargando módulos:', espera: 200 },
      { t: ' biografía ✓', espera: 230, enLinea: true },
      { t: ' experiencia ✓', espera: 230, enLinea: true },
      { t: ' materia ✓', espera: 350, enLinea: true },
      { t: 'Bienvenido.', espera: 500, clase: 'ambar' }
    ];

    var terminado = false;
    var finalizar;
    var promesa = new Promise(function (resolver) { finalizar = resolver; });

    function cerrar() {
      if (terminado) { return; }
      terminado = true;
      try { sessionStorage.setItem('leoos-arranque', '1'); } catch (e) { /* sin almacenamiento */ }
      pantalla.classList.add('saliendo');
      document.removeEventListener('keydown', cerrar);
      pantalla.removeEventListener('click', cerrar);
      pantalla.removeEventListener('touchstart', cerrar);
      setTimeout(function () {
        raiz.classList.remove('con-arranque');
        pantalla.setAttribute('hidden', '');
        finalizar();
      }, 300);
    }

    document.addEventListener('keydown', cerrar);
    pantalla.addEventListener('click', cerrar);
    pantalla.addEventListener('touchstart', cerrar, { passive: true });

    (async function () {
      for (var i = 0; i < lineas.length; i++) {
        if (terminado) { return; }
        var linea = lineas[i];
        if (i > 0 && !linea.enLinea) { texto.appendChild(document.createTextNode('\n')); }
        if (linea.clase) {
          var span = document.createElement('span');
          span.className = linea.clase;
          span.textContent = linea.t;
          texto.appendChild(span);
        } else {
          texto.appendChild(document.createTextNode(linea.t));
        }
        await esperar(linea.espera);
      }
      cerrar();
    })();

    return promesa;
  }

  /* ---------------------------------------------------------
     3. Efecto de escritura del hero
     --------------------------------------------------------- */
  function escribirHero() {
    var elementos = Array.prototype.slice.call(document.querySelectorAll('[data-escribir]'));
    if (movimientoReducido() || !elementos.length) { return; }

    var textos = elementos.map(function (el) { return el.textContent; });
    elementos.forEach(function (el) { el.textContent = ''; });

    (async function () {
      for (var i = 0; i < elementos.length; i++) {
        var letras = Array.from(textos[i]);
        var pausa = i === 0 ? 80 : (i === 1 ? 55 : 35);
        for (var j = 0; j < letras.length; j++) {
          elementos[i].textContent += letras[j];
          await esperar(pausa);
        }
        await esperar(i === 0 ? 350 : 200);
      }
    })();
  }

  /* ---------------------------------------------------------
     4. Navegación: menú móvil y sección activa
     --------------------------------------------------------- */
  function iniciarNavegacion() {
    var boton = document.getElementById('boton-menu');
    var menu = document.getElementById('menu');
    var enlaces = Array.prototype.slice.call(document.querySelectorAll('.menu__enlace'));

    function abrir(estado) {
      boton.setAttribute('aria-expanded', String(estado));
      boton.setAttribute('aria-label', estado ? 'Cerrar menú' : 'Abrir menú');
      menu.classList.toggle('abierto', estado);
    }

    boton.addEventListener('click', function () {
      abrir(boton.getAttribute('aria-expanded') !== 'true');
    });

    enlaces.forEach(function (enlace) {
      enlace.addEventListener('click', function () { abrir(false); });
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && menu.classList.contains('abierto')) {
        abrir(false);
        boton.focus();
      }
    });

    if (!('IntersectionObserver' in window)) { return; }

    var porId = {};
    enlaces.forEach(function (enlace) { porId[enlace.hash.slice(1)] = enlace; });

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) { return; }
        var enlace = porId[entrada.target.id];
        enlaces.forEach(function (otro) { otro.removeAttribute('aria-current'); });
        if (enlace) { enlace.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('section[id]').forEach(function (seccion) {
      observador.observe(seccion);
    });
  }

  /* ---------------------------------------------------------
     5. Animaciones de entrada al hacer scroll
     --------------------------------------------------------- */
  function iniciarRevelado() {
    var elementos = document.querySelectorAll('.revelar, .seccion__comando');
    var jefe = document.getElementById('logro-jefe');

    if (!('IntersectionObserver' in window)) {
      elementos.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) { return; }
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
        if (entrada.target === jefe) { mostrarAvisoLogro(); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    elementos.forEach(function (el) { observador.observe(el); });
  }

  var avisoMostrado = false;
  function mostrarAvisoLogro() {
    var aviso = document.getElementById('aviso-logro');
    if (avisoMostrado || !aviso) { return; }
    avisoMostrado = true;
    aviso.innerHTML =
      '<svg aria-hidden="true" focusable="false"><use href="#i-trofeo"/></svg>' +
      '<span><strong>¡Logro desbloqueado!</strong>Página web: jefe final derrotado</span>';
    setTimeout(function () { aviso.classList.add('visible'); }, 600);
    setTimeout(function () { aviso.classList.remove('visible'); }, 5200);
  }

  /* ---------------------------------------------------------
     6. Terminal interactiva (easter egg)
     --------------------------------------------------------- */
  function iniciarTerminal() {
    var formulario = document.getElementById('terminal-formulario');
    var entrada = document.getElementById('terminal-entrada');
    var salida = document.getElementById('terminal-salida');
    var cuerpo = document.getElementById('terminal-cuerpo');
    var historial = [];
    var posicion = 0;

    var comandos = {
      help: [
        'Comandos disponibles:',
        '  help      muestra esta ayuda',
        '  whoami    quién soy, en una línea',
        '  bio       mi biografía resumida',
        '  stack     tecnologías que uso',
        '  materia   mi experiencia en Informática Básica',
        '  contacto  dónde encontrarme',
        '  leo       Mini Leo se pone a bailar',
        '  dormir    Mini Leo se echa una siesta',
        '  clear     limpia la pantalla'
      ],
      whoami: ['Leo Álvarez — Desarrollador Full Stack'],
      bio: [
        'Soy Leo Álvarez, desarrollador full stack venezolano.',
        'Técnico Superior Universitario en Informática y estudiante de',
        'Ingeniería en Informática en el IUNAV.',
        'nov 2024 – nov 2025: desarrollador full stack en Barquisimeto.',
        'Hoy: mantenimiento y soporte IT en Torrejón de Ardoz, Madrid.',
        'Llevo unos cuatro años programando y sigo aprendiendo cada día.'
      ],
      stack: [
        'Móvil ........... Flutter, Dart, go_router',
        'Web ............. React, Vite, TypeScript, PWA',
        'Backend y datos . Python, Supabase',
        'Otros ........... Godot (videojuegos), extensiones de VS Code',
        'Infraestructura . redes, cableado estructurado, soporte de hardware y software'
      ],
      materia: [
        'Logros desbloqueados en Informática Básica (7/7):',
        '  [✓] Windows',
        '  [✓] Juego de memoria',
        '  [✓] PowerPoint',
        '  [✓] Word',
        '  [✓] Publisher',
        '  [✓] Canva',
        '  [★] Página web: jefe final'
      ]
    };

    function escribirLinea(contenido, clase) {
      var parrafo = document.createElement('p');
      parrafo.className = clase || 'respuesta';
      if (typeof contenido === 'string') {
        parrafo.textContent = contenido;
      } else {
        parrafo.appendChild(contenido);
      }
      salida.appendChild(parrafo);
    }

    function escribirEco(comando) {
      var parrafo = document.createElement('p');
      parrafo.className = 'eco';
      var usuario = document.createElement('span');
      usuario.className = 'prompt-usuario';
      usuario.textContent = 'leo._.dac';
      var ruta = document.createElement('span');
      ruta.className = 'prompt-ruta';
      ruta.textContent = ':~$';
      parrafo.appendChild(usuario);
      parrafo.appendChild(ruta);
      parrafo.appendChild(document.createTextNode(comando));
      salida.appendChild(parrafo);
    }

    function ejecutar(textoOriginal) {
      var texto = textoOriginal.trim();
      escribirEco(texto);
      if (!texto) { return; }

      var comando = texto.toLowerCase();

      if (comando === 'clear') {
        salida.textContent = '';
        return;
      }

      if (comando === 'contacto') {
        escribirLinea('GitHub:');
        var enlace = document.createElement('a');
        enlace.href = 'https://github.com/leoDanAlCord17';
        enlace.target = '_blank';
        enlace.rel = 'noopener noreferrer';
        enlace.textContent = 'https://github.com/leoDanAlCord17';
        escribirLinea(enlace);
        return;
      }

      if (comando === 'leo' || comando === 'dormir') {
        var miniLeo = window.MiniLeo;
        if (!miniLeo) {
          escribirLinea('Mini Leo no está disponible ahora mismo.', 'error');
          return;
        }
        var resultado = comando === 'leo' ? miniLeo.bailar() : miniLeo.dormir();
        if (resultado === 'oculto') {
          escribirLinea('Mini Leo está oculto. Pulsa [mostrar a Leo] en la barra inferior.', 'error');
        } else if (comando === 'leo') {
          escribirLinea(resultado === 'quieto' ? 'Mini Leo quiere bailar, pero respeta tu preferencia de movimiento reducido.' : 'Mini Leo se pone a bailar. ♪');
        } else {
          escribirLinea('Mini Leo se ha quedado dormido. Mueve el ratón o haz scroll para despertarlo.');
        }
        return;
      }

      if (Object.prototype.hasOwnProperty.call(comandos, comando)) {
        comandos[comando].forEach(function (linea) { escribirLinea(linea); });
        return;
      }

      escribirLinea('comando no encontrado: ' + texto + '. Escribe "help".', 'error');
    }

    escribirLinea('leo._.dac v1.0 — terminal interactiva.', 'tenue');
    escribirLinea('Escribe "help" para ver los comandos disponibles.', 'tenue');

    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault();
      var valor = entrada.value;
      if (valor.trim()) { historial.push(valor.trim()); }
      posicion = historial.length;
      ejecutar(valor);
      entrada.value = '';
      cuerpo.scrollTop = cuerpo.scrollHeight;
    });

    entrada.addEventListener('keydown', function (evento) {
      if (evento.key === 'ArrowUp' && posicion > 0) {
        posicion -= 1;
        entrada.value = historial[posicion];
        evento.preventDefault();
      } else if (evento.key === 'ArrowDown' && posicion < historial.length) {
        posicion += 1;
        entrada.value = historial[posicion] || '';
        evento.preventDefault();
      }
    });

    cuerpo.addEventListener('click', function (evento) {
      if (evento.target.tagName !== 'A' && !window.getSelection().toString()) {
        entrada.focus();
      }
    });

    function abrirTerminal() {
      var terminal = document.getElementById('terminal');
      terminal.scrollIntoView({ behavior: movimientoReducido() ? 'auto' : 'smooth', block: 'center' });
      entrada.focus({ preventScroll: true });
    }

    document.querySelectorAll('[data-abrir-terminal]').forEach(function (boton) {
      boton.addEventListener('click', abrirTerminal);
    });

    // Tecla ~ (en teclado español es AltGr + 4, que llega como tecla muerta)
    document.addEventListener('keydown', function (evento) {
      var destino = evento.target;
      var escribiendo = destino && (destino.tagName === 'INPUT' || destino.tagName === 'TEXTAREA' || destino.isContentEditable);
      if (escribiendo || raiz.classList.contains('con-arranque')) { return; }
      var esVirgulilla = evento.key === '~' || (evento.key === 'Dead' && evento.code === 'Digit4');
      if (esVirgulilla) {
        evento.preventDefault();
        abrirTerminal();
      }
    });
  }

  /* ---------------------------------------------------------
     Inicio
     --------------------------------------------------------- */
  cargarFotos();
  iniciarNavegacion();
  iniciarTerminal();
  arrancar().then(function () {
    // Aviso para Mini Leo (js/leo.js): ya terminó el arranque
    window.LEOOS_LISTO = true;
    document.dispatchEvent(new CustomEvent('leoos:listo'));
    escribirHero();
    iniciarRevelado();
  });
})();
