/*
 * "Name them all" quiz engine (used by the champion / skin-line / collection quizzes).
 *
 * NameAll.mount({
 *   load(): Promise<[{ id, name:{ko,en}, img, fallbackImg?, contain?, aliases? }]>,
 *           (contain: fit the whole image instead of cropping, e.g. weapon renders)
 *           (aliases: {ko:[...], en:[...]} extra accepted answers, skipped if they
 *            equal another item's full name)
 *           (noHint: never pick this item as a hint)
 *   gridClass: 'grid-champ' | 'grid-tile' | 'grid-weapon',
 * })
 *
 * The page provides the markup (see lol-champions.html) and its own strings:
 * pageTitle, title, placeholder, tip, notFound, clearComments.
 * Only the full name in the current language is accepted (spacing, case and
 * punctuation are ignored). Items sharing a name are revealed together.
 *
 * Hints: every 3 minutes (counted from the first correct answer) one random
 * unfound item is picked. When the player clicks the hint button, its cell
 * number and masked name (Korean initial consonants / first letters) are shown,
 * never its picture. The next countdown starts only after the hinted item is answered.
 *
 * Hints are locked once 90% are found (a hint that is already shown stays until answered).
 * Strict mode (hidden code): no hints, random cell order, and a "shuffle" button.
 * "End" finishes early and shows found/total + time.
 */
