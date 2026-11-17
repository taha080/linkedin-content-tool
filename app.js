/* Founder's LinkedIn Week — v1
   All client-side. No API key needed: built-in templates do the work.
   Optional: a free Gemini API key (stored only in localStorage) enables
   AI-generated drafts, with automatic fallback to templates. */

'use strict';

var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
var LINKEDIN_LIMIT = 3000;

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function pick(arr, seed) {
  return arr[((seed % arr.length) + arr.length) % arr.length];
}

function cap(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

function topicWords(topic) {
  var stop = { a: 1, an: 1, the: 1, and: 1, of: 1, for: 1, to: 1, in: 1, on: 1, with: 1, my: 1 };
  return topic.split(/[^A-Za-z0-9]+/).filter(function (w) {
    return w.length > 2 && !stop[w.toLowerCase()];
  });
}

function hashtags(topic) {
  var words = topicWords(topic).slice(0, 2).map(cap);
  var tags = words.map(function (w) { return '#' + w.replace(/[^A-Za-z0-9]/g, ''); });
  tags.push('#Founders');
  return tags.slice(0, 3).join(' ');
}

function cleanTopic(topic) {
  var t = (topic || '').trim();
  return t || 'building a business';
}

/* Tone-flavoured opening lines, used across post types. */
var TONE_LINES = {
  humble: [
    "I'm still learning this myself, but here's what I've noticed.",
    "This is what worked for me — take what helps, leave the rest.",
    "I don't have it all figured out. But this part is clear now."
  ],
  bold: [
    "Most advice on this is wrong. Here's why.",
    "Unpopular opinion, but someone has to say it.",
    "If this makes you uncomfortable, it might be the point."
  ],
  educational: [
    "Here's a simple framework you can use this week.",
    "Break it down into small steps and it stops feeling huge.",
    "The idea is simple. The hard part is doing it consistently."
  ]
};

var END_QUESTIONS = [
  'What would you add to this list?',
  'Has this happened to you too?',
  'What is one lesson you learned the hard way?',
  'What is working for you right now?',
  'Do you agree — or would you do it differently?'
];

/* ------------------------------------------------------------------ */
/* Post-type generators. Each returns a complete, usable LinkedIn post. */
/* ------------------------------------------------------------------ */

var POST_TYPES = [
  { id: 'story', label: 'Personal Story & Lesson' },
  { id: 'contrarian', label: 'Contrarian Take' },
  { id: 'howto', label: 'How-To List' },
  { id: 'mistake', label: 'Mistake & Fix' },
  { id: 'bts', label: 'Behind the Scenes' }
];

var GENERATORS = {
  story: function (input, seed) {
    var topic = input.topic, aud = input.audience, tone = input.tone;
    var hooks = [
      'I used to think ' + topic + ' was about working harder.',
      'Three years ago, I got ' + topic + ' completely wrong.',
      'Nobody tells you this about ' + topic + ' when you start.',
      'My first attempt at ' + topic + ' failed quietly.',
      'A small win in ' + topic + ' taught me more than any course.'
    ];
    var middles = [
      'I spent months doing more of the same thing.\nLonger hours. More effort. Same result.\nThen one conversation changed how I saw it.',
      'I was copying what everyone else was doing.\nIt looked right on the outside.\nBut it never felt right, and the results showed it.',
      'I kept waiting for the perfect moment to start.\nIt never came.\nSo I started small, messy, and unfinished — and that was the turning point.'
    ];
    var lessons = [
      'The lesson: progress in ' + topic + ' comes from doing the simple things well, every day — not from one big move.',
      'What I learned: ' + topic + ' rewards patience more than talent. Show up, listen, adjust, repeat.',
      'The real lesson was simple: stop trying to impress ' + aud.toLowerCase() + '. Start trying to help them.'
    ];
    var toneLine = pick(TONE_LINES[tone], seed);
    return [
      pick(hooks, seed),
      '',
      toneLine,
      '',
      pick(middles, seed + 1),
      '',
      pick(lessons, seed + 2),
      '',
      pick(END_QUESTIONS, seed + 3),
      '',
      hashtags(topic)
    ].join('\n');
  },

  contrarian: function (input, seed) {
    var topic = input.topic, aud = input.audience, tone = input.tone;
    var hooks = [
      'Everyone says ' + topic + ' is about talent. I disagree.',
      'Unpopular opinion: most ' + topic + ' advice is built for big companies, not founders.',
      'Stop chasing perfect ' + topic + '. Start chasing useful.',
      'The most overrated thing in ' + topic + '? Doing more of it.'
    ];
    var middles = [
      'Here is what actually matters:\n1. One clear message, not ten.\n2. One real conversation, not a hundred impressions.\n3. One small promise kept, every single week.',
      'Founders are told to scale everything.\nBut ' + aud.toLowerCase() + ' do not buy scale. They buy trust.\nAnd trust is built one honest post, one honest call, one honest result at a time.',
      'The loudest voices in ' + topic + ' are usually selling something.\nThe quiet ones are usually doing the work.\nChoose who you listen to carefully.'
    ];
    var closers = [
      'You do not need to be the biggest voice in the room.\nYou need to be the most useful one.',
      'Less noise. More signal. That is the whole strategy.',
      'If your ' + topic + ' is not helping anyone yet, make it smaller — and make it real.'
    ];
    var toneLine = pick(TONE_LINES[tone], seed + 1);
    return [
      pick(hooks, seed),
      '',
      toneLine,
      '',
      pick(middles, seed + 1),
      '',
      pick(closers, seed + 2),
      '',
      pick(END_QUESTIONS, seed),
      '',
      hashtags(topic)
    ].join('\n');
  },

  howto: function (input, seed) {
    var topic = input.topic, aud = input.audience, tone = input.tone;
    var variants = [
      [
        '3 simple steps to get better at ' + topic + ':',
        '',
        '1. Pick one small problem your audience actually has.',
        '2. Solve it in public, in plain language.',
        '3. Ask what worked — then do more of that.',
        '',
        'No complicated tools. No big budget.',
        'Just one useful thing, shared clearly, every week.'
      ],
      [
        '3 simple fixes that make any founder\'s post about ' + topic + ' 2x more readable:',
        '',
        '1. One idea per line. Short lines are easier to read.',
        '2. Start with a hook, not a greeting.',
        '3. End with a real question, not a sales pitch.',
        '',
        'Readability is respect for your reader\'s time.',
        'And ' + aud.toLowerCase() + ' notice it immediately.'
      ],
      [
        'Want better results from ' + topic + '? Start here:',
        '',
        '1. Write down the 3 questions ' + aud.toLowerCase() + ' ask you most.',
        '2. Answer one of them properly this week.',
        '3. Keep the answer short enough to read in 30 seconds.',
        '',
        'Consistency beats cleverness.',
        'Three honest posts a week will do more than one perfect post a month.'
      ]
    ];
    var toneLine = pick(TONE_LINES[tone], seed);
    return [
      pick(variants, seed).join('\n'),
      '',
      toneLine,
      '',
      pick(END_QUESTIONS, seed + 2),
      '',
      hashtags(topic)
    ].join('\n');
  },

  mistake: function (input, seed) {
    var topic = input.topic, aud = input.audience, tone = input.tone;
    var hooks = [
      'The mistake I kept making in ' + topic + ':',
      'I wasted a year on ' + topic + ' because of one wrong assumption.',
      'My biggest ' + topic + ' mistake was trying to look successful instead of being useful.'
    ];
    var middles = [
      'I focused on looking busy instead of being helpful.\nMore posts. More noise. Less trust.\nThe numbers went up. The real results did not.',
      'I copied strategies meant for companies ten times my size.\nBig budgets. Big teams. Big promises.\nNone of it fit a founder doing everything alone.',
      'I waited until everything was perfect before sharing anything.\nPerfect never came.\nSo for months, nobody heard from me at all.'
    ];
    var fixes = [
      'The fix was simple: one honest post a week about a real problem I solved.\nNo polish. No pretending. Just useful.',
      'The fix: stop copying, start listening.\nAsk ' + aud.toLowerCase() + ' what they struggle with — then answer that, in plain words.',
      'The fix: ship the imperfect version.\nA simple post today beats a perfect post that never exists.'
    ];
    var toneLine = pick(TONE_LINES[tone], seed + 1);
    return [
      pick(hooks, seed),
      '',
      pick(middles, seed + 1),
      '',
      pick(fixes, seed + 2),
      '',
      toneLine,
      '',
      pick(END_QUESTIONS, seed + 3),
      '',
      hashtags(topic)
    ].join('\n');
  },

  bts: function (input, seed) {
    var topic = input.topic, aud = input.audience, tone = input.tone;
    var hooks = [
      'What a normal Tuesday looks like when you are building ' + topic + ':',
      'Behind the scenes of ' + topic + ' — the part nobody posts about.',
      'No highlight reel today. Just an honest look at ' + topic + '.'
    ];
    var middles = [
      'Morning: one client call, two emails I have been avoiding.\nAfternoon: rewriting the same paragraph four times.\nEvening: a small win I almost forgot to celebrate.',
      'Coffee. Notes everywhere. A to-do list that grows faster than I finish it.\nAnd somewhere in the middle of it, real progress — slow, quiet, and easy to miss.',
      'Today I spent more time listening to ' + aud.toLowerCase() + ' than talking.\nThat is usually when the best ideas show up.\nNot in a meeting. In a real conversation.'
    ];
    var lessons = [
      'The unglamorous days are the ones that build the business.',
      'Nobody sees the messy middle. But the messy middle is the work.',
      'If your week feels ordinary, you are probably doing it right.'
    ];
    var toneLine = pick(TONE_LINES[tone], seed + 2);
    return [
      pick(hooks, seed),
      '',
      pick(middles, seed + 1),
      '',
      pick(lessons, seed + 2),
      '',
      toneLine,
      '',
      pick(END_QUESTIONS, seed),
      '',
      hashtags(topic)
    ].join('\n');
  }
};

/* ------------------------------------------------------------------ */
/* Week generation                                                     */
/* ------------------------------------------------------------------ */

/* Build one post of a given type. `seed` varies the wording. */
function generatePost(typeId, input, seed) {
  var gen = GENERATORS[typeId];
  var type = POST_TYPES.filter(function (t) { return t.id === typeId; })[0];
  return {
    type: typeId,
    label: type ? type.label : typeId,
    body: gen(input, seed)
  };
}

/* Rotate through the 5 types so a week never repeats a template.
   For 3 posts we use types 0,1,2; for 5 posts all five. The starting
   offset shifts with `weekSeed` so regenerating a week feels fresh. */
function generateWeek(input, weekSeed) {
  var seed = typeof weekSeed === 'number' ? weekSeed : 0;
  var days = input.days && input.days.length ? input.days : ['Mon', 'Wed', 'Fri'];
  var count = Math.min(input.postsPerWeek || 3, days.length, POST_TYPES.length);
  var posts = [];
  for (var i = 0; i < count; i++) {
    var type = POST_TYPES[(seed + i) % POST_TYPES.length];
    var post = generatePost(type.id, input, seed * 7 + i * 3);
    post.day = days[i];
    posts.push(post);
  }
  return posts;
}

/* ------------------------------------------------------------------ */
/* Optional Gemini AI drafts (key stored only in localStorage)          */
/* ------------------------------------------------------------------ */

var GEMINI_KEY = 'flw_gemini_key';

function getSavedKey() {
  try { return localStorage.getItem(GEMINI_KEY) || ''; } catch (e) { return ''; }
}

function saveKey(key) {
  try { localStorage.setItem(GEMINI_KEY, key); } catch (e) { /* storage unavailable */ }
}

function clearSavedKey() {
  try { localStorage.removeItem(GEMINI_KEY); } catch (e) { /* storage unavailable */ }
}

function geminiPrompt(input) {
  return 'You are a LinkedIn ghostwriter for founders. Write ' + input.postsPerWeek +
    ' complete LinkedIn posts about "' + input.topic + '" for an audience of ' + input.audience +
    '. Tone: ' + input.tone + '. Style: humble, friendly, human. Hook in the first line, short readable lines, a small story or lesson, a question at the end, 2-3 relevant hashtags. No sales pitch, no portfolio links. ' +
    'Return ONLY a JSON array, no markdown fences, in this exact shape: ' +
    '[{"type":"Personal Story & Lesson","body":"..."}, ...]. ' +
    'Vary the post types across: Personal Story & Lesson, Contrarian Take, How-To List, Mistake & Fix, Behind the Scenes. ' +
    'Post 1 type must be "Personal Story & Lesson". Post 2 "Contrarian Take". Post 3 "How-To List". ' +
    (input.postsPerWeek >= 5 ? 'Post 4 "Mistake & Fix". Post 5 "Behind the Scenes".' : '');
}

function generateWithGemini(input, key) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(key);
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: geminiPrompt(input) }] }]
    })
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Gemini returned HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var text = data && data.candidates && data.candidates[0] &&
        data.candidates[0].content && data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
      if (!text) throw new Error('Empty Gemini response');
      var clean = text.replace(/```json|```/g, '').trim();
      var parsed = JSON.parse(clean);
      if (!Array.isArray(parsed) || !parsed.length) throw new Error('Unexpected Gemini response');
      var days = input.days && input.days.length ? input.days : ['Mon', 'Wed', 'Fri'];
      return parsed.slice(0, input.postsPerWeek).map(function (p, i) {
        return {
          day: days[i] || DAYS[i],
          type: (p.type || 'Post').toLowerCase().replace(/[^a-z]/g, '').slice(0, 12) || 'post',
          label: p.type || 'AI Draft',
          body: String(p.body || '').trim()
        };
      }).filter(function (p) { return p.body.length > 50; });
    });
}

