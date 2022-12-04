import React, { useEffect, useState } from "react";
import {
	randomIntFromInterval,
	reverseLinkedList,
	useInterval,
} from "../lib/random.js";

import "./Playground.css";

class LinkedListNode {
	constructor(value) {
		this.value = value;
		this.next = null;
	}
}

class LinkedList {
	constructor(value) {
		const node = new LinkedListNode(value);
		this.head = node;
		this.tail = node;
	}
}

const Direction = {
	UP: "UP",
	RIGHT: "RIGHT",
	DOWN: "DOWN",
	LEFT: "LEFT",
};

const Playground_SIZE = 15;
const PROBABILITY_OF_DIRECTION_REVERSAL_FOOD = 0.3;

const getStartingSnake = (Playground) => {
	const rowSize = Playground.length;
	const colSize = Playground[0].length;
	const startingRow = Math.round(rowSize / 3);
	const startingCol = Math.round(colSize / 3);
	const startingCell = Playground[startingRow][startingCol];
	return {
		row: startingRow,
		col: startingCol,
		cell: startingCell,
	};
};

const Playground = () => {
	const [score, setScore] = useState(0);
	const [Playground, setPlayground] = useState(
		createPlayground(Playground_SIZE)
	);
	const [snake, setSnake] = useState(
		new LinkedList(getStartingSnake(Playground))
	);
	const [snakeCells, setSnakeCells] = useState(
		new Set([snake.head.value.cell])
	);
	// Naively set the starting food cell 5 cells away from the starting snake cell.
	const [foodCell, setFoodCell] = useState(snake.head.value.cell + 5);
	const [direction, setDirection] = useState(Direction.RIGHT);
	const [foodShouldReverseDirection, setFoodShouldReverseDirection] =
		useState(false);

	useEffect(() => {
		window.addEventListener("keydown", (e) => {
			handleKeydown(e);
		});
	}, []);

	useInterval(() => {
		moveSnake();
	}, 150);

	const handleKeydown = (e) => {
		const newDirection = getKeyDirection(e.key);
		const isValidDirection = newDirection !== "";
		if (!isValidDirection) return;
		const snakeWillRunIntoItself =
			getOpposite(newDirection) === direction && snakeCells.size > 1;
		if (snakeWillRunIntoItself) return;
		setDirection(newDirection);
	};

	const moveSnake = () => {
		const currentHeadCoords = {
			row: snake.head.value.row,
			col: snake.head.value.col,
		};

		const nextHeadCoords = getCoInDirection(currentHeadCoords, direction);
		if (isOut(nextHeadCoords, Playground)) {
			handleGameOver();
			return;
		}
		const nextHeadCell = Playground[nextHeadCoords.row][nextHeadCoords.col];
		if (snakeCells.has(nextHeadCell)) {
			handleGameOver();
			return;
		}

		const newHead = new LinkedListNode({
			row: nextHeadCoords.row,
			col: nextHeadCoords.col,
			cell: nextHeadCell,
		});
		const currentHead = snake.head;
		snake.head = newHead;
		currentHead.next = newHead;

		const newSnakeCells = new Set(snakeCells);
		newSnakeCells.delete(snake.tail.value.cell);
		newSnakeCells.add(nextHeadCell);

		snake.tail = snake.tail.next;
		if (snake.tail === null) snake.tail = snake.head;

		const foodConsumed = nextHeadCell === foodCell;
		if (foodConsumed) {
			growSnake(newSnakeCells);
			if (foodShouldReverseDirection) reverseSnake();
			handleFoodConsumption(newSnakeCells);
		}

		setSnakeCells(newSnakeCells);
	};
	const growSnake = (newSnakeCells) => {
		const growthNodeCoords = getGrowthNode(snake.tail, direction);
		if (isOut(growthNodeCoords, Playground)) {
			return;
		}
		const newTailCell =
			Playground[growthNodeCoords.row][growthNodeCoords.col];
		const newTail = new LinkedListNode({
			row: growthNodeCoords.row,
			col: growthNodeCoords.col,
			cell: newTailCell,
		});
		const currentTail = snake.tail;
		snake.tail = newTail;
		snake.tail.next = currentTail;

		newSnakeCells.add(newTailCell);
	};

	const reverseSnake = () => {
		const tailNextNodeDirection = getNextNode(snake.tail, direction);
		const newDirection = getOpposite(tailNextNodeDirection);
		setDirection(newDirection);

		reverseLinkedList(snake.tail);
		const snakeHead = snake.head;
		snake.head = snake.tail;
		snake.tail = snakeHead;
	};

	const handleFoodConsumption = (newSnakeCells) => {
		const maxPossibleCellValue = Playground_SIZE * Playground_SIZE;
		let nextFoodCell;
		while (true) {
			nextFoodCell = randomIntFromInterval(1, maxPossibleCellValue);
			if (newSnakeCells.has(nextFoodCell) || foodCell === nextFoodCell)
				continue;
			break;
		}

		const nextFoodShouldReverseDirection =
			Math.random() < PROBABILITY_OF_DIRECTION_REVERSAL_FOOD;

		setFoodCell(nextFoodCell);
		setFoodShouldReverseDirection(nextFoodShouldReverseDirection);
		setScore(score + 1);
	};

	const handleGameOver = () => {
		setScore(0);
		const snakeLLStartingValue = getStartingSnake(Playground);
		setSnake(new LinkedList(snakeLLStartingValue));
		setFoodCell(snakeLLStartingValue.cell + 5);
		setSnakeCells(new Set([snakeLLStartingValue.cell]));
		setDirection(Direction.RIGHT);
	};

	return (
		<>
    <p>Get your snake to eat all the food to get the highest score possible. Watch out for the yellow food, it can be your saviour, but can also cost you the game!</p>
			<p>Score: {score}</p>
			<div className="Playground">
				{Playground.map((row, rowIdx) => (
					<div key={rowIdx} className="row">
						{row.map((cellValue, cellIdx) => {
							const className = getCellName(
								cellValue,
								foodCell,
								foodShouldReverseDirection,
								snakeCells
							);
							return (
								<div key={cellIdx} className={className}></div>
							);
						})}
					</div>
				))}
			</div>
		</>
	);
};

