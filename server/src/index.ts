import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { v4 as uuidv4 } from "uuid";

export const typeDefs = `#graphql
  type Card {
    suit: String!
    rank: String!
  }
  
  type DrawnCard {
    player: String!
    card: Card!
  }  

  type Player {
    id: ID!
    name: String!
    drawnCards: [DrawnCard!]!
  }
  
  type Game {
    id: ID!
    playerA: Player!
    playerB: Player!
    currentPlayerId: ID
    deck: [Card!]!
    draw: Boolean
    winner: ID
    drawnCards: [DrawnCard!]!
  }

  type Query {
    game(gameId: ID!): Game
    getCurrentPlayerTurn(gameId: ID!): String!
    getGameResult(gameId: ID!): String!
  }

  type Mutation {
    createGame(playerAName: String!, playerBName: String!, selectedPlayer: String!): Game
    drawCard(gameId: ID!, playerId: ID!): DrawnCard
    resetGame(gameId: ID!): Game
  }
`;

const suits = ["Spades", "Clubs", "Diamonds", "Hearts"];
const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

function generateDeck() {
  //Initialize deck to be an empty array
  let deck = [];
  // For each suit, iterate through all the ranks
  for (const suit of suits) {
    // Create a card for each suit going through all the ranks
    for (const rank of ranks) {
      // New card object is pushed into the deck array
      deck.push({ suit, rank });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  // Iterate in reverse order
  for (let i = deck.length - 1; i > 0; i--) {
    // Generate a random returning a floating-point number between 0 and 1
    const j = Math.floor(Math.random() * (i + 1));
    // Destructure and swap the elements
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Initialize game state to be an empty object
let gameState = {};

// GraphQL query, mutation, and subscription logic
export const resolvers = {
  Query: {
    game: (_, { gameId }) => {
      // Check if the game exists in the gameState using gameId
      if (gameState[gameId]) {
        // Return the game state if found
        return gameState[gameId];
      }
      // Throw an error if the game is not found
      throw new Error("Game not found");
    },
    getCurrentPlayerTurn: (_, { gameId }) => {
      // Get the game state using gameId
      const game = gameState[gameId];
      // If the game doesn't exist, throw an error
      if (!game) {
        throw new Error("Game not found");
      }
      // Return the ID of the current player
      return game.currentPlayerId;
    },
    getGameResult: (_, { gameId }) => {
      // Get the game state using gameId
      const game = gameState[gameId];
      // If the game doesn't exist, throw an error
      if (!game) {
        throw new Error("Game not found");
      }
      // Check if the game ended in a draw
      if (game.draw) {
        return "Draw";
        // Check if there's a winner
      } else if (game.winner) {
        // Determine the winner player based on the stored winner ID
        const winnerPlayer =
          game.playerA.id === game.winner ? game.playerA : game.playerB;
        // Return the winner's name
        return `Winner: ${winnerPlayer.name}`;
      } else {
        // If the game is ongoing, return a message indicating that
        return "The game is currently in session.";
      }
    },
  },
  Mutation: {
    createGame: (_, { playerAName, playerBName, selectedPlayer }) => {
      // Create player objects for Player A and Player B
      const playerA = { id: "A", name: playerAName, drawnCards: [] };
      const playerB = { id: "B", name: playerBName, drawnCards: [] };
      // Determine the current player's ID based on selection
      const currentPlayerId = selectedPlayer === "A" ? "A" : "B";
      // Generate and shuffle a new deck
      const deck = generateDeck();
      const shuffledDeck = shuffleDeck(deck);

      // Generate a random ID for the new game
      const randomId = uuidv4();

      // Create a new game object with the required properties
      // id
      // Player A
      // Player B
      // Current Player ID
      // Deck
      // Drawn Cards
      const newGame = {
        id: randomId,
        playerA,
        playerB,
        currentPlayerId,
        deck: shuffleDeck,
        drawnCards: [],
      };

      // Store the shuffled deck in the new game instance
      newGame.deck = shuffledDeck;

      // Store the new game instance in the game state
      gameState[newGame.id] = newGame;
      // Return the new game state
      return newGame;
    },
    drawCard: (_, { gameId, playerId }) => {
      const game = gameState[gameId];
      if (!game) {
        throw new Error("Game not found");
      }
      // Check if it's the current player's turn
      if (game.currentPlayerId !== playerId) {
        throw new Error("It's not this player's turn");
      }
      // Check if there are cards left in the deck
      if (game.deck.length === 0) {
        throw new Error("No more cards in the deck");
      }
      // Draw a card from the deck
      const drawnCard = game.deck.pop();
      // Add the drawn card to the player's drawn cards
      game.drawnCards.push({ player: playerId, card: drawnCard });

      // Check if the drawn card has the same rank as the last drawn card
      if (
        game.drawnCards.length > 1 &&
        drawnCard.rank === game.drawnCards[game.drawnCards.length - 2].card.rank
      ) {
        // Set the current player as the winner
        game.winner = playerId;
      }

      // Update the currentPlayerId to switch to the other player's turn
      game.currentPlayerId = playerId === "A" ? "B" : "A";

      // If the deck is empty, set draw to true
      if (game.deck.length === 0) {
        game.draw = true;
      }
      // Return the drawn card information
      return { player: playerId, card: drawnCard };
    },
    resetGame: (_, { gameId }) => {
      const game = gameState[gameId];
      if (!game) {
        throw new Error("Game not found");
      }
      // Generate a new shuffled deck
      game.deck = shuffleDeck(generateDeck());
      // Reset other game attributes
      // Initialize drawn card as an empty array
      // Initialize winner to null
      // Initalize draw to false
      game.drawnCard = [];
      game.currentPlayerId = game.playerA.id;
      game.winner = null;
      game.draw = false;
      return game;
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀 Server listening at: ${url}`);
