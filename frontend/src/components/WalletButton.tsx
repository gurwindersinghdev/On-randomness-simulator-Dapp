import React, { useState } from 'react';
import { useCurrentAccount, useWallets, useDAppKit, useCurrentNetwork } from '@mysten/dapp-kit-react';
import { Wallet, LogOut, ChevronDown, CheckCircle, ExternalLink } from 'lucide-react';

export const WalletButton: React.FC = () => {
  const account = useCurrentAccount();
  const wallets = useWallets();
  const dAppKit = useDAppKit();
  const network = useCurrentNetwork();
  const [isOpen, setIsOpen] = useState(false);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async (w: any) => {
    try {
      await dAppKit.connectWallet({ wallet: w });
      setIsOpen(false);
    } catch (e) {
      console.error('Wallet connection error:', e);
    }
  };

  const handleDisconnect = async () => {
    try {
      await dAppKit.disconnectWallet();
      setIsOpen(false);
    } catch (e) {
      console.error('Disconnect error:', e);
    }
  };

  if (account) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-mono font-medium text-white transition-all shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{shortenAddress(account.address)}</span>
          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
            {network}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-stone-950 border border-stone-800 p-2 shadow-2xl z-50 animate-in fade-in duration-150">
            <div className="px-3 py-2 border-b border-stone-800">
              <span className="text-[10px] text-stone-500 font-mono block">CONNECTED ADDRESS</span>
              <p className="text-xs font-mono text-stone-300 break-all">{account.address}</p>
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 text-xs font-bold transition-all shadow-md active:scale-95"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-stone-950 border border-stone-800 p-2.5 shadow-2xl z-50 animate-in fade-in duration-150">
          <div className="px-2 py-1.5 mb-1.5 border-b border-stone-800">
            <span className="text-xs font-bold text-white block">Select Sui Wallet</span>
            <span className="text-[10px] text-stone-400">Choose an installed wallet standard provider</span>
          </div>

          {wallets.length > 0 ? (
            <div className="space-y-1">
              {wallets.map((w) => (
                <button
                  key={w.name}
                  onClick={() => handleConnect(w)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-900 border border-transparent hover:border-stone-800 transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {w.icon && <img src={w.icon} alt={w.name} className="w-5 h-5 rounded-md" />}
                    <span className="text-xs font-semibold text-white">{w.name}</span>
                  </div>
                  <CheckCircle className="w-3.5 h-3.5 text-stone-600" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center space-y-2">
              <p className="text-xs text-stone-400">No browser wallet detected.</p>
              <a
                href="https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-medium"
              >
                <span>Get Sui Wallet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

