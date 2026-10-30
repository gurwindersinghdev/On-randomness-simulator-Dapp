#[test_only]
module dice::dice_game_tests;

use dice::dice_game;

#[test]
fun correct_guess_returns_true() {
    assert!(dice_game::check_guess(4, 4));
    assert!(dice_game::check_guess(1, 1));
    assert!(dice_game::check_guess(6, 6));
}

#[test]
fun incorrect_guess_returns_false() {
    assert!(!dice_game::check_guess(3, 5));
    assert!(!dice_game::check_guess(1, 6));
    assert!(!dice_game::check_guess(2, 4));
}

