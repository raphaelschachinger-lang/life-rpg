import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CHAPTERS, getCurrentChapter, getChapterProgress, formatCurrency } from '../utils/gameLogic';
import { CHAPTER_INFO } from '../data/chapterInfo';
import { BADGES } from '../data/badges';
import { ChevronLeft, ChevronRight, Lock, Check, ArrowRight } from 'lucide-react';

// ── Path geometry (vertical serpentine, 4 nodes) ──────────────────

const VIEW_W = 640;
const NODE_R = 64;
const NODES = [
  { x: 170, y: 150 },
  { x: 470, y: 490 },
  { x: 170, y: 830 },
  { x: 470, y: 1170 },
];
const VIEW_H = 1360;

function segmentControls(p0, p3) {
  const midY = p0.y + (p3.y - p0.y) * 0.5;
  return { c1: { x: p0.x, y: midY }, c2: { x: p3.x, y: midY } };
}

function bezierPoint(p0, c1, c2, p3, t) {
  const mt = 1 - t;
  return {
    x: mt ** 3 * p0.x + 3 * mt ** 2 * t * c1.x + 3 * mt * t ** 2 * c2.x + t ** 3 * p3.x,
    y: mt ** 3 * p0.y + 3 * mt ** 2 * t * c1.y + 3 * mt * t ** 2 * c2.y + t ** 3 * p3.y,
  };
}

function sampleBezier(p0, c1, c2, p3, steps = 40) {
  return Array.from({ length: steps + 1 }, (_, i) => bezierPoint(p0, c1, c2, p3, i / steps));
}

function pathD(p0, c1, c2, p3) {
  return `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p3.x} ${p3.y}`;
}

function pointsAttr(points) {
  return points.map(p => `${p.x},${p.y}`).join(' ');
}

// ── Component ───────────────────────────────────────────────────

