import React from 'react';
import { useGame } from '../context/GameContext';
import { getLevelFromXP, getVerticalLevel } from '../utils/gameLogic';
import {
  LayoutDashboard, Home, TrendingUp, BarChart2,
  Heart, Trophy, ClipboardList, Gift, UserCircle2, Map,
} from 'lucide-react';

const NAV_ITEMS = [
  { screen: 'dashboard',  label: 'Dashboard',        icon: LayoutDashboard },
  { screen: 'immo',       label: 'Real Estate',      icon: Home },
  { screen: 'trading',    label: 'Trading',          icon: TrendingUp },
  { screen: 'markets',    label: 'Financial Markets',icon: BarChart2 },
  { screen: 'health',     label: 'Health & Habits',  icon: Heart },
  { screen: 'character',  label: 'Personnage',       icon: UserCircle2 },
  { screen: 'carte',      label: 'Carte',            icon: Map },
  { screen: 'achievements',label: 'Achievements',    icon: Trophy },
  { screen: 'review',     label: 'Weekly Review',    icon: ClipboardList },
  { screen: 'loot',       label: 'Loot Shop',        icon: Gift },
];

const VERTICALS = [
  { key: 'realEstate', label: 'Immo' },
  { key: 'trading',    label: 'Trading' },
  { key: 'markets',    label: 'Markets' },
  { key: 'health',     label: 'Health' },
];

export default function Sidebar() {
  const { state, dispatch } = useGame();
  const { currentScreen } = state.ui;

  const navigate = (screen) => dispatch({ type: 'NAVIGATE', screen });

  const unlockedBadgeCount = Object.keys(state.badges).length;

  // Check if weekly review done this week
  const thisWeek = new Date();
  const weekNum = Math.floor(thisWeek.getTime() / (7 * 24 * 60 * 60 * 1000));
  const reviewDoneThisWeek = state.weeklyReviews.some(r => {
    const rDate = new Date(r.date);
    const rWeek = Math.floor(rDate.getTime() / (7 * 24 * 60 * 60 * 1000));
    return rWeek === weekNum;
  });

  return (
    <div
      className="flex flex-col h-full flex-shrink-0"
      style={{
        width: 220,
        background: 'var(--bg-panel)',
        backdropFilter: 'blur(2px)',
        borderRight: '1px solid var(--line)',
      }}
    >
      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV_ITEMS.map(({ screen, label, icon: Icon }) => {
          const isActive = currentScreen === screen;
          const showDot = screen === 'review' && !reviewDoneThisWeek;
          return (
            <button
              key={screen}
              className={`nav-item w-full text-left ${isActive ? 'active' : ''}`}
              onClick={() => navigate(screen)}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span className="flex-1">{label}</span>
              {showDot && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)' }}
                  title="Review à faire"
                />
              )}
              {screen === 'achievements' && unlockedBadgeCount > 0 && (
                <span
                  className="text-xs px-1"
                  style={{ background: 'var(--cyan-dim-bg)', color: 'var(--cyan)', fontSize: 10, borderRadius: 2 }}
                >
                  {unlockedBadgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Vertical stats */}
      <div className="p-3" style={{ borderTop: '1px solid var(--line)' }}>
        <p className="panel-label" style={{ marginBottom: 12 }}>
          Stats vertical
        </p>
        <div className="flex flex-col gap-3">
          {VERTICALS.map(({ key, label }) => {
            const { level, xpInLevel, xpNeeded } = getVerticalLevel(state.stats[key].totalXP);
            const pct = Math.min(100, (xpInLevel / xpNeeded) * 100);
            return (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ color: 'var(--text-dim)', fontSize: 11, textTransform: 'uppercase' }}>{label}</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--cyan)' }}>Lv.{level}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Player name */}
      <div className="p-3" style={{ borderTop: '1px solid var(--line)' }}>
        <p className="text-xs" style={{ color: 'var(--text-dim)', fontSize: 11, textTransform: 'uppercase' }}>
          {state.player.name}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-dim2)', fontSize: 10 }}>
          {state.player.totalXP.toLocaleString()} XP total
        </p>
      </div>
    </div>
  );
}
