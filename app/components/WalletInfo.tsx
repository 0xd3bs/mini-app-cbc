'use client';

import { useAccount, useBalance } from 'wagmi';
import { shortenAddress } from '@/lib/utils'; // Crearemos este helper a continuación

export function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
  });

  if (!isConnected) {
    return null;
  }

  return (
    <div className="p-4 mt-8 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Wallet Conectada</h2>
      <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
        <p>
          <span className="font-semibold">Dirección:</span> {address ? shortenAddress(address) : ''}
        </p>
        <p>
          <span className="font-semibold">Saldo:</span> {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 ETH'}
        </p>
      </div>
    </div>
  );
}