const createPlayground = (Playground_SIZE) => {
	let counter = 1;
	const Playground = [];
	for (let row = 0; row < Playground_SIZE; row++) {
		const currentRow = [];
		for (let col = 0; col < Playground_SIZE; col++) {
			currentRow.push(counter++);
		}
		Playground.push(currentRow);
	}
	return Playground;
};

const getCoInDirection = (coords, direction) => {
	if (direction === Direction.UP) {
		return {
			row: coords.row - 1,
			col: coords.col,
		};
	}
	if (direction === Direction.RIGHT) {
		return {
			row: coords.row,
			col: coords.col + 1,
		};
	}
	if (direction === Direction.DOWN) {
		return {
			row: coords.row + 1,
			col: coords.col,
		};
	}
	if (direction === Direction.LEFT) {
		return {
			row: coords.row,
			col: coords.col - 1,
		};
	}
};

const isOut = (coords, Playground) => {
	const { row, col } = coords;
	if (row < 0 || col < 0) return true;
	if (row >= Playground.length || col >= Playground[0].length) return true;
	return false;
};

const getKeyDirection = (key) => {
	if (key === "ArrowUp") return Direction.UP;
	if (key === "ArrowRight") return Direction.RIGHT;
	if (key === "ArrowDown") return Direction.DOWN;
	if (key === "ArrowLeft") return Direction.LEFT;
	return "";
};

const getNextNode = (node, currentDirection) => {
	if (node.next === null) return currentDirection;
	const { row: currentRow, col: currentCol } = node.value;
	const { row: nextRow, col: nextCol } = node.next.value;
	if (nextRow === currentRow && nextCol === currentCol + 1) {
		return Direction.RIGHT;
	}
	if (nextRow === currentRow && nextCol === currentCol - 1) {
		return Direction.LEFT;
	}
	if (nextCol === currentCol && nextRow === currentRow + 1) {
		return Direction.DOWN;
	}
	if (nextCol === currentCol && nextRow === currentRow - 1) {
		return Direction.UP;
	}
	return "";
};

const getGrowthNode = (snakeTail, currentDirection) => {
	const tailNextNodeDirection = getNextNode(snakeTail, currentDirection);
	const growthDirection = getOpposite(tailNextNodeDirection);
	const currentTailCoords = {
		row: snakeTail.value.row,
		col: snakeTail.value.col,
	};
	const growthNodeCoords = getCoInDirection(
		currentTailCoords,
		growthDirection
	);
	return growthNodeCoords;
};

const getOpposite = (direction) => {
	if (direction === Direction.UP) return Direction.DOWN;
	if (direction === Direction.RIGHT) return Direction.LEFT;
	if (direction === Direction.DOWN) return Direction.UP;
	if (direction === Direction.LEFT) return Direction.RIGHT;
};

const getCellName = (
	cellValue,
	foodCell,
	foodShouldReverseDirection,
	snakeCells
) => {
	let className = "cell";
	if (cellValue === foodCell) {
		if (foodShouldReverseDirection) {
			className = "cell cell-purple";
		} else {
			className = "cell cell-red";
		}
	}
	if (snakeCells.has(cellValue)) className = "cell cell-green";

	return className;
};

export default Playground;