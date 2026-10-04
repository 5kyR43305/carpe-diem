/* VALORANT — name every skin collection (스킨 컬렉션). */
(function () {
  'use strict';

  App.addStrings({
    ko: {
      pageTitle: '발로란트 스킨 컬렉션 이름 맞추기 · Carpe Diem',
      title: '발로란트 스킨 컬렉션 전부 말할 수 있을까?',
      placeholder: '컬렉션 이름 입력',
      tip: '스킨 컬렉션의 한국어 이름을 입력하고 Enter 또는 정답 버튼을 누르세요.',
      notFound: '등록된 컬렉션이 아니에요',
      already: '이미 맞힌 컬렉션이에요',
      clearComments: ['컬렉션 박사 인정!', '모든 컬렉션을 기억하다니, 상점 단골이네요.', '완벽 클리어! 진정한 스킨 수집가.'],
    },
    en: {
      pageTitle: 'Name Every VALORANT Collection · Carpe Diem',
      title: 'Can You Name Every VALORANT Skin Collection?',
      placeholder: 'Type a collection name',
      tip: 'Type the English name of a skin collection and press Enter or the button.',
      notFound: 'Not a collection',
      already: 'Already found',
      clearComments: ['Certified collection expert!', 'Every single one. The store knows your name.', 'Perfect clear! True skin collector.'],
    },
  });

  const API = 'https://valorant-api.com/v1/';
  const MIN_SKINS = 2; // leaves out single-weapon agent contract rewards
  const PREFERRED = ['Vandal', 'Phantom', 'Operator', 'Sheriff', 'Spectre', 'Ghost', 'Classic'];

  // Extra accepted answers for specific collections, keyed by English name.
  const EXTRA_ALIASES = {
    'Coalition: Cobra': { ko: ['코브라'], en: ['Cobra'] },
    '9 Lives': { ko: ['9 Lives'] },
    'Radiant Crisis 001': { ko: ['레디언트 크라이시스'], en: ['Radiant Crisis'] },
    'Radiant Entertainment System': { ko: ['RES'], en: ['RES'] },
  };

  /**
   * Accepted short forms and hint exceptions per collection. Hints otherwise
   * always show the full name masked; only these exceptions differ:
   * - "아틀라스 // CMD" -> "아틀라스" (the part before "//")
   * - "발로란트 GO! Vol. 1" -> "발로란트 GO 1"
   * - "2021 챔피언스" -> "챔피언스21" (Champions are never picked as hints)
   * - "VCT x T1" -> "VCT T1" (VCT collections are never picked as hints)
   * (Punctuation is ignored anyway, so "전략사탕" already matches "전략-사탕".)
   */
  function extrasOf(name) {
    const aliases = { ko: [], en: [] };
    const extra = {};
    ['ko', 'en'].forEach((l) => {
      const head = name[l].split('//')[0].trim();
      if (head && head !== name[l].trim()) aliases[l].push(head);
    });

    let m;
    if ((m = name.en.match(/^VALORANT GO! Vol\. (\d+)$/))) {
      aliases.ko.push(`발로란트 GO ${m[1]}`);
      aliases.en.push(`VALORANT GO ${m[1]}`);
    } else if ((m = name.en.match(/^Champions (\d{4})$/))) {
      const yy = m[1].slice(2);
      aliases.ko.push(`챔피언스${yy}`);
      aliases.en.push(`Champions${yy}`);
      extra.noHint = true;
    } else if ((m = name.en.match(/^VCT x (.+)$/))) {
      aliases.ko.push(`VCT ${m[1]}`);
      aliases.en.push(`VCT ${m[1]}`);
      extra.noHint = true;
    }

    const fixed = EXTRA_ALIASES[name.en];
    if (fixed) ['ko', 'en'].forEach((l) => aliases[l].push(...(fixed[l] || [])));
    return Object.assign({ aliases }, extra);
  }

  function resized(url) {
    return 'https://images.weserv.nl/?w=480&output=webp&url=' + encodeURIComponent(url);
  }

  function skinImage(s) {
    const chroma = (s.chromas || [])[0];
    return s.displayIcon || (chroma && (chroma.fullRender || chroma.displayIcon)) || null;
  }

  NameAll.mount({
    gridClass: 'grid-weapon',
    async load() {
      const [themesKo, themesEn, weapons, bundles] = await Promise.all([
        App.fetchJSON(API + 'themes?language=ko-KR'),
        App.fetchJSON(API + 'themes?language=en-US'),
        App.fetchJSON(API + 'weapons?language=en-US'),
        App.fetchJSON(API + 'bundles?language=en-US'),
      ]);
      const koName = new Map(themesKo.data.map((t) => [t.uuid, t.displayName]));

      // Store bundle key art (all weapons of the collection in one picture), matched by name.
      const bundleArt = new Map();
      bundles.data.forEach((b) => {
        const key = App.norm(b.displayName);
        if (b.displayIcon && !bundleArt.has(key)) bundleArt.set(key, b.displayIcon);
      });

      // theme uuid -> skins (with weapon name)
      const byTheme = new Map();
      weapons.data.forEach((w) => (w.skins || []).forEach((s) => {
        if (!byTheme.has(s.themeUuid)) byTheme.set(s.themeUuid, []);
        byTheme.get(s.themeUuid).push({ weapon: w.displayName, img: skinImage(s) });
      }));

      // Some collections are split over several theme entries; merge them by name.
      const groups = new Map();
      themesEn.data.forEach((t) => {
        if (/^(standard|random)$/i.test(t.displayName)) return;
        const skins = byTheme.get(t.uuid) || [];
        if (!skins.length) return;
        const key = App.norm(t.displayName);
        if (!groups.has(key)) groups.set(key, { id: t.uuid, key, name: { en: t.displayName, ko: koName.get(t.uuid) || t.displayName }, skins: [] });
        groups.get(key).skins.push(...skins);
      });

      return [...groups.values()]
        .filter((g) => g.skins.length >= MIN_SKINS)
        .map((g) => {
          const item = Object.assign({ id: g.id, name: g.name }, extrasOf(g.name));
          const art = bundleArt.get(g.key);
          // The originals are ~1-2 MB PNGs; serve a small resized WebP, falling back to the original.
          if (art) return Object.assign(item, { img: resized(art), fallbackImg: art });
          // No store bundle (battle pass, Select tier...): show one weapon skin instead.
          const withImg = g.skins.filter((s) => s.img);
          const rank = (s) => { const i = PREFERRED.indexOf(s.weapon); return i < 0 ? 99 : i; };
          const rep = withImg.sort((a, b) => rank(a) - rank(b))[0];
          return Object.assign(item, { img: rep ? rep.img : '', contain: true });
        });
    },
  });
})();
