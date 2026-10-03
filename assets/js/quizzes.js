/*
 * Quiz registry shown on the home page.
 * To add a quiz: create a new page (copy an existing one) and add an entry here.
 *   game: 'lol' | 'val'  (controls the tag colour)
 *   image: optional background image URL
 */
window.QUIZZES = [
  {
    href: 'lol-champions.html',
    game: 'lol',
    tag: { ko: '리그 오브 레전드', en: 'League of Legends' },
    title: { ko: '챔피언 이름 맞추기', en: 'Name Every Champion' },
    desc: {
      ko: '모든 챔피언의 이름을 기억에만 의존해 입력해 보세요.',
      en: 'Type every champion name from memory.',
    },
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg',
  },
  {
    href: 'lol-titles.html',
    game: 'lol',
    tag: { ko: '리그 오브 레전드', en: 'League of Legends' },
    title: { ko: '챔피언 칭호 맞추기', en: 'Champions by Title' },
    desc: {
      ko: '칭호만 보고 어떤 챔피언인지 맞혀 보세요.',
      en: 'Name each champion from its title alone.',
    },
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg',
  },
  {
    href: 'valorant-collections.html',
    game: 'val',
    tag: { ko: '발로란트', en: 'VALORANT' },
    title: { ko: '스킨 컬렉션 이름 맞추기', en: 'Name Every Skin Collection' },
    desc: {
      ko: '모든 스킨 컬렉션의 이름을 기억해 보세요.',
      en: 'How many skin collections can you name?',
    },
    image: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png',
  },
  {
    href: 'lol-skinlines.html',
    game: 'lol',
    tag: { ko: '리그 오브 레전드', en: 'League of Legends' },
    title: { ko: '스킨 세트 이름 맞추기', en: 'Name Every Skin Line' },
    desc: {
      ko: '모든 스킨 세트의 이름을 기억해 보세요.',
      en: 'How many skin lines can you name?',
    },
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_1.jpg',
  },
];
