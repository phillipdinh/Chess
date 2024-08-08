export function validateMove(board, fromPos, toPos) {
	switch (board[fromPos.row][fromPos.col].piece) {
		case "p":
			return validatePawnMove(board, fromPos, toPos)
		case "r":
			return validateRookMove(board, fromPos, toPos)
		case "b":
			return validateBishopMove(board, fromPos, toPos)
		case "n":
			return validateKnightMove(board, fromPos, toPos)
		case "q":
			return validateQueenMove(board, fromPos, toPos)
		case "k":
			return validateKingMove(board, fromPos, toPos)
		default:
			return false
	}
}

export function validateOrthogonalMove(board, fromPos, toPos) {
	const fromColor = board[fromPos.row][fromPos.col].color
	const toColor = board[toPos.row][toPos.col].color

	if ((fromPos.row !== toPos.row && fromPos.col !== toPos.col) || fromColor === toColor) {
		return false
	}
	if (fromPos.row === toPos.row) {
		let startCol = Math.min(fromPos.col, toPos.col)
		let endCol = Math.max(fromPos.col, toPos.col)
		for (let col = startCol + 1; col <= endCol - 1; col++) {
			if (board[toPos.row][col].piece) {
				return false
			}
		}
	} else {
		let startRow = Math.min(fromPos.row, toPos.row)
		let endRow = Math.max(fromPos.row, toPos.row)
		for (let row = startRow + 1; row < endRow; row++) {
			if (board[row][toPos.col].piece) {
				return false
			}
		}
	}
	return true
}
export function validateDiagonalMove(board, fromPos, toPos) {
	const fromSquare = board[fromPos.row][fromPos.col]
	const toSquare = board[toPos.row][toPos.col]
	if (
		Math.abs(fromPos.row - toPos.row) !== Math.abs(fromPos.col - toPos.col) ||
		fromSquare.color === toSquare.color
	) {
		return false
	}
	const rowDirection = toPos.row > fromPos.row ? 1 : -1
	const colDirection = toPos.col > fromPos.col ? 1 : -1

	let currentRow = fromPos.row + rowDirection
	let currentCol = fromPos.col + colDirection

	while (currentRow !== toPos.row && currentCol !== toPos.col) {
		if (board[currentRow][currentCol].piece) {
			return false
		}
		currentRow += rowDirection
		currentCol += colDirection
	}
	return true
}
export function validatePawnMove(board, fromPos, toPos) {
	//TODO: enpassant
	// Prettier
	const fromColor = board[fromPos.row][fromPos.col].color
	const toColor = board[toPos.row][toPos.col].color
	const direction = fromColor === "white" ? -1 : 1

	//prettier-ignore
	const isFirstMove = (fromPos.row === 1 && fromColor === "black") || 
                        (fromPos.row === 6 && fromColor === "white")
	const isDiagonalMove =
		Math.abs(fromPos.col - toPos.col) === 1 && toPos.row === fromPos.row + direction
	const isForwardMove = toPos.row === fromPos.row + direction && toPos.col === fromPos.col
	const isDoubleMove =
		isFirstMove && toPos.row === fromPos.row + direction * 2 && toPos.col === fromPos.col

	if (isDiagonalMove && toColor && fromColor !== toColor) {
		return true
	}

	if (toColor != null) {
		return false
	}

	if (isForwardMove) {
		return true
	}
	if (isDoubleMove && board[toPos.row - direction][toPos.col].color == null) {
		return true
	}
	return false
}
export function validateRookMove(board, fromPos, toPos) {
	return validateOrthogonalMove(board, fromPos, toPos)
}
export function validateBishopMove(board, fromPos, toPos) {
	return validateDiagonalMove(board, fromPos, toPos)
}
export function validateKnightMove(board, fromPos, toPos) {
	const fromSquare = board[fromPos.row][fromPos.col]
	const toSquare = board[toPos.row][toPos.col]

	const rowDiff = Math.abs(fromPos.row - toPos.row)
	const colDiff = Math.abs(fromPos.col - toPos.col)

	if (
		fromSquare.color !== toSquare.color &&
		((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))
	) {
		return true
	}
	return false
}
export function validateQueenMove(board, fromPos, toPos) {
	return (
		validateOrthogonalMove(board, fromPos, toPos) || validateDiagonalMove(board, fromPos, toPos)
	)
}
export function validateKingMove(board, fromPos, toPos) {
	/*
    TODO
    - Checkmate
        - Look if king can move and not be in check
        - Iterate through all pieces (of same color)
            - Iterate through all possible moves
            - Validate it blocks the check
    - Draw
        - King is not in check but has no valid moves or other pieces to move
    - Castle
        - Check if rook or king has been moved
        - Make sure king is not in check after castling
    */
	if (
		Math.max(Math.abs(fromPos.row - toPos.row), Math.abs(fromPos.col - toPos.col)) > 1 ||
		board[fromPos.row][fromPos.col].color === board[toPos.row][toPos.col].color
	) {
		return false
	}
	return true
}
