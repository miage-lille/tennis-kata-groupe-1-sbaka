// __tests__/index.ts
import { describe, expect, test } from '@jest/globals';
import * as fc from 'fast-check';

// Import the functions we need from our implementation.
// (Make sure these functions are exported from your index.ts.)
import {
  playerToString,
  otherPlayer,
  scoreWhenDeuce,
  scoreWhenAdvantage,
  scoreWhenForty,
  scoreWhenPoint
} from '..';

import * as G from './generators';
import { advantage, game, deuce, forty, thirty } from '../types/score';

// A simple helper to compare players.
function isSamePlayer(p1: string, p2: string): boolean {
  return p1 === p2;
}

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
    fc.assert(
      fc.property(G.getPlayer(), (winner) => {
        const score = scoreWhenDeuce(winner);
        // Expected result is that the winner gets advantage.
        const scoreExpected = advantage(winner);
        expect(score).toStrictEqual(scoreExpected);
      })
    );
  });

  test('Given advantage when advantagedPlayer wins, score is Game avantagedPlayer', () => {
    fc.assert(
      fc.property(G.getPlayer(), G.getPlayer(), (advantagedPlayer, winner) => {
        // Precondition: the advantaged player must be the winner.
        fc.pre(isSamePlayer(advantagedPlayer, winner));
        const score = scoreWhenAdvantage(advantagedPlayer, winner);
        const scoreExpected = game(winner);
        expect(score).toStrictEqual(scoreExpected);
      })
    );
  });

  test('Given advantage when otherPlayer wins, score is Deuce', () => {
    fc.assert(
      fc.property(G.getPlayer(), G.getPlayer(), (advantagedPlayer, winner) => {
        // Precondition: the winner is NOT the advantaged player.
        fc.pre(!isSamePlayer(advantagedPlayer, winner));
        const score = scoreWhenAdvantage(advantagedPlayer, winner);
        const scoreExpected = deuce();
        expect(score).toStrictEqual(scoreExpected);
      })
    );
  });

  test('Given a player at 40 when the same player wins, score is Game for this player', () => {
    fc.assert(
      fc.property(G.getForty(), G.getPlayer(), ({ fortyData }, winner) => {
        // Precondition: the player who has 40 is the winner.
        fc.pre(isSamePlayer(fortyData.player, winner));
        const score = scoreWhenForty(fortyData, winner);
        const scoreExpected = game(winner);
        expect(score).toStrictEqual(scoreExpected);
      })
    );
  });

  test('Given player at 40 and other at 30 when other wins, score is Deuce', () => {
    fc.assert(
      fc.property(G.getForty(), G.getPlayer(), ({ fortyData }, winner) => {
        // Precondition: the winner is the opponent of the player with 40.
        fc.pre(!isSamePlayer(fortyData.player, winner));
        // Precondition: the opponent is at 30.
        fc.pre(fortyData.otherPoint.kind === 'THIRTY');
        const score = scoreWhenForty(fortyData, winner);
        const scoreExpected = deuce();
        expect(score).toStrictEqual(scoreExpected);
      })
    );
  });

  test('Given player at 40 and other at 15 when other wins, score is 40 - 15', () => {
    fc.assert(
      fc.property(G.getForty(), G.getPlayer(), ({ fortyData }, winner) => {
        // Precondition: the winner is the opponent of the player with 40.
        fc.pre(!isSamePlayer(fortyData.player, winner));
        // Precondition: the opponent is at 15.
        fc.pre(fortyData.otherPoint.kind === 'FIFTEEN');
        const score = scoreWhenForty(fortyData, winner);
        // Expected: the player with 40 remains, but the opponent's point is incremented (15 → 30)
        const scoreExpected = forty(fortyData.player, thirty());
        expect(score).toStrictEqual(scoreExpected);
      })
    );
  });

  // -------------------------TESTS POINTS-------------------------- //

  test('Given players at 0 or 15 points score kind is still POINTS', () => {
    fc.assert(
      fc.property(G.getPoints(), G.getPlayer(), ({ pointsData }, winner) => {
        // Precondition: the winner's current point must be either LOVE or FIFTEEN.
        fc.pre(pointsData[winner].kind !== 'THIRTY');
        const newScore = scoreWhenPoint(pointsData, winner);
        // The state should remain POINTS.
        expect(newScore.kind).toBe('POINTS');
        // And the winner's point should be incremented:
        if (newScore.kind === 'POINTS') {
          if (pointsData[winner].kind === 'LOVE') {
            expect(newScore.pointsData[winner].kind).toBe('FIFTEEN');
          }
          if (pointsData[winner].kind === 'FIFTEEN') {
            expect(newScore.pointsData[winner].kind).toBe('THIRTY');
          }
        }
      })
    );
  });

  test('Given one player at 30 and win, score kind is forty', () => {
    fc.assert(
      fc.property(G.getPoints(), G.getPlayer(), ({ pointsData }, winner) => {
        // Precondition: the winner's current point must be THIRTY.
        fc.pre(pointsData[winner].kind === 'THIRTY');
        // Precondition: the opponent's point must NOT be THIRTY (otherwise it would be deuce).
        const opponent = otherPlayer(winner);
        fc.pre(pointsData[opponent].kind !== 'THIRTY');
        const newScore = scoreWhenPoint(pointsData, winner);
        // The state should transition to FORTY.
        expect(newScore.kind).toBe('FORTY');
        // And the forty data should have the correct information.
        if (newScore.kind === 'FORTY') {
          expect(newScore.fortyData.player).toBe(winner);
          expect(newScore.fortyData.otherPoint).toStrictEqual(pointsData[opponent]);
        }
      })
    );
  });
});