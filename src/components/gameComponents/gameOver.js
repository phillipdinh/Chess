import React from "react"
export default function GameOver(props) {
	return (
		<>
			<div className="screen-overlay"> </div>
			<div className="game-over-container">
				<p className="game-over-text">
					{props.mateStatus === "checkmate" ? "Checkmate" : "Stalemate"}
				</p>
				<button className="new-game-btn" onClick={props.handlePlayAgain}>
					Play Again?
				</button>
			</div>
		</>
	)
}
