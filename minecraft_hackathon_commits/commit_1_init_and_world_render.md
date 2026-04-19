КОММИТ 1
Имя коммита:
chore: init project and render first playable voxel world

Сверх-краткая идея:
Создать пустой проект, подключить canvas, описать данные мира, сгенерировать маленький рельеф и научиться рисовать весь мир из изометрических блоков. После этого коммита уже должен открываться "Minecraft-like" экран с блочным миром.

Цель коммита:
Сделать первый рабочий экран игры: небо + изометрический блочный мир.

Файлы:
- создать index.html
- создать style.css
- создать script.js

====================
1. СОЗДАТЬ index.html
====================

Создать файл index.html и вставить в него:

1) стандартный HTML5-каркас
2) <canvas id="game"></canvas>
3) overlay UI:
   - div#ui
   - div#title
   - div#crosshair
   - div#info
   - div#coords
   - div#selectedBlock
   - div#hotbar
   - div#help
4) подключить style.css
5) подключить script.js перед </body>

Нужно, чтобы структура была примерно такая:

- body
  - canvas#game
  - div#ui
    - div#title
    - div#crosshair
    - div#info
      - div#coords
      - div#selectedBlock
    - div#hotbar
    - div#help

Что должно быть после шага:
- страница открывается
- в DOM есть canvas и UI-контейнер

===================
2. СОЗДАТЬ style.css
===================

Создать файл style.css.

Написать стили:

1) Для *:
   - box-sizing: border-box
   - margin: 0
   - padding: 0

2) Для body:
   - overflow: hidden
   - background: голубой/небесный фон
   - font-family: monospace
   - color: white

3) Для canvas:
   - display: block
   - width: 100vw
   - height: 100vh

4) Для #ui:
   - position: fixed
   - inset: 0
   - pointer-events: none

5) Для #title:
   - absolute сверху слева
   - крупный шрифт
   - text-shadow

6) Для #crosshair:
   - absolute по центру
   - transform: translate(-50%, -50%)

7) Для #info:
   - absolute сверху слева под title

8) Для #hotbar:
   - absolute снизу по центру
   - display: flex
   - gap

9) Для .hotbar-slot:
   - фиксированный размер
   - border
   - полупрозрачный фон
   - display:flex
   - align-items:center
   - justify-content:center

10) Для .hotbar-slot.active:
   - более яркая рамка
   - небольшой сдвиг вверх

11) Для #help:
   - absolute снизу слева

Что должно быть после шага:
- canvas на весь экран
- UI виден поверх canvas
- хотбар имеет нормальный каркас

====================
3. СОЗДАТЬ script.js
====================

Создать файл script.js.

Сразу писать код в таком порядке.

Шаг 3.1. Инициализация canvas
Написать:
- const canvas = document.getElementById("game");
- const ctx = canvas.getContext("2d");

Сделать функцию resizeCanvas():
- canvas.width = window.innerWidth;
- canvas.height = window.innerHeight;

Подписаться на window resize.
Сразу вызвать resizeCanvas().

Шаг 3.2. Объявить константы мира
Добавить:
- WORLD_W = 16
- WORLD_H = 8
- WORLD_D = 16

Добавить id блоков:
- BLOCK_AIR = 0
- BLOCK_GRASS = 1
- BLOCK_DIRT = 2
- BLOCK_STONE = 3
- BLOCK_WOOD = 4
- BLOCK_LEAVES = 5
- BLOCK_SAND = 6

Добавить BLOCK_NAMES:
- grass, dirt, stone, wood, leaves, sand

Добавить BLOCK_COLORS:
Для каждого блока описать:
- top
- left
- right

Важно:
- BLOCK_AIR не рендерить
- top светлее боковых граней

Шаг 3.3. Добавить глобальные переменные
Написать:
- let world = [];
- const player = { x: 8, y: 6, z: 8, speed: 0.08 };
- let selectedBlockIndex = 0;
- let hoveredBlock = null;

На этом коммите hoveredBlock пока не использовать, но оставить объявленным.

=================================
4. СДЕЛАТЬ ХРАНЕНИЕ МИРА И HELPERS
=================================

Написать функции:

1) createEmptyWorld()
- world = []
- три вложенных цикла по x/y/z
- в каждую ячейку записывать BLOCK_AIR

2) inBounds(x, y, z)
- вернуть true, только если координаты внутри мира

