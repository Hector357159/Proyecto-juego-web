# Evidencia de vibecoding — Torogoz: Vuelo sobre el Añil

**Actividad:** Semana 2 — Vibecoding  
**Proyecto:** Mini-juego *endless flyer* en pixel art  
**Tecnologías:** HTML5 Canvas, CSS y JavaScript; Python solo para el servidor local opcional  
**Asistente de IA:** modelo de lenguaje usado como copiloto dentro del editor  
**Editor:** VS Code / OpenCode

> Este documento reúne los prompts que utilicé, por qué los fui ajustando, las mejoras que solicité, cómo validé el resultado y mi reflexión final. Los prompts están resumidos y ordenados para la entrega, pero conservan las instrucciones y correcciones principales que fui dando durante el desarrollo.

---

## 1. Resumen del proyecto

**Torogoz: Vuelo sobre el Añil** es un mini-juego en el que controlo al torogoz, el ave nacional de El Salvador. El pájaro vuela entre troncos de ceiba; cada tronco superado suma un punto. El juego tiene menú animado, tres dificultades, récord personal, top 5, medallas, pausa, silencio y reinicio inmediato al perder.

Lo desarrollé con HTML, CSS y JavaScript, sin frameworks ni proceso de compilación. El arte es pixel art generado por código, la música y los efectos se sintetizan con WebAudio y la persistencia usa `localStorage`. El proyecto incluye un servidor local opcional en Python (`servir.py`) y funciona también abriendo `index.html` directamente.

---

## 2. Cómo trabajé con la IA

No le pedí todo el juego de una sola vez. Trabajé en ciclos:

1. **Definí el alcance** y las restricciones técnicas en el primer prompt.
2. **Revisé el resultado** ejecutando el juego y leyendo el código generado.
3. **Detecté lo que faltaba** (identidad visual, jugabilidad, controles móviles, errores).
4. **Refiné el prompt** con instrucciones concretas y medibles.
5. **Probé de nuevo** y documenté lo que cambié.

Mi regla fue no aceptar código que no pudiera explicar o probar. Cuando la IA proponía algo que no entendía, le pedía que me explicara la parte específica antes de modificarla.

---

## 3. Prompts utilizados

### Prompt 1 — Base del juego y alcance

> Quiero hacer un mini-juego estilo Flappy Bird para la actividad de vibecoding. Usa HTML, CSS y JavaScript, sin frameworks ni instalación, y que funcione abriendo `index.html`. El protagonista debe ser el torogoz, el ave nacional de El Salvador, dibujado en pixel art. Necesito: menú con el personaje y opciones, contador de puntos visible durante la partida, dificultad seleccionable, récord guardado, pausa y botón de reinicio al perder. Todo en español y que se vea bien en computadora y celular.

**Qué pedí:** una primera versión funcional con todos los requisitos mínimos de la actividad, sin dependencias externas.

**Por qué lo ajusté o refiné:** quería cerrar el alcance desde el inicio para evitar que la IA agregara librerías o funciones que no necesitaba. También fijé el idioma y el personaje desde el primer prompt para no tener que corregir eso después.

**Resultado:** se generó la estructura del proyecto, el bucle del juego, la física básica, las colisiones, el menú y el sistema de puntuación. Esa versión ya se podía jugar, pero visualmente era muy sencilla.

---

### Prompt 2 — Identidad visual y escenario

> La base ya funciona, pero el personaje se ve como un pájaro genérico y el fondo es muy plano. Quiero que el torogoz se reconozca por su cresta, pico y cola, y que tenga tres poses de aleteo. Haz un fondo de El Salvador con volcanes, un pueblo con iglesia, milpa y ceibas, con parallax. Usa una paleta inspirada en el añil. En el menú, que aparezca posado en una rama, animado y parpadeando. Mantén el pixel art y la resolución 320 × 480.

