import "./PlayerSelection.css";

interface PlayerSelectionProps {
  onSelect: (player: string) => void;
}

function PlayerSelection({ onSelect }: PlayerSelectionProps) {
  return (
    <>
      <div className="welcome-message">
        <h1>Welcome to Card Ditto!</h1>
        <p>
          You'll need to draw a card of the same rank as your opponent in order
          to win. Good luck!
        </p>
      </div>
      <div className="player-selection">
        <h2 className="choose-player-text">Choose Your Player</h2>
        <div className="button-container">
          <button className="player-button" onClick={() => onSelect("A")}>
            Player A
          </button>
          <button className="player-button" onClick={() => onSelect("B")}>
            Player B
          </button>
        </div>
      </div>
    </>
  );
}

export default PlayerSelection;