export default function Carte() {
  const { state, dispatch } = useGame();
  const currentChapter = getCurrentChapter(state.patrimoine.current);
  const currentIndex = CHAPTERS.findIndex(c => c.id === currentChapter.id);
  const [selectedIndex, setSelectedIndex] = useState(currentIndex);

  const selected = CHAPTERS[selectedIndex];
  const selectedInfo = CHAPTER_INFO[selected.id];
  const selectedPct = getChapterProgress(state.patrimoine.current, selected);

  const segments = CHAPTERS.slice(0, -1).map((_, i) => {
    const p0 = NODES[i], p3 = NODES[i + 1];
    const { c1, c2 } = segmentControls(p0, p3);
    return { p0, c1, c2, p3, points: sampleBezier(p0, c1, c2, p3) };
  });

  // Marker: current position along the current segment (or pinned to the last node in chapter 4)
  const currentSegmentPct = currentIndex < 3 ? getChapterProgress(state.patrimoine.current, CHAPTERS[currentIndex]) : 100;
  const markerT = Math.min(1, Math.max(0, currentSegmentPct / 100));
  const markerPos = currentIndex < 3
    ? bezierPoint(segments[currentIndex].p0, segments[currentIndex].c1, segments[currentIndex].c2, segments[currentIndex].p3, markerT)
    : NODES[3];

  return (
    <div className="fade-up" style={{ maxWidth: 1000 }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Carte de progression</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {formatCurrency(state.patrimoine.current)} · Chapitre {currentChapter.id} — {currentChapter.name}
        </p>
      </div>

      {/* Serpentine path */}
      <div className="card mb-6" style={{ padding: 16, overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Chapter zone backdrops */}
          {CHAPTERS.map((c, i) => (
            <rect
              key={c.id}
              x={0} y={NODES[i].y - 175} width={VIEW_W} height={350}
              fill={c.color} opacity={0.04} rx={24}
            />
          ))}

          {/* Base path — full route, dashed/muted */}
          {segments.map((seg, i) => (
            <path key={i} d={pathD(seg.p0, seg.c1, seg.c2, seg.p3)}
              fill="none" stroke="var(--border2)" strokeWidth={5} strokeDasharray="2 14" strokeLinecap="round" />
          ))}

          {/* Solid overlay — completed segments */}
          {segments.map((seg, i) => i < currentIndex && (
            <polyline key={`solid-${i}`} points={pointsAttr(seg.points)}
              fill="none" stroke={CHAPTERS[i + 1].color} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
          ))}

          {/* Solid overlay — current (in-progress) segment, up to marker */}
          {currentIndex < 3 && (
            <polyline
              points={pointsAttr(segments[currentIndex].points.slice(0, Math.ceil(markerT * 40) + 1))}
              fill="none" stroke={CHAPTERS[currentIndex].color} strokeWidth={5} strokeLinecap="round" opacity={0.85}
            />
          )}

          {/* Nodes */}
          {CHAPTERS.map((chapter, i) => {
            const pos = NODES[i];
            const status = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'locked';
            const info = CHAPTER_INFO[chapter.id];
            const isSelected = i === selectedIndex;
            return (
              <g
                key={chapter.id}
                onClick={() => setSelectedIndex(i)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pos.x} cy={pos.y} r={NODE_R}
                  fill={status === 'locked' ? 'var(--navy-700)' : `${chapter.color}22`}
                  stroke={isSelected ? chapter.color : (status === 'locked' ? 'var(--border2)' : chapter.color)}
                  strokeWidth={isSelected ? 4 : 2.5}
                  opacity={status === 'locked' ? 0.55 : 1}
                />
                {status === 'current' && (
                  <circle cx={pos.x} cy={pos.y} r={NODE_R + 8} fill="none" stroke={chapter.color} strokeWidth={2} opacity={0.5}>
                    <animate attributeName="r" values={`${NODE_R + 6};${NODE_R + 16};${NODE_R + 6}`} dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                )}
                <text x={pos.x} y={pos.y + 16} textAnchor="middle" fontSize={44}>
                  {status === 'locked' ? '🔒' : info.icon}
                </text>
                <text x={pos.x} y={pos.y + NODE_R + 30} textAnchor="middle" fontSize={16} fontWeight={700}
                  fill="var(--text)" fontFamily="Inter, sans-serif">
                  {chapter.name}
                </text>
                <text x={pos.x} y={pos.y + NODE_R + 50} textAnchor="middle" fontSize={12}
                  fill="var(--muted)" fontFamily="Inter, sans-serif">
                  {chapter.period}
                </text>
                <text x={pos.x} y={pos.y + NODE_R + 68} textAnchor="middle" fontSize={12} fontWeight={700}
                  fill={chapter.color} fontFamily="JetBrains Mono, monospace">
                  {formatCurrency(chapter.target)}
                </text>
              </g>
            );
          })}

          {/* "You are here" marker */}
          <g>
            <circle cx={markerPos.x} cy={markerPos.y} r={10} fill="var(--blue)" stroke="#fff" strokeWidth={2}>
              <animate attributeName="r" values="9;12;9" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <text x={markerPos.x} y={markerPos.y - 20} textAnchor="middle" fontSize={12} fontWeight={700}
              fill="var(--blue)" fontFamily="JetBrains Mono, monospace">
              Toi
            </text>
          </g>
        </svg>
      </div>

      {/* Detail panel — selected chapter */}
      <div className="card" style={{ borderTop: `2px solid ${selected.color}`, padding: 24 }}>
        <div className="flex items-center justify-between mb-4">
          <button
            className="btn btn-ghost flex items-center gap-1 text-xs"
            disabled={selectedIndex === 0}
            style={selectedIndex === 0 ? { opacity: 0.3, cursor: 'default' } : {}}
            onClick={() => selectedIndex > 0 && setSelectedIndex(selectedIndex - 1)}
          >
            <ChevronLeft size={14} /> Précédent
          </button>
          <div className="text-center">
            <p className="text-xs font-mono" style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}>
              CHAPITRE {selected.id}
            </p>
            <h2 className="text-lg font-bold" style={{ color: selected.color }}>{selected.name}</h2>
          </div>
          <button
            className="btn btn-ghost flex items-center gap-1 text-xs"
            disabled={selectedIndex === CHAPTERS.length - 1}
            style={selectedIndex === CHAPTERS.length - 1 ? { opacity: 0.3, cursor: 'default' } : {}}
            onClick={() => selectedIndex < CHAPTERS.length - 1 && setSelectedIndex(selectedIndex + 1)}
          >
            Suivant <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
          <span>{selected.period}</span>
          <span>Boss final : <strong style={{ color: selected.color }}>{formatCurrency(selected.target)}</strong></span>
        </div>
        <div className="progress-bar mb-2" style={{ height: 8, borderRadius: 4 }}>
          <div className="progress-bar-fill" style={{ width: `${selectedPct}%`, background: selected.color }} />
        </div>
        <p className="text-xs font-mono mb-5" style={{ color: selected.color }}>{selectedPct.toFixed(2)}% accompli</p>

        {selectedIndex < CHAPTERS.length - 1 && (
          <div className="text-xs mb-5 p-3 rounded-lg" style={{ background: 'var(--navy-700)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted)' }}>Déverrouille le chapitre suivant : </span>
            <span style={{ color: 'var(--text)' }}>{selectedInfo.unlockCondition}</span>
          </div>
        )}

        <p className="text-xs font-mono mb-3" style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}>
          JALONS DE CE CHAPITRE
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {selectedInfo.milestoneBadges.map(id => {
            const badge = BADGES[id];
            if (!badge) return null;
            const unlocked = !!state.badges[id];
            return (
              <div
                key={id}
                className="flex items-center gap-3 p-2 rounded-lg"
                style={{
                  background: unlocked ? `${selected.color}12` : 'var(--navy-700)',
                  border: `1px solid ${unlocked ? `${selected.color}40` : 'var(--border)'}`,
                  opacity: unlocked ? 1 : 0.6,
                }}
              >
                <span className="text-xl flex-shrink-0" style={{ filter: unlocked ? 'none' : 'grayscale(1)' }}>
                  {badge.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{badge.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted2)', fontSize: 10 }}>{badge.description}</p>
                </div>
                {unlocked
                  ? <Check size={14} style={{ color: '#3DC98A', flexShrink: 0 }} />
                  : <Lock size={12} style={{ color: 'var(--muted2)', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>

        <button
          className="btn btn-ghost text-xs flex items-center gap-1"
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'achievements' })}
        >
          Voir tous les badges <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