**Qué pedí:** reemplazar el pájaro genérico por un torogoz reconocible y construir un escenario con identidad salvadoreña.

**Por qué lo ajusté o refiné:** la primera versión cumplía con “un pájaro que vuela”, pero no con “el torogoz”. El resultado se sentía como un clon genérico. Ajusté el prompt para exigir rasgos concretos del ave (cresta, pico, cola), un fondo específico y una paleta definida.

**Resultado:** el personaje pasó a estar dibujado con matrices de píxeles, con tres poses de aleteo y una pose de impacto. El fondo tiene capas con parallax: volcanes, pueblo, milpa, ceibas, nubes y suelo. El menú muestra al torogoz posado en una rama, con parpadeo y una bandada a lo lejos.

---

### Prompt 3 — Jugabilidad, progresión y persistencia

> Ahora quiero mejorar la jugabilidad. Que la dificultad Fácil, Normal y Difícil cambie el tamaño del hueco y la velocidad, y que se guarde en `localStorage`. El marcador debe leerse bien sobre el juego. Agrega medallas por puntaje (Barro, Copal, Oro y Añil), récord personal y top 5. También que el cielo cambie cada 15 puntos entre día, atardecer y noche, y que la velocidad suba poco a poco.

**Qué pedí:** convertir una demo funcional en un juego con progresión, rejugabilidad y metas claras.

**Por qué lo ajusté o refiné:** la versión anterior tenía una sola dificultad y el marcador se perdía entre las nubes. Quería que el jugador tuviera razones para volver a jugar y que la dificultad fuera una decisión real, no solo un texto en el menú.

**Resultado:** se agregaron los tres niveles de dificultad con valores distintos de hueco y velocidad, las medallas por puntaje, el récord personal, el top 5 y el cambio de cielo cada 15 puntos. La dificultad se conserva al recargar la página.

---

### Prompt 4 — Corrección de un error y legibilidad del HUD

> Encontré un error: al chocar, el destello rojo a veces se queda pegado y la pantalla sigue temblando aunque vuelva al menú o reinicie. Revisa el estado de impacto y asegúrate de limpiar el destello y la vibración al reiniciar, pausar o cambiar de pantalla. Además, el marcador se confunde con las nubes; ponlo en una placa con borde pixelado y buena sombra.

**Qué pedí:** corregir un fallo visual real y mejorar la lectura del marcador durante la partida.

**Por qué lo ajusté o refiné:** lo detecté al jugar varias partidas seguidas y reiniciar rápido. El juego arrancaba bien, pero después de un choque el efecto visual podía quedar activo. No bastaba con que “funcionara”: tenía que comportarse bien en el ciclo completo de partida, pausa y reinicio.

**Resultado:** el destello se movió a una variable de estado del juego (`flash`), que se actualiza y se limpia en cada transición, igual que la vibración (`shake`). El marcador quedó sobre una placa con borde y sombra, separado visualmente del fondo.

---

### Prompt 5 — Controles táctiles y accesibilidad

> Quiero que el juego se pueda usar sin teclado. En celular, toque para aletear; botones grandes para jugar y reintentar; pausa y silencio accesibles. En teclado, agrega `Esc`/`P` para pausar y `M` para silenciar. Que el foco de los botones se vea y que el canvas se escale sin difuminarse. No cambies la lógica del juego.

**Qué pedí:** ampliar los controles a móvil y mejorar la accesibilidad sin romper la jugabilidad existente.

**Por qué lo ajusté o refiné:** al probar en el celular, los botones eran pequeños y el canvas se veía borroso. La primera versión estaba pensada solo para teclado. Ajusté el prompt para separar claramente lo visual de lo lógico y pedir que no se cambiara la física.

**Resultado:** el juego responde a toque y clic, los botones tienen tamaño adecuado y foco visible, el canvas se escala con píxeles nítidos y se agregaron los atajos de pausa y silencio.

---

