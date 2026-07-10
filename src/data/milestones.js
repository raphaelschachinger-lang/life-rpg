// Static definitions for the progression map (spec: life_rpg_progression_map_spec.md).
// Generic milestones derive their status purely from current_level (see gameLogic.getMilestoneStatus).
// Thematic milestones' status is stored in GameContext state.milestones (manual, never auto-triggered).

export const MILESTONES = [
  {
    id: 'immo_villebourbon_v1',
    type: 'thematic',
    title: '1er projet immo bouclé',
    subtitle: 'Villebourbon',
    target_level: 15,
  },
  {
    id: 'formation_mdb',
    type: 'thematic',
    title: 'Formation',
    subtitle: 'Marchand de biens',
    target_level: 20,
  },
  {
    id: 'level_10',
    type: 'generic',
    title: 'Niveau 10',
    target_level: 10,
  },
  {
    id: 'level_25',
    type: 'generic',
    title: 'Niveau 25',
    target_level: 25,
  },
  {
    id: 'patrimoine_cap',
    type: 'thematic',
    title: 'Cap 10M',
    subtitle: 'Patrimoine visé',
    target_level: 40,
  },
];

// Default status for thematic milestones (manual, editable from the Carte screen).
export const DEFAULT_MILESTONE_STATUS = {
  immo_villebourbon_v1: { status: 'in_progress', updatedAt: null },
  formation_mdb: { status: 'not_started', updatedAt: null },
  patrimoine_cap: { status: 'not_started', updatedAt: null },
};
