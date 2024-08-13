/**
 * Initial setup for a chessboard represented as a 2D array.
 * Each inner array corresponds to a row on the chessboard.
 *
 * String elements represent chess pieces:
 * - "r" : Rook
 * - "n" : Knight
 * - "b" : Bishop
 * - "q" : Queen
 * - "k" : King
 * - "p" : Pawn
 * @type {Array<Array<string|null>>}
 */
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

/**
 * Initializes a new chessboard as a 2D array.
 * Row 0,1 is 'Black's pieces and Row 6,7 is 'White's pieces
 *
 * Each square on the board is represented as an object with properties:
 * - {number} row: Row index of the square.
 * - {number} col: Column index of the square.
 * - {string} piece: Type of piece on the square, based on the initial setup.
 * - {string} color: The color of the piece, either "black", "white", or null if empty.
 * - {boolean} selected: A boolean indicating if the square is currently selected.
 * - {boolean} badSelect: A boolean indicating if the selection was invalid.
 *
 * @returns {Array<Array<Object>>} - A 2D array representing the chessboard.
 */
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

/**
 * Creates a copy of board state with the specified piece moved to the new position.
 *
 * @param {Array<Array<Object>>} board - The current state of the chessboard.
 * @param {Object} fromPos - Current position of the piece being moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 * @param {Object} toPos - Target position where the piece will be moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 * @param {string} piece - Type of chess piece ('p', 'r', 'n', 'b', 'q', 'k')
 * @param {String} color - Color of chess piece ('white' or 'black')
 *
 * @returns {Array<Array<Object>>} - New board state with the piece moved to the target position.
 */
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

// TODO document
export function canCastle(board, fromPos, toPos, castlePieces) {
	const fromSquare = board[fromPos.row][fromPos.col]
	const color = fromSquare.color

	if (fromSquare.piece !== "k") return false

	if (isKingChecked(board, fromSquare.row, fromSquare.col)) return false

	// Check if actually trying to castle
	if (
		!(
			(toPos.row === 0 && (toPos.col === 2 || toPos.col === 6)) ||
			(toPos.row === 7 && (toPos.col === 2 || toPos.col === 6))
		)
	) {
		return false
	}

	const rookSquare = toPos.col === 2 ? board[toPos.row][0] : board[toPos.row][7]

	if (rookSquare.piece !== "r") return false

	if (fromSquare.color !== rookSquare.color) return false

	// Check if pieces are empty between king and rook
	const startCol = Math.min(fromSquare.col, rookSquare.col) + 1
	const endCol = Math.max(fromSquare.col, rookSquare.col)
	for (let col = startCol; col < endCol; col++) {
		if (board[toPos.row][col].piece != null) return false
	}

	// [r,k,r,r,k,r]
	if (color === "white") {
		if (castlePieces[1]) return false

		if (rookSquare.col === 0 && castlePieces[0]) return false

		if (rookSquare.col === 7 && castlePieces[2]) return false
	}
	if (color === "black") {
		if (castlePieces[4]) return false

		if (rookSquare.col === 0 && castlePieces[3]) return false

		if (rookSquare.col === 7 && castlePieces[5]) return false
	}

	const rookPos = { row: rookSquare.row, col: rookSquare.col }

	const rookMoveCol = toPos.col === 2 ? 3 : 5
	const rookMovePos = { row: toPos.row, col: rookMoveCol }

	const moveRookBoard = tryMove(board, rookPos, rookMovePos, "r", color)
	const moveKingBoard = tryMove(moveRookBoard, fromPos, toPos, "k", color)

	if (isKingChecked(moveKingBoard, toPos.row, toPos.col)) return false

	return moveKingBoard
}

/*
 *
 */
const GAME_STATUS = {
	CHECKMATE: "checkmate",
	STALEMATE: "stalemate",
	NOT_CHECKMATE: false
}
/**
 * Evaluates if specified king is in checkmate or stalemate.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} kingPos - Position of the king.
 *  - {number} kingPos.row - Row index of the king's position.
 *  - {number} kingPos.col - Column index of the king's position.
 * @param {string} kingColor - The color of the king ('white' or 'black').
 *
 * @returns {string|boolean} - Returns "checkmate" if the king is in checkmate,
 *                              "stalemate" if the king is in stalemate,
 *                              or false if the king is not in checkmate.
 */
