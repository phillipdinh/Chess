export default function Square(props) {
	const id = `sq-${props.col}-${props.row}`

	const renderPiece = (piece) => {
		switch (piece) {
			case "k":
				return "♔"
			case "q":
				return "♕"
			case "r":
				return "♖"
			case "b":
				return "♗"
			case "n":
				return "♞"
			case "p":
				return "♙"
			default:
				return null
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
			{<div className={props.color}>{renderPiece(props.piece)}</div>}
		</div>
	)
}
