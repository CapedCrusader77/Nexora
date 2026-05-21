'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { Settings, Shield, Bell, Layout } from 'lucide-react';

export default function SettingsPage() {
  const { network, switchNetwork } = useWeb3();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-cyan-400" />
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="space-y-8">
        <div className="border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-3xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
            <Layout className="w-4 h-4 text-cyan-400" /> User Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70">Enable Notifications</div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-11 h-6 rounded-full transition duration-300 relative ${notifications ? 'bg-cyan-500' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 bg-black rounded-full absolute top-1 transition-all duration-300 ${notifications ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70">Dark Theme</div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`w-11 h-6 rounded-full transition duration-300 relative ${darkMode ? 'bg-cyan-500' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 bg-black rounded-full absolute top-1 transition-all duration-300 ${darkMode ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-3xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
            <Shield className="w-4 h-4 text-cyan-400" /> Active Blockchain Network
          </h3>
          <p className="text-xs text-white/50 mb-4">
            Select which network to execute transactions on. We recommend Polygon Amoy testnet for secure, zero-cost sandbox testing.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'polygon-amoy', label: 'Polygon Amoy Testnet' },
              { id: 'ethereum-mainnet', label: 'Ethereum Mainnet (Read-only)' }
            ].map((net) => (
              <button
                key={net.id}
                onClick={() => switchNetwork(net.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition ${
                  network === net.id 
                    ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-black shadow-lg shadow-cyan-950/20' 
                    : 'border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {net.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
