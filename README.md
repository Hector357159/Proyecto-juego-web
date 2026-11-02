# Torogoz: Vuelo sobre el Añil

Mini juego *endless flyer* en pixel art protagonizado por el **torogoz**, el ave nacional de El Salvador. Cruza los troncos de ceiba, suma puntos y consigue la medalla **AÑIL**.

## Evidencia de la actividad (Vibecoding)

La entrega de la **Semana 2 — Vibecoding** incluye el documento
[EVIDENCIA_VIBECODING.md](EVIDENCIA_VIBECODING.md), con:

- Los **6 prompts** utilizados y la explicación de qué pedí y por qué los ajusté.
- Las **iteraciones y mejoras** con su impacto visible.
- Las **pruebas** realizadas y el error corregido.
- La **reflexión final** sobre ventajas y límites del vibecoding.

**Resumen:** se desarrolló un mini-juego funcional con HTML5 Canvas, CSS y JavaScript, sin dependencias externas. La IA se usó como copiloto para generar una base, proponer mejoras visuales y de jugabilidad, y ayudar a documentar; el código fue revisado, probado y ajustado durante el proceso.


<table>
  <tr>
    <td><img src="capturas/menu.png" width="300" alt="Menú principal con el torogoz posado"></td>
    <td><img src="capturas/juego.png" width="300" alt="Partida entre troncos de ceiba"></td>
  </tr>
  <tr>
    <td align="center"><em>Menú con el torogoz animado</em></td>
    <td align="center"><em>Vuelo entre troncos</em></td>
  </tr>
</table>

## Cómo jugar

**Opción 1 — doble clic:** abre `index.html` en cualquier navegador moderno. No necesita instalación ni conexión.

**Opción 2 — servidor local (recomendado):**

```bash
python3 servir.py        # abre http://localhost:8000
python3 servir.py 9000   # otro puerto
```

El servidor escucha solo en `127.0.0.1` (tu equipo), no en toda la red local.

El juego es 100 % HTML, CSS y JavaScript; no usa frameworks ni dependencias externas.

## Controles

| Acción | Teclado | Táctil / ratón |
|---|---|---|
| Aletear | `Espacio`, `↑` o `W` | clic o toque en el juego |
| Empezar / reintentar | `Espacio` o `Enter` | botón **JUGAR** / **REINTENTAR** |
| Pausa | `Esc` o `P` | botón **II** del HUD |
| Silencio total | `M` | **Opciones** |

## Reglas

- Cada tronco superado vale **1 punto**; el contador se ve arriba durante la partida.
- El récord personal y el **top 5** se guardan en `localStorage`.
- El cielo cambia cada **15 puntos**: día → atardecer → noche → día.
- La velocidad aumenta poco a poco con la puntuación.

<table>
  <tr>
    <td><img src="capturas/game-over.png" width="300" alt="Pantalla de game over con medalla"></td>
    <td><img src="capturas/opciones.png" width="300" alt="Pantalla de opciones"></td>
  </tr>
  <tr>
    <td align="center"><em>Game over con medalla</em></td>
    <td align="center"><em>Opciones y dificultad</em></td>
  </tr>
</table>

### Medallas

| Puntos | Medalla |
|---|---|
| 0 – 4 | Barro |
| 5 – 9 | Copal |
| 10 – 19 | Oro |
| 20+ | Añil |

### Dificultades

| Nivel | Hueco | Velocidad inicial |
|---|---|---|
| Fácil | 176 px | 110 px/s |
| Normal | 150 px | 126 px/s |
| Difícil | 126 px | 144 px/s |

La dificultad se elige en **Opciones** y se guarda para la próxima partida.

## Características

- Resolución interna **320 × 480** escalada con píxeles nítidos y diseño responsive.
- Torogoz dibujado con matrices de píxeles: 3 poses de aleteo, parpadeo en el menú y pose de impacto.
- Fondo con parallax: volcanes, pueblo con iglesia, milpa, ceibas, nubes y suelo.
- Tres paletas de cielo (día, atardecer, noche) con transición suave.
- Música chiptune y efectos sintetizados con **WebAudio** (sin archivos de audio).
- Pantallas de menú, opciones, récords, cómo jugar, pausa y game over.
- Medallas, récord personal y reinicio inmediato.
- Controles de teclado y táctiles; botones reales con foco visible.

## Estructura del proyecto

```
index.html                 estructura y pantallas
css/style.css              marco, HUD, menús y efectos CRT
js/art.js                  paletas y matrices de pixel art
js/sprites.js              horneado de sprites, rotaciones y troncos
js/background.js           cielo, volcanes, pueblo, milpa y suelo
js/audio.js                música y efectos con WebAudio
js/storage.js              récords y opciones en localStorage
js/ui.js                   navegación, HUD, opciones y game over
js/game.js                 física, tubos, colisiones y puntuación
js/main.js                 bucle, escalado e input
fonts/                     fuente pixel Press Start 2P + licencia OFL
capturas/                  capturas de vista previa
servir.py                  servidor local opcional
```

## Personalización rápida

- **Física:** `GRAVITY`, `FLAP` y `MAX_FALL` en `js/game.js`.
- **Dificultad y huecos:** objeto `DIFFS` en `js/game.js`.
- **Cielos y colores:** arreglo `PHASES` en `js/background.js`.
- **Personaje:** matrices y paleta en `js/art.js`.
- **Textos de menús:** `index.html`.

## Créditos

- Fuente **Press Start 2P** de Cody “CodeMan38” Boisclair, incluida en `fonts/` bajo licencia SIL Open Font License 1.1 (`fonts/OFL.txt`).
- Inspirado en los *endless flyers* clásicos; homenaje al torogoz y al añil salvadoreño.
- Código, arte y sonido hechos a medida para este proyecto.
- Desarrollado con asistencia de IA como copiloto; el autor revisó, probó y ajustó el código y documentó el proceso en `EVIDENCIA_VIBECODING.md`.

## Notas técnicas

- Funciona abriendo `index.html` directamente; si tu navegador restringe `localStorage` en `file://`, el juego sigue funcionando y guarda los récords en memoria durante la sesión.
- Se probó de forma automatizada con jsdom (simulación completa de menú, partida, game over y opciones) y con Chromium headless (capturas y recorrido de controles), sin errores de consola ni peticiones fallidas.