### Prompt 6 — Documentación y verificación

> Documenta el proyecto en español: cómo ejecutarlo, controles, reglas, estructura de archivos y créditos. Agrega un servidor local opcional en Python para quien no quiera abrir el archivo directamente. Genera capturas reales del menú, la partida, el game over y las opciones. Revisa que no haya errores en consola y que funcione también con `file://`.

**Qué pedí:** cerrar la entrega con documentación clara y una verificación fuera de mi entorno de desarrollo.

**Por qué lo ajusté o refiné:** la actividad pedía README y evidencia. Además, quería comprobar que el juego no dependiera de un servidor o de una configuración especial. Por eso pedí explícitamente la prueba con `file://` y la revisión de errores en consola.

**Resultado:** se creó el `README.md`, el servidor `servir.py`, las capturas y las pruebas automatizadas. El juego funciona abriendo el archivo directamente y también con el servidor local.

---

## 4. Iteración y mejora

### Iteración 1 — De “pájaro genérico” a torogoz reconocible

**Antes:** un pájaro amarillo simple, sin rasgos propios, sobre un fondo plano.

**Cambio solicitado:** rasgos concretos del torogoz, tres poses de aleteo, fondo salvadoreño con parallax y paleta de añil.

**Impacto:** el juego dejó de parecer un clon genérico. El personaje se reconoce por la cresta, el pico y la cola; el menú tiene una escena propia con el ave posada en una rama.

### Iteración 2 — Corrección del destello y la vibración

**Antes:** el efecto de impacto se activaba con una clase CSS y, en algunos reinicios, quedaba “pegado”.

**Cambio solicitado:** controlar el destello y la vibración como estado del juego, y limpiarlos al reiniciar, pausar o volver al menú.

**Impacto:** el ciclo completo de partida → choque → game over → reintentar quedó estable. Esta fue la corrección más importante que hice durante las pruebas.

### Iteración 3 — Marcador legible y controles móviles

**Antes:** el puntaje se confundía con las nubes y los botones eran incómodos en el celular.

**Cambio solicitado:** placa con borde pixelado para el marcador, botones más grandes, foco visible y escalado nítido.

**Impacto:** el puntaje se lee en cualquier fondo y el juego se puede jugar con una sola mano en el teléfono.

---

## 5. Validación del resultado

### 5.1 Pruebas automáticas

- Revisé la sintaxis de todos los archivos JavaScript con `node --check`.
- Compilé el servidor con `python3 -m py_compile servir.py`.
- Usé un arnés con **jsdom** para simular el recorrido completo: menú → jugar → pausa → game over → reintentar → opciones → récords.
- Usé **Playwright con Chromium** para probar escritorio y móvil, con teclado y toque, en modo día y noche, y abriendo el juego con `file://`.
- Revisé que no hubiera errores de consola ni peticiones fallidas.
- Generé capturas reales del menú, la partida, el game over y las opciones.

### 5.2 Pruebas manuales

- Jugué varias partidas completas con `Espacio`, `↑`, `W`, clic y toque.
- Probé pausa con `Esc` y `P`, silencio con `M` y reanudación desde el menú de pausa.
- Cambié la dificultad y recargué la página para comprobar que se conservara.
- Perdí a propósito para verificar el reinicio y la medalla correspondiente.
- Probé en ventana de escritorio y en tamaño de celular.

### 5.3 Error, limitación o ajuste identificado

**Error encontrado:** el destello de impacto podía quedar activo después de un choque y reinicio. La causa era que el efecto dependía de una animación CSS que no siempre se reiniciaba con el estado del juego.

**Ajuste realizado:** moví el destello a una variable `flash` dentro de `js/game.js`, la actualizo en cada frame y la reinicio en `reset()` y en las transiciones de pantalla. Hice lo mismo con la vibración (`shake`). También reforcé el marcador con una placa para que no se confundiera con el fondo.

