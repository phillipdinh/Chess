import React from "react"
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
			<div className="info-container">
				<p className="black info-label">Black Tally</p>
				<div className="white captured-container">
					{props.blackTally.map((piece, index) => (
						<div key={index} className="white captured-pieces">
							{pieces[piece]}
						</div>
					))}
				</div>
			</div>
			<div className="info-container">
				<div className="black captured-container">
					{props.whiteTally.map((piece, index) => (
						<div key={index} className="black captured-pieces">
							{pieces[piece]}
						</div>
					))}
				</div>
				<p className="white info-label">White Tally</p>
			</div>
		</div>
	)
}
