import React from 'react';
import { useGame } from '../context/GameContext';
import { getLevelFromXP, getPlayerTitle, getCurrentChapter, getChapterProgress, formatCurrency } from '../utils/gameLogic';
import { Zap, Shield, Sun, Moon, Menu, X } from 'lucide-react';

export default function Topbar({ navOpen, onMenuClick }) {
  const { state, dispatch } = useGame();
  const { level, xpInLevel, xpNeeded } = getLevelFromXP(state.player.totalXP);
  const title = getPlayerTitle(level);
  const chapter = getCurrentChapter(state.patrimoine.current);
  const chapterProgress = getChapterProgress(state.patrimoine.current, chapter);
  const xpPct = Math.min(100, (xpInLevel / xpNeeded) * 100);
  const theme = state.ui.theme || 'dark';

  return (
    <div
      className="flex items-center gap-4 px-5 h-14 flex-shrink-0"
      style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 1 }}
    >
      {/* Mobile menu button */}
      <button
        className="md:hidden flex-shrink-0"
        style={{ background: 'transparent', border: 'none', color: 'var(--text)', padding: 4, cursor: 'pointer' }}
        onClick={onMenuClick}
        aria-label={navOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        {navOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="icon-pastille active"
          style={{ width: 28, height: 28, borderRadius: 9, fontWeight: 700, fontSize: 13 }}
        >
          L
        </div>
        <span className="text-sm font-bold hidden sm:inline" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
          Life RPG
        </span>
      </div>

      {/* Chapter badge */}
      <div
        className="hidden md:flex items-center gap-2 px-3 py-1 flex-shrink-0"
        style={{ background: 'var(--accent-soft)', borderRadius: 20 }}
      >
        <Shield size={12} style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
          Ch. {chapter.id} — {chapter.name}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
          {chapterProgress.toFixed(0)}%
        </span>
      </div>

      <div className="flex-1" />

      {/* Patrimoine */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Patrimoine</span>
        <span className="text-sm font-bold mono" style={{ color: 'var(--accent)' }}>
          {formatCurrency(state.patrimoine.current)}
        </span>
      </div>

      <div className="hidden md:block" style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />

      {/* XP Bar */}
      <div className="hidden md:flex items-center gap-3 flex-shrink-0" style={{ minWidth: 220 }}>
        <div className="flex items-center gap-1">
          <Zap size={12} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
            Niv. {level}
          </span>
        </div>
        <div className="flex-1 relative" style={{ minWidth: 120 }}>
          <div className="progress-bar" style={{ height: 5 }}>
            <div className="progress-bar-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
        <span className="text-xs mono" style={{ color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
        </span>
      </div>

      <div className="hidden md:block" style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />

      {/* Title */}
      <div
        className="hidden md:block px-3 py-1 text-xs font-semibold flex-shrink-0"
        style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 20 }}
      >
        {title}
      </div>

      {/* Theme toggle */}
      <div className="theme-toggle flex-shrink-0">
        <button
          className={theme === 'light' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_THEME', theme: 'light' })}
          title="Mode clair"
          aria-label="Mode clair"
        >
          <Sun size={14} />
        </button>
        <button
          className={theme === 'dark' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_THEME', theme: 'dark' })}
          title="Mode sombre"
          aria-label="Mode sombre"
        >
          <Moon size={14} />
        </button>
      </div>
    </div>
  );
}
