/* CIRCUIT — the cast
 *
 * Every character on this site is a few lines of text. One letter is one
 * pixel, a dot is transparent, and the palette below maps letters to colours.
 * Nothing here is an image file and nothing is downloaded.
 *
 * Each sprite is tied to the thing it sits beside. BOLT is the rover students
 * build, so it drives along the timetable. TIP is a soldering iron, so it lives
 * on the soldering unit. KITE is the drone, so it hovers over the flight unit.
 * None of them is decoration that wandered in from somewhere else.
 */
(function (global) {
  'use strict';

  var P = {
    o: '#07060E',   /* outline, near-black                */
    b: '#4E5BEA',   /* body, indigo                       */
    l: '#8E97FF',   /* body highlight                     */
    c: '#58E7FF',   /* cyan — sensors, eyes, lenses       */
    a: '#FFC247',   /* amber — beacons, hot metal, coins  */
    A: '#FFE9A8',   /* amber highlight                    */
    H: '#FFFFFF',   /* white hot                          */
    m: '#B4FF3D',   /* lime — live, complete              */
    g: '#FF5FD2',   /* magenta — competition only         */
    t: '#2A3150',   /* tread and track                    */
    w: '#59628C',   /* wheel and lug                      */
    s: '#7B72D4',   /* solder, structure                  */
    p: '#14122A',   /* pad, recessed                      */
    r: '#ADA6D6',   /* rotor blur                         */
    h: '#FF6B6B',   /* handle                             */
    S: '#C9D2FF',   /* polished metal                     */
    d: '#443D80'    /* shadow                             */
  };

  /* --- BOLT ---------------------------------------------------------------
   * The rover. It is the first robot every student builds, and the hero
   * promise is "make it move", so BOLT is the literal subject of that
   * sentence. It drives the hero rail and patrols the class timetable.
   * 16 x 12, two frames: the treads advance, the beacon blinks.
   * --------------------------------------------------------------------- */
  var BOLT_A = [
    '.......a........',
    '.......o........',
    '..oooooooooooo..',
    '..obbbbbbbbbbo..',
    '..obccbbbbccbo..',
    '..obbbbbbbbbbo..',
    '..obllllllllbo..',
    '..oooooooooooo..',
    '.otttttttttttto.',
    '.owwoowwoowwooo.',
    '.oooooooooooooo.',
    '................'
  ];

  var BOLT_B = [
    '.......A........',
    '.......o........',
    '..oooooooooooo..',
    '..obbbbbbbbbbo..',
    '..obccbbbbccbo..',
    '..obbbbbbbbbbo..',
    '..obllllllllbo..',
    '..oooooooooooo..',
    '.otttttttttttto.',
    '.oowwoowwoowwoo.',
    '.oooooooooooooo.',
    '................'
  ];

  /* --- TIP ----------------------------------------------------------------
   * A soldering iron making a joint. It is the sprite that most obviously IS
   * its content: the iron performs the exact skill Unit 02 promises.
   * 12 x 14, two frames: the iron descends a pixel, the tip goes white, a
   * bead of solder appears on the pad.
   * --------------------------------------------------------------------- */
  var TIP_A = [
    '....hhhh....',
    '....hhhh....',
    '....hhhh....',
    '....hhhh....',
    '....ssss....',
    '.....ss.....',
    '.....ss.....',
    '.....aa.....',
    '............',
    '............',
    '............',
    '..pppppppp..',
    '..pppppppp..',
    '..oooooooo..'
  ];

  var TIP_B = [
    '............',
    '....hhhh....',
    '....hhhh....',
    '....hhhh....',
    '....hhhh....',
    '....ssss....',
    '.....ss.....',
    '.....ss.....',
    '.....HH.....',
    '.....HH.....',
    '...ssHHss...',
    '..pppppppp..',
    '..pppppppp..',
    '..oooooooo..'
  ];

  /* --- SCAN ---------------------------------------------------------------
   * A camera eye running threshold, sweep, lock. It is a picture of what
   * Unit 03 teaches: read a value, sweep for it, latch when you find it.
   * 10 x 10, three frames: the pupil pans left, centre, right.
   * --------------------------------------------------------------------- */
  function scanEye(row) {
    return [
      '..oooooo..',
      '.occcccco.',
      'occbbbbcco',
      'oc' + row + 'co',
      'oc' + row + 'co',
      'occbbbbcco',
      '.occcccco.',
      '..oooooo..',
      '...oooo...',
      '..oooooo..'
    ];
  }

  var SCAN_A = scanEye('baabbb');
  var SCAN_B = scanEye('bbaabb');
  var SCAN_C = scanEye('bbbaab');

  /* --- KITE ---------------------------------------------------------------
   * The indoor quadcopter from Unit 04. It hovers over the flight-cage floor
   * tile drawn beneath it, and it appears nowhere else on the site — a drone
   * that wandered the page would be decoration; this one is a label.
   * 14 x 9, three frames. The rotors differ in SHAPE, not in brightness, so
   * there is no luminance flash at all.
   * --------------------------------------------------------------------- */
  function kite(rotor) {
    return [
      rotor,
      '..o........o..',
      '..o.oooooo.o..',
      '..oooblllboo..',
      '....blccbb....',
      '....bbbbbb....',
      '.....oooo.....',
      '..............',
      '...dddddddd...'
    ];
  }

  var KITE_A = kite('.rrr......rrr.');
  var KITE_B = kite('.r.r......r.r.');
  var KITE_C = kite('..r........r..');

  /* --- PIP ----------------------------------------------------------------
   * The line-following puck used in the term-end run. Its IR emitter blinks,
   * which is the one thing a line follower is actually doing.
   * 8 x 8, two frames.
   * --------------------------------------------------------------------- */
  var PIP_A = [
    '..oooo..',
    '.occcco.',
    'ocbbbbco',
    'ocbggbco',
    'ocbggbco',
    'ocbbbbco',
    '.occcco.',
    '..aaoo..'
  ];

  var PIP_B = [
    '..oooo..',
    '.occcco.',
    'ocbbbbco',
    'ocbggbco',
    'ocbggbco',
    'ocbbbbco',
    '.occcco.',
    '..oooo..'
  ];

  /* --- COIN ---------------------------------------------------------------
   * Sits above the login cabinet. It is the only piece of pure arcade
   * furniture on the site, and it is on the one screen that can afford it.
   * 8 x 8, four frames: a spin.
   * --------------------------------------------------------------------- */
  var COIN_A = [
    '..aaaa..',
    '.aAAAAa.',
    'aAAaaAAa',
    'aAaaaaAa',
    'aAaaaaAa',
    'aAAaaAAa',
    '.aAAAAa.',
    '..aaaa..'
  ];

  var COIN_B = [
    '...aa...',
    '..aAAa..',
    '..aAAa..',
    '..aAAa..',
    '..aAAa..',
    '..aAAa..',
    '..aAAa..',
    '...aa...'
  ];

  var COIN_C = [
    '....a...',
    '....a...',
    '....a...',
    '....a...',
    '....a...',
    '....a...',
    '....a...',
    '....a...'
  ];

  /* --- CLAW ---------------------------------------------------------------
   * The servo gripper from the APEX kit, opening and closing over the
   * competition rubric. Two scored objectives are "blocks collected" and
   * "block delivered", and this is the part that does both.
   * 12 x 12, three frames: open, half, closed.
   * --------------------------------------------------------------------- */
  function claw(a, b, c, d) {
    return [
      '.....oo.....',
      '.....oo.....',
      '.....oo.....',
      '..oooooooo..',
      '..obbllbbo..',
      '..oooooooo..',
      a, b, c, d,
      '............',
      '....gggg....'
    ];
  }

  var CLAW_A = claw('..oo....oo..', '.oo......oo.', '.oo......oo.', '.oa......ao.');
  var CLAW_B = claw('..oo....oo..', '..oo....oo..', '.oo......oo.', '.oa......ao.');
  var CLAW_C = claw('..oo....oo..', '..oo....oo..', '..oo....oo..', '..oa....ao..');

  /* --- DASH ---------------------------------------------------------------
   * The member's own bench robot, on the dashboard beside the greeting.
   * 18 x 13, two frames: it blinks and its wheels turn.
   * --------------------------------------------------------------------- */
  var DASH_A = [
    '........aa........',
    '........oo........',
    '....oooooooooo....',
    '....obbbbbbbbo....',
    '....obccbbccbo....',
    '....obbbbbbbbo....',
    '....obbmmmmbbo....',
    '....oooooooooo....',
    '..oooooooooooooo..',
    '..obllllllllllbo..',
    '..obbbbbbbbbbbbo..',
    '..oooooooooooooo..',
    '...ww..wwww..ww...'
  ];

  var DASH_B = [
    '........aa........',
    '........oo........',
    '....oooooooooo....',
    '....obbbbbbbbo....',
    '....oboobboobo....',
    '....obbbbbbbbo....',
    '....obbmmmmbbo....',
    '....oooooooooo....',
    '..oooooooooooooo..',
    '..obllllllllllbo..',
    '..obbbbbbbbbbbbo..',
    '..oooooooooooooo..',
    '...ww..wwww..ww...'
  ];


  /* --- ARM ----------------------------------------------------------------
   * The three-link pick-and-place arm from the APEX kit, doing the one thing
   * Unit 01 is built around: reach, close, lift, place.
   * 14 x 14, two frames: the gripper opens and closes.
   * --------------------------------------------------------------------- */
  var ARM_A = [
    '.....oooo.....',
    '....obccbo....',
    '.....oooo.....',
    '......oo......',
    '......oo......',
    '.....obbo.....',
    '....obbbbo....',
    '...obb..bbo...',
    '..obb....bbo..',
    '..oo......oo..',
    '..............',
    '...oooooooo...',
    '..obbbbbbbbo..',
    '..oooooooooo..'
  ];

  var ARM_B = [
    '.....oooo.....',
    '....obccbo....',
    '.....oooo.....',
    '......oo......',
    '......oo......',
    '.....obbo.....',
    '....obbbbo....',
    '....obbbbo....',
    '....obbbbo....',
    '....oo..oo....',
    '..............',
    '...oooooooo...',
    '..obbbbbbbbo..',
    '..oooooooooo..'
  ];

  /* --- HEX ----------------------------------------------------------------
   * The six-legged walker the RELAY band builds in the back half of a term.
   * 14 x 10, two frames: a tripod gait, three legs down and three swinging.
   * --------------------------------------------------------------------- */
  var HEX_A = [
    '..............',
    '...oooooooo...',
    '..obbccbbbbo..',
    '..obbbbbbbbo..',
    '...oooooooo...',
    '.o..o....o..o.',
    'o...o....o...o',
    '.....o..o.....',
    '..............',
    '..............'
  ];

  var HEX_B = [
    '..............',
    '...oooooooo...',
    '..obbccbbbbo..',
    '..obbbbbbbbo..',
    '...oooooooo...',
    'o..o......o..o',
    '.o..o....o..o.',
    '....o....o....',
    '..............',
    '..............'
  ];

  /* --- MOTE ---------------------------------------------------------------
   * The palm-sized indoor drone the Flight Bay starts beginners on. It is the
   * smallest thing that flies here, so it is the one that drifts highest.
   * 8 x 6, two frames.
   * --------------------------------------------------------------------- */
  var MOTE_A = [
    'r......r',
    '.o....o.',
    '.obbbbo.',
    '..bccb..',
    '..oooo..',
    '........'
  ];

  var MOTE_B = [
    '.r....r.',
    '.o....o.',
    '.obbbbo.',
    '..bccb..',
    '..oooo..',
    '........'
  ];

  /* --- FLIT ---------------------------------------------------------------
   * The flapping-wing airframe. It is on the site because a quadcopter is not
   * the only way to stay up, and the flight unit says so.
   * 14 x 10, two frames: wings up, wings down.
   * --------------------------------------------------------------------- */
  var FLIT_A = [
    '..l........l..',
    '...l......l...',
    '....l....l....',
    '.....oooo.....',
    '....obbbbo....',
    '....obccbo....',
    '.....oooo.....',
    '......oo......',
    '..............',
    '...dddddd.....'
  ];

  var FLIT_B = [
    '..............',
    '..............',
    '.....oooo.....',
    '....obbbbo....',
    '....obccbo....',
    '.....oooo.....',
    '....l.oo.l....',
    '...l......l...',
    '..l........l..',
    '...dddddd.....'
  ];

  /* --- PROBE --------------------------------------------------------------
   * The hovering sensor ball used to demonstrate distance sensing without a
   * chassis in the way. It bobs and does nothing else, which is the point.
   * 10 x 10, two frames: the eye widens.
   * --------------------------------------------------------------------- */
  var PROBE_A = [
    '...oooo...',
    '..obbbbo..',
    '.obllllbo.',
    'obllccllbo',
    'obllccllbo',
    '.obllllbo.',
    '..obbbbo..',
    '...oooo...',
    '..........',
    '...dddd...'
  ];

  var PROBE_B = [
    '...oooo...',
    '..obbbbo..',
    '.obllllbo.',
    'obllllllbo',
    'obllccllbo',
    '.obllllbo.',
    '..obbbbo..',
    '...oooo...',
    '..........',
    '...dddd...'
  ];


  /* --- The mark: a pair of wings ------------------------------------------
   * Rebuilt from the reference. They sweep UP and outward, widest at the top,
   * drawn to a point where they meet — six primaries a side radiating from a
   * hub at the bottom, longest at the top, with a shorter covert layer laid
   * over the roots the way real wings are built.
   *
   * Pale blue-white, its own palette, because it is the only thing on the
   * site that is not the academy's indigo.
   *
   * Every few seconds a ring of light expands out from the centre and passes
   * through every feather — the nova. Nine frames at rest, eleven of burst.
   * A gradient painted into artwork looks flat; light travelling across it
   * does not.  46 x 26.
   * --------------------------------------------------------------------- */
  var PLUME = {
    o: '#6E9A9A',   /* outline, deep teal      */
    k: '#8FB6B6',   /* shadow between feathers */
    m: '#B9D6D6',   /* mid                     */
    l: '#DCEDED',   /* light                   */
    h: '#F2FAFA',   /* bright                  */
    w: '#FFFFFF',   /* the nova itself         */

    /* the bird and the guard share this metal */
    s: '#8FB6B6',
    S: '#DCEDED',
    d: '#6E9A9A',
    c: '#4FC3F7',
    a: '#C9903A'
  };

var WING_OPEN_FRAMES = [
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokklllllhhhhhlllllkkollhho.......',
      '.........ooomllllklhhhwwwhhhlkllllmooo........',
      '............ommmmlhhwwwwwwwhhlmmmmo...........',
      '.............oooomllwwwhwwwllmoooo............',
      '.................oooowwwwwoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllolho.ohlolllkmlllmo........',
      '.........oommmllklhhhhwowhhhhlkllmmmoo........',
      '........ohhllokklhhwwwwwwwwwhhlkkollhho.......',
      '.........ooomlllhkwwwwhhhwwwwkhlllmooo........',
      '............ommllwwwhhhhhhhwwwllmmo...........',
      '.............oooowwwkhhhhhkwwwoooo............',
      '.................oooolhhhloooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmloho.oholmlloolmoooho......',
      '........olloomllmkhkhho.ohhkhkmllmoollo.......',
      '.........omlllmkhhwowwo.owwowhhkmlllmo........',
      '.........oommmhhwwwwwwwowwwwwwwhhmmmoo........',
      '........ohhllokwwwwhhhhhhhhhwwwwkollhho.......',
      '.........ooomhwwwwhhllhhhllhhwwwwhmooo........',
      '............olwwwhhlllhhhlllhhwwwlo...........',
      '.............oooollmklhhhlkmlloooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlookloholho.ohloholkoolmmoo.......',
      '.......ohooomloohhwwowo.owowwhhoolmoooho......',
      '........olloolhwwwwwwwo.owwwwwwwhloollo.......',
      '.........omlhhwwwwwohho.ohhowwwwwhhlmo........',
      '.........oollwwwwhhllllollllhhwwwwlloo........',
      '........ohhhwowkhhllllhhhllllhhkwowhhho.......',
      '.........ooowwwhhkllllhhhllllkhhwwwooo........',
      '............owllmlllllhhhlllllmllwo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomhhlho...ohlhhmolmooolo.......',
      '.........olloolholwowo...owowlohloollo........',
      '........oommhoowwowowwo.owwowowwoohmmoo.......',
      '.......ohooolwoowwlhoho.ohohlwwoowloooho......',
      '........ohhoowwwlkhkllo.ollkhklwwwoohho.......',
      '.........owwwwlkhllollo.ollollhklwwwwo........',
      '.........oowwlhlkllllllollllllklhlwwoo........',
      '........owwwhokkllllllhhhllllllkkohwwwo.......',
      '.........ooolllllkllllhhhllllklllllooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomlooho.....ohoolo.olmo.o.......',
      '.......oho.omhoohoowo.....owoohoohmo.oho......',
      '........olooolwowwwwwo...owwwwwowlooolo.......',
      '.........ohhoowwowhoho...ohohwowwoohho........',
      '........oowwwookhohomlo.olmohohkoowwwoo.......',
      '.......ohooowhoollmlolo.ololmlloohwoooho......',
      '........owwoolllmklkllo.ollklkmllloowwo.......',
      '.........olhhlmklllollo.ollolllkmlhhlo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomlooho.......ohoolmooolo........',
      '..........olloohoowwo.....owwohloollo.........',
      '........o.olhoowwoowo.....owoowo.ohlo.o.......',
      '.......oho.owwoowooho.....ohoowoowwo.oho......',
      '........owooowholhhmlo...olmhhlohwooowo.......',
      '.........owwoollomlolo...ololmolloowwo........',
      '........oollhooklolomlo.olmololkoohlloo.......',
      '.......owooomloollmlolo.ololmlloolmooowo......',
      '........ohloomllmklkllo.ollklkmllmoolho.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..olo.olo.........olo.olo..o........',
      '........oho.olloolho.......ohloolo..oho.......',
      '.........ohoolho.owo.......owo.oho.oho........',
      '.........ohooowwoowo.......owoowwoooho........',
      '..........owwoowoolho.....ohlowwoowwo.........',
      '........o.owwoolhooho.....ohooho.owwo.o.......',
      '.......owo.olhooloolo.....olooloohlo.owo......',
      '........ohooomlomllmlo...olmllmolmoooho.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..olo.........olo..oho..........',
      '...........oho..olo.........olo..oho..........',
      '.........o..oho.oho.........oho.oho..o........',
      '........oho.owwoowwo.......owwoowo..oho.......',
      '.........owoowwo.owo.......owo.owo.owo........',
      '.........owooolhooho.......ohoohlooowo........',
      '..........ohhooloomlo.....olmolmoohho.........',
      '........o.olloomloolo.....oloolo.ollo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...oho.........oho...o...........',
      '...........oho..oho.........oho..oho..........',
      '...........oho..owo.........owo..oho..........',
      '.........o..owo.owo.........owo.owo..o........',
      '........owo.owhoolho.......ohlooho..owo.......',
      '.........ohoolho.olo.......olo.oho.oho........',
      '.........ohooomloolo.......oloolmoooho........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ],
    [
      '..............................................',
      '..............................................',
      '................o.............o...............',
      '...............oho...........oho..............',
      '............o...owo.........owo...o...........',
      '...........owo..owo.........owo..owo..........',
      '...........owo..oho.........oho..owo..........',
      '.........o..oho.olo.........olo.oho..o........',
      '........oho.olloomlo.......olmoolo..oho.......',
      '.........ohoomlo.olo.......olo.olo.oho........',
      '.........olooomloolo.......oloolmooolo........',
      '..........ollooloomlo.....olmolmoollo.........',
      '........o.omloomloolo.....oloolo.olmo.o.......',
      '.......oho.omlooloolo.....olooloolmo.oho......',
      '........olooomlomllmlo...olmllmolmooolo.......',
      '.........olloomlomlolo...ololmolmoollo........',
      '........oommlooklolomlo.olmololkoolmmoo.......',
      '.......ohooomloollmlolo.ololmlloolmoooho......',
      '........olloomllmklkllo.ollklkmllmoollo.......',
      '.........omlllmklllollo.ollolllkmlllmo........',
      '.........oommmllkllllllollllllkllmmmoo........',
      '........ohhllokkllllllhhhllllllkkollhho.......',
      '.........ooomllllkllllhhhllllkllllmooo........',
      '............ommmmlllllhhhlllllmmmmo...........',
      '.............oooommmklhhhlkmmmoooo............',
      '.................oooomhhhmoooo................'
    ]
  ];

var WING_SHUT_FRAMES = [
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omhhhhhmo..................',
      '....................olwwwlo...................',
      '.....................owwwo....................',
      '.....................owhwo....................',
      '.....................owwwo....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlhhhhhlmo.................',
      '...................ohhwwwhho..................',
      '...................owwwwwwwo..................',
      '....................owhhhwo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................ollhhhhhllo.................',
      '..................ohhhhhhhhho.................',
      '..................owwwwwwwwwo.................',
      '...................owwwhwwwo..................',
      '...................olhhhhhlo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohlhhhohhhlho................',
      '..................owwwwwwwwwo.................',
      '..................owwwwwwwwwo.................',
      '..................olhhhhhhhlo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................ohohhohhoho.................',
      '.................owwowwowwowwo................',
      '.................owwwwwowwwwwo................',
      '..................ohhhhhhhhho.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................ohohohohohoho................',
      '..................owwwwowwwwo.................',
      '..................owowwowwowo.................',
      '.................ohhohhohhohho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................ohohohoho..................',
      '..................oowowowowoo.................',
      '.................owowowowowowo................',
      '..................ohhhhohhhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................owowowowo..................',
      '...................owowowowo..................',
      '..................oohohohohoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oowowoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ],
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................o.o.....................',
      '....................oohohoo...................',
      '...................ohohohoho..................',
      '...................oholohoho..................',
      '..................oololololoo.................',
      '.................oholololohoho................',
      '..................ohhllollhho.................',
      '..................olollollolo.................',
      '.................ohlollollolho................',
      '.................ohmlllolllmho................',
      '..................olllllllllo.................',
      '..................olllllllllo.................',
      '..................omlllllllmo.................',
      '...................olllllllo..................',
      '...................omlhhhlmo..................',
      '....................omhhhmo...................',
      '.....................ohhho....................',
      '.....................ohhho....................',
      '.....................ohhho....................'
    ]
  ];
  /* --- BIRD ---------------------------------------------------------------
   * The metal bird that carries you between pages. Wise stare, blue eyes.
   * 20 x 14, three frames: wings up, level, down.
   * --------------------------------------------------------------------- */
  var BIRD_UP = [
    '..ss............ss..',
    '.ssss..........ssss.',
    '..ssss........ssss..',
    '...ssss..ss..ssss...',
    '....sssSSSSSSsss....',
    '.....sSSSSSSSSs.....',
    '.....SSScSScSSS.....',
    '.....SSSSSSSSSS.....',
    '......SSaaaaSS......',
    '.......SSSSSS.......',
    '........SSSS........',
    '.........SS.........',
    '....................',
    '....................'
  ];

  var BIRD_MID = [
    '....................',
    '..ss............ss..',
    '.ssss..........ssss.',
    '..ssss...ss...ssss..',
    '...sssssSSSSsssss...',
    '....ssSSSSSSSSss....',
    '.....SSScSScSSS.....',
    '.....SSSSSSSSSS.....',
    '......SSaaaaSS......',
    '.......SSSSSS.......',
    '........SSSS........',
    '.........SS.........',
    '....................',
    '....................'
  ];

  var BIRD_DOWN = [
    '....................',
    '....................',
    '.........ss.........',
    '........SSSS........',
    '.......SSSSSS.......',
    '......SSSSSSSS......',
    '.....SSScSScSSS.....',
    '.....SSSSSSSSSS.....',
    '..ss..SSaaaaSS..ss..',
    '.ssss..SSSSSS..ssss.',
    '..ssss.SSSS..ssss...',
    '...ssss.SS..ssss....',
    '....ssss...ssss.....',
    '.....ss.....ss......'
  ];

  /* --- CHIP ---------------------------------------------------------------
   * A little bench helper that trundles. Small, for the crowd at the bottom.
   * 8 x 7, two frames.
   * --------------------------------------------------------------------- */
  var CHIP_A = [
    '..oooo..',
    '.obccbo.',
    '.obbbbo.',
    '.oooooo.',
    '.owoowo.',
    '.oooooo.',
    '........'
  ];

  var CHIP_B = [
    '..oooo..',
    '.obccbo.',
    '.obbbbo.',
    '.oooooo.',
    '.oowwoo.',
    '.oooooo.',
    '........'
  ];

  /* --- COG ----------------------------------------------------------------
   * A gear that turns. It is the smallest thing in the workshop that moves.
   * 9 x 9, two frames, a quarter turn apart.
   * --------------------------------------------------------------------- */
  var COG_A = [
    '...sss...',
    '.s.sss.s.',
    '.sssssss.',
    'sssbbbsss',
    'ssbbbbbss',
    'sssbbbsss',
    '.sssssss.',
    '.s.sss.s.',
    '...sss...'
  ];

  var COG_B = [
    '..s...s..',
    '.sssssss.',
    's.sssss.s',
    '.ssbbbss.',
    '.sbbbbbs.',
    '.ssbbbss.',
    's.sssss.s',
    '.sssssss.',
    '..s...s..'
  ];


  /* --- GUARD ---------------------------------------------------------------
   * The one on the door. Peaked cap, a badge on the chest, and every so often
   * a salute. He stands on the sign-in page because that is the only door on
   * the site, and a door with nobody on it is just a gap in a wall.
   * 14 x 18, three frames.
   * --------------------------------------------------------------------- */
  var GUARD_A = [
    '.....oooooo...',
    '....obbbbbbo..',
    '...obbbbbbbbo.',
    '...oooooooooo.',
    '....oaaaaaao..',
    '....obccbbo...',
    '....obbbbbo...',
    '.....oooooo...',
    '...oooooooooo.',
    '..obbbbggbbbo.',
    '..obbbaggabbo.',
    '..obbbbggbbbo.',
    '..obbbbbbbbbo.',
    '...oooooooooo.',
    '...obbo..obbo.',
    '...obbo..obbo.',
    '...oooo..oooo.',
    '..............'
  ];

  var GUARD_B = [
    '.....oooooo...',
    '....obbbbbbo..',
    '...obbbbbbbbo.',
    '...oooooooooo.',
    '....oaaaaaao..',
    '....oboobbo...',
    '....obbbbbo...',
    '.....oooooo...',
    '...oooooooooo.',
    '..obbbbggbbbo.',
    '..obbbaggabbo.',
    '..obbbbggbbbo.',
    '..obbbbbbbbbo.',
    '...oooooooooo.',
    '...obbo..obbo.',
    '...obbo..obbo.',
    '...oooo..oooo.',
    '..............'
  ];

  var GUARD_C = [
    '.....oooooo.o.',
    '....obbbbbboo.',
    '...obbbbbbbbo.',
    '...ooooooooooo',
    '....oaaaaaaobo',
    '....obccbboobo',
    '....obbbbbo.o.',
    '.....oooooo...',
    '...oooooooooo.',
    '..obbbbggbbbo.',
    '..obbbaggabbo.',
    '..obbbbggbbbo.',
    '..obbbbbbbbbo.',
    '...oooooooooo.',
    '...obbo..obbo.',
    '...obbo..obbo.',
    '...oooo..oooo.',
    '..............'
  ];

  /* --- TITAN ---------------------------------------------------------------
   * The big one. Tea in the left hand, a small robot coming together under
   * the right. It only ever appears on a waiting screen, which is exactly the
   * moment a page has nothing better to offer than something to look at.
   * 34 x 24, two frames: it blinks, and so does what it is building.
   * --------------------------------------------------------------------- */
  var TITAN_A = [
    '..........oooooooo................',
    '.........obbbbbbbbo...............',
    '..s.....obbbbbbbbbbo..............',
    '.s.s....obccbbbbccbo..............',
    '..s.....obbbbbbbbbbo..............',
    '.s......obbbmmmmbbbo..............',
    '.oooo....oooooooooo...............',
    '.ollo.ooooooooooooooo.............',
    '.ollo.obbbbbbbbbbbbbbo............',
    '.oaaooobbbbbbbbbbbbbbboooo........',
    '.oaaao.obbbbbbbbbbbbbo..oaao......',
    '.oaaao.obbbbbbbbbbbbbo..oaao......',
    '.ooooo.obbbbbbbbbbbbbo..ooooo.....',
    '.......obbbbbbbbbbbbbo............',
    '.......obbbbbbbbbbbbbo....ooooo...',
    '.......ooooooooooooooo...obbbbbo..',
    '........obbbo...obbbo....obccbbo..',
    '........obbbo...obbbo....obbbbbo..',
    '........ooooo...ooooo....ooooooo..',
    '.........................owo.owo..',
    '.........................ooo.ooo..',
    '..................................',
    '..................................',
    '..................................'
  ];

  var TITAN_B = [
    '..........oooooooo................',
    '.........obbbbbbbbo...............',
    '.s......obbbbbbbbbbo..............',
    '..s.s...oboobbbboobo..............',
    '.s......obbbbbbbbbbo..............',
    '..s.....obbbmmmmbbbo..............',
    '.oooo....oooooooooo...............',
    '.ollo.ooooooooooooooo.............',
    '.ollo.obbbbbbbbbbbbbbo............',
    '.oaaooobbbbbbbbbbbbbbboooo........',
    '.oaaao.obbbbbbbbbbbbbo..oaao......',
    '.oaaao.obbbbbbbbbbbbbo..oaao......',
    '.ooooo.obbbbbbbbbbbbbo..ooooo.....',
    '.......obbbbbbbbbbbbbo............',
    '.......obbbbbbbbbbbbbo....ooooo...',
    '.......ooooooooooooooo...obbbbbo..',
    '........obbbo...obbbo....oboobbo..',
    '........obbbo...obbbo....obbbbbo..',
    '........ooooo...ooooo....ooooooo..',
    '.........................owo.owo..',
    '.........................ooo.ooo..',
    '..................................',
    '..................................',
    '..................................'
  ];

  /* --- Registry ---------------------------------------------------------- */
  var CAST = {
    bolt:  { frames: [BOLT_A, BOLT_B], palette: P, fps: 5, scale: 3 },
    tip:   { frames: [TIP_A, TIP_B],   palette: P, fps: 2, scale: 3 },
    scan:  { frames: [SCAN_A, SCAN_B, SCAN_C], palette: P, fps: 2, scale: 3 },
    kite:  { frames: [KITE_A, KITE_B, KITE_C], palette: P, fps: 10, scale: 3, bob: 3, bobSpeed: 1.4 },
    pip:   { frames: [PIP_A, PIP_B],   palette: P, fps: 3, scale: 3 },
    coin:  { frames: [COIN_A, COIN_B, COIN_C, COIN_B], palette: P, fps: 6, scale: 5 },
    claw:  { frames: [CLAW_A, CLAW_B, CLAW_C, CLAW_B], palette: P, fps: 3, scale: 3 },
    dash:  { frames: [DASH_A, DASH_A, DASH_A, DASH_B], palette: P, fps: 3, scale: 4, bob: 1, bobSpeed: 1.1 },

    arm:   { frames: [ARM_A, ARM_A, ARM_B, ARM_B], palette: P, fps: 2, scale: 3 },
    hex:   { frames: [HEX_A, HEX_B], palette: P, fps: 4, scale: 3 },
    mote:  { frames: [MOTE_A, MOTE_B], palette: P, fps: 12, scale: 3, bob: 2, bobSpeed: 2.2 },
    flit:  { frames: [FLIT_A, FLIT_B], palette: P, fps: 5, scale: 3, bob: 4, bobSpeed: 1.1 },
    probe: { frames: [PROBE_A, PROBE_A, PROBE_A, PROBE_B], palette: P, fps: 2, scale: 3, bob: 3, bobSpeed: 0.9 },

    chip:  { frames: [CHIP_A, CHIP_B], palette: P, fps: 5, scale: 3 },
    cog:   { frames: [COG_A, COG_B], palette: P, fps: 3, scale: 3 },

    /* The mark. Which state shows is decided by the lights, not by a timer;
     * the frames only carry the glint travelling over the metal. */
    'wing-open': { frames: WING_OPEN_FRAMES, palette: PLUME, fps: 10, scale: 2 },
    'wing-shut': { frames: WING_SHUT_FRAMES, palette: PLUME, fps: 10, scale: 2 },

    guard: { frames: [GUARD_A, GUARD_A, GUARD_B, GUARD_A, GUARD_C, GUARD_C], palette: P, fps: 2, scale: 3 },
    titan: { frames: [TITAN_A, TITAN_A, TITAN_A, TITAN_B], palette: P, fps: 2, scale: 3 },

    bird:  { frames: [BIRD_UP, BIRD_MID, BIRD_DOWN, BIRD_MID], palette: PLUME, fps: 9, scale: 5 }
  };

  global.CircuitCast = CAST;

  if (global.Pixel) {
    for (var name in CAST) {
      if (Object.prototype.hasOwnProperty.call(CAST, name)) {
        global.Pixel.define(name, CAST[name]);
      }
    }
  }
})(window);
