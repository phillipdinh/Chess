import King from "./pieces/king"
import Queen from "./pieces/queen"
import Rook from "./pieces/rook"
import Bishop from "./pieces/bishop"
import Knight from "./pieces/knight"
import Pawn from "./pieces/pawn"

export default function Square(props) {
	const id = `sq-${props.col}-${props.row}`

	const renderPiece = (piece, color, onClick) => {
		switch (piece) {
			case "k":
				return <King color={color} onClick={onClick} />
			case "q":
				return <Queen color={color} onClick={onClick} />
			case "r":
				return <Rook color={color} onClick={onClick} />
			case "b":
				return <Bishop color={color} onClick={onClick} />
			case "n":
				return <Knight color={color} onClick={onClick} />
			case "p":
				return <Pawn color={color} onClick={onClick} />
			default:
				return null // No piece
		}
	}

	return (
		<div
			id={id}
			className={`board-square ${
				(props.row + props.col) % 2 === 0 ? "light" : "dark"
			}`}
			onClick={props.onClick}
		>
			{renderPiece(props.piece, props.color, props.onClick)}
		</div>
	)
}
