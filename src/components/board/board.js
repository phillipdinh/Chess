import React, { useState, useRef, useEffect } from "react"

import Square from "./square"
import GameInfo from "../gameComponents/gameInfo"
import PromotionChoices from "../gameComponents/promotionChoices"
import {
	boardInit,
	getMate,
	isKingChecked,
	validateMove,
	tryMove,
	canCastle
} from "../chessUtils/boardHelper"

import "../../styles.css"

export default function Board() {
	/* TODO 
    - Use global state providersz
    - Try to reorganize states

    */
	const [chessBoard, setChessBoard] = useState(boardInit())
	const [selectedPiece, setSelectedPiece] = useState(null)
	const [whiteTally, setWhiteTally] = useState([])
	const [blackTally, setBlackTally] = useState([])
	const [promotionSquare, setPromotionSquare] = useState(null)
	const [isGameOver, setIsGameOver] = useState(false)
	const [mateStatus, setMateStatus] = useState(false)
	const [promotionColor, setPromotionColor] = useState(null)

	/* [r,k,r,r,k,r]
    - white 0,1,2
    - black 3,4,5
    */
	const [castlePieces, setCastlePieces] = useState(Array(6).fill(false))

	const whiteKing = useRef({ row: 7, col: 4 })
	const blackKing = useRef({ row: 0, col: 4 })
	const isWhiteTurn = useRef(true)

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
	const pawnPromotion = (square) => {
		if (square.piece !== "p") return
		if (square.color === "black" && square.row !== 7) return
		if (square.color === "white" && square.row !== 0) return
		setPromotionSquare(square)
	}
	//TODO integrate onDrag
	// set rook and king move
	const handleSquareClick = (row, col) => {
		const clickedSquare = chessBoard[row][col]
		if (selectedPiece) {
			const fromPos = { row: selectedPiece.row, col: selectedPiece.col }
			const toPos = { row, col }

			setBoardPiece(fromPos.row, fromPos.col, "selected", false)

			// TODO unnest and handleBadSelection in castle

			const castleBoard = canCastle(chessBoard, fromPos, toPos, castlePieces)
			if (castleBoard) {
				castleBoard[fromPos.row][fromPos.col].selected = false
				setChessBoard(castleBoard)
				isWhiteTurn.current = !isWhiteTurn.current

				setKingPos(toPos, castleBoard[toPos.row][toPos.col].color)
			} else {
				const isValidMove = validateMove(chessBoard, fromPos, toPos)

				if (!isValidMove || !movePiece(chessBoard, fromPos, toPos)) {
					handleBadSelection(fromPos.row, fromPos.col)
					handleBadSelection(row, col)
				}
			}

			setSelectedPiece(null)
			console.log(chessBoard)
		}
		// Valid piece selection
		else if (isTurn(clickedSquare.color)) {
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

			const mateStatus = getMate(newBoard, oppKingPos, oppKingColor)

			if (mateStatus === "checkmate" || mateStatus === "stalemate") {
				setIsGameOver(true)
				setMateStatus(mateStatus)
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
		setMateStatus(false)
		setWhiteTally([])
		setBlackTally([])
		isWhiteTurn.current = true
	}
	function setCastlePiecesMoved(pos) {
		if (pos.row === 0) {
			switch (pos.col) {
				case 0:
					break

				case 4:
					break

				case 7:
					break

				default:
					return
			}
		} else if (pos.row === 7) {
			switch (pos.col) {
				case 0:
					break

				case 4:
					break

				case 7:
					break

				default:
					return
			}
		}
	}
	function isTurn(color) {
		return (
			(color === "white" && isWhiteTurn.current) ||
			(color === "black" && !isWhiteTurn.current)
		)
	}
	function setKingPos(pos, color) {
		if (color === "white") {
			whiteKing.current = { ...pos }
		} else {
			blackKing.current = { ...pos }
		}
	}
	const movePiece = (board, fromPos, toPos) => {
		const fromSquare = board[fromPos.row][fromPos.col]
		const toSquare = board[toPos.row][toPos.col]

		console.log("from:", fromSquare.piece, fromPos.row, fromPos.col)
		console.log("to:", toSquare.piece, toPos.row, toPos.col)

		if (!isTurn(fromSquare.color)) {
			return false
		}

		if (fromSquare.piece === "k") {
			setKingPos(toPos, fromSquare.color)
		}

		const newBoard = tryMove(board, fromPos, toPos, fromSquare.piece, fromSquare.color)
		newBoard[fromPos.row][fromPos.col].selected = false

		// Only set chessBoard to newBoard if King is not checked

		const king = fromSquare.color === "white" ? whiteKing.current : blackKing.current
		if (isKingChecked(newBoard, king.row, king.col)) {
			if (fromSquare.piece !== "k") return false
			setKingPos(fromPos, fromSquare.color)
			return false
		}

		if (!isTurn(toSquare.color)) {
			capturePiece(toSquare)
		}

		// Modularize
		isWhiteTurn.current = !isWhiteTurn.current
		setChessBoard(newBoard)
		pawnPromotion(newBoard[toPos.row][toPos.col])

		const oppKingPos = fromSquare.color === "white" ? blackKing.current : whiteKing.current
		const oppKingColor = fromSquare.color === "white" ? "black" : "white"

		const mateStatus = getMate(newBoard, oppKingPos, oppKingColor)

		if (mateStatus === "checkmate" || mateStatus === "stalemate") {
			console.log(mateStatus)
			setIsGameOver(true)
			setMateStatus(mateStatus)
		}

		return true
	}
	function endMove(board, color) {
		isWhiteTurn.current = !isWhiteTurn.current
		setChessBoard(board)

		const oppKingPos = color === "white" ? blackKing.current : whiteKing.current
		const oppKingColor = color === "white" ? "black" : "white"

		const mateStatus = getMate(board, oppKingPos, oppKingColor)

		if (mateStatus === "checkmate" || mateStatus === "stalemate") {
			console.log(mateStatus)
			setIsGameOver(true)
			setMateStatus(mateStatus)
		}
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
				whiteTally={whiteTally}
				blackTally={blackTally}
				isGameOver={isGameOver}
				mateStatus={mateStatus}
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
