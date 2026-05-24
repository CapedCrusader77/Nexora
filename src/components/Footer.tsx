'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield, ExternalLink, Globe, Github, Twitter, Mail, Heart, Zap, Code2
} from 'lucide-react';
import {
  NFT_ADDRESS, MARKETPLACE_ADDRESS, AUCTION_ADDRESS,
  EXPLORER_BASE_URL, getExplorerAddressUrl
} from '../utils/constants';

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-white/[0.06]">
      {/* Subtle gradient divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          {/* ── Column 1: EtherAuthority Branding ────────────────────── */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-indigo-700/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-white tracking-tight">
                  EtherAuthority
                </h3>
                <p className="text-[10px] text-white/40 tracking-wide uppercase">
                  Training Program
                </p>
              </div>
            </div>
            <p className="text-xs text-white/40 leading-relaxed mb-4">
              Developed under the <span className="text-blue-400 font-medium">EtherAuthority Internship Training Program</span>.
              Building production-grade decentralized applications on Polygon & Ethereum.
            </p>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">Polygon Amoy Testnet</span>
            </div>
          </div>

          {/* ── Column 2: Quick Links ────────────────────────────────── */}
          <div>
            <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <nav className="space-y-2.5">
              {[
                { href: '/explore', label: 'Explore NFTs' },
                { href: '/collections', label: 'Collections' },
                { href: '/auctions', label: 'Live Auctions' },
                { href: '/create', label: 'Create NFT' },
                { href: '/activity', label: 'Activity Feed' },
                { href: '/dashboard', label: 'Analytics' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-xs text-white/40 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Column 3: Smart Contracts ────────────────────────────── */}
          <div>
            <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5" /> Smart Contracts
            </h4>
            <div className="space-y-3">
              {[
                { name: 'NFT Contract', address: NFT_ADDRESS },
                { name: 'Marketplace', address: MARKETPLACE_ADDRESS },
                { name: 'Auction House', address: AUCTION_ADDRESS },
              ].map(contract => (
                <a
                  key={contract.name}
                  href={getExplorerAddressUrl(contract.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white/50 group-hover:text-white transition-colors text-[11px]">
                      {contract.name}
                    </div>
                    <div className="text-white/25 font-mono text-[10px] truncate">
                      {shortenAddress(contract.address)}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                </a>
              ))}
              <a
                href={EXPLORER_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-[10px] text-cyan-400/60 hover:text-cyan-400 transition-colors"
              >
                <Globe className="w-3 h-3" />
                View on Polygonscan
              </a>
            </div>
          </div>

          {/* ── Column 4: Resources ──────────────────────────────────── */}
          <div>
            <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-4">
              Resources
            </h4>
            <nav className="space-y-2.5">
              <a
                href="https://etherauthority.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-blue-400 transition-colors"
              >
                <Shield className="w-3 h-3" /> EtherAuthority
              </a>
              <a
                href="https://amoy.polygonscan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
              >
                <Globe className="w-3 h-3" /> Polygon Amoy Explorer
              </a>
              <a
                href="https://www.alchemy.com/faucets/polygon-amoy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
              >
                <Zap className="w-3 h-3" /> Get Testnet MATIC
              </a>
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> MetaMask Wallet
              </a>
            </nav>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Github, href: 'https://github.com', label: 'GitHub' },
                { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                { icon: Mail, href: 'mailto:contact@etherauthority.io', label: 'Email' },
              ].map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all"
                >
                  <social.icon className="w-3.5 h-3.5 text-white/40" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ─────────────────────────────────────────────── */}
        <div className="border-t border-white/[0.06] py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-white/30">
            <span>© {currentYear} NEXORA Marketplace</span>
            <span className="text-white/10">•</span>
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-rose-500/60" /> under
              <a
                href="https://etherauthority.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400/70 hover:text-blue-400 transition-colors font-medium"
              >
                EtherAuthority
              </a>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/20">
            <span>Solidity v0.8.24</span>
            <span className="text-white/10">•</span>
            <span>ERC-721 + ERC-2981</span>
            <span className="text-white/10">•</span>
            <span>Polygon Amoy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
