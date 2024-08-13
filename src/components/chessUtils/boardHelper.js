/*
    TODO
    - Draws
        - Dead Position
        - Mutual Agreement
        - Threefold Repition
        - 50 Move rule
    */
const GAME_STATUS = {
	CHECKMATE: "checkmate",
	STALEMATE: "stalemate",
	NOT_CHECKMATE: false
}

const newBoardSetup = [
	["r", "n", "b", "q", "k", "b", "n", "r"],
	["p", "p", "p", "p", "p", "p", "p", "p"],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	["p", "p", "p", "p", "p", "p", "p", "p"],
	["r", "n", "b", "q", "k", "b", "n", "r"]
]

export const boardInit = () => {
	const board = []
	let player = null
	for (let r = 0; r < 8; r++) {
		const currRow = []
		for (let c = 0; c < 8; c++) {
			if (r < 2) {
				player = "black"
			} else if (r > 5) {
				player = "white"
			} else {
				player = null
			}
			currRow.push({
				row: r,
				col: c,
				piece: newBoardSetup[r][c],
				color: player,
				selected: false,
				badSelect: false
			})
		}
		board.push(currRow)
	}
	return board
}

export function tryMove(board, fromPos, toPos, piece, color) {
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
/*
- TODO Castle
    - Fix queen check
    - 
*/
export function canCastle(board, fromPos, toPos, pieceMoved) {
	const fromSquare = board[fromPos.row][fromPos.col]
	const color = fromSquare.color

	if (fromSquare.piece !== "k") return false

	console.log("Before check")
	if (isKingChecked(board, fromSquare.row, fromSquare.col)) return false

	console.log("Before move position")
	// Check if actually trying to castle
	console.dir(toPos)
	if (
		!(
			(toPos.row === 0 && (toPos.col === 2 || toPos.col === 6)) ||
			(toPos.row === 7 && (toPos.col === 2 || toPos.col === 6))
		)
	) {
		return false
	}

	const rookSquare = toPos.col === 2 ? board[toPos.row][0] : board[toPos.row][7]

	console.log("Before rook check")
	if (rookSquare.piece !== "r") return false

	console.log("Before color check")
	if (fromSquare.color !== rookSquare.color) return false

	const startCol = Math.min(fromSquare.col, rookSquare.col) + 1
	const endCol = Math.max(fromSquare.col, rookSquare.col)

	// Check if pieces are empty between king and rook
	for (let col = startCol; col < endCol; col++) {
		console.log(board[toPos.row][col])
		if (board[toPos.row][col].piece != null) return false
	}

	// FIXME
	// if (color === "white" && pieceMoved[0] && pieceMoved[1]) {
	// 	return false
	// } else if (color === "black" && pieceMoved[3] && pieceMoved[4]) {
	// 	return false
	// }

	console.log("Can Castle")
	const rookPos = { row: rookSquare.row, col: rookSquare.col }

	const rookMoveCol = toPos.col === 2 ? 3 : 5
	const rookMovePos = { row: toPos.row, col: rookMoveCol }

	const moveRookBoard = tryMove(board, rookPos, rookMovePos, "r", color)
	const moveKingBoard = tryMove(moveRookBoard, fromPos, toPos, "k", color)

	console.log("After check")
	if (isKingChecked(moveKingBoard, toPos.row, toPos.col)) return false

	console.log("True")
	return moveKingBoard
}

export function getMate(board, kingPos, kingColor) {
	// console.log(kingPos)
	// console.log(board)

	if (canPieceBlock(board, kingPos, kingColor) || canKingMove(board, kingPos, kingColor)) {
		return GAME_STATUS.NOT_CHECKMATE
	}

	if (!isKingChecked(board, kingPos.row, kingPos.col)) return GAME_STATUS.STALEMATE

	return GAME_STATUS.CHECKMATE
}

export function isKingChecked(board, kingRow, kingCol) {
	console.log(board)
	const king = board[kingRow][kingCol]

	for (let row of board) {
		for (let square of row) {
			if (!square.color || square.color === king.color) {
				continue
			}

			const squarePos = { row: square.row, col: square.col }
			const kingPos = { row: king.row, col: king.col }

			if (validateMove(board, squarePos, kingPos)) {
				console.log(square, kingRow, king.color)
				return true
			}
		}
	}
	return false
}

function canKingMove(board, kingPos, kingColor) {
	for (let r = -1; r <= 1; r++) {
		for (let c = -1; c <= 1; c++) {
			const newRow = kingPos.row + r
			const newCol = kingPos.col + c

			if (r === 0 && c === 0) continue
			if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) continue

			const newPos = { row: newRow, col: newCol }
			if (!validateKingMove(board, kingPos, newPos)) continue

			const newBoard = tryMove(board, kingPos, { row: newRow, col: newCol }, "k", kingColor)

			if (!isKingChecked(newBoard, newRow, newCol)) {
				console.log("CAN MOVE")
				return true
			}
		}
	}
	console.log("CHECKMATE")
	return false
}

function canPieceBlock(board, kingPos, kingColor) {
	for (let row of board) {
		for (let square of row) {
			if (square.color !== kingColor) continue

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
					console.log("Square:", square)
			}
		}
	}
}