export function getMate(board, kingPos, kingColor) {
	if (canPieceBlock(board, kingPos, kingColor) || canKingMove(board, kingPos, kingColor)) {
		return GAME_STATUS.NOT_CHECKMATE
	}

	if (!isKingChecked(board, kingPos.row, kingPos.col)) return GAME_STATUS.STALEMATE

	return GAME_STATUS.CHECKMATE
}
/**
 * Checks if the king is in check.
 *
 * Iterates through entire board to determine if the king can be captured by any opposing pieces.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {number} kingRow - Row index of the king's position.
 * @param {number} kingCol - Column index of the king's position.
 *
 * @returns {boolean} - Returns true if the king is in check, otherwise returns false.
 */
export function isKingChecked(board, kingRow, kingCol) {
	const king = board[kingRow][kingCol]

	for (let row of board) {
		for (let square of row) {
			if (!square.color || square.color === king.color) continue

			const squarePos = { row: square.row, col: square.col }
			const kingPos = { row: king.row, col: king.col }

			if (validateMove(board, squarePos, kingPos)) return true
		}
	}
	return false
}

/**
 * Determines if the king can legally move to any adjacent square without being in check.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} kingPos - Position of the king.
 *  - {number} kingPos.row - Row index of the king's position.
 *  - {number} kingPos.col - Column index of the king's position.
 * @param {string} kingColor - The color of the king ('white' or 'black').
 *
 * @returns {boolean} - Returns true if the king can move to at least one valid square, otherwise returns false.
 */
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
	return false
}

/**
 * Checks if any pieces of the color as the king can block a check to the king.
 *
 * Iterates through entire board and checks if any of the player's pieces
 * can move to a position to block the attack on the king.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} kingPos - Position of the king.
 *  - {number} kingPos.row - Row index of the king's position.
 *  - {number} kingPos.col - Column index of the king's position.
 * @param {string} kingColor - The color of the king ('white' or 'black').
 *
 * @returns {boolean} - Returns true if a piece can block the check to the king, otherwise returns false.
 */
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

/**
 * Determines if a pawn can block a check to the king by moving to a specified position.
 *
 * Checks if the pawn can move to an adjacent square in front of it
 * (either diagonally or straight ahead) and if that move would prevent the king
 * from being in check. The pawn's direction of movement is determined by its color.
 *
 *
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromSquare - Square object representing the pawn that is attempting to block.
 *  - {number} row - Row index of the pawn's current position.
 *  - {number} col - Column index of the pawn's current position.
 *  - {string} piece - Type of chess piece ('p')
 *  - {String} color - Color of chess piece ('white' or 'black')
 * @param {Object} kingPos - Position of the king.
 *  - {number} kingPos.row - Row index of the king's position.
 *  - {number} kingPos.col - Column index of the king's position.
 *
 * @returns {boolean} - Returns true if the pawn can move to block the king from being checked, otherwise returns false.
 */
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

/**
 * Determines if a piece can block a check to the king by moving orthogonally
 * (horizontally or vertically)
 *
 * Checks all possible orthogonal directions from the piece's current position and
 * if the piece can move to a position that prevents the king from being in check.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromSquare - Square object representing the piece that is attempting to block.
 *  - {number} row - Row index of the piece's current position.
 *  - {number} col - Column index of the piece's current position.
 *  - {string} piece - Type of chess piece ('r', 'q')
 *  - {String} color - Color of chess piece ('white' or 'black')
 * @param {Object} kingPos - Position of the king.
 *  - {number} kingPos.row - Row index of the king's position.
 *  - {number} kingPos.col - Column index of the king's position.
 *
 * @returns {boolean} - Returns true if the piece can move to block the king from being checked, otherwise returns false.
 */
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

/**
 * Determines if a piece can block a check to the king by moving diagonally.
 * (top-left, top-right, bottom-left, bottom-right)
 *
 * Checks all possible diagonal directions from the piece's current position and
 * if the piece can move to a position that prevents the king from being in check.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromSquare - Square object representing the piece that is attempting to block.
 *  - {number} row - Row index of the piece's current position.
 *  - {number} col - Column index of the piece's current position.
 *  - {string} piece - Type of chess piece ('r', 'q')
 *  - {String} color - Color of chess piece ('white' or 'black')
 * @param {Object} kingPos - Position of the king.
 *  - {number} kingPos.row - Row index of the king's position.
 *  - {number} kingPos.col - Column index of the king's position.
 *
 * @returns {boolean} - Returns true if the piece can move to block the king from being checked, otherwise returns false.
 */
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