/* ------------------------------------------------------------------ */
/* Browser UI                                                          */
/* ------------------------------------------------------------------ */

if (typeof document !== 'undefined') {
  var state = {
    posts: [],
    selected: 0,
    weekSeed: 0,
    input: null
  };

  var $ = function (id) { return document.getElementById(id); };

  function readInput() {
    var days = [];
    document.querySelectorAll('#daysRow input[type="checkbox"]').forEach(function (cb) {
      if (cb.checked) days.push(cb.value);
    });
    var toneEl = document.querySelector('input[name="tone"]:checked');
    return {
      topic: cleanTopic($('topic').value),
      audience: $('audience').value,
      tone: toneEl ? toneEl.value : 'humble',
      days: days.length ? days : ['Mon', 'Wed', 'Fri'],
      postsPerWeek: parseInt($('postsPerWeek').value, 10) || 3
    };
  }

  function setStatus(msg, kind) {
    var el = $('status');
    el.textContent = msg;
    el.className = 'status' + (kind ? ' ' + kind : '');
  }

  function renderCalendar() {
    var cal = $('calendar');
    cal.innerHTML = '';
    var byDay = {};
    state.posts.forEach(function (p, i) { byDay[p.day] = i; });
    DAYS.forEach(function (day) {
      var cell = document.createElement('div');
      cell.className = 'day-cell';
      var name = document.createElement('div');
      name.className = 'day-name';
      name.textContent = day;
      var kind = document.createElement('div');
      kind.className = 'day-kind';
      if (day in byDay) {
        cell.classList.add('has-post');
        kind.textContent = state.posts[byDay[day]].label;
        cell.title = 'Click to view the ' + day + ' post';
        cell.addEventListener('click', function () { selectPost(byDay[day]); });
        if (byDay[day] === state.selected) cell.classList.add('selected');
      } else {
        kind.textContent = 'Rest day';
      }
      cell.appendChild(name);
      cell.appendChild(kind);
      cal.appendChild(cell);
    });
  }

  function renderDraft() {
    var view = $('draftView');
    if (!state.posts.length) {
      view.hidden = true;
      $('emptyState').hidden = false;
      $('weekActions').hidden = true;
      return;
    }
    var post = state.posts[state.selected];
    $('emptyState').hidden = true;
    view.hidden = false;
    $('weekActions').hidden = false;
    $('draftDay').textContent = post.day;
    $('draftType').textContent = post.label;
    $('draftText').textContent = post.body;
    var countEl = $('charCount');
    countEl.textContent = post.body.length + ' / ' + LINKEDIN_LIMIT + ' characters';
    countEl.classList.toggle('over', post.body.length > LINKEDIN_LIMIT);
  }

  function renderAll() {
    renderCalendar();
    renderDraft();
  }

  function selectPost(i) {
    state.selected = i;
    renderAll();
  }

  function copyText(text, okMsg) {
    function done() { setStatus(okMsg, 'ok'); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); }
      catch (e) { setStatus('Copy did not work in this browser — select the text and copy it manually.', 'error'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  function formatWeekAsText() {
    return state.posts.map(function (p) {
      return p.day + ' — ' + p.label + '\n' + p.body;
    }).join('\n\n------------------------------\n\n');
  }

  function handleGenerate() {
    var input = readInput();
    state.input = input;
    state.weekSeed += 1;
    var key = getSavedKey();
    var btn = $('generateBtn');
    btn.disabled = true;

    function finish(posts, note) {
      state.posts = posts;
      state.selected = 0;
      btn.disabled = false;
      renderAll();
      setStatus(note, 'ok');
    }

    if (key) {
      setStatus('Generating with Gemini…');
      generateWithGemini(input, key).then(function (posts) {
        if (posts.length) {
          finish(posts, 'Done — ' + posts.length + ' AI drafts ready. Edit them in your own voice before posting.');
        } else {
          finish(generateWeek(input, state.weekSeed), 'Gemini returned nothing usable — built-in templates were used instead.');
        }
      }).catch(function (err) {
        finish(generateWeek(input, state.weekSeed), 'AI draft failed (' + err.message + ') — built-in templates were used instead. Check your key or use templates.');
      });
    } else {
      var posts = generateWeek(input, state.weekSeed);
      finish(posts, 'Done — ' + posts.length + ' drafts ready from built-in templates. Add a free Gemini key above if you want AI drafts.');
    }
  }

  function init() {
    var saved = getSavedKey();
    if (saved) {
      $('geminiKey').value = saved;
      $('keyStatus').textContent = 'A key is saved in this browser only. Templates are still the fallback if AI fails.';
    }

    $('generateBtn').addEventListener('click', handleGenerate);

    $('saveKeyBtn').addEventListener('click', function () {
      var key = $('geminiKey').value.trim();
      if (!key) { setStatus('Paste a key first, or leave it empty to use templates.', 'error'); return; }
      saveKey(key);
      $('keyStatus').textContent = 'Key saved in this browser only. It is never sent anywhere except Google Gemini.';
      setStatus('Key saved.', 'ok');
    });

    $('clearKeyBtn').addEventListener('click', function () {
      clearSavedKey();
      $('geminiKey').value = '';
      $('keyStatus').textContent = 'No key saved — template drafts will be used.';
      setStatus('Key cleared. Template drafts will be used.', 'ok');
    });

    $('copyBtn').addEventListener('click', function () {
      if (!state.posts.length) return;
      copyText(state.posts[state.selected].body, 'Post copied. Paste it into LinkedIn.');
    });

    $('regenBtn').addEventListener('click', function () {
      if (!state.posts.length || !state.input) return;
      var post = state.posts[state.selected];
      var fresh = generatePost(post.type, state.input, state.weekSeed * 13 + state.selected * 5 + 11);
      fresh.day = post.day;
      state.posts[state.selected] = fresh;
      state.weekSeed += 1;
      renderAll();
      setStatus('This post was regenerated with a fresh angle.', 'ok');
    });

    $('copyAllBtn').addEventListener('click', function () {
      if (!state.posts.length) return;
      copyText(formatWeekAsText(), 'All ' + state.posts.length + ' posts copied.');
    });

    $('downloadBtn').addEventListener('click', function () {
      if (!state.posts.length) return;
      var blob = new Blob([formatWeekAsText() + '\n'], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'linkedin-week.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('Downloaded linkedin-week.txt.', 'ok');
    });

    renderCalendar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

/* Node test hook — lets the generation logic be verified without a browser. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateWeek: generateWeek,
    generatePost: generatePost,
    POST_TYPES: POST_TYPES,
    hashtags: hashtags,
    cleanTopic: cleanTopic,
    LINKEDIN_LIMIT: LINKEDIN_LIMIT
  };
}
