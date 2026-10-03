/* Shared helpers: i18n, top bar, sound, timer, modal, toast, data fetch. */
(function () {
  'use strict';

  const DD = 'https://ddragon.leagueoflegends.com';
  const LOCALE = {
    ddragon: { ko: 'ko_KR', en: 'en_US' },
    valorant: { ko: 'ko-KR', en: 'en-US' },
  };

  // Per-publisher footer notice. To add a publisher (e.g. 'hoyoverse'), add an
  // entry here plus its text key in STRINGS, then use <body data-legal="hoyoverse">.
  const LEGAL = {
    riot: {
      key: 'disclaimer',
      sources: [
        { name: 'Riot Data Dragon', url: 'https://developer.riotgames.com/docs/lol#data-dragon' },
        { name: 'CommunityDragon', url: 'https://www.communitydragon.org' },
        { name: 'valorant-api.com', url: 'https://valorant-api.com' },
      ],
    },
  };

  const STRINGS = {
    ko: {
      brand: 'Game Quiz',
      home: '홈',
      soundOn: '효과음 켜짐',
      soundOff: '효과음 꺼짐',
      loading: '데이터를 불러오는 중…',
      loadError: '데이터를 불러오지 못했어요. 잠시 후 새로고침해 주세요.',
      close: '닫기',
      restart: '다시 하기',
      time: '시간',
      langResetConfirm: '언어 설정을 바꾸면 진행 내용이 초기화됩니다. 계속할까요?',
      ok: '확인',
      cancel: '취소',
      modeNormal: '일반',
      modeHard: '하드',
      recordValue: '{n} / {total} · {time}',
      bestLine: '🏆 최고 기록 ({mode}): {value}',
      bestNone: '🏆 최고 기록 ({mode}): 아직 없어요',
      bestLineSimple: '🏆 최고 기록: {value}',
      bestNoneSimple: '🏆 최고 기록: 아직 없어요',
      recordNew: '🏆 새 최고 기록!',
      recordPrev: '(이전: {value})',
      recordKept: '🏆 최고 기록: {value}',
      recordCheated: '⚠ 명령어를 사용한 게임이라 기록되지 않았어요',
      langNote: '언어를 바꾸면 진행 내용이 초기화됩니다',
      disclaimerCommon: '이 사이트는 비공식 팬 사이트이며, 어떤 게임사의 승인이나 후원도 받지 않았습니다. 각 게임의 이미지, 명칭, 상표에 대한 권리는 해당 게임사에 있습니다.',
      disclaimer: '이 사이트는 비공식 팬 콘텐츠이며 Riot Games의 승인이나 후원을 받지 않았습니다. Riot Games의 "Legal Jibber Jabber" 정책에 따라 Riot Games 소유 자산을 사용합니다. League of Legends와 VALORANT는 Riot Games, Inc.의 상표입니다.',
      dataSource: '데이터 출처',
    },
    en: {
      brand: 'Game Quiz',
      home: 'Home',
      soundOn: 'Sound on',
      soundOff: 'Sound off',
      loading: 'Loading data…',
      loadError: 'Could not load data. Please refresh in a moment.',
      close: 'Close',
      restart: 'Play again',
      time: 'Time',
      langResetConfirm: 'Changing the language will reset your progress. Continue?',
      ok: 'OK',
      cancel: 'Cancel',
      modeNormal: 'normal',
      modeHard: 'hard',
      recordValue: '{n} / {total} · {time}',
      bestLine: '🏆 Best ({mode}): {value}',
      bestNone: '🏆 Best ({mode}): none yet',
      bestLineSimple: '🏆 Best: {value}',
      bestNoneSimple: '🏆 Best: none yet',
      recordNew: '🏆 New best!',
      recordPrev: '(previous: {value})',
      recordKept: '🏆 Best: {value}',
      recordCheated: '⚠ Not recorded because a code was used',
      langNote: 'Changing the language resets your progress',
      disclaimerCommon: 'This is an unofficial fan site and is not endorsed or sponsored by any game publisher. All game images, names and trademarks belong to their respective owners.',
      disclaimer: 'This is an unofficial fan project and is not endorsed or sponsored by Riot Games. It was created under Riot Games\' "Legal Jibber Jabber" policy using assets owned by Riot Games. League of Legends and VALORANT are trademarks of Riot Games, Inc.',
      dataSource: 'Data',
    },
  };

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* storage unavailable */ }
    return null;
  }

  function detectLang() {
    const saved = store('rq-lang');
    if (saved === 'ko' || saved === 'en') return saved;
    return (navigator.language || '').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  }

  const listeners = [];
  let soundOn = store('rq-sound') !== 'off';
  let audioCtx = null;

  const App = {
    DD,
    LOCALE,
    lang: detectLang(),

    addStrings(extra) {
      for (const l of Object.keys(extra)) Object.assign(STRINGS[l], extra[l]);
    },

    t(key, vars) {
      let s = STRINGS[App.lang][key];
      if (s === undefined) s = STRINGS.en[key];
      if (s === undefined) return key;
      if (typeof s === 'string' && vars) {
        s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
      }
      return s;
    },

    /** Pick the current-language value from a {ko, en} object. */
    L(obj) {
      if (!obj) return '';
      return obj[App.lang] || obj.en || obj.ko || '';
    },

    /** Pages set this to a function returning true while a game has progress. */
    hasProgress: null,

    async setLang(lang) {
      if (lang === App.lang) return;
      if (App.hasProgress && App.hasProgress() && !(await App.confirm(App.t('langResetConfirm')))) return;
      App.lang = lang;
      store('rq-lang', lang);
      App.applyI18n();
      listeners.forEach((fn) => fn(lang));
    },

    onLang(fn) { listeners.push(fn); },

    applyI18n(root) {
      root = root || document;
      document.documentElement.lang = App.lang;
      root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = App.t(el.dataset.i18n); });
      root.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = App.t(el.dataset.i18nPh); });
      const titleKey = document.body.dataset.titleKey;
      if (titleKey) document.title = App.t(titleKey);
      document.querySelectorAll('#langSeg button').forEach((b) => b.classList.toggle('active', b.dataset.lang === App.lang));
      const seg = document.getElementById('langSeg');
      if (seg) seg.title = App.hasProgress ? App.t('langNote') : '';
      const sb = document.getElementById('soundBtn');
      if (sb) { sb.textContent = soundOn ? '🔊' : '🔇'; sb.title = App.t(soundOn ? 'soundOn' : 'soundOff'); }
    },

    mountChrome() {
      const top = document.createElement('header');
      top.className = 'topbar';
      top.innerHTML =
        '<a class="brand" href="index.html"><img class="brand-logo" src="assets/img/logo.png" alt="Game Quiz"><span class="brand-text" data-i18n="brand"></span></a>' +
        '<div class="controls">' +
        '<div class="seg" id="langSeg"><button type="button" data-lang="ko">한국어</button><button type="button" data-lang="en">EN</button></div>' +
        '<button type="button" class="icon-btn" id="soundBtn"></button>' +
        '</div>';
      document.body.prepend(top);

      // Footer: the home page shows the common notice; a quiz page with
      // <body data-legal="riot"> shows that publisher's notice and data sources.
      const foot = document.createElement('footer');
      foot.className = 'footer';
      const legal = LEGAL[document.body.dataset.legal];
      if (legal) {
        const links = legal.sources.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join(' · ');
        foot.innerHTML = `<div data-i18n="${legal.key}"></div><div><span data-i18n="dataSource"></span>: ${links}</div>`;
      } else {
        foot.innerHTML = '<div data-i18n="disclaimerCommon"></div>';
      }
      document.body.appendChild(foot);

      const extra = document.createElement('div');
      extra.innerHTML =
        '<div class="backdrop" id="backdrop"></div><div class="toast" id="toast" role="status"></div>' +
        '<section class="modal" id="confirmModal" role="alertdialog" aria-modal="true">' +
        '<p class="modal-comment confirm-msg" id="confirmMsg"></p>' +
        '<div class="modal-buttons"><button type="button" class="btn" id="confirmNo" data-i18n="cancel"></button>' +
        '<button type="button" class="btn btn-primary" id="confirmYes" data-i18n="ok"></button></div></section>';
      while (extra.firstChild) document.body.appendChild(extra.firstChild);

      top.querySelectorAll('#langSeg button').forEach((b) => b.addEventListener('click', () => App.setLang(b.dataset.lang)));
      document.getElementById('soundBtn').addEventListener('click', () => {
        soundOn = !soundOn;
        store('rq-sound', soundOn ? 'on' : 'off');
        App.applyI18n();
      });
      document.getElementById('confirmYes').addEventListener('click', () => App._settleConfirm(true));
      document.getElementById('confirmNo').addEventListener('click', () => App._settleConfirm(false));
      document.getElementById('backdrop').addEventListener('click', App.closeModals);
      document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', App.closeModals));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') App.closeModals(); });
      App.applyI18n();
    },

    /* ---------- sound (generated, no audio files) ---------- */
    sfx(kind) {
      if (!soundOn) return;
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const tone = (freq, dur, type, at, vol) => {
          const t0 = audioCtx.currentTime + (at || 0);
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = type || 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(vol || 0.12, t0);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
          osc.connect(gain).connect(audioCtx.destination);
          osc.start(t0);
          osc.stop(t0 + dur + 0.02);
        };
        if (kind === 'ok') { tone(880, 0.09, 'triangle'); tone(1320, 0.14, 'triangle', 0.07); }
        else if (kind === 'bad') { tone(190, 0.22, 'sawtooth', 0, 0.07); }
        else if (kind === 'dup') { tone(440, 0.1, 'square', 0, 0.05); }
        else if (kind === 'hint') { tone(1047, 0.12, 'sine', 0, 0.1); tone(1568, 0.25, 'sine', 0.1, 0.08); }
        else if (kind === 'win') { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', i * 0.11)); }
      } catch (e) { /* audio unavailable */ }
    },

    toast(msg) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(App.toast.t);
      App.toast.t = setTimeout(() => el.classList.remove('show'), 1200);
    },

    openModal(id) {
      document.getElementById('backdrop').classList.add('show');
      document.getElementById(id).classList.add('show');
    },

    closeModals() {
      document.getElementById('backdrop').classList.remove('show');
      document.querySelectorAll('.modal.show').forEach((m) => m.classList.remove('show'));
      if (App._confirmResolve) App._settleConfirm(false);
    },

    /** In-page replacement for window.confirm(); resolves true/false. */
    confirm(message) {
      if (App._confirmResolve) App._settleConfirm(false);
      App.closeModals();
      document.getElementById('confirmMsg').textContent = message;
      App.openModal('confirmModal');
      document.getElementById('confirmYes').focus();
      return new Promise((resolve) => { App._confirmResolve = resolve; });
    },

    _settleConfirm(value) {
      const resolve = App._confirmResolve;
      App._confirmResolve = null;
      document.getElementById('confirmModal').classList.remove('show');
      document.getElementById('backdrop').classList.remove('show');
      if (resolve) resolve(value);
    },


    /**
     * Best records in localStorage, per quiz and mode. More found is better;
     * with the same count, a shorter time is better.
     */
    records: {
      key: (quiz, mode) => `rq-best:${quiz}:${mode}`,
      load(quiz, mode) {
        try { return JSON.parse(localStorage.getItem(App.records.key(quiz, mode))); } catch (e) { return null; }
      },
      /** Saves cur ({n, total, sec}) if it beats the previous one. Returns {status:'new'|'kept', prev}. */
      submit(quiz, mode, cur) {
        const prev = App.records.load(quiz, mode);
        const better = !prev || cur.n > prev.n || (cur.n === prev.n && cur.sec < prev.sec);
        if (!better) return { status: 'kept', prev };
        try { localStorage.setItem(App.records.key(quiz, mode), JSON.stringify(Object.assign({ at: Date.now() }, cur))); } catch (e) { /* storage unavailable */ }
        return { status: 'new', prev };
      },
      format: (r) => App.t('recordValue', { n: r.n, total: r.total, time: App.fmtTime(r.sec) }),
      /** Writes a record result into a result-window element (classes: new / warn). */
      show(el, result) {
        el.className = 'modal-best';
        if (result.status === 'cheated') {
          el.textContent = App.t('recordCheated');
          el.classList.add('warn');
        } else if (result.status === 'new') {
          el.textContent = App.t('recordNew') + (result.prev ? ' ' + App.t('recordPrev', { value: App.records.format(result.prev) }) : '');
          el.classList.add('new');
        } else {
          el.textContent = App.t('recordKept', { value: App.records.format(result.prev) });
        }
      },
    },

    fmtTime(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    },

    /** Normalize an answer: case/width/spacing/punctuation-insensitive. */
    norm(v) {
      return String(v || '').normalize('NFKC').toLowerCase().replace(/[\s'’`".,·・ㆍ:;!?&＆_\-/\\()[\]]/g, '');
    },

    /** Fingerprint (FNV-1a, base 36) used to recognise hidden codes without storing them. */
    fingerprint(s) {
      let h = 0x811c9dc5;
      for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
      return h.toString(36);
    },

    /** Hide a name for hints: Hangul -> initial consonants, Latin words -> first letter + blanks. */
    maskName(name) {
      const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
      return name.split(/\s+/).map((word) => {
        let shownLatin = false;
        return [...word].map((ch) => {
          const code = ch.charCodeAt(0);
          if (code >= 0xac00 && code <= 0xd7a3) return CHO[Math.floor((code - 0xac00) / 588)];
          if (/[A-Za-z]/.test(ch)) {
            if (shownLatin) return '_';
            shownLatin = true;
            return ch;
          }
          return ch; // digits and punctuation stay visible
        }).join('');
      }).join(' ');
    },

    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },

    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

    async fetchJSON(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status + ' ' + url);
      return res.json();
    },

    ddVersion() {
      if (!App._dd) App._dd = App.fetchJSON(DD + '/api/versions.json').then((v) => v[0]);
      return App._dd;
    },

    loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error('image ' + src));
        img.src = src;
      });
    },

    /**
     * Wire a text input so Korean IME composition behaves: onChange fires on every
     * keystroke (including mid-composition), onEnter on Enter. clear() empties the
     * field without the composing syllable reappearing.
     */
    smartInput(input, handlers) {
      let composing = false;
      let lastEnter = 0;
      const enter = () => {
        if (Date.now() - lastEnter < 150) return;
        lastEnter = Date.now();
        setTimeout(() => handlers.onEnter && handlers.onEnter(), 0);
      };
      input.addEventListener('compositionstart', () => { composing = true; });
      input.addEventListener('compositionend', () => { composing = false; if (handlers.onChange) handlers.onChange(); });
      input.addEventListener('input', () => { if (handlers.onChange) handlers.onChange(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); enter(); } });
      input.addEventListener('keyup', (e) => { if (e.key === 'Enter') enter(); });
      return {
        clear() {
          if (composing) {
            input.blur();
            setTimeout(() => { input.value = ''; input.focus(); }, 0);
          } else {
            input.value = '';
          }
        },
      };
    },
  };

  App.Timer = class {
    constructor(onTick) { this.sec = 0; this.id = null; this.onTick = onTick; }
    start() {
      if (this.id) return;
      this.t0 = Date.now() - this.sec * 1000;
      this.id = setInterval(() => {
        const s = Math.floor((Date.now() - this.t0) / 1000);
        if (s !== this.sec) { this.sec = s; if (this.onTick) this.onTick(s); }
      }, 200);
    }
    stop() { clearInterval(this.id); this.id = null; }
    reset() { this.stop(); this.sec = 0; if (this.onTick) this.onTick(0); }
  };

  window.App = App;
})();