/**
 * Determines if a queen can block a check to the king by moving diagonally or orthogonally.
 *
 * Checks all possible diagonal and orthogonal moves of the queen and
 * if the queen can move to a position that prevents the king from being in check.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromSquare - Square object representing the queen that is attempting to block.
 *  - {number} row - Row index of the queen's current position.
 *  - {number} col - Column index of the queen's current position.
 *  - {string} piece - Type of chess piece ('q')
 *  - {String} color - Color of chess piece ('white' or 'black')
 * @param {Object} kingPos - Position of the king.
 *  - {number} kingPos.row - Row index of the king's position.
 *  - {number} kingPos.col - Column index of the king's position.
 *
 * @returns {boolean} - Returns true if the piece can move to block the king from being checked, otherwise returns false.
 */
function canQueenBlock(board, fromSquare, kingPos) {
	return (
		canDiagonalBlock(board, fromSquare, kingPos) ||
		canOrthogonalBlock(board, fromSquare, kingPos)
	)
}

/**
 * Determines if a rook can block a check to the king by moving orthogonally.
 *
 * Checks all possible orthogonal moves of the rook and
 * if the rook can move to a position that prevents the king from being in check.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromSquare - Square object representing the rook that is attempting to block.
 *  - {number} row - Row index of the rook's current position.
 *  - {number} col - Column index of the rook's current position.
 *  - {string} piece - Type of chess piece ('r')
 *  - {String} color - Color of chess piece ('white' or 'black')
 * @param {Object} kingPos - Position of the king.
 *  - {number} kingPos.row - Row index of the king's position.
 *  - {number} kingPos.col - Column index of the king's position.
 *
 * @returns {boolean} - Returns true if the piece can move to block the king from being checked, otherwise returns false.
 */
function canRookBlock(board, fromSquare, kingPos) {
	return canOrthogonalBlock(board, fromSquare, kingPos)
}

/**
 * Determines if a bishop can block a check to the king by moving diagonally.
 *
 * Checks all possible diagonal moves of the bishop and
 * if the bishop can move to a position that prevents the king from being in check.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromSquare - Square object representing the bishop that is attempting to block.
 *  - {number} row - Row index of the bishop's current position.
 *  - {number} col - Column index of the bishop's current position.
 *  - {string} piece - Type of chess piece ('b')
 *  - {String} color - Color of chess piece ('white' or 'black')
 * @param {Object} kingPos - Position of the king.
 *  - {number} kingPos.row - Row index of the king's position.
 *  - {number} kingPos.col - Column index of the king's position.
 *
 * @returns {boolean} - Returns true if the piece can move to block the king from being checked, otherwise returns false.
 */
function canBishopBlock(board, fromSquare, kingPos) {
	return canDiagonalBlock(board, fromSquare, kingPos)
}

/**
 * Determines if a knight can block a check to the king by moving to a valid knight position.
 *
 * Checks all possible moves of the knight and
 * if moving to any of those positions would prevent the king from being in check.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromSquare - Square object representing the knight that is attempting to block.
 *  - {number} row - Row index of the knight's current position.
 *  - {number} col - Column index of the knight's current position.
 *  - {string} piece - Type of chess piece ('n')
 *  - {String} color - Color of chess piece ('white' or 'black')
 * @param {Object} kingPos - Position of the king.
 *  - {number} kingPos.row - Row index of the king's position.
 *  - {number} kingPos.col - Column index of the king's position.
 *
 * @returns {boolean} - Returns true if the piece can move to block the king from being checked, otherwise returns false.
 */
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

/**
 * Validates a move for a given piece on the chessboard.
 *
 * Checks the type of piece at the specified `fromPos` and
 * validates whether it can move to the specified `toPos`.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromPos - Current position of the piece being moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 * @param {Object} toPos - Target position where the piece will be moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 *
 * @returns {boolean} - Returns true if the move is valid for the specified piece, otherwise returns false.
 */
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

/**
 * Validates whether a piece can move orthogonally (horizontally or vertically)
 *
 * Checks if a move from `fromPos` to `toPos` is valid for an orthogonal move,
 * ensuring that the destination square is either empty or occupied by an opponent's piece,
 * and that there are no pieces blocking the path of the move.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromPos - Current position of the piece being moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 * @param {Object} toPos - Target position where the piece will be moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 *
 * @returns {boolean} - Returns true if the orthogonal move is valid, otherwise returns false.
 */
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

