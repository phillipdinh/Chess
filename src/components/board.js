import React, { useState } from "react"

import Square from "./square"
import "../styles.css"

export default function Board() {
	const [board, setBoard] = useState(boardInit())
	const [selectedPiece, setSelectedPiece] = useState(null)

	const handleSquareClick = (row, col) => {
		const clickedSquare = board[row][col]

		if (selectedPiece) {
			const {
				piece: selectedPieceType,
				color: selectedColor,
				row: selectedRow,
				col: selectedCol
			} = selectedPiece

			// Handle movement based on the type of piece
			const isValidMove = validateMove(
				selectedPieceType,
				selectedColor,
				selectedRow,
				selectedCol,
				row,
				col
			)

			if (isValidMove) {
				movePiece(selectedColor, selectedRow, selectedCol, row, col)
			}
		} else if (clickedSquare.piece) {
			setSelectedPiece(clickedSquare)
		}
	}
	const validateMove = (pieceType, color, fromRow, fromCol, toRow, toCol) => {
		switch (pieceType.toLowerCase()) {
			case "p":
				return validatePawnMove(color, fromRow, fromCol, toRow, toCol)
			// case "r":
			// 	return validateRookMove(fromRow, fromCol, toRow, toCol)
			case "n":
				return validateKnightMove(fromRow, fromCol, toRow, toCol)
			// case "b":
			// 	return validateBishopMove(fromRow, fromCol, toRow, toCol)
			// case "q":
			// 	return validateQueenMove(fromRow, fromCol, toRow, toCol)
			// case "k":
			// 	return validateKingMove(fromRow, fromCol, toRow, toCol)
			default:
				return false // Invalid piece
		}
	}
	const validatePawnMove = (color, fromRow, fromCol, toRow, toCol) => {
		//TODO: Add starting check (double), capture, promotion
		const direction = color == "white" ? -1 : 1 // White moves up (-1), Black moves down (+1)
		console.log("From: ", fromRow, fromCol)
		console.log("To: ", toRow, toCol)

		// Check Normal move
		if (
			toRow === fromRow + direction &&
			toCol === fromCol &&
			!board[toRow][toCol].piece
		) {
			return true
		} else {
			console.log("Bad")
			return false
		}
	}

	const validateKnightMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO: Add starting check (double), capture, promotion
		console.log("From: ", fromRow, fromCol)
		console.log("To: ", toRow, toCol)

		const rowDiff = Math.abs(fromRow - toRow)
		const colDiff = Math.abs(fromCol - toCol)

		// L Shape
		if (!board[toRow][toCol].piece) {
			return true
		} else {
			console.log("Bad")
			return false
		}
	}

	const movePiece = (color, fromRow, fromCol, toRow, toCol) => {
		const newBoard = board.map((row) => row.map((square) => ({ ...square }))) // Clone the board

		// Move the piece
		newBoard[toRow][toCol].piece = newBoard[fromRow][fromCol].piece
		newBoard[toRow][toCol].color = color
		newBoard[fromRow][fromCol].piece = null
		newBoard[fromRow][fromCol].color = null

		setBoard(newBoard)
		setSelectedPiece(null) // Deselect piece after moving
	}

	return (
		<div className="board">
			{board.map((row, rowIndex) => (
				<div key={rowIndex} className="board-row">
					{row.map((square, colIndex) => (
						<Square
							row={rowIndex}
							col={colIndex}
							piece={square.piece}
							color={square.color}
							onClick={() => handleSquareClick(rowIndex, colIndex)}
						/>
					))}
				</div>
			))}
		</div>
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
			currRow.push({ row: r, col: c, piece: newBoardSetup[r][c], color: player })
		}
		board.push(currRow)
	}
	return board
}
