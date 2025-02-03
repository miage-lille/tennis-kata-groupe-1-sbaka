import { describe, expect, test } from '@jest/globals';
import { otherPlayer, playerToString } from '..';
import * as fc from 'fast-check';

import * as G from './generators';

describe('Tests for tooling functions', () => {
  test('Given playerOne when playerToString', () => {
    expect(playerToString('PLAYER_ONE')).toStrictEqual('Player 1');
  });

  test('Given playerOne when otherPlayer', () => {
    expect(otherPlayer('PLAYER_ONE')).toStrictEqual('PLAYER_TWO');
  });
});

describe('Tests for transition functions', () => {
  test('Given deuce, score is advantage to winner', () => {
    console.log('To fill when we will know how represent Deuce');
  });
  test('Given advantage when advantagedPlayer wins, score is Game avantagedPlayer', () => {
    console.log('To fill when we will know how represent Advantage');
  });
  test('Given advantage when otherPlayer wins, score is Deuce', () => {
    console.log('To fill when we will know how represent Advantage');
  });
  test('Given a player at 40 when the same player wins, score is Game for this player', () => {
    console.log('To fill when we will know how represent Forty');
  });
  test('Given player at 40 and other at 30 when other wins, score is Deuce', () => {
    console.log('To fill when we will know how represent Forty');
  });
  test('Given player at 40 and other at 15 when other wins, score is 40 - 15', () => {
    console.log('To fill when we will know how represent Forty');
  });
  // -------------------------TESTS POINTS-------------------------- //
  // test('Given players at 0 or 15 points score kind is still POINTS', () => {
  // fc.assert(
  //   fc.property(G.getPoints(), G.getPlayer(), ({ pointsData }, winner) => {
  //     throw new Error(
  //       'Your turn to code the preconditions, expected result and test.'
  //     );
  //   })
  // );
  // });
  // test('Given one player at 30 and win, score kind is forty', () => {
  // fc.assert(
  //   fc.property(G.getPoints(), G.getPlayer(), ({ pointsData }, winner) => {
  //     throw new Error(
  //       'Your turn to code the preconditions, expected result and test.'
  //     );
  //   })
  // );
  // });
});
