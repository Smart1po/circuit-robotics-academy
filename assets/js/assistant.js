/* CIRCUIT — the help assistant
 *
 * A white flag in the bottom corner. Press it and a small chat opens; press
 * "Minimise" and it shrinks to just the flag and waits there. It never
 * disappears — a control somebody has to go hunting for is a control they have
 * lost — so the smallest it ever gets is still one tap away.
 *
 * It answers out of a table written by hand from the content of this site. It
 * makes no network request — there is no API behind it, and it does not invent
 * anything. If a question does not match, it says so and offers what it does
 * know rather than guessing.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var HIDDEN_KEY = 'circuit.assistant.hidden';

  /* ------------------------------------------------------------------ *
   * What it knows. Every answer here is drawn from a page on this site.
   * ------------------------------------------------------------------ */
  var KNOWLEDGE = [
    {
      id: 'ages',
      chip: 'What ages?',
      match: ['age', 'ages', 'old', 'year old', 'band', 'bands', 'spark', 'relay', 'apex', 'child', 'kid'],
      answer: 'Three bands, split by age rather than experience. SPARK is 8 to 10, ninety minutes a week. ' +
              'RELAY is 11 to 13, two hours a week. APEX is 14 to 17, two hours a week. Nobody needs to ' +
              'arrive knowing how to code.'
    },
    {
      id: 'fees',
      chip: 'How much is a term?',
      match: ['fee', 'fees', 'price', 'cost', 'how much', 'kd', 'pay', 'deposit', 'money', 'expensive'],
      answer: 'A twelve-week term is 45 KD for SPARK, 60 KD for RELAY and 75 KD for APEX. The competition ' +
              'track is a 25 KD add-on. There is a 20 KD kit deposit that comes back in full when the kit ' +
              'comes back complete. The fee covers the kit, the consumables, the logbook, the dry run and ' +
              'the scored run.'
    },
    {
      id: 'timetable',
      chip: 'When are the classes?',
      match: ['time', 'times', 'timetable', 'when', 'schedule', 'day', 'days', 'saturday', 'sunday', 'monday', 'session'],
      answer: 'SPARK runs three times a week — Saturday 10:00, Sunday 17:00 or Thursday 17:00. RELAY runs ' +
              'Saturday 12:00 or Monday 17:30. APEX runs Saturday 15:00 or Tuesday 17:30. You pick one slot ' +
              'at the start of term and keep it. The full timetable is in the members area.'
    },
    {
      id: 'teach',
      chip: 'What do you teach?',
      match: ['teach', 'learn', 'curriculum', 'unit', 'units', 'subject', 'syllabus', 'course', 'what do'],
      answer: 'Four units run across every term, the same four for every band. Unit 01 Build and Drive, ' +
              'Unit 02 Circuits and Soldering, Unit 03 Sensors, Code and Vision, and Unit 04 Drone Systems. ' +
              'The depth changes with the band, not the subject.'
    },
    {
      id: 'term',
      chip: 'How long is a term?',
      match: ['term', 'long', 'weeks', 'twelve', '12', 'how long', 'stage', 'stages'],
      answer: 'Twelve weeks, in four stages. Weeks 1 to 3 build the drivetrain, weeks 4 to 8 are the sensor ' +
              'board and the control loop, weeks 9 and 10 move to the Flight Bay, and weeks 11 and 12 are ' +
              'the dry run and the scored run. The robot a student starts in week one is the robot that ' +
              'runs in week twelve.'
    },
    {
      id: 'kits',
      chip: 'What is in the kit?',
      match: ['kit', 'kits', 'robot', 'parts', 'equipment', 'tread', 'take home', 'bring'],
      answer: 'Kits are issued in week one and returned in week twelve. SPARK gets "Tread", a tracked ' +
              'chassis with two gear motors and reflectance sensors. RELAY gets "Relay Board", which adds a ' +
              'solderable sensor shield, a gyro and a multimeter. APEX gets "Apex Arm" — an omni base, ' +
              'encoder motors, a servo gripper, a camera and a single-board computer. The full lists are in ' +
              'the members area.'
    },
    {
      id: 'competition',
      chip: 'Tell me about the competition',
      match: ['compet', 'contest', 'mat', 'score', 'scoring', 'rubric', 'run', 'points', 'tournament'],
      answer: 'A 2.4 by 1.2 metre mat, six scored objectives, one 150-second round, two attempts with the ' +
              'better one counting, and fully autonomous once it starts. Teams are two or three students. ' +
              'Open to APEX, and to RELAY students invited by their coach from week six. We are not ' +
              'affiliated with any competition organiser — the format is ours and our coaches score it.'
    },
    {
      id: 'safety',
      chip: 'Is it safe?',
      match: ['safe', 'safety', 'danger', 'solder', 'iron', 'burn', 'battery', 'rule', 'rules', 'drone fly'],
      answer: 'Seven bench rules, and they apply to coaches too. Safety glasses at Bench B whenever an iron ' +
              'is hot. Fume extraction on before the iron is. SPARK students never hold the iron — they ' +
              'wire, and a coach solders. Batteries charge on the charge bench only, never unattended. ' +
              'Drones fly indoors in a netted bay with prop guards on, and no student flies outdoors.'
    },
    {
      id: 'coding',
      chip: 'Does my child need to code?',
      match: ['code', 'coding', 'program', 'python', 'block', 'experience', 'beginner', 'know how'],
      answer: 'No. SPARK starts in a block editor. RELAY moves to text. APEX writes the whole control loop ' +
              'and adds on-device vision. Nobody is expected to arrive with any of it.'
    },
    {
      id: 'trial',
      chip: 'Is there a trial session?',
      match: ['trial', 'try', 'taster', 'demo class', 'visit', 'first session', 'sign up', 'join', 'enrol', 'enroll', 'book'],
      answer: 'One trial per family, per band, in week one or two of a term. It is the same session everyone ' +
              'else is doing — we do not run a separate demo class, because a demo class does not tell you ' +
              'what a term is like.'
    },
    {
      id: 'login',
      chip: 'I cannot log in',
      match: ['log in', 'login', 'sign in', 'password', 'account', 'member area', 'forgot'],
      answer: 'The members area holds the timetable, the kit library and the competition rubric. Sign in ' +
              'from the log in page. One thing worth knowing: this sign-in is a front-end preview, so ' +
              'please do not type a password you use anywhere else.'
    },
    {
      id: 'contact',
      chip: 'How do I get in touch?',
      match: ['contact', 'email', 'phone', 'call', 'reach', 'address', 'where are you', 'location'],
      answer: 'Email is the way: hello@circuit.example. We are in Kuwait City. Term times are on the ' +
              'timetable in the members area.'
    }
  ];

  var GREETING = 'Hello. I can answer questions about the programme — ages, fees, the timetable, ' +
                 'the kits, the competition and the bench rules. Pick one below or type a question.';

  var FALLBACK = 'I do not have an answer for that one. I can help with ages and bands, fees and the ' +
                 'deposit, the timetable, what each unit teaches, the kits, the competition format, the ' +
                 'bench rules, and getting into the members area.';

  var STARTERS = ['ages', 'fees', 'timetable', 'competition'];

  /* ------------------------------------------------------------------ *
   * Matching. Plain keyword scoring — no model, no network, no guessing.
   * ------------------------------------------------------------------ */
  function findAnswer(text) {
    var q = ' ' + String(text).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ') + ' ';
    var best = null;
    var bestScore = 0;

    for (var i = 0; i < KNOWLEDGE.length; i++) {
      var entry = KNOWLEDGE[i];
      var score = 0;

      for (var j = 0; j < entry.match.length; j++) {
        var term = entry.match[j];
        if (q.indexOf(' ' + term) > -1) score += term.length;
      }

      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }

    return bestScore >= 3 ? best : null;
  }

  /* ------------------------------------------------------------------ *
   * Building it
   * ------------------------------------------------------------------ */
  function build() {
    var wrap = doc.createElement('div');
    wrap.className = 'asst';

    /* --- the flag --- */
    var flag = doc.createElement('button');
    flag.type = 'button';
    flag.className = 'asst__flag';
    flag.setAttribute('aria-expanded', 'false');
    flag.setAttribute('aria-controls', 'asst-panel');

    var banner = doc.createElement('span');
    banner.className = 'asst__banner';
    banner.setAttribute('aria-hidden', 'true');

    var flagText = doc.createElement('span');
    flagText.textContent = 'Need a hand?';

    flag.appendChild(banner);
    flag.appendChild(flagText);

    /* --- the panel --- */
    var panel = doc.createElement('div');
    panel.className = 'asst__panel';
    panel.id = 'asst-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'CIRCUIT help');

    var head = doc.createElement('div');
    head.className = 'asst__head';

    var title = doc.createElement('p');
    title.className = 'asst__title';
    title.textContent = 'CIRCUIT help';

    var hideBtn = doc.createElement('button');
    hideBtn.type = 'button';
    hideBtn.className = 'asst__x';
    hideBtn.textContent = 'Minimise';
    hideBtn.title = 'Shrink the assistant to a small flag in the corner';

    var closeBtn = doc.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'asst__x';
    closeBtn.textContent = 'Close';

    head.appendChild(title);
    head.appendChild(hideBtn);
    head.appendChild(closeBtn);

    var log = doc.createElement('div');
    log.className = 'asst__log';
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');

    var chips = doc.createElement('div');
    chips.className = 'asst__chips';

    var form = doc.createElement('form');
    form.className = 'asst__form';

    var input = doc.createElement('input');
    input.type = 'text';
    input.autocomplete = 'off';
    input.placeholder = 'Ask about fees, times, kits…';
    input.setAttribute('aria-label', 'Ask the CIRCUIT assistant a question');

    var send = doc.createElement('button');
    send.type = 'submit';
    send.className = 'asst__send';
    send.textContent = 'Ask';

    form.appendChild(input);
    form.appendChild(send);

    panel.appendChild(head);
    panel.appendChild(log);
    panel.appendChild(chips);
    panel.appendChild(form);

    wrap.appendChild(panel);
    wrap.appendChild(flag);
    doc.body.appendChild(wrap);

    /* --- behaviour --- */
    function say(text, who) {
      var msg = doc.createElement('p');
      msg.className = 'asst__msg asst__msg--' + who;
      msg.textContent = text;
      log.appendChild(msg);
      log.scrollTop = log.scrollHeight;
    }

    function offerChips(ids) {
      chips.innerHTML = '';

      for (var i = 0; i < ids.length; i++) {
        var entry = byId(ids[i]);
        if (!entry) continue;

        var b = doc.createElement('button');
        b.type = 'button';
        b.className = 'asst__chip';
        b.textContent = entry.chip;
        b.setAttribute('data-ask', entry.id);
        chips.appendChild(b);
      }
    }

    function byId(id) {
      for (var i = 0; i < KNOWLEDGE.length; i++) {
        if (KNOWLEDGE[i].id === id) return KNOWLEDGE[i];
      }
      return null;
    }

    /* Suggest three things they have not asked yet, so the chips stay useful. */
    var asked = {};

    function refreshChips() {
      var next = [];

      for (var i = 0; i < KNOWLEDGE.length && next.length < 4; i++) {
        if (!asked[KNOWLEDGE[i].id]) next.push(KNOWLEDGE[i].id);
      }

      offerChips(next.length ? next : STARTERS);
    }

    function answer(text) {
      say(text, 'you');

      var found = findAnswer(text);

      if (found) {
        asked[found.id] = true;
        say(found.answer, 'bot');
      } else {
        say(FALLBACK, 'bot');
      }

      refreshChips();
    }

    chips.addEventListener('click', function (e) {
      var id = e.target && e.target.getAttribute && e.target.getAttribute('data-ask');
      if (!id) return;

      var entry = byId(id);
      if (!entry) return;

      asked[id] = true;
      say(entry.chip, 'you');
      say(entry.answer, 'bot');
      refreshChips();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var text = input.value.trim();
      if (!text) return;

      input.value = '';
      answer(text);
    });

    function open() {
      panel.hidden = false;
      flag.setAttribute('aria-expanded', 'true');
      flagText.textContent = 'Help';

      if (!log.childNodes.length) {
        say(GREETING, 'bot');
        refreshChips();
      }

      input.focus();
    }

    function close() {
      panel.hidden = true;
      flag.setAttribute('aria-expanded', 'false');
      flagText.textContent = 'Need a hand?';
      flag.focus();
    }

    flag.addEventListener('click', function () {
      if (panel.hidden) open(); else close();
    });

    closeBtn.addEventListener('click', close);

    /* Escape closes it, the way any dialog should. */
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close();
    });

    /* --- getting it out of the way ---------------------------------------
     * Minimising shrinks it to a small flag in the corner. It never vanishes:
     * a control the visitor has to go hunting for in the footer is a control
     * they have lost. Small and present beats invisible and findable.
     * ------------------------------------------------------------------- */
    var restore = doc.querySelector('[data-assistant-show]');

    function setMinimised(min) {
      wrap.classList.toggle('is-min', min);

      /* The label is only noise once the thing is the size of its own icon. */
      flagText.hidden = min;
      /* With the words hidden the button needs a name of its own. */
      if (min) flag.setAttribute('aria-label', 'Open the CIRCUIT assistant');
      else flag.removeAttribute('aria-label');

      /* The footer link is a second route back, offered only when it is
       * actually useful. */
      if (restore) restore.hidden = !min;

      try {
        if (min) global.sessionStorage.setItem(HIDDEN_KEY, '1');
        else global.sessionStorage.removeItem(HIDDEN_KEY);
      } catch (err) { /* private mode */ }
    }

    hideBtn.addEventListener('click', function () {
      close();
      setMinimised(true);
      flag.focus();
    });

    /* Opening it from the small state puts it back to full size. */
    flag.addEventListener('click', function () {
      if (wrap.classList.contains('is-min')) setMinimised(false);
    });

    if (restore) {
      restore.addEventListener('click', function () {
        setMinimised(false);
        flag.focus();
      });
    }

    var wasMin = false;
    try { wasMin = global.sessionStorage.getItem(HIDDEN_KEY) === '1'; } catch (err) {}
    setMinimised(wasMin);
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})(window);
