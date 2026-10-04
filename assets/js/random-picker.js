/*
 * Random character picker (used by the VALORANT agent and LoL champion pickers).
 *
 * RandomPicker.mount({
 *   load(): Promise<{ units: [{ id, name:{ko,en}, role, img, fallbackImg?, colors? }],
 *                     roles: [{ key, name:{ko,en}, icon? }] }>,   // roles in display order
 *   positions?: [{ ko, en, icon? }],   // enables the optional "draw positions too" toggle
 *   cardClass?: string,         // extra class for result cards (e.g. image style)
 * })
 *
 * Pick 2–5; optionally fix how many come from each role. A role count is exact:
 * leftover slots are drawn from the roles left at 0 (or from any role if every
 * role has a count). Nobody is drawn twice. With positions on, every pick gets a
 * different random position and cards are shown in position order; "Re-draw
 * positions" shuffles everyone's positions again without changing the picks.
 * One name input per pick; players are matched to picks at random.
 * The page provides the markup (see valorant-random.html) and pageTitle/title/sub strings.
 */
(function () {
  'use strict';

  App.addStrings({
    ko: {
      countLabel: '뽑을 인원',
      countUnit: '{n}명',
      roleLabel: '역할군별 인원',
      roleNote: '(남은 {n}자리는 아무 역할군에서 뽑아요)',
      roleNoteOthers: '(남은 {n}자리는 인원을 정하지 않은 역할군에서 뽑아요)',
      roleNoteFull: '(모든 자리의 역할군이 정해졌어요)',
      posToggle: '포지션도 추첨하기',
      namesLabel: '참가자 이름 (선택)',
      namePh: '플레이어 {n}',
      rerollPos: '🔄 포지션 다시 뽑기',
      draw: '🎲 뽑기',
      redraw: '🎲 다시 뽑기',
    },
    en: {
      countLabel: 'How many',
      countUnit: '{n}',
      roleLabel: 'Per role',
      roleNote: '({n} open slot(s) will be drawn from any role)',
      roleNoteOthers: '({n} open slot(s) will be drawn from the roles left at 0)',
      roleNoteFull: '(every slot has a role)',
      posToggle: 'Also draw positions',
      namesLabel: 'Player names (optional)',
      namePh: 'Player {n}',
      rerollPos: '🔄 Re-draw positions',
      draw: '🎲 Draw',
      redraw: '🎲 Draw again',
    },
  });

  const MIN = 2;
  const MAX = 5;

  function mount(cfg) {
    const $ = (id) => document.getElementById(id);
    let units = [];
    let roles = []; // { key, name, icon, size }
    const NAMES_KEY = 'rq-picker-names';
    const want = { count: 5, perRole: {}, positions: false, names: loadNames() };
    let lastPick = []; // [{ unit, pos, player }] — player: index into want.names
    let drawing = false;

    function loadNames() {
      try { return JSON.parse(localStorage.getItem(NAMES_KEY)) || []; } catch (e) { return []; }
    }
    function saveNames() {
      try { localStorage.setItem(NAMES_KEY, JSON.stringify(want.names)); } catch (e) { /* storage unavailable */ }
    }
    const playerName = (i) => (want.names[i] || '').trim() || App.t('namePh', { n: i + 1 });

    // Player-name inputs (one per pick), right below the count buttons.
    const namesRow = document.createElement('div');
    namesRow.className = 'rp-row';
    namesRow.innerHTML = '<div class="rp-label" data-i18n="namesLabel"></div><div class="rp-names" id="names"></div>';
    $('countSeg').closest('.rp-row').after(namesRow);

    function renderNames() {
      const box = $('names');
      box.innerHTML = '';
      for (let i = 0; i < want.count; i++) {
        const inp = document.createElement('input');
        inp.className = 'text-input rp-name-input';
        inp.maxLength = 16;
        inp.placeholder = App.t('namePh', { n: i + 1 });
        inp.value = want.names[i] || '';
        inp.addEventListener('input', () => {
          want.names[i] = inp.value;
          saveNames();
          // Update cards already on screen.
          document.querySelectorAll(`.rp-player[data-player="${i}"]`).forEach((el) => { el.textContent = playerName(i); });
        });
        box.appendChild(inp);
      }
    }

    const fixedTotal = () => roles.reduce((s, r) => s + want.perRole[r.key], 0);
    const roleOf = (key) => roles.find((r) => r.key === key);

    // Optional position toggle.
    if (cfg.positions) {
      const row = document.createElement('label');
      row.className = 'check rp-pos';
      row.innerHTML = '<input type="checkbox" id="posToggle"><span data-i18n="posToggle"></span>';
      $('drawBtn').before(row);
      $('posToggle').addEventListener('change', (e) => { want.positions = e.target.checked; });

      // "Re-draw positions" sits next to the draw button.
      const actions = document.createElement('div');
      actions.className = 'rp-actions';
      $('drawBtn').before(actions);
      const reroll = document.createElement('button');
      reroll.type = 'button';
      reroll.className = 'btn btn-lg';
      reroll.id = 'rerollBtn';
      reroll.dataset.i18n = 'rerollPos';
      reroll.hidden = true;
      reroll.addEventListener('click', rerollPositions);
      actions.append($('drawBtn'), reroll);
    }

    /* ---------- setup controls ---------- */
    function renderSetup() {
      const seg = $('countSeg');
      seg.innerHTML = '';
      for (let n = MIN; n <= MAX; n++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = App.t('countUnit', { n });
        b.classList.toggle('active', n === want.count);
        b.addEventListener('click', () => setCount(n));
        seg.appendChild(b);
      }

      const box = $('roles');
      box.innerHTML = '';
      roles.forEach((r) => {
        const row = document.createElement('div');
        row.className = 'rp-role';
        const label = document.createElement('div');
        label.className = 'rp-role-name';
        if (r.icon) {
          const img = document.createElement('img');
          img.src = r.icon;
          img.alt = '';
          label.appendChild(img);
        }
        label.append(App.L(r.name));
        const minus = document.createElement('button');
        minus.type = 'button';
        minus.className = 'btn rp-step';
        minus.textContent = '−';
        minus.disabled = want.perRole[r.key] === 0;
        minus.addEventListener('click', () => setRole(r.key, -1));
        const val = document.createElement('b');
        val.className = 'rp-val';
        val.textContent = want.perRole[r.key];
        const plus = document.createElement('button');
        plus.type = 'button';
        plus.className = 'btn rp-step';
        plus.textContent = '+';
        plus.disabled = fixedTotal() >= want.count || want.perRole[r.key] >= r.size;
        plus.addEventListener('click', () => setRole(r.key, 1));
        row.append(label, minus, val, plus);
        box.appendChild(row);
      });

      const open = want.count - fixedTotal();
      const anyFixed = fixedTotal() > 0;
      const allFixed = roles.every((r) => want.perRole[r.key] > 0);
      $('roleNote').textContent = open <= 0 ? App.t('roleNoteFull')
        : !anyFixed || allFixed ? App.t('roleNote', { n: open })
        : App.t('roleNoteOthers', { n: open });
      $('drawBtn').textContent = App.t(lastPick.length ? 'redraw' : 'draw');
      $('drawBtn').disabled = drawing;
      if (cfg.positions) {
        $('rerollBtn').hidden = !(lastPick.length && lastPick[0].pos != null);
        $('rerollBtn').disabled = drawing;
      }
    }

    function setCount(n) {
      const changed = n !== want.count;
      want.count = n;
      if (changed) renderNames();
      // Lowering the count trims fixed roles from the last role backwards.
      for (let i = roles.length - 1; i >= 0 && fixedTotal() > n; i--) {
        const k = roles[i].key;
        want.perRole[k] = Math.max(0, want.perRole[k] - (fixedTotal() - n));
      }
      renderSetup();
    }

    function setRole(key, delta) {
      const r = roleOf(key);
      const next = want.perRole[key] + delta;
      if (next < 0 || next > r.size || (delta > 0 && fixedTotal() >= want.count)) return;
      want.perRole[key] = next;
      renderSetup();
    }

    /* ---------- drawing ---------- */
    function pick() {
      const order = roles.map((r) => r.key);
      const chosen = [];
      roles.forEach((r) => {
        chosen.push(...App.shuffle(units.filter((u) => u.role === r.key)).slice(0, want.perRole[r.key]));
      });
      const freeRoles = roles.filter((r) => !want.perRole[r.key]).map((r) => r.key);
      const rest = App.shuffle(units.filter((u) => !chosen.includes(u) && (!freeRoles.length || freeRoles.includes(u.role))));
      chosen.push(...rest.slice(0, want.count - chosen.length));

      // Players are matched to picks at random (picks are already in random order here).
      const players = App.shuffle(chosen.map((u, i) => i));
      if (want.positions && cfg.positions) {
        // Each pick gets a different random position; show them in position order.
        const posIdx = App.shuffle(cfg.positions.map((p, i) => i)).slice(0, chosen.length);
        return chosen.map((unit, i) => ({ unit, pos: posIdx[i], player: players[i] })).sort((a, b) => a.pos - b.pos);
      }
      return chosen
        .map((unit, i) => ({ unit, pos: null, player: players[i] }))
        .sort((a, b) => order.indexOf(a.unit.role) - order.indexOf(b.unit.role));
    }

    // Re-draw the positions of everyone at once (champions and players stay the same).
    function rerollPositions() {
      if (drawing || !lastPick.length || lastPick[0].pos == null) return;
      const posIdx = App.shuffle(cfg.positions.map((p, i) => i)).slice(0, lastPick.length);
      lastPick.forEach((e, i) => { e.pos = posIdx[i]; });
      lastPick.sort((a, b) => a.pos - b.pos);
      renderResult(false);
      [...$('result').children].forEach((c) => c.classList.add('pop'));
      App.sfx('ok');
    }

    function cardFor(entry) {
      const u = entry.unit;
      const card = document.createElement('div');
      card.className = 'rp-card' + (cfg.cardClass ? ' ' + cfg.cardClass : '');
      if (u.colors && u.colors.length >= 2) card.style.background = `linear-gradient(160deg, ${u.colors[0]}, ${u.colors[1]})`;
      if (entry.pos != null) {
        const p = cfg.positions[entry.pos];
        const pos = document.createElement('div');
        pos.className = 'rp-pos-chip';
        if (p.icon) {
          const icon = document.createElement('img');
          icon.src = p.icon;
          icon.alt = '';
          pos.appendChild(icon);
        }
        pos.append(App.L(p));
        card.appendChild(pos);
      }
      if (entry.player != null) {
        const p = document.createElement('div');
        p.className = 'rp-player';
        p.dataset.player = entry.player;
        p.textContent = playerName(entry.player);
        card.appendChild(p);
      }
      const img = document.createElement('img');
      img.className = 'rp-portrait';
      if (u.fallbackImg) img.onerror = () => { img.onerror = null; img.src = u.fallbackImg; };
      img.src = u.img;
      img.alt = '';
      const name = document.createElement('div');
      name.className = 'rp-name';
      name.textContent = App.L(u.name);
      const role = document.createElement('div');
      role.className = 'rp-role-chip';
      const r = roleOf(u.role);
      if (r && r.icon) {
        const ri = document.createElement('img');
        ri.src = r.icon;
        ri.alt = '';
        role.appendChild(ri);
      }
      role.append(r ? App.L(r.name) : u.role);
      card.append(img, name, role);
      return card;
    }

    function renderResult(rolling) {
      const box = $('result');
      box.innerHTML = '';
      lastPick.forEach((entry) => {
        // While rolling, start on a random one so the result isn't visible early.
        const c = cardFor(rolling ? { unit: App.pick(units), pos: entry.pos, player: entry.player } : entry);
        if (rolling) c.classList.add('rolling');
        box.appendChild(c);
      });
    }

    // Each card flips through random picks briefly, then settles on its result (left to right).
    async function draw() {
      if (drawing) return;
      drawing = true;
      lastPick = pick();
      renderSetup();
      renderResult(true);
      const cards = [...$('result').children];
      const flips = cards.map((card) => setInterval(() => {
        const u = App.pick(units);
        card.querySelector('.rp-portrait').src = u.img;
        card.querySelector('.rp-name').textContent = App.L(u.name);
      }, 70));
      for (let i = 0; i < cards.length; i++) {
        await new Promise((r) => setTimeout(r, i === 0 ? 700 : 280));
        clearInterval(flips[i]);
        cards[i].replaceWith(cardFor(lastPick[i]));
        $('result').children[i].classList.add('pop');
        App.sfx('ok');
      }
      drawing = false;
      renderSetup();
    }

    $('drawBtn').addEventListener('click', draw);
    App.mountChrome();
    App.onLang(() => { if (units.length) { renderSetup(); renderNames(); if (!drawing) renderResult(false); } });

    cfg.load().then((data) => {
      units = data.units;
      roles = data.roles
        .map((r) => Object.assign({}, r, { size: units.filter((u) => u.role === r.key).length }))
        .filter((r) => r.size);
      roles.forEach((r) => { want.perRole[r.key] = 0; });
      $('status').hidden = true;
      $('setup').hidden = false;
      renderSetup();
      renderNames();
    }).catch((err) => {
      console.error(err);
      const s = $('status');
      s.dataset.i18n = 'loadError';
      s.textContent = App.t('loadError');
      s.classList.add('error');
    });
  }

  window.RandomPicker = { mount };
})();
