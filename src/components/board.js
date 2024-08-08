import React, { useState, useRef } from "react"

import Square from "./square"
import GameInfo from "./gameInfo"
import PromotionChoices from "./promotionChoices"

import "../styles.css"

export default function Board() {
	/* TODO 
    - Highlight possible squares and captures
    - Remove bad move
    - Add game over banner
    - Clean up states
    - Passboard
    */
	const [chessBoard, setChessBoard] = useState(boardInit())
	const [selectedPiece, setSelectedPiece] = useState(null)
	const [isWhiteTurn, setIsWhiteTurn] = useState(true)
	const [whiteTally, setWhiteTally] = useState([])
	const [blackTally, setBlackTally] = useState([])
	const [isBadMove, setIsBadMove] = useState(false)
	const [promotionSquare, setPromotionSquare] = useState(null)

	const whiteKing = useRef({ row: 7, col: 4 })
	const blackKing = useRef({ row: 0, col: 4 })

	const setBoardPiece = (row, col, attr, val) => {
		setChessBoard((prevBoard) => {
			const newBoard = prevBoard.map((r) => r.map((square) => ({ ...square })))
			newBoard[row][col][attr] = val
			return newBoard
		})
	}
	const capturePiece = (piece) => {
		if (piece.color === "black") {
			setWhiteTally((prevTally) => [...prevTally, piece])
		} else {
			setBlackTally((prevTally) => [...prevTally, piece])
		}
	}
	const handleSquareClick = (row, col) => {
		const clickedSquare = chessBoard[row][col]

		if (selectedPiece) {
			const fromPos = { row: selectedPiece.row, col: selectedPiece.col }
			const toPos = { row, col }

			const isValidMove = validateMove(chessBoard, fromPos, toPos)

			if (isValidMove) {
				movePiece(chessBoard, fromPos, toPos)
			} else {
				setIsBadMove(true)
			}
			setSelectedPiece(null)
		} else if (
			(clickedSquare.color === "white" && isWhiteTurn) ||
			(clickedSquare.color === "black" && !isWhiteTurn)
		) {
			setSelectedPiece(clickedSquare)
			setBoardPiece(row, col, "selected", true)
		}
	}
	const handlePromotionClick = (row, col, piece, color) => {
		setBoardPiece(row, col, "piece", piece)
		setBoardPiece(row, col, "color", color)
		setPromotionSquare(null)
	}
	const pawnPromotion = (square) => {
		if (square.piece !== "p") return
		if (square.color === "black" && square.row !== 7) return
		if (square.color === "white" && square.row !== 0) return
		setPromotionSquare(square)
	}
	const movePiece = (board, fromPos, toPos) => {
		const fromSquare = board[fromPos.row][fromPos.col]
		const toSquare = board[toPos.row][toPos.col]

		console.log(fromSquare.piece, fromPos.row, fromPos.col)
		console.log(toSquare.piece, toPos.row, toPos.col)
		if (
			(isWhiteTurn && fromSquare.color === "black") ||
			(!isWhiteTurn && fromSquare.color === "white")
		) {
			return false
		}

		// Only set chessBoard to newBoard if King is not checked
		const newBoard = board.map((row) => row.map((square) => ({ ...square })))
		newBoard[toPos.row][toPos.col] = {
			...newBoard[toPos.row][toPos.col],
			piece: fromSquare.piece,
			color: fromSquare.color
		}
		newBoard[fromPos.row][fromPos.col] = {
			...newBoard[fromPos.row][fromPos.col],
			piece: null,
			color: null,
			selected: false
		}

		if (isKingChecked(newBoard, fromSquare.color)) {
			console.log("CHECKED")

			if (fromSquare.piece !== "k") return false

			if (fromSquare.color === "white") {
				whiteKing.current.row = fromPos.row
				whiteKing.current.col = fromPos.col
			} else {
				blackKing.current.row = fromPos.row
				blackKing.current.col = fromPos.col
			}

			return false
		}
		if (
			(isWhiteTurn && toSquare.color === "black") ||
			(!isWhiteTurn && toSquare.color === "white")
		) {
			capturePiece(toSquare)
		}

		setIsWhiteTurn((prevTurn) => !prevTurn)
		setChessBoard(newBoard)
		pawnPromotion(newBoard[toPos.row][toPos.col])
	}
	const isKingChecked = (board, color) => {
		const king = color === "white" ? whiteKing.current : blackKing.current
		for (let row of board) {
			for (let square of row) {
				if (!square.color || square.color === color) {
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
	const validateMove = (board, fromPos, toPos) => {
		setBoardPiece(fromPos.row, fromPos.col, "selected", false)
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
	const validateOrthogonalMove = (board, fromPos, toPos) => {
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
	const validateDiagonalMove = (board, fromPos, toPos) => {
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
	const validatePawnMove = (board, fromPos, toPos) => {
		//TODO: enpassant
		// Prettier
		const fromColor = board[fromPos.row][fromPos.col].color
		const toColor = board[toPos.row][toPos.col].color
		const direction = fromColor === "white" ? -1 : 1

		//prettier-ignore
		const isFirstMove = (fromPos.row === 1 && fromColor === "black") || 
                            (fromPos.row === 6 && fromColor === "white")
		const isDiagonalMove =
			Math.abs(fromPos.col - toPos.col) === 1 && toPos.row === fromPos.currRow + direction
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
	const validateRookMove = (board, fromPos, toPos) => {
		return validateOrthogonalMove(board, fromPos, toPos)
	}
	const validateBishopMove = (board, fromPos, toPos) => {
		return validateDiagonalMove(board, fromPos, toPos)
	}
	const validateKnightMove = (board, fromPos, toPos) => {
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
	const validateQueenMove = (board, fromPos, toPos) => {
		return (
			validateOrthogonalMove(board, fromPos, toPos) ||
			validateDiagonalMove(board, fromPos, toPos)
		)
	}
	const validateKingMove = (board, fromPos, toPos) => {
		/*
        TODO
        - Checkmate
        - Draw
        - Castle
        */

		const fromSquare = board[fromPos.row][fromPos.col]
		if (
			Math.max(Math.abs(fromPos.row - toPos.row), Math.abs(fromPos.col - toPos.col)) > 1 ||
			board[fromPos.row][fromPos.col].color === board[toPos.row][toPos.col].color
		) {
			return false
		}
		if (fromSquare.color === "white") {
			whiteKing.current.row = toPos.row
			whiteKing.current.col = toPos.col
		} else {
			blackKing.current.row = toPos.row
			blackKing.current.col = toPos.col
		}
		return true
	}
	return (
		<>
			<div className="board">
				{chessBoard.map((row, rowIndex) => (
					<div key={rowIndex} className="board-row">
						{row.map((square, colIndex) => (
							<Square
								key={`${rowIndex}-${colIndex}`}
								row={rowIndex}
								col={colIndex}
								piece={square.piece}
								color={square.color}
								selected={square.selected}
								onClick={() => handleSquareClick(rowIndex, colIndex)}
							/>
						))}
					</div>
				))}
			</div>
			<GameInfo
				turn={isWhiteTurn}
				whiteTally={whiteTally}
				blackTally={blackTally}
				badMove={isBadMove}
			/>

			{promotionSquare != null ? (
				<PromotionChoices
					square={promotionSquare}
					onClick={handlePromotionClick}
				></PromotionChoices>
			) : null}
		</>
	)
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
const boardInit = () => {
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
				selected: false
			})
			/*
            Square:
            -row
            -col
            -piece
            -color
            )
            */
		}
		board.push(currRow)
	}
	return board
}
