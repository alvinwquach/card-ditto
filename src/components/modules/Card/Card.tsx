import {
  BsDiamondFill,
  BsSuitClubFill,
  BsSuitSpadeFill,
  BsHeartFill,
} from "react-icons/bs";
import "./Card.css";

export interface CardProps {
  suit: string;
  rank: string;
}

function getSuitIcon(suit: string) {
  switch (suit) {
    case "Hearts":
      return <BsHeartFill />;
    case "Diamonds":
      return <BsDiamondFill />;
    case "Clubs":
      return <BsSuitClubFill />;
    case "Spades":
      return <BsSuitSpadeFill />;
    default:
      return null;
  }
}

function Card({ suit, rank }: CardProps) {
  const suitIcon = getSuitIcon(suit);

  return (
    <div className={`card ${suit}`}>
      <div className="card-content">
        <div className="card-rank">{rank}</div>
        <div className="card-suit">{suitIcon}</div>
      </div>
      <div className="card-content">
        <div className="card-suit inverted">{suitIcon}</div>
        <div className="card-rank">{rank}</div>
      </div>
    </div>
  );
}

export default Card;
