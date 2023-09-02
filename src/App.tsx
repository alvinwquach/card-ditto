import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_GAME } from "./graphql/mutations";
import PlayerSelection from "./components/modules/PlayerSelection/PlayerSelection";
import Gameboard from "./components/modules/GameBoard/GameBoard";
import "./App.css";

function CardDealer() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showPlayerSelection, setShowPlayerSelection] = useState(true);
  const [gameId, setGameId] = useState<string | null>(null);
  const [createGame] = useMutation(CREATE_GAME);

  const handlePlayerSelect = async (player: string) => {
    try {
      const { data } = await createGame({
        variables: {
          playerAName: player === "A" ? "Player A" : "Player B",
          playerBName: player === "A" ? "Player B" : "Player A",
          selectedPlayer: player,
        },
      });
      const newGameId = data.createGame.id;
      setGameId(newGameId);
      setSelectedPlayer(player);
      setShowPlayerSelection(false);
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  const handleResetGame = () => {
    setShowPlayerSelection(true);
    setGameId(null);
    setSelectedPlayer(null);
  };

  return (
    <div className="app">
      {showPlayerSelection ? (
        <PlayerSelection onSelect={handlePlayerSelect} />
      ) : (
        <Gameboard
          gameId={gameId}
          selectedPlayer={selectedPlayer}
          onResetGame={handleResetGame}
        />
      )}
    </div>
  );
}

export default CardDealer;
