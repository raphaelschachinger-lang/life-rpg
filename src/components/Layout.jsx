import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import Dashboard from '../screens/Dashboard';
import WeeklyReview from '../screens/WeeklyReview';
import RealEstate from '../screens/RealEstate';
import Trading from '../screens/Trading';
import FinancialMarkets from '../screens/FinancialMarkets';
import Health from '../screens/Health';
import Achievements from '../screens/Achievements';
import LootShop from '../screens/LootShop';
import Character from '../screens/Character';
import Carte from '../screens/Carte';

const SCREENS = {
  dashboard:    Dashboard,
  immo:         RealEstate,
  trading:      Trading,
  markets:      FinancialMarkets,
  health:       Health,
  achievements: Achievements,
  review:       WeeklyReview,
  loot:         LootShop,
  character:    Character,
  carte:        Carte,
};

export default function Layout() {
  const { state } = useGame();
  const Screen = SCREENS[state.ui.currentScreen] || Dashboard;
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.ui.theme || 'dark');
  }, [state.ui.theme]);

  // Close the mobile nav drawer whenever the screen changes.
  useEffect(() => { setNavOpen(false); }, [state.ui.currentScreen]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Topbar navOpen={navOpen} onMenuClick={() => setNavOpen(o => !o)} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar isOpen={navOpen} onClose={() => setNavOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Screen />
        </main>
      </div>
    </div>
  );
}
