// types/score.ts
import { Player } from './player';

// --- Types des points ---
export type Love = {
  kind: 'LOVE';
};

export type Fifteen = {
  kind: 'FIFTEEN';
};

export type Thirty = {
  kind: 'THIRTY';
};

// Dans notre modèle final, on ne veut pas que le point "40" soit représenté dans Point
// pour éviter des états illégaux (par exemple 40-40). On ne garde donc que Love, Fifteen et Thirty.
export type Point = Love | Fifteen | Thirty;

// Fonctions constructrices pour les points
export const love = (): Love => ({
  kind: 'LOVE',
});

export const fifteen = (): Fifteen => ({
  kind: 'FIFTEEN',
});

export const thirty = (): Thirty => ({
  kind: 'THIRTY',
});

// --- Représentation du score avant d'arriver à 40 ---
export type PointsData = {
  PLAYER_ONE: Point;
  PLAYER_TWO: Point;
};

export type Points = {
  kind: 'POINTS';
  pointsData: PointsData;
};

export const points = (
  playerOnePoints: Point,
  playerTwoPoints: Point
): Points => ({
  kind: 'POINTS',
  pointsData: {
    PLAYER_ONE: playerOnePoints,
    PLAYER_TWO: playerTwoPoints,
  },
});

// --- Exercice 0 : Définition des types pour Deuce, Forty et Advantage ---

// Type pour l'état Deuce (égalité à 40-40)
export type Deuce = {
  kind: 'DEUCE';
};

// Constructeur pour Deuce
export const deuce = (): Deuce => ({
  kind: 'DEUCE',
});

// Pour représenter l'état Forty, on a besoin d'un complément d'information : 
// quel joueur a atteint 40 et quel est le point de l'autre joueur.
export type FortyData = {
  player: Player;    // Le joueur qui a 40 points
  otherPoint: Point; // Le point de l'adversaire (Love, Fifteen ou Thirty)
};

// Type pour l'état Forty
export type Forty = {
  kind: 'FORTY';
  fortyData: FortyData;
};

// Constructeur pour Forty
export const forty = (player: Player, otherPoint: Point): Forty => ({
  kind: 'FORTY',
  fortyData: { player, otherPoint },
});

// Type pour l'état Advantage (lorsqu'un joueur a l'avantage après Deuce)
export type Advantage = {
  kind: 'ADVANTAGE';
  player: Player; // Le joueur qui bénéficie de l'avantage
};

// Constructeur pour Advantage
export const advantage = (player: Player): Advantage => ({
  kind: 'ADVANTAGE',
  player,
});

// Type pour l'état Game (le joueur a gagné la partie)
export type Game = {
  kind: 'GAME';
  player: Player; // Le joueur vainqueur
};

// Constructeur pour Game
export const game = (winner: Player): Game => ({
  kind: 'GAME',
  player: winner,
});

// Union de tous les états possibles du score
export type Score = Points | Forty | Deuce | Advantage | Game;