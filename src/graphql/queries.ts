import { gql } from "@apollo/client";

const playerFragment = gql`
  fragment PlayerFragment on Player {
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
`;

export const GET_GAME = gql`
  ${playerFragment}
  query GetGame($gameId: ID!) {
    game(gameId: $gameId) {
      id
      playerA {
        ...PlayerFragment
      }
      playerB {
        ...PlayerFragment
      }
      currentPlayerId
      deck {
        suit
        rank
      }
      draw
      winner
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