(function () {
  'use strict';

  App.addStrings({
    ko: {
      answer: '정답',
      giveUp: '포기',
      correct: '정답',
      already: '이미 맞힌 항목이에요',
      confirmGiveUp: '포기하면 진행 내용과 타이머가 초기화됩니다. 포기할까요?',
      resetDone: '초기화되었어요. 처음부터 다시 도전!',
      clear: '클리어!',
      scoreLine: '정답 {n} / {total}',
      hintIdle: '💡 첫 정답을 맞히면 힌트 타이머가 시작돼요',
      hintCounting: '💡 다음 힌트까지 {time}',
      hintReady: '💡 힌트 보기',
      hintReadyToast: '힌트가 준비됐어요!',
      hintShown: '💡 힌트: {num}번 · {mask}',
      hintWaiting: '이 항목을 맞히면 다음 힌트 타이머가 시작돼요',
      hintNone: '💡 남은 항목은 힌트가 제공되지 않아요',
      hintRules: '💡 첫 정답 후 3분마다 힌트를 받을 수 있어요. 힌트 버튼을 누르면 아직 못 맞힌 항목 하나의 번호와 이름 초성이 공개되고, 그 항목을 맞혀야 다음 힌트 타이머가 시작됩니다. 진행도가 90% 이상이면 힌트를 사용할 수 없어요. "종료" 버튼으로 언제든 결과를 볼 수 있어요.',
      earlyEnd: '종료',
      confirmEarlyEnd: '지금 게임을 끝내고 결과를 볼까요?',
      earlyEndTitle: '게임 종료',
      earlyEndComment: '정답률 {pct}%',
      hintLocked: '💡 진행도 90% 이상에서는 힌트를 사용할 수 없어요',
      shuffle: '🔀 섞기',
      hardNoHint: '🔥 하드모드 · 힌트 없음',
      hardRules: '🔥 하드모드: 힌트가 없고 칸의 순서가 무작위예요. "섞기" 버튼을 누르면 순서를 다시 섞을 수 있어요. "종료" 버튼으로 언제든 결과를 볼 수 있어요.',
      confirmHardOn: '하드모드로 바꾸면 진행 내용이 초기화됩니다. 계속할까요?',
      confirmHardOff: '일반 모드로 돌아가면 진행 내용이 초기화됩니다. 계속할까요?',
      hardOn: '🔥 하드모드가 시작됐어요',
      hardOff: '일반 모드로 돌아왔어요',
      cheatSil: '🔓 남은 항목의 실루엣이 공개됐어요',
      cheatMask: '🔓 남은 항목의 초성이 공개됐어요',
      cheatBoth: '🔓 남은 항목의 실루엣과 초성이 공개됐어요',
      cheatPause: '⏸ 시간이 멈췄어요',
      cheatResume: '▶ 시간이 다시 흐릅니다',
    },
    en: {
      answer: 'Enter',
      giveUp: 'Give up',
      correct: 'Found',
      already: 'Already found',
      confirmGiveUp: 'Giving up resets your progress and the timer. Give up?',
      resetDone: 'Reset. Try again from the start!',
      clear: 'Cleared!',
      scoreLine: '{n} / {total} found',
      hintIdle: '💡 The hint timer starts with your first correct answer',
      hintCounting: '💡 Next hint in {time}',
      hintReady: '💡 Show hint',
      hintReadyToast: 'A hint is ready!',
      hintShown: '💡 Hint: #{num} · {mask}',
      hintWaiting: 'Answer this one to start the next hint timer',
      hintNone: '💡 No hints are available for the remaining items',
      hintRules: '💡 After your first correct answer, a hint unlocks every 3 minutes. Click the hint button to reveal the number of one unanswered item and the first letter of each word in its name. The next hint timer starts once you answer that item. Hints are unavailable once you reach 90%. Press "End" at any time to see your result.',
      earlyEnd: 'End',
      confirmEarlyEnd: 'End the game now and see your result?',
      earlyEndTitle: 'Game over',
      earlyEndComment: '{pct}% found',
      hintLocked: '💡 Hints are unavailable at 90% progress or more',
      shuffle: '🔀 Shuffle',
      hardNoHint: '🔥 Hard mode · no hints',
      hardRules: '🔥 Hard mode: no hints, and the cells are in random order. Press "Shuffle" to reshuffle them. Press "End" at any time to see your result.',
      confirmHardOn: 'Switching to hard mode will reset your progress. Continue?',
      confirmHardOff: 'Going back to normal mode will reset your progress. Continue?',
      hardOn: '🔥 Hard mode started',
      hardOff: 'Back to normal mode',
      cheatSil: '🔓 Silhouettes of the rest are revealed',
      cheatMask: '🔓 First letters of the rest are revealed',
      cheatBoth: '🔓 Silhouettes and first letters of the rest are revealed',
      cheatPause: '⏸ Time stopped',
      cheatResume: '▶ Time is running again',
    },
  });

  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';

  /** Hide a name: Hangul -> initial consonants, Latin words -> first letter + blanks. */
  function maskName(name) {
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
  }

  function mount(cfg) {
    const $ = (id) => document.getElementById(id);
    const HINT_SEC = 180;

    const input = $('answer');
    const grid = $('grid');
    const timer = new App.Timer((s) => { $('timer').textContent = App.fmtTime(s); });

    // Hint bar goes right below the input bar.
    const hintBar = document.createElement('div');
    hintBar.className = 'hint-bar';
    hintBar.innerHTML = '<button type="button" class="btn btn-hint" id="hintBtn" disabled></button>' +
      '<button type="button" class="btn btn-shuffle" id="shuffleBtn" data-i18n="shuffle" hidden></button>' +
      '<span class="hint-text" id="hintText"></span>';
    document.querySelector('.game-bar').after(hintBar);

    // Early-end button, next to "give up".
    const endBtn = document.createElement('button');
    endBtn.type = 'button';
    endBtn.className = 'btn btn-end';
    endBtn.id = 'endBtn';
    endBtn.dataset.i18n = 'earlyEnd';
    endBtn.disabled = true;
    $('giveUpBtn').after(endBtn);

    // Hint rules, shown under the page's own instructions.
    const rules = document.createElement('p');
    rules.className = 'tip tip-hint';
    rules.dataset.i18n = 'hintRules';
    document.querySelector('.tip').after(rules);
    const hintBtn = $('hintBtn');
    const hintText = $('hintText');
    const shuffleBtn = $('shuffleBtn');

    let items = [];
    const lookup = new Map(); // normalized name -> [items]
    const found = new Set();
    let finished = false;
    let commentIdx = 0;
    // No new hints once 90% are found.
    const HINT_LOCK_RATIO = 0.9;
    const hintsLocked = () => found.size >= Math.ceil(items.length * HINT_LOCK_RATIO);
    // Cheat state: extra reveals for unfound cells, and a paused game timer.
    const reveal = { sil: false, mask: false };
    let timePaused = false;
    let gameId = 0; // bumped on every reset
    // Strict mode (hidden code): no hints, random cell order, "shuffle" button.
    // Lasts until the code is entered again or the page is reloaded.
    let strict = false;
    let order = []; // item ids in display order while in hard mode

    // phase: 'idle' (not started / finished) | 'counting' | 'ready' (target picked, not shown) | 'shown'
    //        | 'none' (only items without hints remain) | 'locked' (90% reached)
    const hint = { phase: 'idle', deadline: 0, left: 0, target: null, tick: null };

    grid.classList.add(cfg.gridClass || 'grid-champ');

    function buildLookup() {
      lookup.clear();
      items.forEach((it) => {
        const key = App.norm(it.name[App.lang]);
        if (!key) return;
        if (!lookup.has(key)) lookup.set(key, []);
        lookup.get(key).push(it);
      });
      // Short forms are accepted only when they aren't another item's full name
      // (e.g. "아틀라스" for "아틀라스 // CMD", but not "프라임" for "프라임//2.0").
      items.forEach((it) => {
        ((it.aliases && it.aliases[App.lang]) || []).forEach((a) => {
          const key = App.norm(a);
          if (key && !lookup.has(key)) lookup.set(key, [it]);
        });
      });
    }

    function sorted() {
      if (strict) {
        const byId = new Map(items.map((it) => [it.id, it]));
        return order.map((id) => byId.get(id));
      }
      const locale = App.lang === 'ko' ? 'ko' : 'en';
      return items.slice().sort((a, b) => a.name[App.lang].localeCompare(b.name[App.lang], locale));
    }

    function cellOf(it) {
      return grid.querySelector(`.cell[data-id="${CSS.escape(String(it.id))}"]`);
    }

    function render() {
      grid.innerHTML = '';
      sorted().forEach((it, i) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.id = it.id;
        cell.dataset.num = i + 1;
        cell.innerHTML = `<span class="num">${String(i + 1).padStart(3, '0')}</span>`;
        grid.appendChild(cell);
        paint(cell, it, false);
      });
      $('total').textContent = items.length;
      $('count').textContent = found.size;
    }

    function picture(it) {
      const pic = document.createElement('div');
      pic.className = it.contain ? 'pic contain' : 'pic';
      const img = document.createElement('img');
      img.alt = '';
      if (it.fallbackImg) img.onerror = () => { img.onerror = null; img.src = it.fallbackImg; };
      img.src = it.img;
      pic.appendChild(img);
      return pic;
    }

    function paint(cell, it, animate) {
      const isFound = found.has(it.id);
      // Unfound cells can show a silhouette and/or the masked name:
      // via the hidden codes; a shown hint adds the masked name only.
      const isHinted = !isFound && hint.phase === 'shown' && hint.target === it;
      const showSil = !isFound && reveal.sil;
      const showMask = !isFound && (reveal.mask || isHinted);
      cell.classList.toggle('ok', isFound);
      cell.classList.toggle('hinted', isHinted);
      cell.classList.toggle('final', !isFound && (reveal.sil || reveal.mask));
      cell.querySelectorAll('.q, .pic, .name').forEach((el) => el.remove());
      if (isFound) {
        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = it.name[App.lang];
        cell.title = it.name[App.lang];
        cell.append(picture(it), name);
      } else {
        cell.removeAttribute('title');
        // "Silhouette" = the picture with a "?" laid over it.
        if (showSil) cell.appendChild(picture(it));
        const q = document.createElement('div');
        q.className = 'q';
        q.textContent = '?';
        cell.appendChild(q);
        if (showMask) {
          const masked = document.createElement('div');
          masked.className = 'name';
          masked.textContent = maskName(it.name[App.lang]);
          cell.appendChild(masked);
        }
      }
      if (animate) {
        cell.classList.remove('pop');
        void cell.offsetWidth;
        cell.classList.add('pop');
      }
    }

    /* ---------- hints ---------- */
    const hintCandidates = () => items.filter((it) => !found.has(it.id) && !it.noHint);

    function startHintCountdown() {
      clearInterval(hint.tick);
      hint.target = null;
      if (finished || found.size === items.length) { hint.phase = 'idle'; renderHint(); return; }
      if (!hintCandidates().length) { hint.phase = 'none'; renderHint(); return; }
      hint.phase = 'counting';
      hint.deadline = Date.now() + HINT_SEC * 1000;
      if (timePaused) pauseHint();
      else hint.tick = setInterval(hintTick, 250);
      renderHint();
    }

    // The hint countdown freezes with the game timer (hidden time-stop code).
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

    function stopHints() {
      clearInterval(hint.tick);
      const prev = hint.target;
      hint.phase = 'idle';
      hint.target = null;
      if (prev && grid.contains(cellOf(prev))) paint(cellOf(prev), prev, false);
      renderHint();
    }

    function hintTick() {
      if (hint.phase !== 'counting') return;
      if (Date.now() < hint.deadline) { renderHint(); return; }
      clearInterval(hint.tick);
      const pool = hintCandidates();
      if (!pool.length) { hint.phase = 'none'; renderHint(); return; }
      hint.target = App.pick(pool);
      hint.phase = 'ready';
      App.sfx('hint');
      App.toast(App.t('hintReadyToast'));
      renderHint();
    }

    function showHint() {
      if (hint.phase !== 'ready') return;
      hint.phase = 'shown';
      const cell = cellOf(hint.target);
      paint(cell, hint.target, true);
      cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
      renderHint();
      input.focus();
    }

    function renderHint() {
      hintBtn.classList.toggle('ready', hint.phase === 'ready');
      hintBtn.disabled = hint.phase !== 'ready';
      hintText.textContent = '';
      shuffleBtn.hidden = !strict;
      shuffleBtn.disabled = finished;
      if (strict) {
        hintBtn.hidden = true;
        hintText.textContent = App.t('hardNoHint');
      } else if (hint.phase === 'idle') {
        hintBtn.hidden = true;
        hintText.textContent = finished ? '' : App.t('hintIdle');
      } else if (hint.phase === 'none') {
        hintBtn.hidden = true;
        hintText.textContent = App.t('hintNone');
      } else if (hint.phase === 'locked') {
        hintBtn.hidden = true;
        hintText.textContent = finished ? '' : App.t('hintLocked');
      } else if (hint.phase === 'counting') {
        hintBtn.hidden = false;
        const ms = timePaused ? hint.left : hint.deadline - Date.now();
        const left = Math.max(0, Math.ceil(ms / 1000));
        hintBtn.textContent = App.t('hintCounting', { time: App.fmtTime(left) });
      } else if (hint.phase === 'ready') {
        hintBtn.hidden = false;
        hintBtn.textContent = App.t('hintReady');
      } else {
        hintBtn.hidden = true;
        const num = cellOf(hint.target).dataset.num;
        const strong = document.createElement('b');
        strong.textContent = App.t('hintShown', { num, mask: maskName(hint.target.name[App.lang]) });
        const small = document.createElement('small');
        small.textContent = App.t('hintWaiting');
        hintText.append(strong, small);
      }
    }

    /* ---------- answering ---------- */
    // Answers are registered only via Enter or the answer button.
    function tryAnswer() {
      if (finished) return;
      const key = App.norm(input.value);
      if (!key) return;
      if (runCheat(key)) { field.clear(); return; }
      const group = lookup.get(key);
      if (!group) { App.sfx('bad'); App.toast(App.t('notFound')); field.clear(); return; }
      const fresh = group.filter((it) => !found.has(it.id));
      if (!fresh.length) { App.sfx('dup'); App.toast(App.t('already')); field.clear(); return; }

      field.clear();
      const first = !found.size;
      fresh.forEach((it) => {
        found.add(it.id);
        paint(cellOf(it), it, true);
      });
      App.sfx('ok');
      $('count').textContent = found.size;
      if (found.size === items.length) { clearGame(); return; }

      if (first) { if (!timePaused) timer.start(); endBtn.disabled = false; }
      if (strict) return; // no hints in hard mode
      if (hintsLocked()) {
        // Keep a hint that is already open until its item is answered; otherwise lock now.
        const openHint = hint.phase === 'shown' && !found.has(hint.target.id);
        if (!openHint && hint.phase !== 'locked') lockHints();
        return;
      }
      if (first) startHintCountdown();
      // Answering the hinted item (shown or not yet opened) restarts the countdown.
      else if (hint.target && found.has(hint.target.id)) startHintCountdown();
    }

    const field = App.smartInput(input, { onEnter: tryAnswer });

    /* ---------- hidden codes ---------- */
    // Only fingerprints are stored so the codes can't be read from the source.
    function fingerprint(s) {
      let h = 0x811c9dc5;
      for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
      return h.toString(36);
    }
    const CHEATS = {
      '1cgj5q0': () => setReveal({ sil: true }, 'cheatSil'),
      'xzhy3t': () => setReveal({ mask: true }, 'cheatMask'),
      'fw96ql': () => setReveal({ sil: true, mask: true }, 'cheatBoth'),
      '1h9t8j1': toggleTime,
      'mkidqr': autoClear,
      'x2fpof': toggleStrict,
    };

    function runCheat(key) {
      const fn = CHEATS[fingerprint(key)];
      if (!fn) return false;
      fn();
      App.sfx('hint');
      return true;
    }

    function setReveal(flags, msgKey) {
      Object.assign(reveal, flags);
      items.forEach((it) => { if (!found.has(it.id)) paint(cellOf(it), it, false); });
      App.toast(App.t(msgKey));
    }

    // Switching mode always starts a new game (asks first when there is progress).
    async function toggleStrict() {
      if (App.hasProgress() && !(await App.confirm(App.t(strict ? 'confirmHardOff' : 'confirmHardOn')))) {
        input.focus();
        return;
      }
      strict = !strict;
      reset();
      App.toast(App.t(strict ? 'hardOn' : 'hardOff'));
    }

    function shuffleOrder() {
      order = App.shuffle(items).map((it) => it.id);
    }

    function reshuffle() {
      if (!strict || finished) return;
      shuffleOrder();
      render();
      input.focus();
    }

    function applyModeLook() {
      document.body.classList.toggle('hard', strict);
      rules.dataset.i18n = strict ? 'hardRules' : 'hintRules';
      rules.textContent = App.t(rules.dataset.i18n);
    }

    function toggleTime() {
      timePaused = !timePaused;
      if (timePaused) { timer.stop(); pauseHint(); }
      else { if (found.size) timer.start(); resumeHint(); }
      renderHint();
      $('timer').parentElement.classList.toggle('paused', timePaused);
      App.toast(App.t(timePaused ? 'cheatPause' : 'cheatResume'));
    }

    // Fill in every remaining item one by one, in grid order, then clear.
    async function autoClear() {
      finished = true; // blocks input while the animation runs
      input.disabled = true;
      $('answerBtn').disabled = true;
      $('giveUpBtn').disabled = true;
      endBtn.disabled = true;
      stopHints();
      const rest = sorted().filter((it) => !found.has(it.id));
      const delay = Math.min(120, 6000 / Math.max(1, rest.length)); // up to ~6 s in total
      const game = gameId;
      for (const it of rest) {
        if (game !== gameId) return; // the game was reset meanwhile
        found.add(it.id);
        const cell = cellOf(it);
        paint(cell, it, true);
        cell.scrollIntoView({ block: 'nearest' });
        $('count').textContent = found.size;
        await new Promise((r) => setTimeout(r, delay));
      }
      clearGame();
    }

    function lockHints() {
      clearInterval(hint.tick);
      const prev = hint.target;
      hint.phase = 'locked';
      hint.target = null;
      if (prev && !found.has(prev.id)) paint(cellOf(prev), prev, false);
      renderHint();
    }

    async function endEarly() {
      if (finished || !found.size) return;
      if (!(await App.confirm(App.t('confirmEarlyEnd')))) { input.focus(); return; }
      finished = true;
      timer.stop();
      stopHints();
      input.disabled = true;
      $('answerBtn').disabled = true;
      $('giveUpBtn').disabled = true;
      endBtn.disabled = true;
      const pct = Math.floor((found.size / items.length) * 100);
      $('endBig').textContent = App.t('earlyEndTitle');
      $('endScore').textContent = App.t('scoreLine', { n: found.size, total: items.length });
      $('endTime').textContent = App.fmtTime(timer.sec);
      $('endComment').textContent = App.t('earlyEndComment', { pct });
      App.openModal('endModal');
    }

    function clearGame() {
      finished = true;
      timer.stop();
      stopHints();
      input.disabled = true;
      $('answerBtn').disabled = true;
      $('giveUpBtn').disabled = true;
      endBtn.disabled = true;
      commentIdx = Math.floor(Math.random() * App.t('clearComments').length);
      $('endBig').textContent = App.t('clear');
      $('endScore').textContent = App.t('scoreLine', { n: found.size, total: items.length });
      $('endTime').textContent = App.fmtTime(timer.sec);
      $('endComment').textContent = App.t('clearComments')[commentIdx];
      App.sfx('win');
      App.openModal('endModal');
    }

    function reset() {
      found.clear();
      finished = false;
      gameId++;
      reveal.sil = false;
      reveal.mask = false;
      timePaused = false;
      $('timer').parentElement.classList.remove('paused');
      endBtn.disabled = true; // enabled after the first correct answer
      clearInterval(hint.tick);
      hint.phase = 'idle';
      hint.target = null;
      timer.reset();
      App.closeModals();
      input.value = '';
      buildLookup();
      if (strict) shuffleOrder();
      applyModeLook();
      render();
      renderHint();
      input.disabled = false;
      $('answerBtn').disabled = false;
      $('giveUpBtn').disabled = false;
      input.focus();
    }

    async function giveUp() {
      if (finished) return;
      if (!(await App.confirm(App.t('confirmGiveUp')))) { input.focus(); return; }
      reset();
      App.toast(App.t('resetDone'));
    }

    $('answerBtn').addEventListener('click', () => { tryAnswer(); input.focus(); });
    $('giveUpBtn').addEventListener('click', giveUp);
    endBtn.addEventListener('click', endEarly);
    $('restartBtn').addEventListener('click', reset);
    hintBtn.addEventListener('click', showHint);
    shuffleBtn.addEventListener('click', reshuffle);

    App.hasProgress = () => found.size > 0 || finished;
    App.mountChrome();
    App.onLang(() => { if (items.length) reset(); });

    cfg.load().then((list) => {
      items = list;
      $('status').hidden = true;
      reset();
    }).catch((err) => {
      console.error(err);
      const s = $('status');
      s.dataset.i18n = 'loadError';
      s.textContent = App.t('loadError');
      s.classList.add('error');
    });
  }

  window.NameAll = { mount };
})();
