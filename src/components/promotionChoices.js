import React, { useState } from "react"

//TODO add css
export default function PromotionChoices(props) {
	const handlePromotion = (choice) => {
		const square = props.square
		props.onClick(square.row, square.col, choice, square.color)
	}
	return (
		<div className="pawn-promotion">
			<div onClick={() => handlePromotion("q")}>♕</div>
			<div onClick={() => handlePromotion("r")}>♖</div>
			<div onClick={() => handlePromotion("b")}>♗</div>
			<div onClick={() => handlePromotion("n")}>♞</div>
		</div>
	)
}
