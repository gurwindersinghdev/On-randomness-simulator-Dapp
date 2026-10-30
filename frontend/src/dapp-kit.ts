import { createDAppKit } from '@mysten/dapp-kit-react';
import { SuiGrpcClient } from '@mysten/sui/grpc';

// Sui gRPC endpoints (Standard Sui v2)
const GRPC_URLS: Record<string, string> = {
  testnet: 'https://fullnode.testnet.sui.io:443',
  devnet: 'https://fullnode.devnet.sui.io:443',
  mainnet: 'https://fullnode.mainnet.sui.io:443',
  localnet: 'http://127.0.0.1:9000',
};

// Published Move Package IDs per network
export const PACKAGE_IDS: Record<string, string> = {
  testnet: '0x3fddcb15384de9097c6dbf82b899094d332691e36662a4b02525cf4ec12f3588',
  devnet: '0x0',
  mainnet: '0x0',
  localnet: '0x0',
};

export const UPGRADE_CAP_IDS: Record<string, string> = {
  testnet: '0xa8d3ecf2a9572cce708992f1862b85f2c1e3bd7842bdfb262a800fb8f5178c0c',
};

export const dAppKit = createDAppKit({
  networks: ['testnet', 'devnet', 'localnet', 'mainnet'],
  defaultNetwork: 'testnet',
  createClient: (network) =>
    new SuiGrpcClient({ network, baseUrl: GRPC_URLS[network] }),
});

declare module '@mysten/dapp-kit-react' {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}