**Limitación conocida:** el audio del navegador necesita una interacción del usuario para empezar; por eso la música arranca después del primer clic o tecla. Si el navegador bloquea `localStorage` en `file://`, el juego sigue funcionando y guarda los récords solo durante la sesión.

**Medida de seguridad:** el servidor local se enlaza únicamente a `127.0.0.1`, no a todas las interfaces de red, para que el proyecto no quede expuesto a otros equipos de la red local. No hay tokens, claves API ni credenciales en el código ni en la entrega.

---

## 6. Reflexión final

### Qué aprendí usando IA para programar

Aprendí que la IA no reemplaza la prueba del programa. Puede generar una base muy rápido, pero el resultado solo queda bien cuando uno revisa, ejecuta y corrige. También aprendí que un prompt vago produce una solución vaga: mientras más claro sea el contexto, el alcance y el criterio de aceptación, mejor es el resultado.

Otra cosa importante fue aprender a pedir cambios pequeños. Al principio pedía “mejora los gráficos” y el resultado era impredecible. Después empecé a pedir cosas concretas: “tres poses de aleteo”, “fondo con volcanes y parallax”, “placa para el marcador”. Eso hizo que la IA trabajara sobre lo que yo realmente quería.

### Ventajas y límites del vibecoding

**Ventajas:**

- Permite avanzar rápido en la estructura, el boilerplate y las primeras versiones.
- Ayuda a explorar ideas visuales y de jugabilidad que no tenía claras.
- Sirve para explicar código y proponer alternativas cuando algo no funciona.
- Facilita documentar y ordenar el proyecto al final.

**Límites:**

- Puede producir código que parece correcto pero falla en casos límite.
- Tiende a resolver con soluciones genéricas si no se le da identidad y contexto.
- No ve el resultado en pantalla; hay que probarlo uno mismo.
- A veces agrega complejidad innecesaria o dependencias que no hacen falta.
- Hay que entender lo que genera para poder mantenerlo y defenderlo.

### Qué partes del código comprendo y cuáles necesito reforzar

**Comprendo bien:**

- El bucle principal, el uso de `requestAnimationFrame` y el delta time.
- La máquina de estados del juego: menú, jugando, pausa, choque y game over.
- La física básica: gravedad, impulso al aletear y velocidad máxima de caída.
- Las colisiones entre el pájaro y los troncos.
- El sistema de puntuación y la persistencia con `localStorage`.
- La navegación entre pantallas y el manejo de eventos de teclado, clic y toque.

**Necesito reforzar:**

- La síntesis de audio con WebAudio y la programación de la música.
- El “horneado” de sprites y las rotaciones con canvas.
- Los cálculos del parallax y la generación procedural del fondo.
- El escalado responsive y los efectos CSS tipo CRT.
- El servidor local en Python y el manejo de puertos.

---

## 7. Cómo ejecutar el proyecto

**Opción 1 — abrir directamente:**

```bash
# Abrir index.html en el navegador
```

No se necesita instalar dependencias. Los detalles de controles, reglas y estructura están en el `README.md`.

---

## Anexo — Relación con los requisitos de la entrega

| Requisito | Dónde se cumple |
|---|---|
| Aplicación o mini-juego funcional | El juego se ejecuta sin errores críticos y cumple el objetivo |
| Al menos 3 prompts | Se incluyen 6 prompts con explicación |
| Qué se pidió y por qué se ajustó | Cada prompt tiene sus secciones “Qué pedí” y “Por qué lo ajusté” |
| Evidencia de al menos una mejora | Iteraciones 1, 2 y 3, con antes/después e impacto |
| Cómo se probó el código | Sección 5.1 y 5.2 |
| Error, limitación o ajuste | Destello pegado, corregido con estado `flash`; limitaciones de audio y `localStorage` |
| Reflexión final | Sección 6 |
| README o documento corto | Este documento y el `README.md` del proyecto |
