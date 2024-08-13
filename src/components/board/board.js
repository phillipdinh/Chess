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
      - black 3,4,5 */
	const castlePieces = useRef(Array(6).fill(false))
	const whiteKing = useRef({ row: 7, col: 4 })
	const blackKing = useRef({ row: 0, col: 4 })
	const isWhiteTurn = useRef(true)

	/**
	 * Copies and updates given element of chessBoard array
	 *
	 * @param {number} row - Row index of chessBoard
	 * @param {number} col - Column index of chessBoard
	 * @param {string} attr - Attribute of chessBoard element
	 * @param {string} val - Value to set attribute of chessBoard element
	 *
	 * @returns {chessBoard} - Copied and updated board
	 */
	const setBoardPiece = (row, col, attr, val) => {
		setChessBoard((prevBoard) => {
			const newBoard = prevBoard.map((r) => r.map((square) => ({ ...square })))
			newBoard[row][col][attr] = val
			return newBoard
		})
	}

	/**
	 * Appends chess piece to black or white tally array based on color
	 *
	 * @param {Object} piece - Chess piece
	 *  - {string} .piece - Type of chess piece ('p', 'r', 'n', 'b', 'q', 'k')
	 *  - {String} .color - Color of chess piece ('white' or 'black')
	 */
	const capturePiece = (piece) => {
		if (piece.color === "black") {
			setWhiteTally((prevTally) => [...prevTally, piece.piece])
		} else {
			setBlackTally((prevTally) => [...prevTally, piece.piece])
		}
	}

	/**
	 * Checks if it is the given player's turn
	 *
	 * @param {string} color - Color of player ('white' or 'black')
	 *
	 * @returns {boolean} - Return true if it is the given player's turn
	 */
	const isTurn = (color) => {
		return (
			(color === "white" && isWhiteTurn.current) ||
			(color === "black" && !isWhiteTurn.current)
		)
	}

	/**
	 * Modifies position of reference of whiteKing or blackKing
	 *
	 * @param {Object} pos - Position of piece on chessBoard
	 *  - {number} row - Row index of chessBoard
	 *  - {number} col - Column index of chessBoard
	 * @param {string} color - Color of player ('white' or 'black')
	 */
	const setKingPos = (pos, color) => {
		if (color === "white") {
			whiteKing.current = { ...pos }
		} else {
			blackKing.current = { ...pos }
		}
	}

	/**
	 * Sets promotionSquare state
	 *
	 * @param {Object} square - Element of chessBoard
	 *  - {number} row - Row index of chessBoard
	 *  - {number} col - Column index of chessBoard
	 *  - {string} .piece - Type of chess piece ('p', 'r', 'n', 'b', 'q', 'k')
	 *  - {String} .color - Color of chess piece ('white' or 'black')
	 */
	const pawnPromotion = (square) => {
		if (square.piece !== "p") return
		if (square.color === "black" && square.row !== 7) return
		if (square.color === "white" && square.row !== 0) return
		setPromotionSquare(square)
	}

	/**
	 * Handles click event on a square of chessBoard, managing piece selection,
	 * move validation, and highlighting indicators for good or bad moves.
	 *
	 * Modifies the properties of the chessBoard state to support piece movement and castsling.
	 *
	 * @param {number} row - Row index of chessBoard
	 * @param {number} col - Column index of chessBoard
	 */
	//TODO Integrate onDrag
	const handleSquareClick = (row, col) => {
		const clickedSquare = chessBoard[row][col]

		// Piece previously selected
		if (selectedPiece) {
			const fromPos = { row: selectedPiece.row, col: selectedPiece.col }
			const toPos = { row, col }

			setBoardPiece(fromPos.row, fromPos.col, "selected", false)

			const castleBoard = canCastle(chessBoard, fromPos, toPos, castlePieces.current)

			// Check if castle move
			if (castleBoard) {
				castleBoard[fromPos.row][fromPos.col].selected = false
				endMove(castleBoard, castleBoard[fromPos.row][fromPos.col].color)
				setKingPos(toPos, castleBoard[toPos.row][toPos.col].color)
			}
			// Checks for valid regular move
			else {
				const isValidMove = validateMove(chessBoard, fromPos, toPos)

				if (!isValidMove || !movePiece(chessBoard, fromPos, toPos)) {
					handleBadSelection(fromPos.row, fromPos.col)
					handleBadSelection(row, col)
				}
			}
			setSelectedPiece(null)
		}
		// Valid piece selection
		else if (isTurn(clickedSquare.color)) {
			setSelectedPiece(clickedSquare)
			setBoardPiece(row, col, "selected", true)
		} else {
			handleBadSelection(row, col)
		}
	}

	/**
	 * HandlesClickEvent of pawn promotion selection
	 *
	 * Modifies 'piece' and 'color' propeerty of square containing pawn based on selection.
	 * Resets the promotionSquare to null and sets the promotionColor to trigger a useEffect.
	 *
	 * @param {number} row - Row index of chessBoard
	 * @param {number} col - Column index of chessBoard
	 * @param {string} piece - Type of chess piece ('p', 'r', 'n', 'b', 'q', 'k')
	 * @param {String} color - Color of chess piece ('white' or 'black')
	 */
	const handlePromotionClick = (row, col, piece, color) => {
		setBoardPiece(row, col, "piece", piece)
		setBoardPiece(row, col, "color", color)
		setPromotionSquare(null)
		setPromotionColor(color)
	}
	/**
	 * Effect triggered when the promotion color is set.
	 *
	 * Creates a copy of chessBoard and updates board if checkmate or stalemate
	 * found based on the opponent's king position after a pawn promotion.
	 */
	// TODO use endmove
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

	/**
	 * Handles bad selection indication by highlighting the given square
	 * for a brief moment and then resetting its state.
	 *
	 * @param {number} row - Row index of chessBoard
	 * @param {number} col - Column index of chessBoard
	 */
	const handleBadSelection = (row, col) => {
		setBoardPiece(row, col, "badSelect", true)

		const timeoutId = setTimeout(() => {
			setBoardPiece(row, col, "badSelect", false)
		}, 200)

		return () => clearTimeout(timeoutId)
	}

	/**
	 * Handles play again button reinitializing and setting chessBoard to a starting board
	 * and reseting isWhiteTurn, whiteKing, blackKing, isGameOver, mateStatus,
	 * whiteTally, and blacktally to default values.
	 */
	const handlePlayAgainBtn = () => {
		setChessBoard(boardInit())
		isWhiteTurn.current = true
		whiteKing.current = { row: 7, col: 4 }
		blackKing.current = { row: 0, col: 4 }
		setIsGameOver(false)
		setMateStatus(false)
		setWhiteTally([])
		setBlackTally([])
	}

	/**
	 * Checks the position of a chess piece and sets the corresponding index in
	 * castlePieces array to true if piece is a castling piece.
	 *
	 * @param {Object} pos - Position of piece on chessBoard
	 *  - {number} row - Row index of chessBoard
	 *  - {number} col - Column index of chessBoard
	 */
	const setCastlePiecesMoved = (pos) => {
		if (pos.row === 7) {
			switch (pos.col) {
				case 0:
					castlePieces.current[0] = true
					break
				case 4:
					castlePieces.current[1] = true
					break
				case 7:
					castlePieces.current[2] = true
					break
				default:
					console.log("Not Castle Piece")
			}
		} else if (pos.row === 0) {
			switch (pos.col) {
				case 0:
					castlePieces.current[3] = true
					break
				case 4:
					castlePieces.current[4] = true
					break
				case 7:
					castlePieces.current[5] = true
					break
				default:
					console.log("Not Castle Piece")
			}
		}
	}

	/**
	 * Moves a chess piece from one position to another on the board.
	 *
	 * Checks if the move is valid, updates the board state, and handles
	 * special cases such as capturing pieces, castling, and pawn promotion.
	 *
	 * @param {Array<Array<Object>>} board - Current state of chessBoard
	 * @param {Object} fromPos - Current position of the piece being moved.
	 *  - {number} row - Row index of board
	 *  - {number} col - Column index of board
	 * @param {Object} toPos - Target position where the piece will be moved.
	 *  - {number} row - Row index of board
	 *  - {number} col - Column index of board
	 *
	 * * @returns {boolean} - Returns true if the move was successful, false otherwise.
	 */
	const movePiece = (board, fromPos, toPos) => {
		const fromSquare = board[fromPos.row][fromPos.col]
		const toSquare = board[toPos.row][toPos.col]

		//console.log("from:", fromSquare.piece, fromPos.row, fromPos.col)
		//console.log("to:", toSquare.piece, toPos.row, toPos.col)

		if (!isTurn(fromSquare.color)) {
			return false
		}

		if (fromSquare.piece === "k") {
			setKingPos(toPos, fromSquare.color)
		}

		const newBoard = tryMove(board, fromPos, toPos, fromSquare.piece, fromSquare.color)
		newBoard[fromPos.row][fromPos.col].selected = false

		// Only set chessBoard to newBoard if King is not checked after move
		const king = fromSquare.color === "white" ? whiteKing.current : blackKing.current
		if (isKingChecked(newBoard, king.row, king.col)) {
			if (fromSquare.piece !== "k") return false
			setKingPos(fromPos, fromSquare.color)
			return false
		}

		if (!isTurn(toSquare.color)) {
			capturePiece(toSquare)
		}

		if (fromSquare.piece === "k" || fromSquare.piece === "r") {
			setCastlePiecesMoved(fromPos)
		}
		pawnPromotion(newBoard[toPos.row][toPos.col])
		endMove(newBoard, fromSquare.color)
		return true
	}

	/**
	 * Updates entire chessBoard state
	 * Switches turn to the opposing player
	 * Checks for checkmate or stale mate then then updates isGameOver and mateStatus
	 *
	 * @param {Array<Array<Object>>} board - Copy of chessboard after the move.
	 * @param {string} color - The color of the player who just moved ("white" or "black").
	 */
	//TODO breakdown even more
	const endMove = (board, color) => {
		setChessBoard(board)

		isWhiteTurn.current = !isWhiteTurn.current

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
