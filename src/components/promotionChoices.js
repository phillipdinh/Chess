import React from "react"

export default function PromotionChoices(props) {
	const handlePromotion = (choice) => {
		const square = props.square
		props.onClick(square.row, square.col, choice, square.color)
	}
	const styles = {
		left: `${props.square.col * 64}px`, // Adjust this based on your square size
		top: `${props.square.row * 64}px` // Adjust this based on your square size
	}
	return (
		<div className="pawn-promotion" style={styles}>
			<div className="promotion-choice" onClick={() => handlePromotion("q")}>
				♕
			</div>
			<div className="promotion-choice" onClick={() => handlePromotion("r")}>
				♖
			</div>
			<div className="promotion-choice" onClick={() => handlePromotion("b")}>
				♗
			</div>
			<div className="promotion-choice" onClick={() => handlePromotion("n")}>
				♞
			</div>
		</div>
	)
}
