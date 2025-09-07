'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export default function WalletConnect({ fullWidth = false, size = 'md' }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();
  const { setFrameReady, isFrameReady } = useMiniKit();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Set frame ready when component mounts
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Try to connect with the first available connector (usually Farcaster)
      if (connectors.length > 0) {
        await connect({ connector: connectors[0], chainId: baseSepolia.id });
        try {
          await switchChainAsync({ chainId: baseSepolia.id });
        } catch (_) {}
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && chainId !== baseSepolia.id) {
      switchChainAsync({ chainId: baseSepolia.id }).catch(() => {});
    }
  }, [isConnected, chainId, switchChainAsync]);

  const handleDisconnect = () => {
    disconnect();
  };

   // Copy address functionality
  const copyAddressToClipboard = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const sizeClass = size === 'lg' ? 'h-12 px-6 text-base' : 'px-6 py-2';

  return (
    <div className="wallet-connect-container">
      {isConnected ? (
        <div className="wallet-connected">
           {/* Clickable Address Display */}
          <button
            onClick={copyAddressToClipboard}
            className="wallet-address-button"
            title="Click to copy full address"
          >
            <span className="wallet-icon">👤</span>
            <span className="wallet-address-text">
              {copiedAddress ? 'Copied!' : formatAddress(address)}
            </span>
            {copiedAddress && <span className="copy-check">✓</span>}
            
          </button>

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="wallet-disconnect-button"
          >
            <span className="disconnect-icon">🚪</span>
            <span className="disconnect-text">Disconnect</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className={`wallet-connect-button ${widthClass} ${sizeClass}`}
        >
          <span className="wallet-connect-icon">💳</span>
          <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>
      )}
    </div>
  );
}