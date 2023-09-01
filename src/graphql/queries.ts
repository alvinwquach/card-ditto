import { gql } from "@apollo/client";

export const GET_GAME = gql`
  query GetGame($gameId: ID!) {
    game(gameId: $gameId) {
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

export const GET_CURRENT_PLAYER_TURN = gql`
  query GetCurrentPlayerTurn($gameId: ID!) {
    getCurrentPlayerTurn(gameId: $gameId)
  }
`;

export const GET_GAME_RESULT = gql`
  query GetGameResult($gameId: ID!) {
    getGameResult(gameId: $gameId)
  }
`;
