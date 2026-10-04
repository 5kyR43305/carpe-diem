/* VALORANT — random agent picker (roles: Duelist / Controller / Sentinel / Initiator). */
(function () {
  'use strict';

  App.addStrings({
    ko: {
      pageTitle: '발로란트 요원 랜덤 뽑기 · Carpe Diem',
      title: '발로란트 요원 랜덤 뽑기',
      sub: '뽑을 인원과 역할군별 인원을 정하고 뽑기를 눌러 보세요.',
    },
    en: {
      pageTitle: 'VALORANT Random Agent Picker · Carpe Diem',
      title: 'VALORANT Random Agent Picker',
      sub: 'Choose how many agents and how many per role, then draw.',
    },
  });

  const API = 'https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=';
  const ROLE_ORDER = ['Duelist', 'Controller', 'Sentinel', 'Initiator'];

  RandomPicker.mount({
    async load() {
      const [ko, en] = await Promise.all([App.fetchJSON(API + 'ko-KR'), App.fetchJSON(API + 'en-US')]);
      const koById = new Map(ko.data.map((a) => [a.uuid, a]));
      const roleInfo = new Map(); // English role name -> { name:{ko,en}, icon }
      const units = en.data.filter((a) => a.role).map((a) => {
        const k = koById.get(a.uuid) || a;
        if (!roleInfo.has(a.role.displayName)) {
          roleInfo.set(a.role.displayName, {
            name: { en: a.role.displayName, ko: k.role ? k.role.displayName : a.role.displayName },
            icon: a.role.displayIcon,
          });
        }
        return {
          id: a.uuid,
          name: { en: a.displayName, ko: k.displayName },
          role: a.role.displayName,
          img: a.displayIcon,
          colors: (a.backgroundGradientColors || []).map((c) => '#' + c.slice(0, 6)),
        };
      });
      const roles = ROLE_ORDER.filter((key) => roleInfo.has(key)).map((key) => Object.assign({ key }, roleInfo.get(key)));
      return { units, roles };
    },
  });
})();
