import React, { useState, useRef, useEffect } from "react"

import Square from "./square"
import GameInfo from "./gameInfo"
import PromotionChoices from "./promotionChoices"
import { isCheckMate, isKingChecked, validateMove, tryMove } from "./chessUtils/boardHelper"

import "../styles.css"

export default function Board() {
	/* TODO 
    - Use global state providers
    - If no possible moves set badSelect
    - Create getKingFunction
    - Try to reorganize states
    - Choose font
    */
	const [chessBoard, setChessBoard] = useState(boardInit())
	const [selectedPiece, setSelectedPiece] = useState(null)
	const [whiteTally, setWhiteTally] = useState([])
	const [blackTally, setBlackTally] = useState([])
	const [promotionSquare, setPromotionSquare] = useState(null)
	const [isGameOver, setIsGameOver] = useState(false)

	const [promotionColor, setPromotionColor] = useState(null)

	const whiteKing = useRef({ row: 7, col: 4 })
	const blackKing = useRef({ row: 0, col: 4 })

	const [isWhiteTurn, setIsWhiteTurn] = useState(true)

	const setBoardPiece = (row, col, attr, val) => {
		setChessBoard((prevBoard) => {
			const newBoard = prevBoard.map((r) => r.map((square) => ({ ...square })))
			newBoard[row][col][attr] = val
			return newBoard
		})
	}
	const capturePiece = (piece) => {
		if (piece.color === "black") {
			setWhiteTally((prevTally) => [...prevTally, piece.piece])
		} else {
			setBlackTally((prevTally) => [...prevTally, piece.piece])
		}
	}
	//TODO integrate onDrag
	const handleSquareClick = (row, col) => {
		const clickedSquare = chessBoard[row][col]
		if (selectedPiece) {
			const fromPos = { row: selectedPiece.row, col: selectedPiece.col }
			const toPos = { row, col }

			setBoardPiece(fromPos.row, fromPos.col, "selected", false)

			const isValidMove = validateMove(chessBoard, fromPos, toPos)

			if (isValidMove && movePiece(chessBoard, fromPos, toPos)) {
			} else {
				handleBadSelection(fromPos.row, fromPos.col)
				handleBadSelection(row, col)
			}
			setSelectedPiece(null)
		}
		// Valid piece selection
		else if (
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
		setPromotionColor(color)
	}
	useEffect(() => {
		if (promotionColor) {
			const newBoard = chessBoard.map((r) => r.map((square) => ({ ...square })))

			const oppKingPos = promotionColor === "white" ? blackKing.current : whiteKing.current
			const oppKingColor = promotionColor === "white" ? "black" : "white"

			if (isCheckMate(newBoard, oppKingPos, oppKingColor)) {
				setIsGameOver(true)
			}
		}
		setPromotionColor(false)
	}, [promotionColor])

	const handleBadSelection = (row, col) => {
		setBoardPiece(row, col, "badSelect", true)

		setTimeout(() => {
			setBoardPiece(row, col, "badSelect", false)
		}, 200)
	}
	const handlePlayAgainBtn = () => {
		setChessBoard(boardInit())
		whiteKing.current = { row: 7, col: 4 }
		blackKing.current = { row: 0, col: 4 }
		setIsGameOver(false)
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

		// console.log("from:", fromSquare.piece, fromPos.row, fromPos.col)
		// console.log("to:", toSquare.piece, toPos.row, toPos.col)
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

		const newBoard = tryMove(board, fromPos, toPos, fromSquare.piece, fromSquare.color)
		newBoard[fromPos.row][fromPos.col].selected = false

		// Only set chessBoard to newBoard if King is not checked
		const king = fromSquare.color === "white" ? whiteKing.current : blackKing.current
		if (isKingChecked(newBoard, king.row, king.col)) {
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

		// TODO function?
		const oppKingPos = fromSquare.color === "white" ? blackKing.current : whiteKing.current
		const oppKingColor = fromSquare.color === "white" ? "black" : "white"

		//TODO check for checkmate after promotion

		if (isCheckMate(newBoard, oppKingPos, oppKingColor)) {
			setIsGameOver(true)
		}

		return true
	}
	return (
		<div className="page">
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
			<GameInfo
				turn={isWhiteTurn}
				whiteTally={whiteTally}
				blackTally={blackTally}
				isGameOver={isGameOver}
				handlePlayAgain={handlePlayAgainBtn}
			/>

			{promotionSquare != null ? (
				<PromotionChoices
					square={promotionSquare}
					onClick={handlePromotionClick}
				></PromotionChoices>
			) : null}
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
