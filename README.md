# Sui On-Chain Dice Simulator

A verifiable dice dApp built on **Sui Move 2024** and **Sui TypeScript SDK v2**, utilizing native **Sui Onchain Randomness (`0x8`)** with an interactive React frontend managed via **pnpm**.

---

## 📦 Live Published Package (Sui Testnet)

* **Package ID:** [`0x3fddcb15384de9097c6dbf82b899094d332691e36662a4b02525cf4ec12f3588`](https://suiscan.xyz/testnet/object/0x3fddcb15384de9097c6dbf82b899094d332691e36662a4b02525cf4ec12f3588)
* **Upgrade Capability:** `0xa8d3ecf2a9572cce708992f1862b85f2c1e3bd7842bdfb262a800fb8f5178c0c`
* **Target Module:** `dice::dice_game`
* **Entry Function:** `play_guess(guess: u8, r: &Random, ctx: &mut TxContext)`

---

## 🌟 Architecture & Features

```
simulator/
├── README.md                      # Comprehensive documentation
├── contracts/                     # Sui Move 2024 smart contracts
│   ├── Move.toml                  # Minimal modern package manifest
│   ├── Published.toml             # Live Testnet publication metadata
│   ├── sources/
│   │   └── dice.move              # Core dice contract consuming 0x8 Randomness
│   └── tests/
│       └── dice_tests.move        # Unit tests (sui move test)
└── frontend/                      # React 18 + Vite + TypeScript (pnpm)
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── dapp-kit.ts            # Published package IDs & SuiGrpcClient
    │   ├── types.ts               # Roll records & stats interfaces
    │   ├── utils/
    │   │   └── suiDice.ts         # PTB construction with tx.object('0x8') & simulator
    │   ├── components/
    │   │   ├── DiceFace.tsx       # 3D-styled animated dice face (1-6 pips)
    │   │   ├── StatsBar.tsx       # Rolls, wins, win rate %, streaks
    │   │   ├── RollHistory.tsx    # Live ledger of rolls with IDs & badges
    │   │   └── WalletButton.tsx   # Sui Wallet Standard integration
    │   ├── App.tsx                # Main dice application & state management
    │   └── main.tsx
```

---

## 🎲 1. Move Smart Contract (`contracts/sources/dice.move`)

### Native On-Chain Randomness (`0x8`)
Unlike Ethereum where randomness requires off-chain oracles (Chainlink VRF), Sui provides cryptographic threshold randomness generated natively by validators at consensus.

```move
module dice::dice_game;

use sui::event;
use sui::random::{Self, Random};

public struct DiceTicket has key, store {
    id: UID,
    guess: u8,
    rolled: u8,
    won: bool,
}

public struct DiceRolled has copy, drop {
    ticket_id: ID,
    player: address,
    guess: u8,
    rolled: u8,
    won: bool,
}

/// Rolls dice (1-6) and checks player's prediction using Sui native Randomness.
/// Must be a private 'entry' function for security.
entry fun play_guess(guess: u8, r: &Random, ctx: &mut TxContext) {
    assert!(guess >= 1 && guess <= 6, 0);

    let mut generator = r.new_generator(ctx);
    let rolled = generator.generate_u8_in_range(1, 6);
    let won = (guess == rolled);

    let id = object::new(ctx);
    let ticket_id = id.to_inner();

    let ticket = DiceTicket { id, guess, rolled, won };

    event::emit(DiceRolled {
        ticket_id,
        player: ctx.sender(),
        guess,
        rolled,
        won,
    });

    transfer::public_transfer(ticket, ctx.sender());
}
```

### Security Rules Enforced:
1. **Private `entry` function**: Prevents other Move contracts from composing over the function and calling `assert!(won)` to abort losing dice rolls (abort-filtering attacks).
2. **Local PRG instantiation**: `r.new_generator(ctx)` is always instantiated inside the consuming function so its internal state is never leaked or predicted.

---

## 💻 2. Frontend & Sui TypeScript SDK v2 (`frontend/`)

### Published Package Configuration (`src/dapp-kit.ts`):
```typescript
export const PACKAGE_IDS = {
  testnet: '0x3fddcb15384de9097c6dbf82b899094d332691e36662a4b02525cf4ec12f3588',
};
```

### PTB Call with Random Object (`0x8`):
```typescript
import { Transaction } from '@mysten/sui/transactions';

export function buildPlayGuessTransaction(packageId: string, guess: number): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::dice_game::play_guess`,
    arguments: [
      tx.pure.u8(guess),
      tx.object('0x8'), // Immutable Sui Random shared object
    ],
  });
  return tx;
}
```

---

## 🚀 Quick Start Guide

### Step 1: Run Move Unit Tests
```bash
cd /home/biotech/BUILD/simulator/contracts
sui move test
sui move build
```

### Step 2: Install Dependencies & Run Frontend (via pnpm)
```bash
cd /home/biotech/BUILD/simulator/frontend
pnpm install
pnpm run dev
```

Open your browser at **http://localhost:5174/** to start playing with the live published contract!
