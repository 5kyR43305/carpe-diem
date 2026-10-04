/*
 * League of Legends — champion titles, one at a time.
 * A random title is shown in the middle; type the champion's name to answer it.
 * Wrong answers can be retried; "Skip" moves the title to the back of the line.
 * Hints (every 3 min, locked at 90%): initials or icon silhouette for the title on screen.
 */
(function () {
  'use strict';

  App.addStrings({
    ko: {
      pageTitle: 'LoL 챔피언 칭호 퀴즈 · Carpe Diem',
      title: '칭호만 보고 챔피언을 맞힐 수 있을까?',
      statFound: '맞춘 수',
      statLeft: '남은 수',
      cardLabel: '이 칭호의 챔피언은?',
      placeholder: '챔피언 이름 입력',
      answer: '정답',
      skip: '넘기기',
      giveUp: '포기',
      earlyEnd: '종료',
      tip: '가운데 칭호를 보고 그 챔피언의 한국어 풀네임을 입력한 뒤 Enter 또는 정답 버튼을 누르세요. 모르면 "넘기기"로 뒤로 미룰 수 있어요.',
      notFound: '등록된 챔피언이 아니에요 (풀네임으로 입력해 주세요)',
      wrong: '오답! 다시 생각해 보세요',
      correctFb: '{clue} → {name}',
      skipped: '넘겼어요. 이 칭호는 나중에 다시 나와요',
      confirmGiveUp: '포기하면 진행 내용과 타이머가 초기화됩니다. 포기할까요?',
      resetDone: '초기화되었어요. 처음부터 다시 도전!',
      confirmEarlyEnd: '지금 게임을 끝내고 결과를 볼까요?',
      clear: '클리어!',
      earlyEndTitle: '게임 종료',
      scoreLine: '정답 {n} / {total}',
      earlyEndComment: '정답률 {pct}% · 창을 닫으면 못 맞힌 정답을 볼 수 있어요',
      missedTitle: '못 맞힌 칭호',
      hintIdle: '💡 첫 정답을 맞히면 힌트 타이머가 시작돼요',
      hintCounting: '💡 다음 힌트까지 {time}',
      hintReadyToast: '힌트가 준비됐어요!',
      hintReadyText: '지금 화면의 칭호에 쓸 힌트를 골라 주세요',
      hintPickMask: '💡 초성 보기',
      hintPickSil: '🖼 실루엣 보기',
      hintWaiting: '💡 힌트를 받은 칭호를 맞히면 다음 힌트 타이머가 시작돼요',
      hintLocked: '💡 진행도 90% 이상에서는 힌트를 사용할 수 없어요',
      codeBlocked: '🔒 이 명령어는 지금 사용할 수 없어요',
      cheatSil: '🔓 지금과 앞으로 나올 칭호의 실루엣이 공개돼요',
      cheatMask: '🔓 지금과 앞으로 나올 칭호의 초성이 공개돼요',
      cheatBoth: '🔓 지금과 앞으로 나올 칭호의 실루엣과 초성이 공개돼요',
      cheatPause: '⏸ 시간이 멈췄어요',
      cheatResume: '▶ 시간이 다시 흐릅니다',
      hintRules: '💡 첫 정답 후 3분마다 힌트를 받을 수 있어요. 힌트가 준비되면 지금 화면의 칭호에 대해 "초성" 또는 "실루엣" 중 하나를 골라 볼 수 있고, 그 칭호를 맞혀야 다음 힌트 타이머가 시작됩니다. 진행도가 90% 이상이면 힌트를 사용할 수 없어요.',
      clearComments: ['칭호만 보고 전부 맞히다니, 룬테라 역사학자 인정!', '모든 칭호를 꿰뚫고 있네요.', '완벽 클리어! 챔피언 도감 마스터.'],
    },
    en: {
      pageTitle: 'LoL Champion Titles Quiz · Carpe Diem',
      title: 'Can You Name Every Champion From Its Title?',
      statFound: 'Found',
      statLeft: 'Left',
      cardLabel: 'Which champion has this title?',
      placeholder: 'Type a champion name',
      answer: 'Enter',
      skip: 'Skip',
      giveUp: 'Give up',
      earlyEnd: 'End',
      tip: 'Read the title in the middle, type that champion\'s full English name and press Enter or the button. Not sure? "Skip" moves it to the back.',
      notFound: 'Not a champion (use the full name)',
      wrong: 'Wrong! Try again',
      correctFb: '{clue} → {name}',
      skipped: 'Skipped. This title will come back later',
      confirmGiveUp: 'Giving up resets your progress and the timer. Give up?',
      resetDone: 'Reset. Try again from the start!',
      confirmEarlyEnd: 'End the game now and see your result?',
      clear: 'Cleared!',
      earlyEndTitle: 'Game over',
      scoreLine: '{n} / {total} found',
      earlyEndComment: '{pct}% found · close this window to see what you missed',
      missedTitle: 'Missed titles',
      hintIdle: '💡 The hint timer starts with your first correct answer',
      hintCounting: '💡 Next hint in {time}',
      hintReadyToast: 'A hint is ready!',
      hintReadyText: 'Choose a hint for the title on screen',
      hintPickMask: '💡 First letters',
      hintPickSil: '🖼 Silhouette',
      hintWaiting: '💡 Answer the hinted title to start the next hint timer',
      hintLocked: '💡 Hints are unavailable at 90% progress or more',
      codeBlocked: '🔒 This code can\'t be used right now',
      cheatSil: '🔓 Silhouettes revealed for this and upcoming titles',
      cheatMask: '🔓 First letters revealed for this and upcoming titles',
      cheatBoth: '🔓 Silhouettes and first letters revealed for this and upcoming titles',
      cheatPause: '⏸ Time stopped',
      cheatResume: '▶ Time is running again',
      hintRules: '💡 After your first correct answer, a hint unlocks every 3 minutes. When it is ready, choose the first letters or the silhouette for the title on screen. The next hint timer starts once you answer that title. Hints are unavailable once you reach 90%.',
      clearComments: ['Every title, every champion. Runeterra historian!', 'You know them all by their titles.', 'Perfect clear! Champion lore master.'],
    },
  });

  const QUIZ_ID = 'lol-titles';
  const $ = (id) => document.getElementById(id);
  const input = $('answer');
  const card = $('card');
  const feedback = $('feedback');
  const timer = new App.Timer((s) => { $('timer').textContent = App.fmtTime(s); });

  let items = [];
  let names = new Set(); // every champion name in the current language (normalized)
  let queue = []; // unanswered titles; queue[0] is on screen
  const found = new Set();
  let finished = false;
  let cheated = false; // a hidden code was used this game (not recorded)
  // Hidden-code state: initials / silhouette shown for every title (current and upcoming),
  // and a paused game timer.
  const reveal = { sil: false, mask: false };
  let timePaused = false;
  let gameId = 0; // bumped on every reset

  // Hints: every 3 minutes after the first correct answer. When ready, the player picks
  // initials or silhouette for the title on screen; that title keeps the hint (even if
  // skipped) and the next countdown starts once it is answered. Locked at 90%.
  const HINT_SEC = 180;
  const HINT_LOCK_RATIO = 0.9;
  // phase: 'idle' | 'counting' | 'ready' | 'shown' | 'locked'
  const hint = { phase: 'idle', deadline: 0, left: 0, target: null, kind: 'mask', tick: null };
  const hintsLocked = () => found.size >= Math.ceil(items.length * HINT_LOCK_RATIO);

  async function load() {
    const v = await App.ddVersion();
    const [ko, en] = await Promise.all(
      ['ko_KR', 'en_US'].map((l) => App.fetchJSON(`${App.DD}/cdn/${v}/data/${l}/champion.json`))
    );
    items = Object.values(en.data).map((c) => {
      const k = ko.data[c.id] || c;
      return {
        id: c.id,
        name: { en: c.name, ko: k.name },
        clue: { en: c.title, ko: k.title },
        img: `${App.DD}/cdn/${v}/img/champion/${c.image.full}`,
      };
    });
  }

  function current() { return queue[0]; }

  function showCurrent() {
    $('count').textContent = found.size;
    $('left').textContent = items.length - found.size;
    const it = current();
    if (!it) return;
    $('clue').textContent = it.clue[App.lang];
    renderCardHint();
    card.classList.remove('flip');
    void card.offsetWidth;
    card.classList.add('flip');
  }

  /* ---------- hints ---------- */
  function startHintCountdown() {
    clearInterval(hint.tick);
    hint.target = null;
    if (finished || !queue.length) { hint.phase = 'idle'; renderHint(); return; }
    hint.phase = 'counting';
    hint.deadline = Date.now() + HINT_SEC * 1000;
    if (timePaused) pauseHint();
    else hint.tick = setInterval(hintTick, 250);
    renderHint();
  }

  // The hint countdown freezes with the game timer (time-stop code).
  function pauseHint() {
    clearInterval(hint.tick);
    if (hint.phase === 'counting') hint.left = Math.max(0, hint.deadline - Date.now());
  }

  function resumeHint() {
    if (hint.phase !== 'counting') return;
    hint.deadline = Date.now() + hint.left;
    clearInterval(hint.tick);
    hint.tick = setInterval(hintTick, 250);
  }

  function stopHints(phase) {
    clearInterval(hint.tick);
    hint.phase = phase || 'idle';
    hint.target = null;
    renderHint();
    renderCardHint();
  }

  function hintTick() {
    if (hint.phase !== 'counting') return;
    if (Date.now() < hint.deadline) { renderHint(); return; }
    hintReadyNow();
  }

  function hintReadyNow() {
    clearInterval(hint.tick);
    hint.phase = 'ready';
    App.sfx('hint');
    App.toast(App.t('hintReadyToast'));
    renderHint();
  }

  // The hint is spent on whichever title is on screen when the player chooses.
  function useHint(kind) {
    if (hint.phase !== 'ready' || !current()) return;
    hint.phase = 'shown';
    hint.kind = kind;
    hint.target = current();
    renderHint();
    renderCardHint();
    input.focus();
  }

  function renderHint() {
    const ready = hint.phase === 'ready';
    $('hintMaskBtn').hidden = !ready;
    $('hintSilBtn').hidden = !ready;
    const counting = hint.phase === 'counting';
    $('hintBtn').hidden = !counting;
    if (counting) {
      const ms = timePaused ? hint.left : hint.deadline - Date.now();
      const left = Math.max(0, Math.ceil(ms / 1000));
      $('hintBtn').textContent = App.t('hintCounting', { time: App.fmtTime(left) });
    }
    const text = {
      idle: finished ? '' : App.t('hintIdle'),
      ready: App.t('hintReadyText'),
      shown: App.t('hintWaiting'),
      locked: finished ? '' : App.t('hintLocked'),
    }[hint.phase] || '';
    $('hintText').textContent = text;
  }

  // Shows, inside the card, the chosen hint for this title and/or the reveals from codes.
  function renderCardHint() {
    const box = $('cardHint');
    box.innerHTML = '';
    const it = current();
    const hinted = !!it && hint.phase === 'shown' && hint.target === it;
    const showSil = !!it && (reveal.sil || (hinted && hint.kind === 'sil'));
    const showMask = !!it && (reveal.mask || (hinted && hint.kind === 'mask'));
    box.hidden = !showSil && !showMask;
    if (showSil) {
      const wrap = document.createElement('div');
      wrap.className = 'tq-sil';
      const img = document.createElement('img');
      img.src = it.img;
      img.alt = '';
      const q = document.createElement('span');
      q.textContent = '?';
      wrap.append(img, q);
      box.appendChild(wrap);
    }
    if (showMask) {
      const m = document.createElement('div');
      m.className = 'tq-mask';
      m.textContent = App.maskName(it.name[App.lang]);
      box.appendChild(m);
    }
  }

  function say(kind, text, it) {
    feedback.innerHTML = '';
    if (it) {
      const img = document.createElement('img');
      img.src = it.img;
      img.alt = '';
      feedback.appendChild(img);
    }
    const span = document.createElement('span');
    span.className = kind;
    span.textContent = text;
    feedback.appendChild(span);
  }

  function shake() {
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
  }

  function setPlaying(on) {
    input.disabled = !on;
    $('answerBtn').disabled = !on;
    $('skipBtn').disabled = !on;
    $('giveUpBtn').disabled = !on;
    $('endBtn').disabled = !on || !found.size;
  }

  // Answers are registered only via Enter or the answer button.
  function tryAnswer() {
    if (finished || !current()) return;
    const key = App.norm(input.value);
    if (!key) return;
    field.clear();
    if (runCode(key)) return;
    const it = current();
    if (key !== App.norm(it.name[App.lang])) {
      App.sfx('bad');
      shake();
      say('bad', App.t(names.has(key) ? 'wrong' : 'notFound'));
      return;
    }
    found.add(it.id);
    queue.shift();
    App.sfx('ok');
    say('ok', App.t('correctFb', { clue: it.clue[App.lang], name: it.name[App.lang] }), it);
    if (!queue.length) { finish('clear'); return; }
    if (found.size === 1) { if (!timePaused) timer.start(); $('endBtn').disabled = false; }
    showCurrent();
    updateHintsAfterAnswer(it, found.size === 1);
  }

  function updateHintsAfterAnswer(answered, first) {
    if (hint.phase === 'locked') return;
    if (hintsLocked()) {
      // A hint already in use stays until its title is answered; otherwise lock now.
      if (hint.phase === 'shown' && hint.target !== answered) return;
      stopHints('locked');
      return;
    }
    if (first || (hint.phase === 'shown' && hint.target === answered)) startHintCountdown();
  }

  const field = App.smartInput(input, { onEnter: tryAnswer });

  /* ---------- hidden codes (stored only as fingerprints) ---------- */
  // A code returning false is refused; a game where any code worked isn't recorded.
  const CODES = {
    '13so5y1': skipCountdownCode,
    // The two single reveals can't be combined (nor used after "both"); "both" is always allowed.
    '1cgj5q0': () => (reveal.mask ? false : setReveal({ sil: true }, 'cheatSil')),
    'xzhy3t': () => (reveal.sil ? false : setReveal({ mask: true }, 'cheatMask')),
    'fw96ql': () => setReveal({ sil: true, mask: true }, 'cheatBoth'),
    '1h9t8j1': toggleTime,
    'mkidqr': autoClear,
  };

  function runCode(key) {
    const fn = CODES[App.fingerprint(key)];
    if (!fn) return false;
    if (fn() === false) {
      App.sfx('bad');
      App.toast(App.t('codeBlocked'));
      return true;
    }
    cheated = true;
    App.sfx('hint');
    return true;
  }

  // Skip the rest of the hint countdown. Allowed while it runs, or when the hint in use
  // belongs to a title that was skipped (that old hint is then released for a fresh one).
  function skipCountdownCode() {
    const usable = hint.phase === 'counting' || (hint.phase === 'shown' && hint.target !== current());
    if (!usable) return false;
    hint.target = null;
    hintReadyNow();
    return true;
  }

  // Reveals stay on for the current and all upcoming titles until the game is reset.
  function setReveal(flags, msgKey) {
    Object.assign(reveal, flags);
    renderCardHint();
    App.toast(App.t(msgKey));
  }

  function toggleTime() {
    timePaused = !timePaused;
    if (timePaused) { timer.stop(); pauseHint(); }
    else { if (found.size) timer.start(); resumeHint(); }
    $('timer').parentElement.classList.toggle('paused', timePaused);
    renderHint();
    App.toast(App.t(timePaused ? 'cheatPause' : 'cheatResume'));
  }

  // Answer every remaining title one by one, then clear.
  async function autoClear() {
    finished = true; // blocks input while it runs
    setPlaying(false);
    stopHints();
    const game = gameId;
    const delay = Math.min(480, 24000 / Math.max(1, queue.length)); // up to ~24 s in total
    while (queue.length) {
      if (game !== gameId) return; // the game was reset meanwhile
      const it = queue.shift();
      found.add(it.id);
      say('ok', App.t('correctFb', { clue: it.clue[App.lang], name: it.name[App.lang] }), it);
      if (queue.length) showCurrent();
      else { $('count').textContent = found.size; $('left').textContent = 0; }
      await new Promise((r) => setTimeout(r, delay));
    }
    finish('clear');
  }

  function skip() {
    if (finished || queue.length < 2) return;
    queue.push(queue.shift());
    say('muted', App.t('skipped'));
    showCurrent();
    input.focus();
  }

  function renderBest() {
    const r = App.records.load(QUIZ_ID, 'normal');
    $('best').textContent = r ? App.t('bestLineSimple', { value: App.records.format(r) }) : App.t('bestNoneSimple');
  }

  function renderMissed() {
    const list = $('missedList');
    list.innerHTML = '';
    queue.forEach((it) => {
      const row = document.createElement('div');
      row.className = 'tq-miss';
      const img = document.createElement('img');
      img.src = it.img;
      img.alt = '';
      const text = document.createElement('div');
      const b = document.createElement('b');
      b.textContent = it.name[App.lang];
      const small = document.createElement('small');
      small.textContent = it.clue[App.lang];
      text.append(b, small);
      row.append(img, text);
      list.appendChild(row);
    });
    $('missedBox').hidden = !queue.length;
  }

  function finish(kind) {
    finished = true;
    timer.stop();
    stopHints();
    setPlaying(false);
    const result = cheated
      ? { status: 'cheated' }
      : App.records.submit(QUIZ_ID, 'normal', { n: found.size, total: items.length, sec: timer.sec });
    App.records.show($('endBest'), result);
    renderBest();
    $('endScore').textContent = App.t('scoreLine', { n: found.size, total: items.length });
    $('endTime').textContent = App.fmtTime(timer.sec);
    if (kind === 'clear') {
      $('endBig').textContent = App.t('clear');
      const comments = App.t('clearComments');
      $('endComment').textContent = comments[Math.floor(Math.random() * comments.length)];
      App.sfx('win');
    } else {
      $('endBig').textContent = App.t('earlyEndTitle');
      $('endComment').textContent = App.t('earlyEndComment', { pct: Math.floor((found.size / items.length) * 100) });
      renderMissed();
    }
    App.openModal('endModal');
  }

  async function endEarly() {
    if (finished || !found.size) return;
    if (!(await App.confirm(App.t('confirmEarlyEnd')))) { input.focus(); return; }
    finish('end');
  }

  async function giveUp() {
    if (finished) return;
    if (!(await App.confirm(App.t('confirmGiveUp')))) { input.focus(); return; }
    reset();
    App.toast(App.t('resetDone'));
  }

  function reset() {
    found.clear();
    finished = false;
    cheated = false;
    gameId++;
    reveal.sil = false;
    reveal.mask = false;
    timePaused = false;
    $('timer').parentElement.classList.remove('paused');
    stopHints();
    names = new Set(items.map((it) => App.norm(it.name[App.lang])));
    queue = App.shuffle(items);
    timer.reset();
    App.closeModals();
    feedback.innerHTML = '';
    input.value = '';
    $('missedBox').hidden = true;
    card.hidden = false;
    renderBest();
    showCurrent();
    setPlaying(true);
    input.focus();
  }

  $('answerBtn').addEventListener('click', () => { tryAnswer(); input.focus(); });
  $('skipBtn').addEventListener('click', skip);
  $('giveUpBtn').addEventListener('click', giveUp);
  $('endBtn').addEventListener('click', endEarly);
  $('restartBtn').addEventListener('click', reset);
  $('hintMaskBtn').addEventListener('click', () => useHint('mask'));
  $('hintSilBtn').addEventListener('click', () => useHint('sil'));

  App.hasProgress = () => found.size > 0 || finished;
  App.mountChrome();
  App.onLang(() => { if (items.length) reset(); });

  load().then(() => {
    $('status').hidden = true;
    reset();
  }).catch((err) => {
    console.error(err);
    const s = $('status');
    s.dataset.i18n = 'loadError';
    s.textContent = App.t('loadError');
    s.classList.add('error');
  });
})();
