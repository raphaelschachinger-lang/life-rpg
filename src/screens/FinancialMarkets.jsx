import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatCurrency, getVerticalLevel, formatDate, todayISO } from '../utils/gameLogic';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Shield, TrendingUp, Edit2 } from 'lucide-react';

export default function FinancialMarkets() {
  const { state, dispatch } = useGame();
  const { level: vLevel, xpInLevel, xpNeeded } = getVerticalLevel(state.stats.markets.totalXP);
  const { pea, cto, dca, emergencyFund, consecutiveDCAMonths } = state.markets;

  const [editPEA, setEditPEA] = useState(false);
  const [editCTO, setEditCTO] = useState(false);
  const [editEF, setEditEF] = useState(false);
  const [editDCA, setEditDCA] = useState(false);

  const [peaForm, setPeaForm] = useState({ currentValue: pea.currentValue, totalInvested: pea.totalInvested });
  const [ctoForm, setCtoForm] = useState({ currentValue: cto.currentValue, totalInvested: cto.totalInvested });
  const [efForm, setEfForm] = useState(emergencyFund);
  const [dcaForm, setDcaForm] = useState(dca.monthlyAmount);

  const [openPEAAmount, setOpenPEAAmount] = useState(500);
  const [showOpenPEA, setShowOpenPEA] = useState(false);

  const totalPortfolio = pea.currentValue + cto.currentValue;
  const totalInvested = pea.totalInvested + cto.totalInvested;
  const totalGain = totalPortfolio - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;

  // Build chart data from DCA history
  const dcaChartData = dca.history.reduce((acc, entry) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].total : 0;
    return [...acc, { date: entry.date, total: prev + entry.amount }];
  }, []);

  const handleSavePEA = () => {
    dispatch({
      type: 'UPDATE_MARKETS',
      updates: { pea: { ...pea, currentValue: peaForm.currentValue, totalInvested: peaForm.totalInvested } },
    });
    setEditPEA(false);
  };

  const handleSaveCTO = () => {
    dispatch({
      type: 'UPDATE_MARKETS',
      updates: { cto: { ...cto, currentValue: ctoForm.currentValue, totalInvested: ctoForm.totalInvested } },
    });
    setEditCTO(false);
  };

  return (
    <div className="fade-up" style={{ maxWidth: 900 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Financial Markets</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Vertical Markets · Niveau {vLevel}</p>
        </div>
      </div>

      {/* Level bar */}
      <div className="card mb-6" style={{ padding: '12px 16px', borderTop: '2px solid #8B6FCA' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold" style={{ color: '#8B6FCA' }}>Markets Niveau {vLevel}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
            {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
          </span>
        </div>
        <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
          <div className="progress-bar-fill"
            style={{ width: `${Math.min(100, (xpInLevel / xpNeeded) * 100)}%`, background: '#8B6FCA' }} />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Portefeuille total', value: formatCurrency(totalPortfolio), color: '#8B6FCA' },
          { label: 'Total investi', value: formatCurrency(totalInvested), color: 'var(--text)' },
          { label: 'Plus-value', value: `${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain)}`, color: totalGain >= 0 ? '#3DC98A' : '#E05C5C' },
          { label: 'Performance', value: `${gainPct >= 0 ? '+' : ''}${gainPct}%`, color: gainPct >= 0 ? '#3DC98A' : '#E05C5C' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ borderTop: '2px solid #8B6FCA' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className="font-mono text-lg font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* PEA Card */}
        <div className="card" style={{ borderTop: '2px solid #8B6FCA' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: '#8B6FCA' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>PEA</h3>
              {pea.openDate ? (
                <span className="pill pill-veteran" style={{ fontSize: 10 }}>Actif depuis {pea.openDate.split('-')[0]}</span>
              ) : (
                <span className="pill pill-timed" style={{ fontSize: 10 }}>Non ouvert</span>
              )}
            </div>
            <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setEditPEA(!editPEA)}>
              <Edit2 size={12} />
            </button>
          </div>

          {!pea.openDate && !showOpenPEA && (
            <div className="mb-3">
              <button
                className="btn w-full"
                style={{ background: '#8B6FCA', color: '#fff', width: '100%' }}
                onClick={() => setShowOpenPEA(true)}
              >
                + Ouvrir le PEA (+300 XP)
              </button>
            </div>
          )}

          {showOpenPEA && !pea.openDate && (
            <div className="mb-3 p-3 rounded-lg fade-up" style={{ background: 'var(--navy-700)' }}>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Montant initial versé (€)</label>
              <input type="number" value={openPEAAmount} onChange={e => setOpenPEAAmount(Number(e.target.value))} />
              <div className="flex gap-2 mt-2">
                <button
                  className="btn btn-primary flex-1"
                  style={{ background: '#8B6FCA' }}
                  onClick={() => {
                    dispatch({ type: 'OPEN_PEA', amount: openPEAAmount });
                    setShowOpenPEA(false);
                  }}
                >
                  Confirmer l'ouverture
                </button>
                <button className="btn btn-ghost" onClick={() => setShowOpenPEA(false)}>Annuler</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Valeur actuelle</p>
              <p className="font-mono font-bold text-lg" style={{ color: '#8B6FCA' }}>{formatCurrency(pea.currentValue)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Total investi</p>
              <p className="font-mono font-bold text-lg" style={{ color: 'var(--text)' }}>{formatCurrency(pea.totalInvested)}</p>
            </div>
          </div>

          {/* PEA plafond progress */}
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
              <span>Plafond légal</span>
              <span className="font-mono">{formatCurrency(pea.totalInvested)} / 150K€</span>
            </div>
            <div className="progress-bar" style={{ height: 4, borderRadius: 2 }}>
              <div className="progress-bar-fill"
                style={{ width: `${Math.min(100, (pea.totalInvested / 150000) * 100)}%`, background: '#8B6FCA' }} />
            </div>
          </div>

          {editPEA && (
            <div className="mt-3 flex flex-col gap-2 fade-up" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Valeur actuelle (€)</label>
                <input type="number" value={peaForm.currentValue} onChange={e => setPeaForm(f => ({ ...f, currentValue: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Total versé (€)</label>
                <input type="number" value={peaForm.totalInvested} onChange={e => setPeaForm(f => ({ ...f, totalInvested: Number(e.target.value) }))} />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={handleSavePEA}>Sauvegarder</button>
                <button className="btn btn-ghost" onClick={() => setEditPEA(false)}>Annuler</button>
              </div>
            </div>
          )}
        </div>

        {/* CTO Card */}
        <div className="card" style={{ borderTop: '2px solid #388BDC' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} style={{ color: '#388BDC' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>CTO</h3>
            </div>
            <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setEditCTO(!editCTO)}>
              <Edit2 size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Valeur actuelle</p>
              <p className="font-mono font-bold text-lg" style={{ color: '#388BDC' }}>{formatCurrency(cto.currentValue)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Total investi</p>
              <p className="font-mono font-bold text-lg" style={{ color: 'var(--text)' }}>{formatCurrency(cto.totalInvested)}</p>
            </div>
          </div>

          {/* 500K target */}
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
              <span>Objectif 500K€</span>
              <span className="font-mono">{formatCurrency(cto.currentValue)} / 500K€</span>
            </div>
            <div className="progress-bar" style={{ height: 4, borderRadius: 2 }}>
              <div className="progress-bar-fill"
                style={{ width: `${Math.min(100, (cto.currentValue / 500000) * 100)}%`, background: '#388BDC' }} />
            </div>
          </div>

          {editCTO && (
            <div className="mt-3 flex flex-col gap-2 fade-up" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Valeur actuelle (€)</label>
                <input type="number" value={ctoForm.currentValue} onChange={e => setCtoForm(f => ({ ...f, currentValue: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Total versé (€)</label>
                <input type="number" value={ctoForm.totalInvested} onChange={e => setCtoForm(f => ({ ...f, totalInvested: Number(e.target.value) }))} />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={handleSaveCTO}>Sauvegarder</button>
                <button className="btn btn-ghost" onClick={() => setEditCTO(false)}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* DCA Tracker */}
        <div className="card" style={{ borderTop: '2px solid #8B6FCA' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>DCA Tracker</h3>
            <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setEditDCA(!editDCA)}>
              <Edit2 size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Mensuel programmé</p>
              <p className="font-mono font-bold text-lg" style={{ color: '#8B6FCA' }}>{formatCurrency(dca.monthlyAmount)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Mois consécutifs</p>
              <p className="font-mono font-bold text-lg" style={{ color: consecutiveDCAMonths >= 12 ? '#3DC98A' : '#E4A94B' }}>
                {consecutiveDCAMonths}
              </p>
            </div>
          </div>

          {/* 12 months progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
              <span>DCA Warrior (12 mois)</span>
              <span className="font-mono">{consecutiveDCAMonths}/12</span>
            </div>
            <div className="progress-bar" style={{ height: 4, borderRadius: 2 }}>
              <div className="progress-bar-fill"
                style={{ width: `${Math.min(100, (consecutiveDCAMonths / 12) * 100)}%`, background: '#8B6FCA' }} />
            </div>
          </div>

          {editDCA && (
            <div className="flex flex-col gap-2 fade-up" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Montant mensuel (€)</label>
                <input type="number" value={dcaForm} onChange={e => setDcaForm(Number(e.target.value))} />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary"
                  onClick={() => {
                    dispatch({ type: 'UPDATE_MARKETS', updates: { dca: { ...dca, monthlyAmount: dcaForm } } });
                    setEditDCA(false);
                  }}
                >Sauvegarder</button>
                <button className="btn btn-ghost" onClick={() => setEditDCA(false)}>Annuler</button>
              </div>
            </div>
          )}

          {/* DCA History */}
          {dca.history.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Historique versements</p>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {[...dca.history].reverse().slice(0, 8).map((entry, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span style={{ color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>{formatDate(entry.date)}</span>
                    <span className="font-mono font-bold" style={{ color: '#8B6FCA' }}>+{formatCurrency(entry.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emergency Fund */}
        <div className="card" style={{ borderTop: `2px solid ${emergencyFund >= 9000 ? '#3DC98A' : '#E05C5C'}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: emergencyFund >= 9000 ? '#3DC98A' : '#E05C5C' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Fonds d'urgence</h3>
            </div>
            <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setEditEF(!editEF)}>
              <Edit2 size={12} />
            </button>
          </div>

          <p
            className="font-mono font-bold mb-2"
            style={{ fontSize: 32, color: emergencyFund >= 9000 ? '#3DC98A' : '#E05C5C' }}
          >
            {formatCurrency(emergencyFund)}
          </p>

          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
              <span>Objectif 9 000€</span>
              <span className="font-mono">{Math.min(100, (emergencyFund / 9000) * 100).toFixed(0)}%</span>
            </div>
            <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
              <div className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, (emergencyFund / 9000) * 100)}%`,
                  background: emergencyFund >= 9000 ? '#3DC98A' : '#E05C5C',
                }}
              />
            </div>
          </div>

          {emergencyFund >= 9000 && (
            <p className="text-xs" style={{ color: '#3DC98A' }}>✓ Fonds sanctuaire atteint!</p>
          )}
          {emergencyFund < 9000 && (
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Encore {formatCurrency(9000 - emergencyFund)} pour le seuil
            </p>
          )}

          {editEF && (
            <div className="mt-3 flex flex-col gap-2 fade-up" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <input type="number" value={efForm} onChange={e => setEfForm(Number(e.target.value))} />
              <div className="flex gap-2">
                <button className="btn btn-primary"
                  onClick={() => {
                    dispatch({ type: 'UPDATE_MARKETS', updates: { emergencyFund: efForm } });
                    setEditEF(false);
                  }}
                >Sauvegarder</button>
                <button className="btn btn-ghost" onClick={() => setEditEF(false)}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DCA Growth Chart */}
      {dcaChartData.length > 1 && (
        <div className="card" style={{ borderTop: '2px solid #8B6FCA' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Progression versements DCA
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={dcaChartData}>
              <defs>
                <linearGradient id="dcaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B6FCA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B6FCA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#4E6A88', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#4E6A88', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => formatCurrency(v)} width={55} />
              <Tooltip
                contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 6 }}
                formatter={v => [formatCurrency(v), 'Versé']}
              />
              <Area type="monotone" dataKey="total" stroke="#8B6FCA" fill="url(#dcaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
