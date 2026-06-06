import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatCurrency, getVerticalLevel, formatDate } from '../utils/gameLogic';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts';
import { Plus, X, TrendingUp, TrendingDown, Edit2 } from 'lucide-react';

const STATUS_CONFIG = {
  challenge: { label: 'En challenge', color: '#E4A94B' },
  funded:    { label: 'Funded',       color: '#3DC98A' },
  lost:      { label: 'Perdu',        color: '#E05C5C' },
};

function PropfirmCard({ pf, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...pf });
  const cfg = STATUS_CONFIG[pf.status] || STATUS_CONFIG.challenge;
  const pnlPct = ((pf.pnl / pf.capital) * 100).toFixed(2);

  return (
    <div className="card" style={{ borderTop: `2px solid ${cfg.color}` }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold" style={{ color: 'var(--text)' }}>{pf.name}</span>
            <span
              className="pill"
              style={{ background: `${cfg.color}20`, color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            Capital: <span className="font-mono" style={{ color: 'var(--text)' }}>{formatCurrency(pf.capital)}</span>
            {' · '}
            DD Max: <span className="font-mono" style={{ color: '#E05C5C' }}>{pf.maxDrawdown}%</span>
          </p>
        </div>
        <div className="flex gap-1">
          <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setEditing(!editing)}>
            <Edit2 size={12} />
          </button>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', color: '#E05C5C' }} onClick={() => onRemove(pf.id)}>
            <X size={12} />
          </button>
        </div>
      </div>

      {/* P&L display */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>P&L actuel</p>
          <p
            className="text-xl font-mono font-bold"
            style={{ color: pf.pnl >= 0 ? '#3DC98A' : '#E05C5C' }}
          >
            {pf.pnl >= 0 ? '+' : ''}{formatCurrency(pf.pnl)}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Performance</p>
          <p
            className="text-xl font-mono font-bold"
            style={{ color: pf.pnl >= 0 ? '#3DC98A' : '#E05C5C' }}
          >
            {pf.pnl >= 0 ? '+' : ''}{pnlPct}%
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Marge DD</p>
          <p className="text-xl font-mono font-bold" style={{ color: '#E4A94B' }}>
            {Math.max(0, pf.maxDrawdown + Number(pnlPct)).toFixed(1)}%
          </p>
        </div>
      </div>

      {editing && (
        <div className="mt-4 flex flex-col gap-3 fade-up" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Nom</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Capital (€)</label>
              <input type="number" value={form.capital} onChange={e => setForm(f => ({ ...f, capital: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>P&L actuel (€)</label>
              <input type="number" value={form.pnl} onChange={e => setForm(f => ({ ...f, pnl: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Drawdown max (%)</label>
              <input type="number" value={form.maxDrawdown} onChange={e => setForm(f => ({ ...f, maxDrawdown: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Statut</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => { onUpdate(pf.id, form); setEditing(false); }}>
              Sauvegarder
            </button>
            <button className="btn btn-ghost" onClick={() => { setForm({ ...pf }); setEditing(false); }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Trading() {
  const { state, dispatch } = useGame();
  const [showAddPF, setShowAddPF] = useState(false);
  const [newPF, setNewPF] = useState({ name: 'FTMO', capital: 200000, maxDrawdown: 10, pnl: 0, status: 'challenge' });
  const [consecutiveMonths, setConsecutiveMonths] = useState(state.trading.consecutivePositiveMonths);
  const [editingMonths, setEditingMonths] = useState(false);

  const { level: vLevel, xpInLevel, xpNeeded } = getVerticalLevel(state.stats.trading.totalXP);

  // Build cumulative P&L chart from weekly logs
  const chartData = state.trading.weeklyLogs.reduce((acc, log) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    return [...acc, {
      date: log.date,
      weekly: log.result,
      cumulative: prev + (log.result || 0),
    }];
  }, []);

  const totalPnL = state.trading.weeklyLogs.reduce((s, l) => s + (l.result || 0), 0);
  const fundedCount = state.trading.propfirms.filter(p => p.status === 'funded').length;
  const positiveWeeks = state.trading.weeklyLogs.filter(l => l.result > 0).length;
  const winRate = state.trading.weeklyLogs.length > 0
    ? ((positiveWeeks / state.trading.weeklyLogs.length) * 100).toFixed(0)
    : 0;

  return (
    <div className="fade-up" style={{ maxWidth: 900 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Trading</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Vertical Trading · Niveau {vLevel}</p>
        </div>
        <button className="btn flex items-center gap-2" style={{ background: '#3DC98A', color: '#000' }} onClick={() => setShowAddPF(true)}>
          <Plus size={14} /> Ajouter une propfirm
        </button>
      </div>

      {/* Level bar */}
      <div className="card mb-6" style={{ padding: '12px 16px', borderTop: '2px solid #3DC98A' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold" style={{ color: '#3DC98A' }}>Trading Niveau {vLevel}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
            {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
          </span>
        </div>
        <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
          <div className="progress-bar-fill"
            style={{ width: `${Math.min(100, (xpInLevel / xpNeeded) * 100)}%`, background: '#3DC98A' }} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'P&L total', value: `${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL)}`, color: totalPnL >= 0 ? '#3DC98A' : '#E05C5C' },
          { label: 'Semaines positives', value: `${positiveWeeks}/${state.trading.weeklyLogs.length}`, color: '#3DC98A' },
          { label: 'Win rate hebdo', value: `${winRate}%`, color: Number(winRate) >= 50 ? '#3DC98A' : '#E05C5C' },
          { label: 'Funded actifs', value: fundedCount, color: '#E4A94B' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ borderTop: '2px solid #3DC98A' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className="font-mono text-lg font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Consecutive months - editable */}
      <div className="card mb-6" style={{ borderTop: '2px solid #3DC98A' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Mois consécutifs positifs</p>
            {editingMonths ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={consecutiveMonths}
                  onChange={e => setConsecutiveMonths(Number(e.target.value))}
                  style={{ width: 80, fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 700, color: '#3DC98A' }}
                />
                <button className="btn btn-primary" style={{ padding: '4px 12px' }} onClick={() => {
                  dispatch({ type: 'UPDATE_CONSECUTIVE_MONTHS', value: consecutiveMonths });
                  setEditingMonths(false);
                }}>OK</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="font-mono font-bold" style={{ fontSize: 32, color: consecutiveMonths >= 6 ? '#3DC98A' : '#E4A94B' }}>
                  {consecutiveMonths}
                  <span className="text-sm ml-1" style={{ color: 'var(--muted)' }}>mois</span>
                </p>
                <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setEditingMonths(true)}>
                  <Edit2 size={12} />
                </button>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Objectif Chapitre I</p>
            <p className="font-mono text-sm" style={{ color: 'var(--text)' }}>6 mois consécutifs</p>
            <div className="progress-bar mt-2" style={{ width: 120, height: 6, borderRadius: 3 }}>
              <div className="progress-bar-fill"
                style={{ width: `${Math.min(100, (consecutiveMonths / 6) * 100)}%`, background: '#3DC98A' }} />
            </div>
          </div>
        </div>
      </div>

      {/* P&L Chart */}
      <div className="card mb-6" style={{ borderTop: '2px solid #3DC98A' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Courbe P&L cumulatif</h3>
          <span className="text-xs font-mono" style={{ color: totalPnL >= 0 ? '#3DC98A' : '#E05C5C' }}>
            {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)} total
          </span>
        </div>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,139,220,0.08)" />
              <XAxis dataKey="date" tick={{ fill: '#4E6A88', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#4E6A88', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => formatCurrency(v)} width={60} />
              <Tooltip
                contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 6 }}
                formatter={(v, n) => [formatCurrency(v), n === 'cumulative' ? 'P&L cumulé' : 'Semaine']}
              />
              <ReferenceLine y={0} stroke="rgba(224,92,92,0.4)" strokeDasharray="4 2" />
              <Line type="monotone" dataKey="cumulative" stroke="#3DC98A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-28" style={{ color: 'var(--muted2)', fontSize: 13 }}>
            Loggez vos semaines via la Weekly Review pour voir la courbe.
          </div>
        )}
      </div>

      {/* Weekly log history */}
      {state.trading.weeklyLogs.length > 0 && (
        <div className="card mb-6" style={{ borderTop: '2px solid #3DC98A' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Journal des semaines ({state.trading.weeklyLogs.length})
          </h3>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: 'var(--muted)', fontSize: 11 }}>
                  {['Date', 'Résultat', 'Trades', 'MM', 'Cumulatif'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...state.trading.weeklyLogs].reverse().slice(0, 10).map((log, i) => {
                  const idx = state.trading.weeklyLogs.length - 1 - i;
                  const cum = chartData[idx]?.cumulative || 0;
                  return (
                    <tr
                      key={i}
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <td style={{ padding: '8px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', fontSize: 11 }}>{formatDate(log.date)}</td>
                      <td style={{ padding: '8px', fontFamily: 'JetBrains Mono', fontWeight: 700,
                        color: log.result >= 0 ? '#3DC98A' : '#E05C5C' }}>
                        {log.result >= 0 ? '+' : ''}{formatCurrency(log.result)}
                      </td>
                      <td style={{ padding: '8px', color: 'var(--text)', fontFamily: 'JetBrains Mono' }}>{log.tradesCount || '—'}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ color: log.mmRespected ? '#3DC98A' : '#E05C5C', fontSize: 12 }}>
                          {log.mmRespected ? '✓' : '✗'}
                        </span>
                      </td>
                      <td style={{ padding: '8px', fontFamily: 'JetBrains Mono', color: cum >= 0 ? '#3DC98A' : '#E05C5C' }}>
                        {cum >= 0 ? '+' : ''}{formatCurrency(cum)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Propfirms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
            PROPFIRMS ({state.trading.propfirms.length})
          </h2>
        </div>
        {state.trading.propfirms.length === 0 ? (
          <div className="card text-center py-8">
            <TrendingUp size={28} style={{ color: 'var(--muted2)', margin: '0 auto 8px' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Aucune propfirm enregistrée</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {state.trading.propfirms.map(pf => (
              <PropfirmCard
                key={pf.id}
                pf={pf}
                onUpdate={(id, updates) => dispatch({ type: 'UPDATE_PROPFIRM', id, updates })}
                onRemove={(id) => { if (window.confirm('Supprimer cette propfirm ?')) dispatch({ type: 'REMOVE_PROPFIRM', id }); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add propfirm modal */}
      {showAddPF && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(5,13,26,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div className="card" style={{ width: 400, borderTop: '2px solid #3DC98A' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Ajouter une propfirm</h3>
              <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setShowAddPF(false)}><X size={14} /></button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Nom', key: 'name', type: 'text', placeholder: 'FTMO, MyForexFunds...' },
                { label: 'Capital (€)', key: 'capital', type: 'number' },
                { label: 'Drawdown max (%)', key: 'maxDrawdown', type: 'number' },
                { label: 'P&L actuel (€)', key: 'pnl', type: 'number' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={newPF[key]}
                    onChange={e => setNewPF(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Statut</label>
                <select value={newPF.status} onChange={e => setNewPF(f => ({ ...f, status: e.target.value }))}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="btn flex-1"
                  style={{ background: '#3DC98A', color: '#000' }}
                  onClick={() => {
                    if (newPF.name) { dispatch({ type: 'ADD_PROPFIRM', propfirm: newPF }); setShowAddPF(false); }
                  }}
                >
                  Ajouter
                </button>
                <button className="btn btn-ghost" onClick={() => setShowAddPF(false)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
