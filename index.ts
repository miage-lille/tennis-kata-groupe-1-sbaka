// index.ts
import { Player } from './types/player';
import {
  Point,
  PointsData,
  Score,
  love,
  fifteen,
  thirty,
  points,
  deuce,
  advantage,
  forty,
  game,
  FortyData,
} from './types/score';
import { none, Option, some, match as matchOpt } from 'fp-ts/Option';
import { pipe } from 'fp-ts/lib/function';

/* ------------------------------------------------------------
   Fonctions utilitaires pour l'affichage et la sélection
   ------------------------------------------------------------ */

// Convertir un joueur en chaîne de caractères
export const playerToString = (player: Player): string => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'Player 1';
    case 'PLAYER_TWO':
      return 'Player 2';
  }
};

// Retourner l'autre joueur
export const otherPlayer = (player: Player): Player => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'PLAYER_TWO';
    case 'PLAYER_TWO':
      return 'PLAYER_ONE';
  }
};

/* ------------------------------------------------------------
   Exercice 1 : Conversion de Point et Score en chaîne
   ------------------------------------------------------------ */

// Fonction pour convertir un Point en chaîne
export const pointToString = (point: Point): string => {
  // On utilise un switch pour retourner la valeur correspondant à chaque point.
  switch (point.kind) {
    case 'LOVE':
      return '0';
    case 'FIFTEEN':
      return '15';
    case 'THIRTY':
      return '30';
    // Normalement, le cas "FORTY" n'arrivera pas ici car 40 est représenté par l'état Forty.
    default:
      return 'Inconnu';
  }
};

// Fonction pour convertir un Score en chaîne
export const scoreToString = (score: Score): string => {
  // On traite chaque cas possible du score
  switch (score.kind) {
    case 'POINTS':
      return `${pointToString(score.pointsData.PLAYER_ONE)} - ${pointToString(score.pointsData.PLAYER_TWO)}`;
    case 'FORTY':
      return `40 for ${playerToString(score.fortyData.player)} (opponent: ${pointToString(score.fortyData.otherPoint)})`;
    case 'DEUCE':
      return 'Deuce';
    case 'ADVANTAGE':
      return `Advantage ${playerToString(score.player)}`;
    case 'GAME':
      return `Game won by ${playerToString(score.player)}`;
  }
};

/* ------------------------------------------------------------
   Exercice 0 : Fonctions de transition pour les états spéciaux
   ------------------------------------------------------------ */

// Quand le score est Deuce, le joueur qui gagne le point obtient l'avantage.
export const scoreWhenDeuce = (winner: Player): Score => {
  // Retourne l'état Advantage pour le joueur gagnant
  return advantage(winner);
};

// Quand un joueur est en Advantage :
// - S'il gagne le point, il remporte le jeu.
// - Sinon, le score redevient Deuce.
export const scoreWhenAdvantage = (advantagedPlayer: Player, winner: Player): Score => {
  if (advantagedPlayer === winner) {
    return game(winner);
  }
  return deuce();
};

// Quand le score est à Forty, trois cas se présentent :
// 1. Si le joueur qui a 40 gagne le point, il gagne le jeu.
// 2. Si l'autre joueur gagne et que son point peut être incrémenté, on met à jour son point dans l'état Forty.
// 3. Si l'autre joueur est déjà à 30 (et ne peut plus incrémenter), le score devient Deuce.
export const scoreWhenForty = (currentForty: FortyData, winner: Player): Score => {
  // Si le joueur qui a 40 gagne le point, il remporte la partie.
  if (currentForty.player === winner) {
    return game(winner);
  }
  // Sinon, on incrémente le point de l'autre joueur.
  return pipe(
    incrementPoint(currentForty.otherPoint),
    matchOpt(
      () => deuce(), // Si l'autre joueur était à 30, il ne peut plus monter, donc c'est Deuce.
      (newPoint) => forty(currentForty.player, newPoint) as Score
    )
  );
};

// Lorsque le jeu est terminé, le score reste le même.
export const scoreWhenGame = (winner: Player): Score => {
  return game(winner);
};

/* ------------------------------------------------------------
   Exercice 2 : Gestion de la phase POINTS (avant d'atteindre 40)
   ------------------------------------------------------------ */

// Fonction utilitaire pour incrémenter un Point.
// Passe de LOVE -> FIFTEEN et de FIFTEEN -> THIRTY.
// Si le point est déjà THIRTY, on ne peut pas incrémenter (on passera ensuite à Forty).
export const incrementPoint = (point: Point): Option<Point> => {
  switch (point.kind) {
    case 'LOVE':
      return some(fifteen());
    case 'FIFTEEN':
      return some(thirty());
    case 'THIRTY':
      return none; // On ne peut pas incrémenter au-delà de THIRTY dans l'état POINTS.
  }
};

// Gère la transition quand les deux joueurs sont dans la phase POINTS
export const scoreWhenPoint = (current: PointsData, winner: Player): Score => {
  // Récupère le point actuel du joueur gagnant
  const currentPoint = current[winner];

  // Si le point est LOVE, on passe à FIFTEEN
  if (currentPoint.kind === 'LOVE') {
    // On met à jour le score du joueur gagnant
    const newPoints = { ...current, [winner]: fifteen() };
    return points(newPoints.PLAYER_ONE, newPoints.PLAYER_TWO);
  }

  // Si le point est FIFTEEN, on passe à THIRTY
  if (currentPoint.kind === 'FIFTEEN') {
    const newPoints = { ...current, [winner]: thirty() };
    return points(newPoints.PLAYER_ONE, newPoints.PLAYER_TWO);
  }

  // Si le point est THIRTY, il faut passer à l'état Forty
  if (currentPoint.kind === 'THIRTY') {
    // On identifie l'autre joueur
    const opponent = otherPlayer(winner);
    // Si l'autre joueur est aussi à THIRTY, cela correspond à une situation Deuce
    if (current[opponent].kind === 'THIRTY') {
      return deuce();
    } else {
      // Sinon, le joueur gagnant passe à Forty et l'autre conserve son point actuel
      return forty(winner, current[opponent]);
    }
  }

  // Ce cas ne devrait jamais arriver
  throw new Error("État de point invalide dans scoreWhenPoint");
};

/* ------------------------------------------------------------
   Fonction générale de transition de score
   ------------------------------------------------------------ */

// La fonction 'score' met à jour l'état du jeu en fonction de l'état courant et du joueur gagnant
export const score = (currentScore: Score, winner: Player): Score => {
  switch (currentScore.kind) {
    case 'POINTS':
      return scoreWhenPoint(currentScore.pointsData, winner);
    case 'FORTY':
      return scoreWhenForty(currentScore.fortyData, winner);
    case 'DEUCE':
      return scoreWhenDeuce(winner);
    case 'ADVANTAGE':
      return scoreWhenAdvantage(currentScore.player, winner);
    case 'GAME':
      // Si le jeu est déjà terminé, le score ne change pas
      return scoreWhenGame(winner);
  }
};