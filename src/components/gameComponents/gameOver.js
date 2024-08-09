import React from "react"
export default function GameOver(props) {
	return (
		<>
			<div className="screen-overlay"> </div>
			<div className="game-over-container">
				<p className="game-over-text">Checkmate</p>
				<button className="new-game-btn" onClick={props.handlePlayAgain}>
					Play Again?
				</button>
			</div>
		</>
	)
}
