import React from 'react';
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

const SCREENS = {
  dashboard:    Dashboard,
  immo:         RealEstate,
  trading:      Trading,
  markets:      FinancialMarkets,
  health:       Health,
  achievements: Achievements,
  review:       WeeklyReview,
  loot:         LootShop,
};

export default function Layout() {
  const { state } = useGame();
  const Screen = SCREENS[state.ui.currentScreen] || Dashboard;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Topbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--navy-900)',
            padding: '24px',
          }}
        >
          <Screen />
        </main>
      </div>
    </div>
  );
}
