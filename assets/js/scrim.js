/*
 * Custom-game (scrim) helper for VALORANT and League of Legends.
 *  1. Teams: 2–10 players with name + tier.
 *     - Balanced: tries every split and picks (at random among the best) one whose
 *       average tier scores are closest. Tier score = position in the tier list.
 *     - For fun: fully random split.
 *  2. Map (VALORANT only): random competitive map from a pool the user can edit.
 *  3. Coin toss (odd / even): odd → team 1 starts on attack (VALORANT) / blue side (LoL).
 * Settings and players are kept in localStorage.
 */
(function () {
  'use strict';

  App.addStrings({
    ko: {
      pageTitle: '내전 도우미 · Carpe Diem',
      title: '내전 도우미',
      sub: '팀 나누기, 맵 정하기, 선공 정하기를 한 곳에서.',
      gameVal: '발로란트',
      gameLol: '리그 오브 레전드',
      teamsTitle: '팀 나누기',
      playerCount: '인원',
      modeBalance: '⚖️ 밸런스형',
      modeRandom: '🎲 즐겜용',
      modeTipBalance: '티어 점수가 최대한 비슷해지도록 팀을 나눠요. 다시 누르면 비슷한 다른 조합이 나와요.',
      modeTipRandom: '티어와 상관없이 완전히 랜덤으로 팀을 나눠요.',
      namePh: '플레이어 {n}',
      split: '팀 나누기',
      resplit: '다시 나누기',
      team1: '1팀',
      team2: '2팀',
      teamScore: '티어 점수 {sum} · 평균 {avg}',
      scoreDiff: '두 팀 평균 차이: {diff}',
      mapTitle: '맵 정하기',
      mapTip: '후보에서 뺄 맵은 눌러서 끄세요.',
      mapPick: '🗺️ 맵 뽑기',
      mapNone: '후보 맵을 하나 이상 켜 주세요',
      coinTitle: '선공 정하기',
      coinTipVal: '홀이 나오면 1팀이 공격으로 시작, 짝이 나오면 2팀이 공격으로 시작해요.',
      coinTipLol: '홀이 나오면 1팀이 블루 진영, 짝이 나오면 2팀이 블루 진영이에요.',
      coinFlip: '🪙 동전 던지기',
      heads: '홀',
      tails: '짝',
      headsShort: '홀',
      tailsShort: '짝',
      coinResultVal: '{face}! {first}이 공격, {second}이 수비로 시작해요',
      coinResultLol: '{face}! {first}이 블루, {second}이 레드 진영이에요',
    },
    en: {
      pageTitle: 'Custom Game Helper · Carpe Diem',
      title: 'Custom Game Helper',
      sub: 'Split teams, pick a map and decide who starts — all in one place.',
      gameVal: 'VALORANT',
      gameLol: 'League of Legends',
      teamsTitle: 'Split teams',
      playerCount: 'Players',
      modeBalance: '⚖️ Balanced',
      modeRandom: '🎲 Just for fun',
      modeTipBalance: 'Teams are split so their tier scores are as even as possible. Press again for another fair split.',
      modeTipRandom: 'Teams are split completely at random, ignoring tiers.',
      namePh: 'Player {n}',
      split: 'Split teams',
      resplit: 'Split again',
      team1: 'Team 1',
      team2: 'Team 2',
      teamScore: 'Tier score {sum} · avg {avg}',
      scoreDiff: 'Average difference: {diff}',
      mapTitle: 'Pick a map',
      mapTip: 'Tap a map to remove it from the pool.',
      mapPick: '🗺️ Pick map',
      mapNone: 'Turn on at least one map',
      coinTitle: 'Who starts',
      coinTipVal: 'Odd: Team 1 starts on attack. Even: Team 2 starts on attack.',
      coinTipLol: 'Odd: Team 1 plays blue side. Even: Team 2 plays blue side.',
      coinFlip: '🪙 Flip the coin',
      heads: 'Odd',
      tails: 'Even',
      headsShort: 'ODD',
      tailsShort: 'EVEN',
      coinResultVal: '{face}! {first} starts on attack, {second} on defense',
      coinResultLol: '{face}! {first} is blue side, {second} is red side',
    },
  });

  const TIERS = {
    val: [
      { ko: '아이언', en: 'Iron', color: '#6f6a66' },
      { ko: '브론즈', en: 'Bronze', color: '#a26b45' },
      { ko: '실버', en: 'Silver', color: '#aab4bd' },
      { ko: '골드', en: 'Gold', color: '#e0b43c' },
      { ko: '플래티넘', en: 'Platinum', color: '#3fb7c9' },
      { ko: '다이아몬드', en: 'Diamond', color: '#c48bf2' },
      { ko: '초월자', en: 'Ascendant', color: '#33c27a' },
      { ko: '불멸', en: 'Immortal', color: '#d9455d' },
      { ko: '레디언트', en: 'Radiant', color: '#f6e7a6' },
    ],
    lol: [
      { ko: '아이언', en: 'Iron', color: '#6f6a66' },
      { ko: '브론즈', en: 'Bronze', color: '#a26b45' },
      { ko: '실버', en: 'Silver', color: '#aab4bd' },
      { ko: '골드', en: 'Gold', color: '#e0b43c' },
      { ko: '플래티넘', en: 'Platinum', color: '#3fb7a8' },
      { ko: '에메랄드', en: 'Emerald', color: '#2bb673' },
      { ko: '다이아몬드', en: 'Diamond', color: '#6b93ff' },
      { ko: '마스터', en: 'Master', color: '#b05be0' },
      { ko: '그랜드마스터', en: 'Grandmaster', color: '#e0424c' },
      { ko: '챌린저', en: 'Challenger', color: '#f2cf5b' },
    ],
  };
  const MIN = 2;
  const MAX = 10;
  const STORE = 'rq-scrim';
  const MAP_API = 'https://valorant-api.com/v1/maps?language=';

  const $ = (id) => document.getElementById(id);
  const state = loadState();
  let teams = null; // { a:[playerIdx], b:[playerIdx], mode }
  let maps = null; // VALORANT competitive maps (loaded on demand)
  let rolling = false;
  let coinTurn = 0; // accumulated rotation for the coin

  function loadState() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORE)); } catch (e) { /* ignore */ }
    s = s || {};
    return {
      game: s.game === 'lol' ? 'lol' : 'val',
      mode: s.mode === 'random' ? 'random' : 'balance',
      count: Math.min(MAX, Math.max(MIN, s.count || 10)),
      players: Array.isArray(s.players) ? s.players : [],
      mapOff: Array.isArray(s.mapOff) ? s.mapOff : [],
    };
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  const tiers = () => TIERS[state.game];
  function player(i) {
    if (!state.players[i]) state.players[i] = { name: '', tier: 3 }; // default: Gold
    const p = state.players[i];
    p.tier = Math.min(tiers().length - 1, Math.max(0, p.tier | 0));
    return p;
  }
  const nameOf = (i) => (player(i).name || '').trim() || App.t('namePh', { n: i + 1 });
  const scoreOf = (i) => player(i).tier + 1;

  /* ---------- game / mode / players ---------- */
  function renderGame() {
    const seg = $('gameSeg');
    seg.innerHTML = '';
    [['val', 'gameVal'], ['lol', 'gameLol']].forEach(([key, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = App.t(label);
      b.classList.toggle('active', state.game === key);
      b.addEventListener('click', () => { state.game = key; teams = null; save(); renderAll(); });
      seg.appendChild(b);
    });
    $('mapSection').hidden = state.game !== 'val';
    $('coinNum').textContent = state.game === 'val' ? '③' : '②';
    $('coinTip').textContent = App.t(state.game === 'val' ? 'coinTipVal' : 'coinTipLol');
    if (state.game === 'val') loadMaps();
  }

  function renderMode() {
    const seg = $('modeSeg');
    seg.innerHTML = '';
    [['balance', 'modeBalance'], ['random', 'modeRandom']].forEach(([key, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = App.t(label);
      b.classList.toggle('active', state.mode === key);
      b.addEventListener('click', () => { state.mode = key; save(); renderMode(); });
      seg.appendChild(b);
    });
    $('modeTip').textContent = App.t(state.mode === 'balance' ? 'modeTipBalance' : 'modeTipRandom');
  }

  function renderPlayers() {
    $('countVal').textContent = state.count;
    $('countMinus').disabled = state.count <= MIN;
    $('countPlus').disabled = state.count >= MAX;
    const box = $('players');
    box.innerHTML = '';
    for (let i = 0; i < state.count; i++) {
      const p = player(i);
      const row = document.createElement('div');
      row.className = 'sc-player';
      const num = document.createElement('span');
      num.className = 'sc-num';
      num.textContent = i + 1;
      const name = document.createElement('input');
      name.className = 'text-input sc-name';
      name.maxLength = 16;
      name.placeholder = App.t('namePh', { n: i + 1 });
      name.value = p.name || '';
      name.addEventListener('input', () => { p.name = name.value; save(); });
      const sel = document.createElement('select');
      sel.className = 'sc-tier';
      tiers().forEach((t, k) => {
        const o = document.createElement('option');
        o.value = k;
        o.textContent = App.L(t);
        sel.appendChild(o);
      });
      sel.value = p.tier;
      sel.style.borderColor = tiers()[p.tier].color;
      sel.addEventListener('change', () => { p.tier = Number(sel.value); sel.style.borderColor = tiers()[p.tier].color; save(); });
      row.append(num, name, sel);
      box.appendChild(row);
    }
    $('splitBtn').textContent = App.t(teams ? 'resplit' : 'split');
  }

  function setCount(n) {
    state.count = Math.min(MAX, Math.max(MIN, n));
    teams = null;
    save();
    renderPlayers();
    renderTeams();
  }

  /* ---------- team split ---------- */
  function split() {
    const idx = [...Array(state.count).keys()];
    if (state.mode === 'random') {
      const s = App.shuffle(idx);
      const half = Math.ceil(s.length / 2);
      teams = { a: s.slice(0, half), b: s.slice(half), mode: 'random' };
    } else {
      teams = balancedSplit(idx);
    }
    // Which side is "team 1" is random too.
    if (Math.random() < 0.5) teams = { a: teams.b, b: teams.a, mode: teams.mode };
    renderPlayers();
    renderTeams(true);
    App.sfx('ok');
  }

  // Try every split (n ≤ 10 → at most 1024 masks) and pick one with the smallest
  // difference in average tier score, at random among ties.
  function balancedSplit(idx) {
    const n = idx.length;
    const size = Math.ceil(n / 2);
    let best = Infinity;
    let pool = [];
    for (let mask = 0; mask < (1 << n); mask++) {
      let cnt = 0;
      for (let k = 0; k < n; k++) if (mask & (1 << k)) cnt++;
      if (cnt !== size) continue;
      const a = idx.filter((k) => mask & (1 << k));
      const b = idx.filter((k) => !(mask & (1 << k)));
      const diff = Math.abs(avg(a) - avg(b));
      if (diff < best - 1e-9) { best = diff; pool = [[a, b]]; }
      else if (Math.abs(diff - best) < 1e-9) pool.push([a, b]);
    }
    const [a, b] = App.pick(pool);
    return { a: App.shuffle(a), b: App.shuffle(b), mode: 'balance' };
  }

  const sum = (list) => list.reduce((s, i) => s + scoreOf(i), 0);
  const avg = (list) => (list.length ? sum(list) / list.length : 0);
  const tierNameForAvg = (v) => App.L(tiers()[Math.min(tiers().length - 1, Math.max(0, Math.round(v) - 1))]);

  function renderTeams(animate) {
    const box = $('teams');
    box.innerHTML = '';
    if (!teams) return;
    [['a', 'team1', 'blue'], ['b', 'team2', 'red']].forEach(([key, label, color]) => {
      const list = teams[key];
      const card = document.createElement('div');
      card.className = `sc-team ${color}` + (animate ? ' pop' : '');
      const h = document.createElement('h3');
      h.textContent = App.t(label);
      card.appendChild(h);
      list.forEach((i) => {
        const row = document.createElement('div');
        row.className = 'sc-member';
        const n = document.createElement('span');
        n.textContent = nameOf(i);
        const chip = document.createElement('span');
        chip.className = 'sc-chip';
        const t = tiers()[player(i).tier];
        chip.textContent = App.L(t);
        chip.style.borderColor = t.color;
        chip.style.color = t.color;
        row.append(n, chip);
        card.appendChild(row);
      });
      const foot = document.createElement('div');
      foot.className = 'sc-team-foot';
      foot.textContent = App.t('teamScore', { sum: sum(list), avg: tierNameForAvg(avg(list)) });
      card.appendChild(foot);
      box.appendChild(card);
    });
    if (teams.mode === 'balance') {
      const d = document.createElement('p');
      d.className = 'sc-diff';
      d.textContent = App.t('scoreDiff', { diff: Math.abs(avg(teams.a) - avg(teams.b)).toFixed(2) });
      box.appendChild(d);
    }
  }

  /* ---------- maps (VALORANT) ---------- */
  async function loadMaps() {
    if (maps) { renderPool(); return; }
    try {
      const [ko, en] = await Promise.all([App.fetchJSON(MAP_API + 'ko-KR'), App.fetchJSON(MAP_API + 'en-US')]);
      const koById = new Map(ko.data.map((m) => [m.uuid, m]));
      // Competitive maps are the ones with bomb sites ("A/B Sites").
      maps = en.data.filter((m) => m.tacticalDescription).map((m) => ({
        id: m.uuid,
        name: { en: m.displayName, ko: (koById.get(m.uuid) || m).displayName },
        img: m.splash || m.listViewIcon,
        thumb: m.listViewIcon || m.splash,
      })).sort((a, b) => a.name.en.localeCompare(b.name.en));
      renderPool();
    } catch (e) {
      console.error(e);
      $('mapPool').textContent = App.t('loadError');
    }
  }

  function renderPool() {
    const box = $('mapPool');
    box.innerHTML = '';
    maps.forEach((m) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sc-map-chip';
      b.classList.toggle('off', state.mapOff.includes(m.id));
      b.style.backgroundImage = `url("${m.thumb}")`;
      const s = document.createElement('span');
      s.textContent = App.L(m.name);
      b.appendChild(s);
      b.addEventListener('click', () => {
        state.mapOff = state.mapOff.includes(m.id) ? state.mapOff.filter((x) => x !== m.id) : state.mapOff.concat(m.id);
        save();
        renderPool();
      });
      box.appendChild(b);
    });
  }

  async function pickMap() {
    if (!maps || rolling) return;
    const pool = maps.filter((m) => !state.mapOff.includes(m.id));
    if (!pool.length) { App.toast(App.t('mapNone')); return; }
    rolling = true;
    $('mapBtn').disabled = true;
    const box = $('mapResult');
    box.hidden = false;
    const show = (m, final) => {
      box.innerHTML = '';
      box.style.backgroundImage = `url("${m.img}")`;
      box.classList.toggle('rolling', !final);
      const s = document.createElement('span');
      s.textContent = App.L(m.name);
      box.appendChild(s);
    };
    for (let k = 0; k < 14; k++) { show(App.pick(pool), false); await new Promise((r) => setTimeout(r, 60 + k * 8)); }
    const result = App.pick(pool);
    show(result, true);
    box.classList.remove('pop');
    void box.offsetWidth;
    box.classList.add('pop');
    App.sfx('ok');
    rolling = false;
    $('mapBtn').disabled = false;
  }

  /* ---------- coin toss ---------- */
  function flipCoin() {
    const coin = $('coin');
    if (coin.classList.contains('flipping')) return;
    const heads = Math.random() < 0.5;
    // Spin several full turns; end on the front (heads) or back (tails).
    const base = Math.ceil(coinTurn / 360) * 360 + 360 * 5;
    coinTurn = base + (heads ? 0 : 180);
    $('coinResult').textContent = '';
    coin.classList.add('flipping');
    coin.style.transform = `rotateY(${coinTurn}deg)`;
    setTimeout(() => {
      coin.classList.remove('flipping');
      const first = App.t(heads ? 'team1' : 'team2');
      const second = App.t(heads ? 'team2' : 'team1');
      $('coinResult').textContent = App.t(state.game === 'val' ? 'coinResultVal' : 'coinResultLol', {
        face: App.t(heads ? 'heads' : 'tails'), first, second,
      });
      App.sfx('win');
    }, 1700);
  }

  function renderAll() {
    renderGame();
    renderMode();
    renderPlayers();
    renderTeams();
    $('coinResult').textContent = '';
  }

  $('countMinus').addEventListener('click', () => setCount(state.count - 1));
  $('countPlus').addEventListener('click', () => setCount(state.count + 1));
  $('splitBtn').addEventListener('click', split);
  $('mapBtn').addEventListener('click', pickMap);
  $('coinBtn').addEventListener('click', flipCoin);
  App.mountChrome();
  App.onLang(() => { renderAll(); if (maps) renderPool(); });
  renderAll();
})();
