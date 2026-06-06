import React from 'react';
import { useGame } from '../context/GameContext';
import { getLevelFromXP, getVerticalLevel } from '../utils/gameLogic';
import {
  LayoutDashboard, Home, TrendingUp, BarChart2,
  Heart, Trophy, ClipboardList, Gift,
} from 'lucide-react';

const NAV_ITEMS = [
  { screen: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard, color: '#388BDC' },
  { screen: 'immo',       label: 'Real Estate',      icon: Home,            color: '#E4A94B' },
  { screen: 'trading',    label: 'Trading',          icon: TrendingUp,      color: '#3DC98A' },
  { screen: 'markets',    label: 'Financial Markets',icon: BarChart2,       color: '#8B6FCA' },
  { screen: 'health',     label: 'Health & Habits',  icon: Heart,           color: '#E05C5C' },
  { screen: 'achievements',label: 'Achievements',    icon: Trophy,          color: '#E4A94B' },
  { screen: 'review',     label: 'Weekly Review',    icon: ClipboardList,   color: '#2EC4B6' },
  { screen: 'loot',       label: 'Loot Shop',        icon: Gift,            color: '#E4A94B' },
];

const VERTICALS = [
  { key: 'realEstate', label: 'Immo',    color: '#E4A94B' },
  { key: 'trading',    label: 'Trading', color: '#3DC98A' },
  { key: 'markets',    label: 'Markets', color: '#8B6FCA' },
  { key: 'health',     label: 'Health',  color: '#E05C5C' },
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
        background: 'var(--navy-800)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV_ITEMS.map(({ screen, label, icon: Icon, color }) => {
          const isActive = currentScreen === screen;
          const showDot = screen === 'review' && !reviewDoneThisWeek;
          return (
            <button
              key={screen}
              className="nav-item w-full text-left"
              style={isActive ? { background: `${color}18`, color } : {}}
              onClick={() => navigate(screen)}
            >
              <Icon size={15} style={{ flexShrink: 0, color: isActive ? color : undefined }} />
              <span className="flex-1">{label}</span>
              {showDot && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: '#2EC4B6' }}
                  title="Review à faire"
                />
              )}
              {screen === 'achievements' && unlockedBadgeCount > 0 && (
                <span
                  className="text-xs font-mono px-1 rounded"
                  style={{ background: 'var(--gold-dim)', color: '#E4A94B', fontSize: 10 }}
                >
                  {unlockedBadgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Vertical stats */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-mono mb-3" style={{ color: 'var(--muted2)', letterSpacing: '0.1em' }}>
          STATS VERTICAL
        </p>
        <div className="flex flex-col gap-3">
          {VERTICALS.map(({ key, label, color }) => {
            const { level, xpInLevel, xpNeeded } = getVerticalLevel(state.stats[key].totalXP);
            const pct = Math.min(100, (xpInLevel / xpNeeded) * 100);
            return (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs" style={{ color: 'var(--muted)', fontSize: 11 }}>{label}</span>
                  <span className="font-mono text-xs font-bold" style={{ color }}>Lv.{level}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Player name */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-mono" style={{ color: 'var(--muted)', fontSize: 11 }}>
          {state.player.name}
        </p>
        <p className="text-xs" style={{ color: 'var(--muted2)', fontSize: 10 }}>
          {state.player.totalXP.toLocaleString()} XP total
        </p>
      </div>
    </div>
  );
}
