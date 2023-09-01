import { gql } from "@apollo/client";

export const CREATE_GAME = gql`
  mutation CreateGame(
    $playerAName: String!
    $playerBName: String!
    $selectedPlayer: String!
  ) {
    createGame(
      playerAName: $playerAName
      playerBName: $playerBName
      selectedPlayer: $selectedPlayer
    ) {
      id
      playerA {
        id
        name
      }
      playerB {
        id
        name
      }
      currentPlayerId
    }
  }
`;

export const DRAW_CARD = gql`
  mutation DrawCard($gameId: ID!, $playerId: ID!) {
    drawCard(gameId: $gameId, playerId: $playerId) {
      player
      card {
        suit
        rank
      }
    }
  }
`;

export const RESET_GAME = gql`
  mutation ResetGame($gameId: ID!) {
    resetGame(gameId: $gameId) {
      id
      playerA {
        id
        name
        drawnCards {
          player
          card {
            suit
            rank
          }
        }
      }
      playerB {
        id
        name
        drawnCards {
          player
          card {
            suit
            rank
          }
        }
      }
      currentPlayerId
      deck {
        suit
        rank
      }
      draw
      winner
      drawnCards {
        player
        card {
          suit
          rank
        }
      }
    }
  }
`;
