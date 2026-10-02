/* League of Legends — name every skin line (스킨 세트). */
(function () {
  'use strict';

  App.addStrings({
    ko: {
      pageTitle: 'LoL 스킨 세트 이름 맞추기 · Game Quiz',
      title: '리그 오브 레전드 스킨 세트 전부 말할 수 있을까?',
      placeholder: '스킨 세트 이름 입력',
      tip: '스킨 세트(스킨 라인)의 한국어 이름을 입력하고 Enter 또는 정답 버튼을 누르세요.',
      notFound: '등록된 스킨 세트가 아니에요',
      already: '이미 맞힌 스킨 세트예요',
      clearComments: ['스킨 세트 박사 인정!', '모든 세트를 기억하다니, 상점의 VIP네요.', '완벽 클리어! 컬렉션 마스터.'],
    },
    en: {
      pageTitle: 'Name Every LoL Skin Line · Game Quiz',
      title: 'Can You Name Every League of Legends Skin Line?',
      placeholder: 'Type a skin line name',
      tip: 'Type the English name of a skin line and press Enter or the button.',
      notFound: 'Not a skin line',
      already: 'Already found',
      clearComments: ['Certified skin line expert!', 'Every single line. The shop knows your name.', 'Perfect clear! Collection master.'],
    },
  });

  // Skin lines come from CommunityDragon (official client data, localized).
  const CD = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/';
  const MIN_SKINS = 2;
  const RARITY = { kTranscendent: 6, kUltimate: 5, kMythic: 4, kLegendary: 3, kEpic: 2, kRare: 1 };

  NameAll.mount({
    gridClass: 'grid-tile',
    async load() {
      const v = await App.ddVersion();
      const [linesKo, linesEn, skins, champs] = await Promise.all([
        App.fetchJSON(CD + 'ko_kr/v1/skinlines.json'),
        App.fetchJSON(CD + 'default/v1/skinlines.json'),
        App.fetchJSON(CD + 'default/v1/skins.json'),
        App.fetchJSON(`${App.DD}/cdn/${v}/data/en_US/champion.json`),
      ]);
      const champByKey = new Map(Object.values(champs.data).map((c) => [Number(c.key), c.id]));
      const koName = new Map(linesKo.map((l) => [l.id, l.name]));

      // skin line id -> skins in it
      const members = new Map();
      Object.values(skins).forEach((s) => {
        (s.skinLines || []).forEach((l) => {
          if (!members.has(l.id)) members.set(l.id, []);
          members.get(l.id).push(s);
        });
      });

      return linesEn
        .filter((l) => l.id > 0 && l.name && (members.get(l.id) || []).length >= MIN_SKINS)
        .map((l) => {
          // Representative image: the highest-rarity skin of the line.
          const rep = members.get(l.id).slice().sort((a, b) => (RARITY[b.rarity] || 0) - (RARITY[a.rarity] || 0))[0];
          const champId = champByKey.get(Math.floor(rep.id / 1000));
          const cdTile = rep.tilePath
            ? CD + 'default/' + rep.tilePath.replace('/lol-game-data/assets/', '').toLowerCase()
            : '';
          return {
            id: l.id,
            name: { en: l.name, ko: koName.get(l.id) || l.name },
            img: champId ? `${App.DD}/cdn/img/champion/tiles/${champId}_${rep.id % 1000}.jpg` : cdTile,
            fallbackImg: cdTile,
          };
        });
    },
  });
})();
