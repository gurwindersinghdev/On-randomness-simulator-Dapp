module dice::dice_game;

use sui::event;
use sui::random::{Self, Random};

// === Errors ===
const EInvalidGuess: u64 = 0;

// === Structs ===

/// On-chain verifiable record of a dice roll stored in the player's wallet
public struct DiceTicket has key, store {
    id: UID,
    guess: u8,
    rolled: u8,
    won: bool,
}

// === Events ===

public struct DiceRolled has copy, drop {
    ticket_id: ID,
    player: address,
    guess: u8,
    rolled: u8,
    won: bool,
}

// === Randomness Entry Functions ===

/// Rolls the dice with a prediction (1-6) using native Sui Onchain Randomness.
/// Must be private entry function to prevent composition and abort-filtering attacks.
entry fun play_guess(guess: u8, r: &Random, ctx: &mut TxContext) {
    assert!(guess >= 1 && guess <= 6, EInvalidGuess);

    let mut generator = r.new_generator(ctx);
    let rolled = generator.generate_u8_in_range(1, 6);
    let won = check_guess(guess, rolled);

    let id = object::new(ctx);
    let ticket_id = id.to_inner();

    let ticket = DiceTicket {
        id,
        guess,
        rolled,
        won,
    };

    event::emit(DiceRolled {
        ticket_id,
        player: ctx.sender(),
        guess,
        rolled,
        won,
    });

    transfer::public_transfer(ticket, ctx.sender());
}

/// Simple dice roll (1-6) without a guess requirement.
entry fun roll_dice(r: &Random, ctx: &mut TxContext) {
    play_guess(1, r, ctx);
}

// === Composable Helper Functions ===

public fun check_guess(guess: u8, rolled: u8): bool {
    guess == rolled
}

public fun guess(ticket: &DiceTicket): u8 { ticket.guess }
public fun rolled(ticket: &DiceTicket): u8 { ticket.rolled }
public fun won(ticket: &DiceTicket): bool { ticket.won }

