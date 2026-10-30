import { Transaction } from '@mysten/sui/transactions';
import { DiceRollResult } from '../types';
import { PACKAGE_IDS } from '../dapp-kit';

export const SUI_RANDOM_OBJECT_ID = '0x8';
export const DEFAULT_PACKAGE_ID = PACKAGE_IDS.testnet;

/**
 * Builds the Programmable Transaction Block (PTB) invoking the dice Move smart contract.
 * Passes the native Sui Random shared object (0x8) to the private entry function.
 */
export function buildPlayGuessTransaction(packageId: string, guess: number): Transaction {
  const targetPackage = packageId && packageId !== '0x0' ? packageId : DEFAULT_PACKAGE_ID;
  const tx = new Transaction();
  tx.moveCall({
    target: `${targetPackage}::dice_game::play_guess`,
    arguments: [
      tx.pure.u8(guess),
      tx.object(SUI_RANDOM_OBJECT_ID),
    ],
  });
  return tx;
}

/**
 * Local simulation engine matching the Move contract logic 1:1.
 * Useful for instant risk-free testing without wallet/network latency.
 */
export function simulateDiceRoll(guess: number): DiceRollResult {
  const rolled = Math.floor(Math.random() * 6) + 1;
  const won = guess === rolled;
  const pseudoId = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  return {
    id: pseudoId,
    guess,
    rolled,
    won,
    timestamp: Date.now(),
    isOnChain: false,
  };
}
