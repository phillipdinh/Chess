import React, { useState } from "react"
export default function GameInfo(props) {
	/* TODO
    - Whose turn
    - How many turns
    - Pieces captured
    - Game over
    - Bad move indicator
    */

	return <div>Turn: {props.turn ? "White" : "Black"} </div>
}
