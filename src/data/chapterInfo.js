// Curated links between the 4 patrimoine chapters (gameLogic.CHAPTERS) and the badge system.
// Each chapter's milestones reuse existing badge check() functions — no new tracking, no
// duplicated engine, single source of truth in badges.js/state.badges.
// Mapping sourced from LIFE_RPG_GDD.md §11 (roadmap patrimoniale de référence).

export const CHAPTER_INFO = {
  1: {
    icon: '⚒️',
    unlockCondition: 'Flip vendu ET trading rentable 6 mois consécutifs',
    milestoneBadges: ['global-forge', 'immo-chasseur', 'immo-proprio', 'immo-flipper', 'trade-the-six', 'mkt-investisseur', 'global-fonds'],
  },
  2: {
    icon: '🚂',
    unlockCondition: '2 biens locatifs actifs ET FTMO 200K validé',
    milestoneBadges: ['global-engine', 'immo-cash-machine', 'immo-seigneur', 'trade-funded', 'trade-10k', 'mkt-dca-warrior', 'mkt-10k'],
  },
  3: {
    icon: '💥',
    unlockCondition: '8+ biens ET portefeuille financier > 500K€',
    milestoneBadges: ['global-masse', 'immo-titan', 'trade-gerant', 'trade-multi-funded', 'mkt-pea-plafond', 'mkt-half-million'],
  },
  4: {
    icon: '🌌',
    unlockCondition: 'Objectif terminal',
    milestoneBadges: ['global-endgame', 'mkt-compounder', 'secret-oracle'],
  },
};
