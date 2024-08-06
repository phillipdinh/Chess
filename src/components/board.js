import React, { useState } from "react"

import Square from "./square"
import GameInfo from "./gameInfo"

import "../styles.css"

export default function Board() {
	/* TODO 
    - Highlight possible squares and captures
    - Look for "check" after every move
    */
	const [board, setBoard] = useState(boardInit())
	const [selectedPiece, setSelectedPiece] = useState(null)
	const [isWhiteTurn, setIsWhiteTurn] = useState(true)

	const handleSquareClick = (row, col) => {
		const clickedSquare = board[row][col]

		//console.log("clicked: ", clickedSquare)

		if (selectedPiece) {
			const { row: selectedRow, col: selectedCol } = selectedPiece

			// Handle movement based on the type of piece
			const isValidMove = validateMove(selectedRow, selectedCol, row, col)

			if (isValidMove) {
				movePiece(selectedRow, selectedCol, row, col)
			} else {
				//TODO Bad move warning pop up
				setSelectedPiece(null)
			}
		} else if (clickedSquare.piece) {
			setSelectedPiece(clickedSquare)
		}
	}
	const movePiece = (fromRow, fromCol, toRow, toCol) => {
		const newBoard = board.map((row) => row.map((square) => ({ ...square }))) // Clone the board

		if (
			(isWhiteTurn && board[fromRow][fromCol].color === "black") ||
			(!isWhiteTurn && board[fromRow][fromCol].color === "white")
		) {
			setSelectedPiece(null)
			console.log("Not your piece")
			return false
		}

		newBoard[toRow][toCol].piece = newBoard[fromRow][fromCol].piece
		newBoard[toRow][toCol].color = board[fromRow][fromCol].color
		newBoard[fromRow][fromCol].piece = null
		newBoard[fromRow][fromCol].color = null

		setBoard(newBoard)
		setSelectedPiece(null)
		setIsWhiteTurn((prevTurn) => !prevTurn)
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
		//TODO add capture tally
		const fromSquare = board[fromRow][fromCol]
		const toSquare = board[toRow][toCol]
		if ((fromRow !== toRow && fromCol !== toCol) || fromSquare.color === toSquare.color) {
			console.log("Bad")
			return false
		}

		if (fromRow === toRow) {
			let startCol = Math.min(fromCol, toCol)
			let endCol = Math.max(fromCol, toCol)
			for (let col = startCol + 1; col <= endCol - 1; col++) {
				if (board[toRow][col].piece) {
					console.log("Blocked by piece:", board[col][toRow])
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
					console.log("Blocked by piece:", board[toCol][row])
					return false
				}
			}
		}
		return true
	}
	const validateDiagonalMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO add capture tally
		const fromSquare = board[fromRow][fromCol]
		const toSquare = board[toRow][toCol]

		if (
			Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol) ||
			fromSquare.color === toSquare.color
		) {
			console.log("Bad")
			return false
		}
		const rowDirection = toRow > fromRow ? 1 : -1
		const colDirection = toCol > fromCol ? 1 : -1

		let currentRow = fromRow + rowDirection
		let currentCol = fromCol + colDirection

		while (currentRow !== toRow && currentCol !== toCol) {
			if (board[currentRow][currentCol].piece) {
				console.log("Blocked by piece:", board[currentRow][currentCol])
				return false
			}
			currentRow += rowDirection
			currentCol += colDirection
		}
		return true
	}
	const validatePawnMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO: Add starting check (double), promotion, enpassant
		// White moves up (-1), Black moves down (+1)
		const toColor = board[toRow][toCol].color
		const fromColor = board[fromRow][fromCol].color
		const direction = fromColor === "white" ? -1 : 1

		//prettier-ignore
		const isDiagonalMove = Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction
		const isForwardMove = toRow === fromRow + direction && toCol === fromCol

		// Check capture (diagonal move)
		if (isDiagonalMove && toColor && fromColor !== toColor) {
			// TODO: Add capture tally
			return true
		}

		if (isForwardMove && toColor == null) {
			return true
		}

		console.log("Bad Move")
		return false
	}
	const validateRookMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO: capture, check if piece in between
		return validateOrthogonalMove(fromRow, fromCol, toRow, toCol)
	}

	const validateBishopMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO: capture
		return validateDiagonalMove(fromRow, fromCol, toRow, toCol)
	}
	const validateKnightMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO: capture tally
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
		console.log("Bad")
		return false
	}
	const validateQueenMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO: capture
		return (
			validateOrthogonalMove(fromRow, fromCol, toRow, toCol) ||
			validateDiagonalMove(fromRow, fromCol, toRow, toCol)
		)
	}
	const validateKingMove = (fromRow, fromCol, toRow, toCol) => {
		//TODO: Check, checkmate, draw, can't put self in check, capture tally
		if (
			Math.max(Math.abs(fromRow - toRow), Math.abs(fromCol - toCol)) > 1 ||
			board[fromRow][fromCol].color === board[toRow][toCol].color
		) {
			console.log("Blocked by piece:", board[toRow][toCol])
			return false
		}
		return true
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
								onClick={() => handleSquareClick(rowIndex, colIndex)}
							/>
						))}
					</div>
				))}
			</div>
			<GameInfo turn={isWhiteTurn} />
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
			currRow.push({ row: r, col: c, piece: newBoardSetup[r][c], color: player })
		}
		board.push(currRow)
	}
	return board
}
