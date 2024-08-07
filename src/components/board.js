import React, { useState, useRef } from "react"

import Square from "./square"
import GameInfo from "./gameInfo"
import PromotionChoices from "./promotionChoices"

import "../styles.css"

export default function Board() {
	/* TODO 
    - Highlight possible squares and captures
    - Highlight selected
    - Look for "check" after every move
    - Remove bad move
    - Add game over banner
    */
	const [board, setBoard] = useState(boardInit())
	const [selectedPiece, setSelectedPiece] = useState(null)
	const [isWhiteTurn, setIsWhiteTurn] = useState(true)
	const [whiteTally, setWhiteTally] = useState([])
	const [blackTally, setBlackTally] = useState([])
	const [isBadMove, setIsBadMove] = useState(false)
	const [promotionSquare, setPromotionSquare] = useState(null)

	const whiteKing = useRef({ row: 0, col: 4 })
	const blackKing = useRef({ row: 7, col: 4 })

	const setBoardPiece = (row, col, attr, val) => {
		setBoard((prevBoard) => {
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
		const clickedSquare = board[row][col]

		if (selectedPiece) {
			selectedPiece.selected = true
			const { row: selectedRow, col: selectedCol } = selectedPiece
			const isValidMove = validateMove(selectedRow, selectedCol, row, col)

			if (isValidMove) {
				movePiece(selectedRow, selectedCol, row, col)
			} else {
				setIsBadMove(true)
				setSelectedPiece(null)
			}
		} else if (
			(clickedSquare.color === "white" && isWhiteTurn) ||
			(clickedSquare.color === "black" && !isWhiteTurn)
		) {
			setSelectedPiece(clickedSquare)
		}
	}
	const handlePromotionClick = (row, col, piece, color) => {
		// const newBoard = board.map((row) => row.map((square) => ({ ...square })))
		// newBoard[row][col].piece = piece
		// newBoard[row][col].color = color
		// setBoard(newBoard)

		setBoardPiece(row, col, "piece", piece)
		setBoardPiece(row, col, "color", color)
		setPromotionSquare(null)
	}
	const movePiece = (fromRow, fromCol, toRow, toCol) => {
		const toSquare = board[toRow][toCol]
		const fromSquare = board[fromRow][fromCol]

		if (
			(isWhiteTurn && fromSquare.color === "black") ||
			(!isWhiteTurn && fromSquare.color === "white")
		) {
			return false
		}

		if (
			(isWhiteTurn && toSquare.color === "black") ||
			(!isWhiteTurn && toSquare.color === "white")
		) {
			capturePiece(toSquare)
		}

		const newBoard = board.map((row) => row.map((square) => ({ ...square })))
		const newBoardFrom = newBoard[fromRow][fromCol]
		const newBoardTo = newBoard[toRow][toCol]

		newBoardTo.piece = newBoard[fromRow][fromCol].piece
		newBoardTo.color = fromSquare.color
		newBoardFrom.piece = null
		newBoardFrom.color = null

		setBoard(newBoard)
		setSelectedPiece(null)
		setIsWhiteTurn((prevTurn) => !prevTurn)
		pawnPromotion(newBoardTo)
	}
	const pawnPromotion = (square) => {
		console.log(square)
		if (square.piece !== "p") return

		if (square.color === "black" && square.row !== 7) return

		if (square.color === "white" && square.row !== 0) return
		setPromotionSquare(square)
	}
	const validateMove = (fromRow, fromCol, toRow, toCol) => {
		console.log("From    : ", fromRow, fromCol)
		console.log("To (R,C): ", toRow, toCol)

		switch (board[fromRow][fromCol].piece) {
			case "p":
				return validatePawnMove(fromRow, fromCol, toRow, toCol)
			case "r":
				return validateRookMove(fromRow, fromCol, toRow, toCol)
			case "b":
				return validateBishopMove(fromRow, fromCol, toRow, toCol)
			case "n":
				return validateKnightMove(fromRow, fromCol, toRow, toCol)
			case "q":
				return validateQueenMove(fromRow, fromCol, toRow, toCol)
			case "k":
				return validateKingMove(fromRow, fromCol, toRow, toCol)
			default:
				return false // Invalid piece
		}
	}
	const validateOrthogonalMove = (fromRow, fromCol, toRow, toCol) => {
		const fromSquare = board[fromRow][fromCol]
		const toSquare = board[toRow][toCol]
		if ((fromRow !== toRow && fromCol !== toCol) || fromSquare.color === toSquare.color) {
			return false
		}
		if (fromRow === toRow) {
			let startCol = Math.min(fromCol, toCol)
			let endCol = Math.max(fromCol, toCol)
			for (let col = startCol + 1; col <= endCol - 1; col++) {
				if (board[toRow][col].piece) {
					return false
				}
			}
		} else {
			let startRow = Math.min(fromRow, toRow)
			let endRow = Math.max(fromRow, toRow)
			for (let row = startRow + 1; row < endRow; row++) {
				if (board[row][toCol].piece) {
					return false
				}
			}
		}
		return true
	}
	const validateDiagonalMove = (fromRow, fromCol, toRow, toCol) => {
		const fromSquare = board[fromRow][fromCol]
		const toSquare = board[toRow][toCol]

		if (
			Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol) ||
			fromSquare.color === toSquare.color
		) {
			return false
		}
		const rowDirection = toRow > fromRow ? 1 : -1
		const colDirection = toCol > fromCol ? 1 : -1

		let currentRow = fromRow + rowDirection
		let currentCol = fromCol + colDirection

		while (currentRow !== toRow && currentCol !== toCol) {
			if (board[currentRow][currentCol].piece) {
				return false
			}
			currentRow += rowDirection
			currentCol += colDirection
		}
		return true
	}
	const validatePawnMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO: enpassant

		const toColor = board[toRow][toCol].color
		const fromColor = board[fromRow][fromCol].color
		const direction = fromColor === "white" ? -1 : 1

		//prettier-ignore
		const isFirstMove = (fromRow === 1 && fromColor === "black") || 
                            (fromRow === 6 && fromColor === "white")
		const isDiagonalMove = Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction
		const isForwardMove = toRow === fromRow + direction && toCol === fromCol
		const isDoubleMove = isFirstMove && toRow === fromRow + direction * 2 && toCol === fromCol

		if (isDiagonalMove && toColor && fromColor !== toColor) {
			return true
		}

		if (toColor != null) {
			return false
		}

		if (isForwardMove) {
			return true
		}
		if (isDoubleMove && board[toRow - direction][toCol].color == null) {
			return true
		}
		return false
	}
	const validateRookMove = (fromRow, fromCol, toRow, toCol) => {
		return validateOrthogonalMove(fromRow, fromCol, toRow, toCol)
	}
	const validateBishopMove = (fromRow, fromCol, toRow, toCol) => {
		return validateDiagonalMove(fromRow, fromCol, toRow, toCol)
	}
	const validateKnightMove = (fromRow, fromCol, toRow, toCol) => {
		const fromSquare = board[fromRow][fromCol]
		const toSquare = board[toRow][toCol]

		const rowDiff = Math.abs(fromRow - toRow)
		const colDiff = Math.abs(fromCol - toCol)

		if (
			fromSquare.color !== toSquare.color &&
			((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))
		) {
			return true
		}
		return false
	}
	const validateQueenMove = (fromRow, fromCol, toRow, toCol) => {
		return (
			validateOrthogonalMove(fromRow, fromCol, toRow, toCol) ||
			validateDiagonalMove(fromRow, fromCol, toRow, toCol)
		)
	}
	const validateKingMove = (fromRow, fromCol, toRow, toCol) => {
		/*
        TODO
        - Check
        - checkmate
        - Draw
        - Can't put self in check
        - Ppdate king square
        - Castle
        */
		if (
			Math.max(Math.abs(fromRow - toRow), Math.abs(fromCol - toCol)) > 1 ||
			board[fromRow][fromCol].color === board[toRow][toCol].color
		) {
			console.log("Blocked by piece:", board[toRow][toCol])
			return false
		}
		return true
	}

	const KingStatus = (fromRow, fromCol) => {
		// Look at color of piece moved
		// Look for king
		// Check every piece on board and validate it against King

		const fromColor = board[fromRow][fromCol].color
		const king = fromColor === "white" ? whiteKing : blackKing
		board.forEach((row) => {
			row.forEach((square) => {
				// if (square.color !== fromColor) {
				//     continue

				// }
				// If valid then it is in check
				validateMove(square.row, square.col, king.row, king.col)
			})
		})
	}
	return (
		<>
			<div className="board">
				{board.map((row, rowIndex) => (
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
