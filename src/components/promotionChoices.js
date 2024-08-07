import React, { useState } from "react"

//TODO add css
export default function PromotionChoices(props) {
	return (
		<div className="pawn-promotion">
			<div onClick={() => props.onClick(props.row, props.col, "q")}>"♕"</div>
			<div onClick={() => props.onClick(props.row, props.col, "r")}>"♖"</div>
			<div onClick={() => props.onClick(props.row, props.col, "b")}>"♗"</div>
			<div onClick={() => props.onClick(props.row, props.col, "n")}>"♞"</div>
		</div>
	)
}
