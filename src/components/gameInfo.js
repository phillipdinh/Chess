import React, { useState } from "react"
export default function GameInfo(props) {
	const pieces = {
		k: "♔",
		q: "♕",
		r: "♖",
		b: "♗",
		n: "♞",
		p: "♙"
	}
	return (
		<div className="game-info">
			<div>Turn: {props.turn ? "White" : "Black"} </div>
			<div className="captured-pieces">
				White Tally:
				{props.whiteTally.map((square, index) => (
					<div key={index} className={square.color}>
						{pieces[square.piece]}
					</div>
				))}
			</div>
			<div className="captured-pieces">
				Black Tally:
				{props.blackTally.map((square, index) => (
					<div key={index} className={square.color}>
						{pieces[square.piece]}
					</div>
				))}
			</div>
		</div>
	)
}