//TODO enpassant and double block
function canPawnBlock(board, fromSquare, kingPos) {
	const direction = fromSquare.color === "white" ? -1 : 1
	const fromPos = { row: fromSquare.row, col: fromSquare.col }
	const toPos = { row: fromSquare.row + direction, col: fromSquare.col }

	for (let c = -1; c <= 1; c++) {
		toPos.col = fromPos.col + c

		if (toPos.row < 0 || toPos.row >= 8 || toPos.col < 0 || toPos.col >= 8) continue

		if (validatePawnMove(board, fromPos, toPos)) {
			const newBoard = tryMove(board, fromPos, toPos, fromSquare.piece, fromSquare.color)

			if (!isKingChecked(newBoard, kingPos.row, kingPos.col)) {
				console.log("Pawn Block: ", fromPos)
				return true
			}
		}
	}
	return false
}

function canOrthogonalBlock(board, fromSquare, kingPos) {
	const fromPos = { row: fromSquare.row, col: fromSquare.col }

	const directions = [
		{ row: -1, col: 0 }, // Top
		{ row: 1, col: 0 }, // Bottom
		{ row: 0, col: 1 }, // Right
		{ row: 0, col: -1 } // Left
	]

	for (const { row: r, col: c } of directions) {
		let toPos = { ...fromPos }

		while (true) {
			toPos.row += r
			toPos.col += c

			if (toPos.row < 0 || toPos.row >= 8 || toPos.col < 0 || toPos.col >= 8) break

			if (!validateOrthogonalMove(board, fromPos, toPos)) break

			const newBoard = tryMove(board, fromPos, toPos, fromSquare.piece, fromSquare.color)

			if (!isKingChecked(newBoard, kingPos.row, kingPos.col)) {
				console.log("Orthogonal Block: ", fromPos)
				return true
			}
		}
	}
}

function canDiagonalBlock(board, fromSquare, kingPos) {
	const fromPos = { row: fromSquare.row, col: fromSquare.col }

	const directions = [
		{ row: -1, col: -1 }, // Top-left
		{ row: -1, col: 1 }, // Top-right
		{ row: 1, col: -1 }, // Bottom-left
		{ row: 1, col: 1 } // Bottom-right
	]

	for (const { row: r, col: c } of directions) {
		let toPos = { ...fromPos }

		while (true) {
			toPos.row += r
			toPos.col += c

			if (toPos.row < 0 || toPos.row >= 8 || toPos.col < 0 || toPos.col >= 8) break

			if (!validateDiagonalMove(board, fromPos, toPos)) break

			const newBoard = tryMove(board, fromPos, toPos, fromSquare.piece, fromSquare.color)

			if (!isKingChecked(newBoard, kingPos.row, kingPos.col)) {
				console.log("Diagonal Block: ", fromPos)
				return true
			}
		}
	}
	return false
}

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
	const knightMoves = [
		{ row: -2, col: -1 },
		{ row: -2, col: 1 },
		{ row: -1, col: -2 },
		{ row: -1, col: 2 },
		{ row: 1, col: -2 },
		{ row: 1, col: 2 },
		{ row: 2, col: -1 },
		{ row: 2, col: 1 }
	]

	const fromPos = { row: fromSquare.row, col: fromSquare.col }

	for (const { row: r, col: c } of knightMoves) {
		const toPos = { row: fromPos.row + r, col: fromPos.col + c }

		if (toPos.row < 0 || toPos.row >= 8 || toPos.col < 0 || toPos.col >= 8) continue

		if (validateKnightMove(board, fromPos, toPos)) {
			const newBoard = tryMove(board, fromPos, toPos, fromSquare.piece, fromSquare.color)

			if (!isKingChecked(newBoard, kingPos.row, kingPos.col)) {
				console.log("Knight Block: ", fromPos)
				return true
			}
		}
	}
	return false
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

	if (Math.abs(fromPos.row - toPos.row) !== Math.abs(fromPos.col - toPos.col)) return false

	if (fromSquare.color === toSquare.color) return false

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

function validateKingMove(board, fromPos, toPos) {
	if (Math.max(Math.abs(fromPos.row - toPos.row), Math.abs(fromPos.col - toPos.col)) > 1) {
		return false
	}

	if (board[fromPos.row][fromPos.col].color === board[toPos.row][toPos.col].color) {
		return false
	}

	return true
}

function validateQueenMove(board, fromPos, toPos) {
	return (
		validateOrthogonalMove(board, fromPos, toPos) || validateDiagonalMove(board, fromPos, toPos)
	)
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

	if (fromSquare.color === toSquare.color) return false

	if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) return true

	return false
}

function validatePawnMove(board, fromPos, toPos) {
	//TODO: enpassant
	const fromColor = board[fromPos.row][fromPos.col].color
	const toColor = board[toPos.row][toPos.col].color
	const direction = fromColor === "white" ? -1 : 1

	const isFirstMove =
		(fromPos.row === 1 && fromColor === "black") || (fromPos.row === 6 && fromColor === "white")

	const isDiagonalMove =
		Math.abs(fromPos.col - toPos.col) === 1 && toPos.row === fromPos.row + direction

	const isForwardMove = toPos.row === fromPos.row + direction && toPos.col === fromPos.col

	const isDoubleMove =
		isFirstMove && toPos.row === fromPos.row + direction * 2 && toPos.col === fromPos.col

	if (isDiagonalMove && toColor && fromColor !== toColor) return true

	if (toColor != null) return false

	if (isForwardMove) return true

	if (isDoubleMove && board[toPos.row - direction][toPos.col].color == null) return true

	return false
}
