// Static metadata for the 6 character traits (spec: life_rpg_personnage_spec.md).
// Numeric state (base_value/current_value) lives in GameContext DEFAULT_STATE.traits.

export const TRAIT_ORDER = ['discernement', 'integrite', 'discipline', 'lien_social', 'serenite', 'audace'];

export const TRAITS_META = {
  discernement: {
    id: 'discernement',
    name: 'Discernement',
    subtitle: 'Sagesse',
    definition: "Jugement, recul, réflexion avant l'action",
    color: '#4fe8d1',
    question: "Ai-je pris mes décisions importantes après réflexion plutôt qu'à chaud ?",
    composition: "OCEAN : Intellect 85, Imagination 75, Prudence 100, Ordre 100, Efficacité perso 90 (moy. 90) — VIA : Discernement r1, Perspective r3, Précaution r4, Curiosité r10, Amour de l'étude r14 (moy. 80.6)",
  },
  integrite: {
    id: 'integrite',
    name: 'Intégrité',
    subtitle: 'Honneur',
    definition: 'Cohérence valeurs/actes, fiabilité',
    color: '#4fe8d1',
    question: 'Ai-je tenu mes règles et ma parole cette semaine (trading, engagements) ?',
    composition: 'OCEAN : Moralité 95, Fiabilité 100, Coopération 80 (moy. 91.7) — VIA : Honnêteté r5, Citoyenneté r6, Impartialité r8 (moy. 80.7)',
  },
  discipline: {
    id: 'discipline',
    name: 'Discipline',
    subtitle: 'Rigueur',
    definition: 'Auto-discipline, persévérance, tenue d\'un effort sans filet',
    color: '#4fe8d1',
    question: 'Ai-je tenu mes routines sans qu\'il faille me forcer ?',
    composition: 'OCEAN : Auto-discipline 40, Immodération inv. 60 (moy. 50) — VIA : Maîtrise de soi r11, Assiduité/persévérance r20 (moy. 64.8)',
  },
  lien_social: {
    id: 'lien_social',
    name: 'Lien social',
    subtitle: 'Connexion',
    definition: 'Confiance, chaleur, ouverture aux autres',
    color: '#4fe8d1',
    question: 'Ai-je fait un effort actif pour me connecter à d\'autres ?',
    composition: 'OCEAN : Grégarisme 20, Amitié 35, Confiance 40, Empathie 45, Altruisme 35 (moy. 35) — VIA : Capacité d\'aimer r13, Intelligence sociale r16, Gentillesse r17 (moy. 65.1)',
  },
  serenite: {
    id: 'serenite',
    name: 'Sérénité',
    subtitle: 'Stabilité intérieure',
    definition: "Calme émotionnel, gestion de l'anxiété",
    color: '#4fe8d1',
    question: "Ai-je géré le stress/l'anxiété sans qu'elle prenne le dessus ?",
    composition: 'OCEAN : Anxiété inv. 15, Timidité sociale inv. 5, Dépression inv. 30, Hostilité colérique inv. 80, Vulnérabilité inv. 65 (moy. 39) — VIA : Espoir/optimisme r9, Gratitude r15, Pardon r21 (moy. 65.7)',
  },
  audace: {
    id: 'audace',
    name: 'Audace',
    subtitle: 'Vitalité',
    definition: 'Prise de risque, sortie de zone de confort, énergie',
    color: '#4fe8d1',
    question: 'Suis-je sorti de ma zone de confort au moins une fois ?',
    composition: 'OCEAN : Aventurisme 50, Recherche d\'excitation 40, Assertivité 60 (moy. 50) — VIA : Vitalité r12, Courage et vaillance r23 (moy. 61.3)',
  },
};
