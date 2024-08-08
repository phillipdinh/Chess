import Piece from "./piece"

export default function Square(props) {
	const id = `sq-${props.col}-${props.row}`

	const renderPiece = (piece, color) => {
		switch (piece) {
			case "k":
				return <Piece color={color} icon="♔" />
			case "q":
				return <Piece color={color} icon="♕" />
			case "r":
				return <Piece color={color} icon="♖" />
			case "b":
				return <Piece color={color} icon="♗" />
			case "n":
				return <Piece color={color} icon="♞" />
			case "p":
				return <Piece color={color} icon="♙" />
			default:
				return null // No piece
		}
	}
	const showCol = props.row === 7
	const showRow = props.col === 0
	return (
		<div
			id={id}
			className={`board-square ${
				props.badSelect
					? "badSelect"
					: props.selected
					? "selected"
					: (props.row + props.col) % 2 === 0
					? "light"
					: "dark"
			}`}
			onClick={props.onClick}
		>
			{showRow ? <span className="board-label row-label">{`${props.row}`}</span> : null}
			{showCol ? <span className="board-label col-label">{`${props.col}`}</span> : null}
			{renderPiece(props.piece, props.color)}
		</div>
	)
}
