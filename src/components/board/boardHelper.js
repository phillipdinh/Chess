/*
    TODO
    - Checkmate
        - Iterate through all pieces (of same color)
            - Iterate through all possible moves
            - Validate it blocks the check
    - Draw
        - King is not in check but has no valid moves or other pieces to move
    - Castle
        - Check if rook or king has been moved
        - Make sure king is not in check after castling
    */

// TODO seperate into own files by piece
export function copyBoard(board, fromPos, toPos, piece, color) {
	//TODO seperate into function
	const newBoard = board.map((r) => r.map((square) => ({ ...square })))

	newBoard[toPos.row][toPos.col] = {
		...newBoard[toPos.row][toPos.col],
		piece: piece,
		color: color
	}

	newBoard[fromPos.row][fromPos.col] = {
		...newBoard[fromPos.row][fromPos.col],
		piece: null,
		color: null
	}

	return newBoard
}

export function isCheckMate(board, kingPos, kingColor) {
	// console.log(kingPos)
	// console.log(board)
	if (!isKingChecked(board, kingPos.row, kingPos.col)) return false
	console.log("Pass First Check")

	return !canPieceBlock(board, kingPos, kingColor)
	//return !canKingMove(board, kingPos, kingColor)
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
				console.log("CHECK")
				return true
			}
		}
	}
	return false
}
// Check if it works
function canKingMove(board, kingPos, kingColor) {
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

			const newBoard = copyBoard(board, kingPos, { row: newRow, col: newCol }, "k", kingColor)
			if (!isKingChecked(newBoard, newRow, newCol)) {
				console.log("CAN MOVE")
				return true
			}
		}
	}
	console.log("CHECKMATE")
	return false
}

//TODO possible moves
function canPieceBlock(board, kingPos, kingColor) {
	for (let row of board) {
		for (let square of row) {
			if (square.color !== kingColor) continue
			// console.log(square)
			// FIXME make sure canBlock functions dont return after checking the first
			// TODO change default
			switch (square.piece) {
				case "p":
					if (canPawnBlock(board, square, kingPos)) return true
					break
				case "r":
					if (canRookBlock(board, square, kingPos)) return true
					break
				case "b":
					if (canBishopBlock(board, square, kingPos)) return true
					break
				case "n":
					if (canKnightBlock(board, square, kingPos)) return true
					break
				case "q":
					if (canQueenBlock(board, square, kingPos)) return true
					break
				default:
					console.log("default")
				//return false
			}
		}
	}
}
function canPawnBlock(board, fromSquare, kingPos) {
    
}
function canOrthogonalBlock(board, fromSquare, kingPos) {
	const fromPos = { row: fromSquare.row, col: fromSquare.col }
	const toPos = { row: fromSquare.row, col: fromSquare.col }

	const directions = [
		[-1, 0],
		[1, 0],
		[0, 1],
		[0, -1]
	]

	for (let newPos of directions) {
		toPos.row = fromPos.row
		toPos.col = fromPos.col

		while (true) {
			toPos.row += newPos[0]
			toPos.col += newPos[1]

			if (toPos.row < 0 || toPos.row >= 8 || toPos.col < 0 || toPos.col >= 8) break

			if (!validateOrthogonalMove(board, fromPos, toPos)) break

			const newBoard = copyBoard(board, fromPos, toPos, fromSquare.piece, fromSquare.color)

			if (!isKingChecked(newBoard, kingPos.row, kingPos.col)) {
				console.log("Orthogonal block: ", fromPos)
				return true
			}
		}
	}
}

function canDiagonalBlock(board, fromSquare, kingPos) {
	const fromPos = { row: fromSquare.row, col: fromSquare.col }
	const toPos = { row: fromSquare.row, col: fromSquare.col }

	// TODO try to unnest
	for (let r = -1; r <= 1; r++) {
		if (r === 0) continue

		for (let c = -1; c <= 1; c++) {
			if (c === 0) continue
			toPos.row = fromPos.row
			toPos.col = fromPos.col

			while (true) {
				toPos.row += r
				toPos.col += c
				if (toPos.row < 0 || toPos.row >= 8 || toPos.col < 0 || toPos.col >= 8) break

				if (!validateDiagonalMove(board, fromPos, toPos)) break

				const newBoard = copyBoard(
					board,
					fromPos,
					toPos,
					fromSquare.piece,
					fromSquare.color
				)

				if (!isKingChecked(newBoard, kingPos.row, kingPos.col)) {
					console.log("Diagonal block: ", fromPos)
					return true
				}
			}
		}
	}
	return false
}
//TODO add orthongonal
function canQueenBlock(board, fromSquare, kingPos) {
	return (
		canDiagonalBlock(board, fromSquare, kingPos) ||
		canOrthogonalBlock(board, fromSquare, kingPos)
	)
}

function canRookBlock(board, fromSquare, kingPos) {
	return canOrthogonalBlock(board, fromSquare, kingPos)
}
function canBishopBlock(board, fromSquare, kingPos) {
	return canDiagonalBlock(board, fromSquare, kingPos)
}
function canKnightBlock(board, fromSquare, kingPos) {
	const directions = [-2, -1, 1, 2]

	const fromPos = { row: fromSquare.row, col: fromSquare.col }
	const toPos = { row: fromSquare.row, col: fromSquare.col }

	for (let r of directions) {
		for (let c of directions) {
			if ((r === -2 || r === 2) && (c === -2 || c === 2)) continue
			if ((c === -1 || c === 1) && (r === -1 || r === 1)) continue

			toPos.row = fromSquare.row + r
			toPos.col = fromSquare.col + c
			if (toPos.row < 0 || toPos.row >= 8 || toPos.col < 0 || toPos.col >= 8) continue

			// TODO make sure to check all moves before return
			if (validateKnightMove(board, fromPos, toPos)) {
				const newBoard = copyBoard(
					board,
					fromPos,
					toPos,
					fromSquare.piece,
					fromSquare.color
				)

				if (!isKingChecked(newBoard, kingPos.row, kingPos.col)) {
					console.log("Knight block: ", fromPos)
					return true
				}
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
