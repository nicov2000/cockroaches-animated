export class Room {
	constructor(roomLayout) {
		// roomLayout[posY][posX]
		this.roomLayout = roomLayout;
		this.roomLayoutsHistory = [roomLayout];
		this.wallHoles = [];
		this.cockroaches = [];

		this.scanWallHoles();
		this.scanCockroaches();
	}

	getRoomSize() {
		return {
			columns: this[0].length,
			rows: this.length,
		};
	}

	scanWallHoles() {
		const notHoles = ["+", "|", "-", "U", "D", "L", "R", " "];

		this.roomLayout.forEach((row, rowIndex) => {
			const arrRow = Array.from(row);

			for (let i = 0; i < arrRow.length; i++) {
				const isWallHole = !notHoles.includes(arrRow[i]);
				const posY = rowIndex;
				const posX = i;

				if (isWallHole) {
					// then it's a number
					const wallHoleNumber = this.roomLayout[posY][posX];
					const wallHole = new WallHole(posX, posY, wallHoleNumber);

					this.wallHoles.push(wallHole);
				}
			}
		});
	}

	scanCockroaches() {
		const cockroachesIDs = ["U", "D", "L", "R"];

		this.roomLayout.forEach((row, rowIndex) => {
			const arrRow = Array.from(row);

			for (let i = 0; i < arrRow.length; i++) {
				const isCockroach = cockroachesIDs.includes(arrRow[i]);
				const posY = rowIndex;
				const posX = i;

				if (isCockroach) {
					// then it's a letter
					const cockroachDirection = this.roomLayout[posY][posX];
					const cockroach = new Cockroach(this, posX, posY, cockroachDirection);

					this.cockroaches.push(cockroach);
				}
			}
		});
	}

	updateCockroachesPositions() {
		this.cockroaches.forEach((cockroach) => {
			this.updateCockroachPosition(cockroach);
		});
		this.roomLayoutsHistory.push(this.roomLayout);
	}

	updateCockroachPosition(cockroach) {
		if (cockroach.inHole) {
			return;
		}
		const dir = cockroach.direction;
		const posX = cockroach.posX;
		const posY = cockroach.posY;
		const { isNextToWallHole, wallHolePosition } =
			this.getSurroundingTilesInfo(cockroach);

		// check if cockroach is next to hole at this moment
		if (isNextToWallHole) {
			this.cockroachInHole(cockroach, wallHolePosition);
			this.roomLayout[posY] = this.updateRow(this.roomLayout[posY], posX, " ");
			return;
		}

		// check if next tile according to direction is free
		const nextTileIsFree = !this.isNextTileBlocked(dir, posX, posY);

		if (nextTileIsFree) {
			this.roomLayout[posY] = this.updateRow(this.roomLayout[posY], posX, " ");

			// cockroach moves freely according to direction
			if (dir === "U") {
				this.roomLayout[posY - 1] = this.updateRow(
					this.roomLayout[posY - 1],
					posX,
					dir
				);
				cockroach.updatePosition(posX, posY - 1);
			} else if (dir === "D") {
				this.roomLayout[posY + 1] = this.updateRow(
					this.roomLayout[posY + 1],
					posX,
					dir
				);
				cockroach.updatePosition(posX, posY + 1);
			} else if (dir === "L") {
				this.roomLayout[posY] = this.updateRow(
					this.roomLayout[posY],
					posX - 1,
					dir
				);
				cockroach.updatePosition(posX - 1, posY);
			} else if (dir === "R") {
				this.roomLayout[posY] = this.updateRow(
					this.roomLayout[posY],
					posX + 1,
					dir
				);
				cockroach.updatePosition(posX + 1, posY);
			}
		} else {
			// if (this.isNextTileOccupiedByAnotherCockroach(cockroach)) {
			// 	return; // do nothing
			// }

			// Cockroach stays in position, only turns to its left
			if (dir === "U") {
				this.roomLayout[posY] = this.updateRow(
					this.roomLayout[posY],
					posX,
					"L"
				);
				cockroach.updateDirection("L");
			}

			if (dir === "L") {
				this.roomLayout[posY] = this.updateRow(
					this.roomLayout[posY],
					posX,
					"D"
				);
				cockroach.updateDirection("D");
			}

			if (dir === "D") {
				this.roomLayout[posY] = this.updateRow(
					this.roomLayout[posY],
					posX,
					"R"
				);
				cockroach.updateDirection("R");
			}

			if (dir === "R") {
				this.roomLayout[posY] = this.updateRow(
					this.roomLayout[posY],
					posX,
					"U"
				);
				cockroach.updateDirection("U");
			}
		}
	}

	isNextTileOccupiedByAnotherCockroach(cockroach) {
		const dir = cockroach.direction;
		const posX = cockroach.posX;
		const posY = cockroach.posY;

		const cockroachesIDs = ["U", "D", "L", "R"];

		if (dir === "U") {
			return cockroachesIDs.includes(this.roomLayout[posY - 1][posX]);
		} else if (dir === "D") {
			return cockroachesIDs.includes(this.roomLayout[posY + 1][posX]);
		} else if (dir === "L") {
			return cockroachesIDs.includes(this.roomLayout[posY][posX - 1]);
		} else if (dir === "R") {
			return cockroachesIDs.includes(this.roomLayout[posY][posX + 1]);
		}
	}

	updateRow(string, index, char) {
		return string.slice(0, index) + char + string.slice(index + 1);
	}

	getSurroundingTilesInfo(cockroach) {
		const dir = cockroach.direction;
		const posX = cockroach.posX;
		const posY = cockroach.posY;

		const surroundingTilesInfo = {
			isNextToWallHole: false,
			wallHolePosition: undefined,
		};

		const wallHolePosition = this.getNearWallHolePosition(dir, posX, posY);

		if (wallHolePosition) {
			surroundingTilesInfo.isNextToWallHole = true;
			surroundingTilesInfo.wallHolePosition = wallHolePosition;
		}

		return surroundingTilesInfo;
	}

	isNextTileBlocked(direction, posX, posY) {
		const obstacles = ["|", "-", "U", "D", "L", "R"];

		if (direction === "U") {
			return obstacles.includes(this.roomLayout[posY - 1][posX]);
		} else if (direction === "D") {
			return obstacles.includes(this.roomLayout[posY + 1][posX]);
		} else if (direction === "L") {
			return obstacles.includes(this.roomLayout[posY][posX - 1]);
		} else if (direction === "R") {
			return obstacles.includes(this.roomLayout[posY][posX + 1]);
		}
	}

	getNearWallHolePosition(dir, posX, posY) {
		const otherElements = ["+", "|", "-", "U", "D", "L", "R", " "];

		const upTile = this.roomLayout[posY - 1][posX];
		const upTilePos = {
			posX: posX,
			posY: posY - 1,
		};
		const wallHoleIsUp = !otherElements.includes(upTile);

		const downTile = this.roomLayout[posY + 1][posX];
		const downTilePos = {
			posX: posX,
			posY: posY + 1,
		};
		const wallHoleIsDown = !otherElements.includes(downTile);

		const leftTile = this.roomLayout[posY][posX - 1];
		const leftTilePos = {
			posX: posX - 1,
			posY: posY,
		};
		const wallHoleIsLeft = !otherElements.includes(leftTile);

		const rightTile = this.roomLayout[posY][posX + 1];
		const rightTilePos = {
			posX: posX + 1,
			posY: posY,
		};
		const wallHoleIsRight = !otherElements.includes(rightTile);

		if (wallHoleIsUp) {
			return upTilePos;
		} else if (wallHoleIsDown) {
			return downTilePos;
		} else if (wallHoleIsLeft) {
			return leftTilePos;
		} else if (wallHoleIsRight) {
			return rightTilePos;
		} else {
			return undefined;
		}
	}

	cockroachInHole(cockroach, targetHole) {
		this.wallHoles.forEach((hole) => {
			const samePosX = hole.posX === targetHole.posX;
			const samePosY = hole.posY === targetHole.posY;

			if (samePosX && samePosY) {
				cockroach.enterHole(hole);
			}
		});
	}

	// generateLayouts() {
	// 	const allCockroachesInHoles = this.cockroaches.every(
	// 		(cockroach) => cockroach.inHole
	// 	);

	// 	while (!allCockroachesInHoles) {
	// 		this.updateCockroachesPositions();
	// 		this.generateLayouts();
	// 	}
	// }
}

