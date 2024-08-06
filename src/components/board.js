import React, { useState } from "react"

import Square from "./square"
import "../styles.css"

export default function Board() {
	// TODO Turns
	const [board, setBoard] = useState(boardInit())
	const [selectedPiece, setSelectedPiece] = useState(null)

	const handleSquareClick = (row, col) => {
		const clickedSquare = board[row][col]

		//console.log("clicked: ", clickedSquare)

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
			case "r":
				return validateRookMove(fromRow, fromCol, toRow, toCol)
			case "b":
				return validateBishopMove(fromRow, fromCol, toRow, toCol)
			case "n":
				return validateKnightMove(fromRow, fromCol, toRow, toCol)
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
		const direction = color === "white" ? -1 : 1 // White moves up (-1), Black moves down (+1)
		console.log("From    : ", fromRow, fromCol)
		console.log("To (R,C): ", toRow, toCol)

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
	const validateRookMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO: capture, check if piece in between
		console.log("From: ", fromRow, fromCol)
		console.log("To: ", toRow, toCol)

		// TODO clean up redundancy
		// Horizontal and Vertical
		if ((fromRow === toRow || fromCol === toCol) && !board[toRow][toCol].piece) {
			// Check if piece is in the way
			if (fromRow === toRow) {
				let startCol = Math.min(fromCol, toCol)
				let endCol = Math.max(fromCol, toCol)
				for (let col = startCol + 1; col <= endCol - 1; col++) {
					if (board[toRow][col].piece) {
						console.log("Blocked by piece at", board[col][toRow])
						console.log()
						return false
					}
				}
			} else {
				let startRow = Math.min(fromRow, toRow)
				let endRow = Math.max(fromRow, toRow)
				for (let row = startRow + 1; row < endRow; row++) {
					console.log(row)
					if (board[row][toCol].piece) {
						console.log("Blocked by piece at", board[toCol][row])
						return false
					}
				}
			}
			return true
		} else {
			console.log("Bad")
			return false
		}
	}

	const validateBishopMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO: capture, check if piece in between
		console.log("From: ", fromRow, fromCol)
		console.log("To: ", toRow, toCol)

		const rowDiff = Math.abs(fromRow - toRow)
		const colDiff = Math.abs(fromCol - toCol)

		const rowDirection = toRow > fromRow ? 1 : -1
		const colDirection = toCol > fromCol ? 1 : -1

		let currentRow = fromRow + rowDirection
		let currentCol = fromCol + colDirection

		// Diagonal
		while (currentRow != toRow && currentCol != toCol) {
			if (board[currentRow][currentCol].piece) {
				console.log("Blocked by piece at", currentRow, currentCol)
				return false
			}
			currentRow += rowDirection
			currentCol += colDirection
		}

		return true
	}
	const validateKnightMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO: capture
		console.log("From: ", fromRow, fromCol)
		console.log("To: ", toRow, toCol)

		const rowDiff = Math.abs(fromRow - toRow)
		const colDiff = Math.abs(fromCol - toCol)

		// L Shape
		if (
			((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) &&
			!board[toRow][toCol].piece
		) {
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
