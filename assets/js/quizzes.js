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
  // Tools (not quizzes)
  {
    href: 'valorant-random.html',
    game: 'val',
    tag: { ko: '발로란트', en: 'VALORANT' },
    title: { ko: '요원 랜덤 뽑기', en: 'Random Agent Picker' },
    desc: {
      ko: '인원과 역할군을 정하고 요원을 랜덤으로 뽑아 보세요.',
      en: 'Set the team size and roles, then draw random agents.',
    },
    image: 'https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/fullportrait.png',
  },
  {
    href: 'lol-random.html',
    game: 'lol',
    tag: { ko: '리그 오브 레전드', en: 'League of Legends' },
    title: { ko: '챔피언 랜덤 뽑기', en: 'Random Champion Picker' },
    desc: {
      ko: '인원과 주 역할군을 정하고 챔피언을 랜덤으로 뽑아 보세요. 포지션 추첨도 가능해요.',
      en: 'Set the team size and main roles, then draw random champions. Positions too.',
    },
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Teemo_0.jpg',
  },
];
