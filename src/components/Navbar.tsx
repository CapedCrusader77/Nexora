import React, { useState, useEffect } from 'react';
import { useWeb3, WalletType, NetworkType } from '../context/Web3Context';
import { 
  Wallet, 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  TrendingUp, 
  Coins, 
  LogOut, 
  Radio, 
  Grid, 
  PlusSquare, 
  LayoutDashboard, 
  Code2, 
  User as UserIcon,
  Clock
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    isConnected, 
    walletAddress, 
    balance, 
    network, 
    notifications,
    connectWallet, 
    disconnectWallet, 
    switchNetwork,
    markNotificationsAsRead,
    setSimulatorOpen,
    isSimulatorOpen
  } = useWeb3();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const getNetworkColor = (net: NetworkType) => {
    switch (net) {
      case 'polygon-amoy': return 'from-purple-500 to-indigo-600 shadow-purple-900/50';
      case 'ethereum-mainnet': return 'from-blue-500 to-cyan-600 shadow-blue-900/50';
      case 'arbitrum': return 'from-blue-600 to-blue-800 shadow-blue-900/50';
      case 'optimism': return 'from-red-500 to-rose-600 shadow-red-900/50';
      default: return 'from-zinc-700 to-zinc-800';
    }
  };

  const getNetworkName = (net: NetworkType) => {
    switch (net) {
      case 'polygon-amoy': return 'Polygon Amoy';
      case 'ethereum-mainnet': return 'Ethereum';
      case 'arbitrum': return 'Arbitrum';
      case 'optimism': return 'Optimism';
      default: return 'Unknown';
    }
  };

  const handleConnect = async (type: WalletType) => {
    await connectWallet(type);
    setShowConnectModal(false);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsWalletDropdownOpen(false);
      setIsNetworkDropdownOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div 
              className="flex cursor-pointer items-center space-x-3" 
              onClick={() => setCurrentTab('landing')}
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-fuchsia-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-fuchsia-500"></div>
              </div>
              <span className="bg-gradient-to-r from-white via-zinc-200 to-cyan-400 bg-clip-text text-2xl font-extrabold tracking-wider text-transparent font-rajdhani">
                CYBER<span className="text-cyan-400">SPACE</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { id: 'landing', label: 'Home', icon: TrendingUp },
                { id: 'marketplace', label: 'Explore', icon: Grid },
                { id: 'auctions', label: 'Live Auctions', icon: Radio },
                { id: 'create', label: 'Create NFT', icon: PlusSquare },
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'contracts', label: 'Smart Contracts', icon: Code2 }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-zinc-800/80 text-cyan-400 shadow-inner shadow-cyan-500/5 border border-zinc-700/50' 
                        : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Wallet & Notifications */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Simulator trigger button */}
              <button 
                onClick={() => setSimulatorOpen(!isSimulatorOpen)}
                className="flex items-center space-x-2 rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-2 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/10 transition duration-300 shadow-md shadow-cyan-950/30 hover:border-cyan-400"
              >
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></div>
                <span>Dev Simulator</span>
              </button>

              {/* Notification icon */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNotifDropdownOpen(!isNotifDropdownOpen);
                    setIsWalletDropdownOpen(false);
                    setIsNetworkDropdownOpen(false);
                  }}
                  className="relative rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-400 hover:text-white transition duration-300"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-500 text-[10px] font-bold text-white ring-2 ring-zinc-950">
                      {unreadNotifs}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl z-50">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                      <h4 className="text-sm font-bold text-white">Notifications</h4>
                      {unreadNotifs > 0 && (
                        <button 
                          onClick={markNotificationsAsRead}
                          className="text-[11px] text-cyan-400 hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-zinc-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-2 rounded-lg text-xs border ${
                              notif.read ? 'bg-zinc-900/20 border-zinc-900/40' : 'bg-zinc-900/60 border-zinc-800'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-semibold text-zinc-200">{notif.title}</span>
                              <span className="text-[10px] text-zinc-500 flex items-center">
                                <Clock className="h-3 w-3 mr-0.5" />
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-zinc-400 mt-1">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Wallet actions */}
              {isConnected && walletAddress ? (
                <div className="flex items-center space-x-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-1.5 pl-3">
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-zinc-400 font-medium">Balance</span>
                    <span className="text-sm font-bold text-white flex items-center">
                      <Coins className="h-3.5 w-3.5 mr-1 text-cyan-400" />
                      {balance.toFixed(3)} MATIC
                    </span>
                  </div>

                  {/* Network Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsNetworkDropdownOpen(!isNetworkDropdownOpen);
                        setIsWalletDropdownOpen(false);
                        setIsNotifDropdownOpen(false);
                      }}
                      className="flex items-center space-x-1.5 rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                      <span>{getNetworkName(network)}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                    </button>

                    {isNetworkDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl z-50">
                        <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Select Network</span>
                        {[
                          { id: 'polygon-amoy', name: 'Polygon Amoy' },
                          { id: 'ethereum-mainnet', name: 'Ethereum Mainnet' },
                          { id: 'arbitrum', name: 'Arbitrum One' },
                          { id: 'optimism', name: 'Optimism Mainnet' }
                        ].map((net) => (
                          <button
                            key={net.id}
                            onClick={() => switchNetwork(net.id as NetworkType)}
                            className={`w-full text-left px-2.5 py-2 text-xs rounded-lg flex items-center space-x-2 transition ${
                              network === net.id 
                                ? 'bg-zinc-800 text-cyan-400 font-bold' 
                                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                            }`}
                          >
                            <span className={`h-2 w-2 rounded-full ${network === net.id ? 'bg-cyan-400' : 'bg-zinc-700'}`}></span>
                            <span>{net.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Wallet address and details */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsWalletDropdownOpen(!isWalletDropdownOpen);
                        setIsNetworkDropdownOpen(false);
                        setIsNotifDropdownOpen(false);
                      }}
                      className={`flex items-center space-x-2 rounded-lg bg-gradient-to-r ${getNetworkColor(network)} px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all duration-300 hover:brightness-110`}
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      <span>{walletAddress}</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                    </button>

                    {isWalletDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl z-50">
                        <div className="px-3 py-2 border-b border-zinc-800 mb-2">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block">Connected Account</span>
                          <span className="text-xs text-white font-mono block break-all mt-0.5">{walletAddress}</span>
                        </div>
                        <button
                          onClick={() => setCurrentTab('profile')}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white flex items-center space-x-2 transition"
                        >
                          <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setSimulatorOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white flex items-center space-x-2 transition"
                        >
                          <Coins className="h-3.5 w-3.5 text-zinc-500" />
                          <span>MATIC Test Faucet</span>
                        </button>
                        <button
                          onClick={disconnectWallet}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 flex items-center space-x-2 transition border-t border-zinc-800/80 mt-2 pt-2"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Disconnect Wallet</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/30"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="flex md:hidden items-center space-x-3">
              <button 
                onClick={() => setSimulatorOpen(!isSimulatorOpen)}
                className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-2 text-xs text-cyan-400"
              >
                Sim
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-400 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-950/95 px-4 py-4 space-y-3 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col space-y-1">
              {[
                { id: 'landing', label: 'Home', icon: TrendingUp },
                { id: 'marketplace', label: 'Explore', icon: Grid },
                { id: 'auctions', label: 'Live Auctions', icon: Radio },
                { id: 'create', label: 'Create NFT', icon: PlusSquare },
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'contracts', label: 'Smart Contracts', icon: Code2 }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCurrentTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-zinc-850 text-cyan-400 border border-zinc-800' 
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-zinc-800 pt-3 flex flex-col space-y-3">
              {isConnected ? (
                <>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-xs text-zinc-400">Balance</span>
                    <span className="text-sm font-bold text-white">{balance.toFixed(3)} MATIC</span>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab('profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl border border-zinc-800 text-center text-sm font-semibold text-white hover:bg-zinc-900"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={disconnectWallet}
                    className="w-full py-2.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-center text-sm font-semibold text-rose-400 hover:bg-rose-950/40"
                  >
                    Disconnect Wallet
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowConnectModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-center text-sm font-bold text-white"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Wallet Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white font-rajdhani">Connect Wallet</h3>
              <button 
                onClick={() => setShowConnectModal(false)}
                className="rounded-lg bg-zinc-900 p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-xs text-zinc-400 mt-3 mb-5">
              Connect to your Web3 provider or trigger the built-in Developer Simulator. Operates securely on Polygon Amoy.
            </p>

            <div className="space-y-3">
              {[
                { 
                  id: 'metamask', 
                  name: 'MetaMask', 
                  desc: 'Connect to your MetaMask Wallet extension',
                  iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-metamask-2728406-2261817.png' 
                },
                { 
                  id: 'coinbase', 
                  name: 'Coinbase Wallet', 
                  desc: 'Connect using Coinbase web browser or app',
                  iconUrl: 'https://images.ctfassets.net/q5ulk41553rk/2e06180a-9d95-46eb-a1d2-a720dc2f1d97/55b3c37c22998317ef74020a1eb97fb0/coinbase-wallet-logo.png' 
                },
                { 
                  id: 'walletconnect', 
                  name: 'WalletConnect', 
                  desc: 'Scan QR code with your mobile wallet app',
                  iconUrl: 'https://altcoinsbox.com/wp-content/uploads/2023/04/walletconnect-logo.png' 
                },
                { 
                  id: 'simulated', 
                  name: 'Developer Simulator', 
                  desc: 'Instantly sign transactions with pre-funded developer accounts',
                  isSim: true
                }
              ].map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id as WalletType)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/20 hover:bg-zinc-900/60 transition group text-left ${
                    wallet.isSim ? 'border-cyan-500/20 hover:border-cyan-500/60 bg-cyan-950/5' : ''
                  }`}
                >
                  <div>
                    <span className={`font-bold text-sm block group-hover:text-white ${wallet.isSim ? 'text-cyan-400' : 'text-zinc-200'}`}>
                      {wallet.name} {wallet.isSim && <span className="ml-1 text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">Recomended</span>}
                    </span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">{wallet.desc}</span>
                  </div>
                  {wallet.iconUrl ? (
                    <img 
                      src={wallet.iconUrl} 
                      alt={wallet.name} 
                      className="h-7 w-7 object-contain rounded-md" 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Radio className="h-4 w-4 text-cyan-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-[10px] text-zinc-600">By connecting, you agree to our Web3 Terms & Privacy Protocol.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
