/*
 * League of Legends — random champion picker.
 * Main role = the champion's first role tag in Data Dragon. Positions are an optional extra draw.
 */
(function () {
  'use strict';

  App.addStrings({
    ko: {
      pageTitle: 'LoL 챔피언 랜덤 뽑기 · Carpe Diem',
      title: '리그 오브 레전드 챔피언 랜덤 뽑기',
      sub: '뽑을 인원과 주 역할군별 인원을 정하고 뽑기를 눌러 보세요. 포지션도 함께 추첨할 수 있어요.',
    },
    en: {
      pageTitle: 'LoL Random Champion Picker · Carpe Diem',
      title: 'League of Legends Random Champion Picker',
      sub: 'Choose how many champions and how many per main role, then draw. You can draw positions too.',
    },
  });

  // Display order and names of the main roles (Data Dragon tags).
  const ROLES = [
    { key: 'Assassin', name: { ko: '암살자', en: 'Assassin' } },
    { key: 'Fighter', name: { ko: '전사', en: 'Fighter' } },
    { key: 'Marksman', name: { ko: '원거리', en: 'Marksman' } },
    { key: 'Mage', name: { ko: '마법사', en: 'Mage' } },
    { key: 'Tank', name: { ko: '탱커', en: 'Tank' } },
    { key: 'Support', name: { ko: '서포터', en: 'Support' } },
  ];

  // Position icons from the LoL client (via CommunityDragon).
  const POS_ICON = 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-';
  const POSITIONS = [
    { ko: '탑', en: 'Top', icon: POS_ICON + 'top.png' },
    { ko: '정글', en: 'Jungle', icon: POS_ICON + 'jungle.png' },
    { ko: '미드', en: 'Mid', icon: POS_ICON + 'middle.png' },
    { ko: '원딜', en: 'Bot', icon: POS_ICON + 'bottom.png' },
    { ko: '서폿', en: 'Support', icon: POS_ICON + 'utility.png' },
  ];

  RandomPicker.mount({
    positions: POSITIONS,
    cardClass: 'rp-lol',
    async load() {
      const v = await App.ddVersion();
      const [ko, en] = await Promise.all(
        ['ko_KR', 'en_US'].map((l) => App.fetchJSON(`${App.DD}/cdn/${v}/data/${l}/champion.json`))
      );
      const units = Object.values(en.data).map((c) => ({
        id: c.id,
        name: { en: c.name, ko: (ko.data[c.id] || c).name },
        role: c.tags[0],
        img: `${App.DD}/cdn/img/champion/tiles/${c.id}_0.jpg`,
        // A few tile files don't match the champion id (e.g. Fiddlesticks); fall back to the square icon.
        fallbackImg: `${App.DD}/cdn/${v}/img/champion/${c.image.full}`,
      }));
      return { units, roles: ROLES };
    },
  });
})();
