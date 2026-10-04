/* League of Legends — name every champion. */
(function () {
  'use strict';

  App.addStrings({
    ko: {
      pageTitle: 'LoL 챔피언 이름 맞추기 · Carpe Diem',
      title: '리그 오브 레전드 챔피언 전부 말할 수 있을까?',
      placeholder: '챔피언 이름 입력',
      tip: '챔피언의 한국어 풀네임을 입력하고 Enter 또는 정답 버튼을 누르세요. 첫 정답부터 타이머가 시작됩니다.',
      notFound: '등록된 챔피언이 아니에요 (풀네임으로 입력해 주세요)',
      already: '이미 맞힌 챔피언이에요',
      clearComments: ['챔피언 도감 그 자체!', '모든 챔피언을 기억하다니, 진정한 소환사네요.', '완벽 클리어! 협곡의 백과사전 인정.'],
    },
    en: {
      pageTitle: 'Name Every LoL Champion · Carpe Diem',
      title: 'Can You Name Every League of Legends Champion?',
      placeholder: 'Type a champion name',
      tip: 'Type the champion\'s full English name and press Enter or the button. The timer starts with your first correct answer.',
      notFound: 'Not a champion (use the full name)',
      already: 'Already found',
      clearComments: ['A walking champion encyclopedia!', 'Every single one. True Summoner.', 'Perfect clear! The Rift salutes you.'],
    },
  });

  NameAll.mount({
    gridClass: 'grid-champ',
    async load() {
      const v = await App.ddVersion();
      const [ko, en] = await Promise.all(
        ['ko_KR', 'en_US'].map((l) => App.fetchJSON(`${App.DD}/cdn/${v}/data/${l}/champion.json`))
      );
      return Object.values(en.data).map((c) => ({
        id: c.id,
        name: { en: c.name, ko: (ko.data[c.id] || c).name },
        img: `${App.DD}/cdn/${v}/img/champion/${c.image.full}`,
      }));
    },
  });
})();