export class WallHole {
	constructor(posX, posY, id) {
		this.posX = posX;
		this.posY = posY;
		this.id = id;
		this.cockroachesInside = [];
	}

	getCockroachesInside() {
		return this.cockroachesInside;
	}
}

export class Cockroach {
	constructor(room, posX, posY, direction) {
		this.room = room;
		this.posX = posX;
		this.posY = posY;
		this.direction = direction;
		this.inHole = null;
	}

	run(room) {
		room.updateCockroachPosition(this);
	}

	updatePosition(posX, posY) {
		this.posX = posX;
		this.posY = posY;
	}

	updateDirection(dir) {
		this.direction = dir;
	}

	enterHole(hole) {
		hole.cockroachesInside.push(this);
		this.updateDirection("None");
		this.inHole = hole;

		this.updatePosition(hole.posX, hole.posY);
	}
}

// First room tested ever
// const kitchen = new Room([
// 	"+----------------1---------------+", // 0
// 	"|                                |", // 1
// 	"|                                |", // 2
// 	"|          U        D            |", // 3
// 	"|     L                          |", // 4
// 	"|              R                 |", // 5
// 	"|           L                    |", // 6
// 	"|  U                             2", // 7
// 	"4        U    D                  |", // 8
// 	"|         L              R       |", // 9
// 	"|                                |", // 10
// 	"+----------------3---------------+", // 11
// 	//0										 				   33
// ]);
