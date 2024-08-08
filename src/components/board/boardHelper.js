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

export function isCheckMate(board, king, kingColor) {
	console.log(king)
	console.log(board)
	if (!isKingChecked(board, king.row, king.col)) return false
	console.log("Pass First Check")
	// TODO can piece block
	return !canKingMove(board, king, kingColor)
}

// function canPieceBlockCheck(board, king){

// }
function canKingMove(board, kingPos, kingColor) {
	console.log(kingColor)
	for (let r = -1; r <= 1; r++) {
		for (let c = -1; c <= 1; c++) {
			const newRow = kingPos.row + r
			const newCol = kingPos.col + c

			if (r === 0 && c === 0) continue
			if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) continue
			if (
				!validateKingMove(
					board,
					{ row: kingPos.row, col: kingPos.col },
					{ row: newRow, col: newCol }
				)
			)
				continue

			const newBoard = board.map((r) => r.map((square) => ({ ...square })))

			newBoard[newRow][newCol] = {
				...newBoard[newRow][newCol],
				piece: "k",
				color: kingColor
			}
			newBoard[kingPos.row][kingPos.col] = {
				...newBoard[kingPos.row][kingPos.col],
				piece: null,
				color: null
			}

			console.log(newBoard, newRow, newCol)
			if (!isKingChecked(newBoard, newRow, newCol)) {
				console.log("CAN MOVE")
				return true
			}
		}
	}
	console.log("CHECKMATE")
	return false
}
export function isKingChecked(board, kingRow, kingCol) {
	const king = board[kingRow][kingCol]
	for (let row of board) {
		for (let square of row) {
			if (!square.color || square.color === king.color) {
				continue
			}
			if (
				validateMove(
					board,
					{ row: square.row, col: square.col },
					{ row: king.row, col: king.col }
				)
			) {
				return true
			}
		}
	}
	return false
}
function validateKingMove(board, fromPos, toPos) {
	if (
		Math.max(Math.abs(fromPos.row - toPos.row), Math.abs(fromPos.col - toPos.col)) > 1 ||
		board[fromPos.row][fromPos.col].color === board[toPos.row][toPos.col].color
	) {
		return false
	}
	return true
}

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
function validateQueenMove(board, fromPos, toPos) {
	return (
		validateOrthogonalMove(board, fromPos, toPos) || validateDiagonalMove(board, fromPos, toPos)
	)
}

function validateOrthogonalMove(board, fromPos, toPos) {
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
function validateDiagonalMove(board, fromPos, toPos) {
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
function validatePawnMove(board, fromPos, toPos) {
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
function validateRookMove(board, fromPos, toPos) {
	return validateOrthogonalMove(board, fromPos, toPos)
}
function validateBishopMove(board, fromPos, toPos) {
	return validateDiagonalMove(board, fromPos, toPos)
}
function validateKnightMove(board, fromPos, toPos) {
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
