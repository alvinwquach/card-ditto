import { useState } from "react";
import { useSprings, animated, to as interpolate } from "@react-spring/web";
import { useDrag } from "react-use-gesture";
import Card from "../Card/Card";
import "./Player.css";
import styles from "../Player/styles.module.css";

interface PlayerProps {
  playerId: string;
  isTurn: boolean;
  drawnCards: Array<{ suit: string; rank: string }>;
  onDraw: () => void;
  gameOver?: boolean;
}

// Add React Spring card animation example
const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${
    r / 10
  }deg) rotateZ(${r}deg) scale(${s})`;

function Player({
  playerId,
  isTurn,
  drawnCards,
  onDraw,
  gameOver,
}: PlayerProps) {
  const [gone] = useState(() => new Set()); // The set flags all the cards that are flicked out
  const [props, api] = useSprings(drawnCards.length, (i) => ({
    ...to(i),
    from: from(i),
  })); // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useDrag(
    ({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
      const trigger = velocity > 0.2; // If you flick hard enough it should trigger the card to fly out
      const dir = xDir < 0 ? -1 : 1; // Direction should either point left or right
      if (!down && trigger) gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
      api.start((i) => {
        if (index !== i) return; // We're only interested in changing spring-data for the current spring
        const isGone = gone.has(index);
        const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
        const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0); // How much the card tilts, flicking it harder makes it rotate faster
        const scale = down ? 1.1 : 1; // Active cards lift up a bit
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
        };
      });
      if (!down && gone.size === drawnCards.length)
        setTimeout(() => {
          gone.clear();
          api.start((i) => to(i));
        }, 600);
    }
  );

  return (
    <div className={`player ${isTurn ? "active" : ""}`}>
      <div className="player-header">
        <h2>Player {playerId}</h2>
      </div>
      {isTurn && !gameOver && (
        <button onClick={onDraw} className="draw-button">
          Draw
        </button>
      )}
      <div className="drawn-cards-container">
        <div className="drawn-cards">
          {props.map(({ x, y, rot, scale }, i) => (
            <animated.div className={styles.deck} key={i} style={{ x, y }}>
              <animated.div
                {...bind(i)}
                style={{
                  transform: interpolate([rot, scale], trans),
                }}
              >
                <Card suit={drawnCards[i].suit} rank={drawnCards[i].rank} />
              </animated.div>
            </animated.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player;