3) getBlock(x, y, z)
- если координаты вне границ, вернуть BLOCK_AIR
- иначе вернуть world[x][y][z]

4) setBlock(x, y, z, value)
- если координаты вне границ, ничего не делать
- иначе записать value

Что должно быть после шага:
- можно безопасно читать и писать блоки

===========================
5. СГЕНЕРИРОВАТЬ ЛАНДШАФТ МИРА
===========================

Написать:

1) функцию getTopHeight(x, z)
- пройти y сверху вниз
- вернуть первый y, где блок не AIR
- если ничего нет, вернуть -1

2) функцию placeTree(x, z)
- найти groundY через getTopHeight
- если места по высоте мало, выйти
- поставить 3 блока дерева вверх
- сверху сделать листья 3x3
- по желанию еще 1 блок листьев сверху

3) функцию generateWorld()
Внутри:
- вызвать createEmptyWorld()
- пройти по каждому x и z
- высоту считать через sin/cos, например:
  height = floor(2 + sin(x * 0.5) * 1.2 + cos(z * 0.45) * 1.2) + 2
- зажать высоту в пределах от 1 до WORLD_H - 2
- заполнить столбец:
  - верхний блок: grass или sand
  - 2 слоя под ним: dirt
  - ниже: stone

После заполнения вызвать:
- placeTree(4, 4)
- placeTree(10, 11)

Важно:
- не использовать Perlin noise
- не делать случайную генерацию на старте
- генерация должна быть детерминированной

Что должно быть после шага:
- в памяти лежит готовый блочный мир

=========================================
6. СДЕЛАТЬ ИЗОМЕТРИЧЕСКУЮ МАТЕМАТИКУ И РЕНДЕР
=========================================

Добавить константы:
- TILE_W = 48
- TILE_H = 24
- BLOCK_H = 24

Написать worldToScreen(x, y, z):
- sx = (x - z) * (TILE_W / 2)
- sy = (x + z) * (TILE_H / 2) - y * BLOCK_H
- вернуть координаты с учетом центра canvas и позиции player

Формула должна:
- центрировать сцену
- сдвигать мир в зависимости от player.x / player.y / player.z

Написать drawFace(points, color):
- beginPath
- moveTo первой точке
- пройти lineTo по остальным точкам
- closePath
- fillStyle = color
- fill()
- strokeStyle = "rgba(0,0,0,0.25)"
- stroke()

Написать drawBlock(x, y, z, blockId):
- если blockId === BLOCK_AIR, return
- получить p = worldToScreen(...)
- собрать 3 массива точек:
  - top
  - left
  - right
- вызвать drawFace(left, ...)
- вызвать drawFace(right, ...)
- вызвать drawFace(top, ...)

Важно:
- top рисовать последним
- использовать цвета из BLOCK_COLORS[blockId]

===================================
7. СДЕЛАТЬ РЕНДЕР ВСЕГО МИРА
===================================

Написать renderWorld():
1) создать пустой массив blocks
2) пройти весь мир
3) для каждого не-air блока добавить объект:
   - x
   - y
   - z
   - id
   - sort = x + y + z
4) отсортировать blocks по sort
5) в цикле вызвать drawBlock(...)

Пока не пытаться оптимизировать.
Пока не делать hidden-face culling.

===========================
8. СДЕЛАТЬ РЕНДЕР-КАДР И LOOP
===========================

Написать render():
- clearRect
- залить фон цветом неба
- вызвать renderWorld()

Написать пустой update():
- пока ничего не делать

Написать loop():
- update()
- render()
- requestAnimationFrame(loop)

===========================
9. СДЕЛАТЬ ИНИЦИАЛИЗАЦИЮ
===========================

В конце файла:
- вызвать generateWorld()
- записать в coords текст заглушку
- записать в selectedBlock текст заглушку, например Grass
- вызвать loop()

====================================
10. ЧТО ДОЛЖНО РАБОТАТЬ ПОСЛЕ КОММИТА
====================================

После запуска:
- есть полный экран
- есть небо
- есть изометрический блочный мир
- есть 2-3 дерева
- UI виден
- ошибок в консоли нет

====================================
11. ЧЕГО НЕ ДЕЛАТЬ В ЭТОМ КОММИТЕ
====================================

Не делать:
- движение
- hover
- ломание/установку
- localStorage
- хотбар-логику
- физику
- коллизии

Если начать делать это здесь, коммит станет нестабильным.