/**
 * Validates whether a piece can move diagonally (top-left, top-right, bottom-left, bottom-right)
 *
 * Checks if a move from `fromPos` to `toPos` is valid for an diagonal move,
 * ensuring that the destination square is either empty or occupied by an opponent's piece,
 * and that there are no pieces blocking the path of the move.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromPos - Current position of the piece being moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 * @param {Object} toPos - Target position where the piece will be moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 *
 * @returns {boolean} - Returns true if the diagonal move is valid, otherwise returns false.
 */
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

/**
 * Validates whether a king can move from one position to another on the chessboard.
 *
 * Checks if the king can move to adjacent square and
 * if the destination square is not occupied by a piece of the same color.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromPos - Current position of the piece being moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 * @param {Object} toPos - Target position where the piece will be moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 *
 * @returns {boolean} - Returns true if the king's move is valid, otherwise returns false.
 */
function validateKingMove(board, fromPos, toPos) {
	if (Math.max(Math.abs(fromPos.row - toPos.row), Math.abs(fromPos.col - toPos.col)) > 1) {
		return false
	}

	if (board[fromPos.row][fromPos.col].color === board[toPos.row][toPos.col].color) {
		return false
	}

	return true
}
/**
 * Validates whether a queen can move from one position to another on the chessboard.
 *
 * Checks if the move was valid diagonally and orthogonally.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromPos - Current position of the piece being moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 * @param {Object} toPos - Target position where the piece will be moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 *
 * @returns {boolean} - Returns true if the queen's move is valid, otherwise returns false.
 */
function validateQueenMove(board, fromPos, toPos) {
	return (
		validateOrthogonalMove(board, fromPos, toPos) || validateDiagonalMove(board, fromPos, toPos)
	)
}

/**
 * Validates whether a rook can move from one position to another on the chessboard.
 *
 * Checks if the move was valid orthogonally.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromPos - Current position of the piece being moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 * @param {Object} toPos - Target position where the piece will be moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 *
 * @returns {boolean} - Returns true if the rook's move is valid, otherwise returns false.
 */
function validateRookMove(board, fromPos, toPos) {
	return validateOrthogonalMove(board, fromPos, toPos)
}

/**
 * Validates whether a bishop can move from one position to another on the chessboard.
 *
 * Checks if the move was valid diagonally.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromPos - Current position of the piece being moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 * @param {Object} toPos - Target position where the piece will be moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 *
 * @returns {boolean} - Returns true if the rook's move is valid, otherwise returns false.
 */
function validateBishopMove(board, fromPos, toPos) {
	return validateDiagonalMove(board, fromPos, toPos)
}

/**
 * Validates whether a knight can move from one position to another on the chessboard.
 *
 * A knight moves in an L-shape: two squares in one direction and then one square
 * perpendicular, or one square in one direction and then two squares perpendicular.
 * Checks if the move is valid and ensures the knight is not moving to a square occupied by a friendly piece.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromPos - Current position of the piece being moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 * @param {Object} toPos - Target position where the piece will be moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 *
 * @returns {boolean} - Returns true if the rook's move is valid, otherwise returns false.
 */
function validateKnightMove(board, fromPos, toPos) {
	const fromSquare = board[fromPos.row][fromPos.col]
	const toSquare = board[toPos.row][toPos.col]
	const rowDiff = Math.abs(fromPos.row - toPos.row)
	const colDiff = Math.abs(fromPos.col - toPos.col)

	if (fromSquare.color === toSquare.color) return false

	if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) return true

	return false
}

/**
 * Validates whether a pawn can move from one position to another on the chessboard.
 *
 * A pawn can move forward one square or two squares from its starting position,
 * and can capture diagonally. Checks if the move is valid based on
 * the pawn's direction and rules for moving and capturing.
 * Note: En passant capturing is not yet implemented.
 *
 * @param {Array<Array<Object>>} board - The current state of a chessboard copy.
 * @param {Object} fromPos - Current position of the piece being moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 * @param {Object} toPos - Target position where the piece will be moved.
 *  - {number} row - Row index of board
 *  - {number} col - Column index of board
 *
 * @returns {boolean} - Returns true if the rook's move is valid, otherwise returns false.
 */
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
