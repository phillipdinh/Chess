import React, { useState, useRef } from "react"

import Square from "../square"
import GameInfo from "../gameInfo"
import PromotionChoices from "../promotionChoices"
import { isKingChecked, validateMove } from "./boardHelper"

import "../../styles.css"

export default function Board() {
	/* TODO 
    - Add game over banner
    - Drag
    - Moves functions out of board
    - Use global state providers
    - If no possible moves set badSelect
    */
	const [chessBoard, setChessBoard] = useState(boardInit())
	const [selectedPiece, setSelectedPiece] = useState(null)
	const [isWhiteTurn, setIsWhiteTurn] = useState(true)
	const [whiteTally, setWhiteTally] = useState([])
	const [blackTally, setBlackTally] = useState([])
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

			setBoardPiece(fromPos.row, fromPos.col, "selected", false)

			const isValidMove = validateMove(chessBoard, fromPos, toPos)

			if (isValidMove) {
				movePiece(chessBoard, fromPos, toPos)
			} else {
				handleBadSelection(fromPos.row, fromPos.col)
				handleBadSelection(row, col)
			}
			setSelectedPiece(null)
		} else if (
			(clickedSquare.color === "white" && isWhiteTurn) ||
			(clickedSquare.color === "black" && !isWhiteTurn)
		) {
			setSelectedPiece(clickedSquare)
			setBoardPiece(row, col, "selected", true)
		} else {
			handleBadSelection(row, col)
		}
	}
	const handlePromotionClick = (row, col, piece, color) => {
		setBoardPiece(row, col, "piece", piece)
		setBoardPiece(row, col, "color", color)
		setPromotionSquare(null)
	}
	const handleBadSelection = (row, col) => {
		setBoardPiece(row, col, "badSelect", true)

		setTimeout(() => {
			setBoardPiece(row, col, "badSelect", false)
		}, 200)
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

		if (fromSquare.piece === "k") {
			if (fromSquare.color === "white") {
				whiteKing.current.row = toPos.row
				whiteKing.current.col = toPos.col
			} else {
				blackKing.current.row = toPos.row
				blackKing.current.col = toPos.col
			}
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

		const king = fromSquare.color === "white" ? whiteKing.current : blackKing.current
		if (isKingChecked(newBoard, king)) {
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
								badSelect={square.badSelect}
								onClick={() => handleSquareClick(rowIndex, colIndex)}
							/>
						))}
					</div>
				))}
			</div>
			<GameInfo turn={isWhiteTurn} whiteTally={whiteTally} blackTally={blackTally} />

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
				selected: false,
				badSelect: false
			})
		}
		board.push(currRow)
	}
	return board
}
