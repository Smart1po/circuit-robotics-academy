/* CIRCUIT — a 5x7 bitmap typeface, drawn by hand, shipped as text
 *
 * There is no font file here and no request to a font service. Every letter
 * below is seven rows of five characters. A '#' is a lit pixel, a '.' is not.
 * At runtime the glyphs are turned into SVG rectangles, so the type scales to
 * any size and stays perfectly crisp — no blur, no anti-aliasing, no webfont.
 *
 * Usage in HTML:
 *   <h1 class="px" data-px="BUILD A ROBOT|MAKE IT MOVE|PROVE IT">Build a robot. Make it move. Prove it.</h1>
 *
 * The real sentence stays in the element for screen readers and for anyone
 * whose JavaScript never arrives. The pixels are decoration layered on top.
 */
(function (global) {
  'use strict';

  var W = 5;   /* glyph width in pixels  */
  var H = 7;   /* glyph height in pixels */
  var ADVANCE = 6;   /* glyph width + 1px letter spacing */
  var LINE = 9;      /* glyph height + 2px leading       */

  var GLYPHS = {
    'A': '.###.|#...#|#...#|#####|#...#|#...#|#...#',
    'B': '####.|#...#|#...#|####.|#...#|#...#|####.',
    'C': '.###.|#...#|#....|#....|#....|#...#|.###.',
    'D': '####.|#...#|#...#|#...#|#...#|#...#|####.',
    'E': '#####|#....|#....|####.|#....|#....|#####',
    'F': '#####|#....|#....|####.|#....|#....|#....',
    'G': '.###.|#...#|#....|#.###|#...#|#...#|.###.',
    'H': '#...#|#...#|#...#|#####|#...#|#...#|#...#',
    'I': '#####|..#..|..#..|..#..|..#..|..#..|#####',
    'J': '....#|....#|....#|....#|#...#|#...#|.###.',
    'K': '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
    'L': '#....|#....|#....|#....|#....|#....|#####',
    'M': '#...#|##.##|#.#.#|#...#|#...#|#...#|#...#',
    'N': '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#',
    'O': '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
    'P': '####.|#...#|#...#|####.|#....|#....|#....',
    'Q': '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
    'R': '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
    'S': '.####|#....|#....|.###.|....#|....#|####.',
    'T': '#####|..#..|..#..|..#..|..#..|..#..|..#..',
    'U': '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
    'V': '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
    'W': '#...#|#...#|#...#|#...#|#.#.#|##.##|#...#',
    'X': '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
    'Y': '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
    'Z': '#####|....#|...#.|..#..|.#...|#....|#####',

    '0': '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
    '1': '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
    '2': '.###.|#...#|....#|...#.|..#..|.#...|#####',
    '3': '#####|...#.|..#..|...#.|....#|#...#|.###.',
    '4': '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
    '5': '#####|#....|####.|....#|....#|#...#|.###.',
    '6': '..##.|.#...|#....|####.|#...#|#...#|.###.',
    '7': '#####|....#|...#.|..#..|.#...|.#...|.#...',
    '8': '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
    '9': '.###.|#...#|#...#|.####|....#|...#.|.##..',

    ' ': '.....|.....|.....|.....|.....|.....|.....',
    '.': '.....|.....|.....|.....|.....|.##..|.##..',
    ',': '.....|.....|.....|.....|.##..|.##..|.#...',
    '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
    '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
    "'": '..#..|..#..|.....|.....|.....|.....|.....',
    ':': '.....|.##..|.##..|.....|.##..|.##..|.....',
    ';': '.....|.##..|.##..|.....|.##..|.##..|.#...',
    '-': '.....|.....|.....|.###.|.....|.....|.....',
    '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
    '/': '....#|....#|...#.|..#..|.#...|#....|#....',
    '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
    ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
    '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#',
    '%': '##..#|##.#.|...#.|..#..|.#...|#.##.|#..##',
    '#': '.#.#.|#####|.#.#.|.#.#.|#####|.#.#.|.....',
    '>': '.....|.#...|..#..|...#.|..#..|.#...|.....',
    '<': '.....|...#.|..#..|.#...|..#..|...#.|.....',
    '*': '.....|#.#.#|.###.|#####|.###.|#.#.#|.....',
    '"': '.#.#.|.#.#.|.....|.....|.....|.....|.....'
  };

  /* Fallback for anything not in the table: a hollow box, so a missing
   * glyph is obvious during development instead of silently vanishing. */
  var TOFU = '#####|#...#|#...#|#...#|#...#|#...#|#####';

  var cache = {};

  function rowsFor(ch) {
    if (cache[ch]) return cache[ch];
    var def = GLYPHS[ch] || GLYPHS[ch.toUpperCase()] || TOFU;
    cache[ch] = def.split('|');
    return cache[ch];
  }

  /* Merge runs of lit pixels on the same row into a single rect. A headline
   * drops from ~600 rects to ~200, which the browser is much happier with. */
  function rectsForLine(text, originY, out) {
    for (var i = 0; i < text.length; i++) {
      var rows = rowsFor(text.charAt(i));
      var ox = i * ADVANCE;

      for (var y = 0; y < H; y++) {
        var row = rows[y];
        var run = 0;

        for (var x = 0; x <= W; x++) {
          var lit = x < W && row.charAt(x) === '#';

          if (lit) {
            run++;
          } else if (run) {
            out.push([ox + x - run, originY + y, run, 1]);
            run = 0;
          }
        }
      }
    }
  }

  function svgFor(lines, align) {
    var rects = [];
    var cols = 0;
    var i;

    for (i = 0; i < lines.length; i++) cols = Math.max(cols, lines[i].length);

    var width = cols * ADVANCE - 1;
    var height = lines.length * LINE - 2;

    for (i = 0; i < lines.length; i++) {
      var lineRects = [];
      rectsForLine(lines[i], i * LINE, lineRects);

      /* Centring shifts a whole line by whole pixels only — half a pixel
       * would defeat the point of drawing this by hand. */
      var shift = 0;
      if (align === 'center') {
        shift = Math.round((width - (lines[i].length * ADVANCE - 1)) / 2);
      } else if (align === 'right') {
        shift = width - (lines[i].length * ADVANCE - 1);
      }

      for (var r = 0; r < lineRects.length; r++) {
        lineRects[r][0] += shift;
        rects.push(lineRects[r]);
      }
    }

    var parts = new Array(rects.length);
    for (i = 0; i < rects.length; i++) {
      parts[i] = '<rect x="' + rects[i][0] + '" y="' + rects[i][1] +
                 '" width="' + rects[i][2] + '" height="' + rects[i][3] + '"/>';
    }

    return {
      markup: '<svg class="px-svg" viewBox="0 0 ' + width + ' ' + height +
              '" width="' + width + '" height="' + height +
              '" shape-rendering="crispEdges" focusable="false" aria-hidden="true">' +
              parts.join('') + '</svg>',
      cols: cols,
      width: width,
      height: height
    };
  }

  /* Pick the largest whole-number pixel size that still fits the container.
   * Whole numbers only: a scale of 3.4 would smear the grid. */
  function fit(el, natural, min, max) {
    var box = el.clientWidth || (el.parentNode && el.parentNode.clientWidth) || 320;
    var scale = Math.floor(box / natural);

    /* When not even one pixel per unit fits, go below the requested minimum
     * rather than return a scale that overflows the container. Never below 1:
     * a scale of nothing renders nothing. */
    if (scale < min) return Math.max(1, scale);

    return Math.min(max, scale);
  }

  function render(el) {
    var raw = el.getAttribute('data-px') || el.textContent;
    var lines = raw.toUpperCase().split('|');
    var align = el.getAttribute('data-px-align') || 'left';
    var min = parseInt(el.getAttribute('data-px-min'), 10) || 2;
    var max = parseInt(el.getAttribute('data-px-max'), 10) || 8;

    var built = svgFor(lines, align);
    var scale = fit(el, built.width, min, max);

    if (!el.__pxLabel) {
      /* Keep the human sentence available to assistive tech, then hide it. */
      var label = document.createElement('span');
      label.className = 'sr-only';
      label.textContent = el.textContent.trim() || raw.replace(/\|/g, ' ');
      el.textContent = '';
      el.appendChild(label);
      el.__pxLabel = label;

      var holder = document.createElement('span');
      holder.className = 'px-holder';
      el.appendChild(holder);
      el.__pxHolder = holder;
    }

    el.__pxHolder.innerHTML = built.markup;

    var svg = el.__pxHolder.firstChild;
    svg.setAttribute('width', built.width * scale);
    svg.setAttribute('height', built.height * scale);
    el.__pxScale = scale;
  }

  function renderAll(root) {
    var nodes = (root || document).querySelectorAll('[data-px]');
    for (var i = 0; i < nodes.length; i++) render(nodes[i]);
  }

  var resizeTimer = null;
  function onResize() {
    if (resizeTimer) global.clearTimeout(resizeTimer);
    resizeTimer = global.setTimeout(function () { renderAll(); }, 120);
  }

  global.PixFont = {
    glyphs: GLYPHS,
    render: render,
    renderAll: renderAll,
    watch: function () {
      global.addEventListener('resize', onResize, { passive: true });
      global.addEventListener('orientationchange', onResize, { passive: true });
    }
  };
})(window);
