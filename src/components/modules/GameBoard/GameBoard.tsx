import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Player from "../Player/Player";
import Card, { CardProps } from "../Card/Card";
import {
  GET_GAME,
  GET_CURRENT_PLAYER_TURN,
  GET_GAME_RESULT,
} from "../../../graphql/queries";
import { DRAW_CARD, RESET_GAME } from "../../../graphql/mutations";
import "./GameBoard.css";
import Confetti from "react-confetti";

interface GameBoardProps {
  gameId: string | null;
  selectedPlayer: string | null;
  onResetGame: () => void;
}

function Gameboard({ gameId, selectedPlayer, onResetGame }: GameBoardProps) {
  const [lastDrawnCardPlayerA, setLastDrawnCardPlayerA] =
    useState<CardProps | null>(null);
  const [lastDrawnCardPlayerB, setLastDrawnCardPlayerB] =
    useState<CardProps | null>(null);
  const [playerADrawnCards, setPlayerADrawnCards] = useState<CardProps[]>([]);
  const [playerBDrawnCards, setPlayerBDrawnCards] = useState<CardProps[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [drawCard] = useMutation(DRAW_CARD);
  const [resetGame] = useMutation(RESET_GAME);

  const { data: gameData, loading: gameDataLoading } = useQuery(GET_GAME, {
    variables: { gameId },
  });

  const { data: playerTurnData, loading: playerTurnLoading } = useQuery(
    GET_CURRENT_PLAYER_TURN,
    {
      variables: { gameId },
      pollInterval: 100,
    }
  );
  const { data: gameResultData, loading: gameResultDataLoading } = useQuery(
    GET_GAME_RESULT,
    {
      variables: { gameId: gameId },
      pollInterval: 100,
    }
  );
  const winnerPlayerId = gameData?.game?.winner;
  const drawStatus = gameData?.game?.draw;
  const gameResult = gameResultData?.getGameResult;

  useEffect(() => {
    setWinner(winnerPlayerId);
    setIsDraw(drawStatus);

    if (winnerPlayerId) {
      setShowConfetti(true);
    }
  }, [winnerPlayerId, drawStatus]);

  const handleDrawCard = async (playerId: string) => {
    try {
      const result = await drawCard({
        variables: { gameId, playerId },
        refetchQueries: [
          {
            query: GET_GAME,
            variables: { gameId },
          },
        ],
      });

      const drawnCard = result.data.drawCard.card;

      if (playerId === "A") {
        setLastDrawnCardPlayerA(drawnCard);
        setPlayerADrawnCards([...playerADrawnCards, drawnCard]);
      } else if (playerId === "B") {
        setLastDrawnCardPlayerB(drawnCard);
        setPlayerBDrawnCards([...playerBDrawnCards, drawnCard]);
      }
    } catch (error) {
      console.error("Error drawing a card:", error);
    }
  };

  const handleResetGame = async () => {
    try {
      await resetGame({
        variables: { gameId },
        refetchQueries: [
          {
            query: GET_GAME,
            variables: { gameId },
          },
        ],
      });

      onResetGame();
    } catch (error) {
      console.error("Error resetting the game:", error);
    }
  };

  if (gameDataLoading || playerTurnLoading || gameResultDataLoading) {
    return <div>Loading...</div>;
  }

  const currentPlayerTurn = playerTurnData?.getCurrentPlayerTurn;

  return (
    <div className="game-board">
      <Player
        playerId="A"
        isTurn={currentPlayerTurn === "A"}
        drawnCards={playerADrawnCards}
        onDraw={() => handleDrawCard("A")}
        gameOver={!!winner || isDraw}
      />
      {lastDrawnCardPlayerA && (
        <Card
          suit={lastDrawnCardPlayerA.suit}
          rank={lastDrawnCardPlayerA.rank}
        />
      )}
      {!winner && !isDraw && gameResult && (
        <div
          className={`turn-message ${
            currentPlayerTurn === "A" ? "player-a" : "player-b"
          }`}
        >
          {`Your Turn: Player ${currentPlayerTurn}`}
        </div>
      )}
      {gameResult && (
        <div className="reset-button-container">
          <div
            className={`game-result ${
              winner === "A" ? "winner-player-a" : "winner-player-b"
            }`}
          >
            {gameResult}
          </div>
          {showConfetti && (
            <Confetti width={window.innerWidth} height={window.innerHeight} />
          )}
          <div className="reset-button-wrapper">
            <button onClick={handleResetGame} className="reset-button">
              Reset Game
            </button>
          </div>
        </div>
      )}
      <Player
        playerId="B"
        isTurn={currentPlayerTurn === "B"}
        drawnCards={playerBDrawnCards}
        onDraw={() => handleDrawCard("B")}
        gameOver={!!winner || isDraw}
      />
      {lastDrawnCardPlayerB && (
        <Card
          suit={lastDrawnCardPlayerB.suit}
          rank={lastDrawnCardPlayerB.rank}
        />
      )}
    </div>
  );
}

export default Gameboard;
