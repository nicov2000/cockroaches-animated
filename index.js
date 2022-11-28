/* Enunciado: 
- las cucas pueden moverse en las 4 direcciones ortogonales posibles (2D)
- tienen direccion y posicion inicial.
- avanzan de a una posicion siguiendo su posicion inicial
- al chocar con una pared giran siempre hacia la izquierda
- si pasan al lado de un agujero en la pared, se meten y se aumenta el contador de cucas en ese agujero.
- indicar donde terminaron las cucas
*/
import { Room } from "./classes.js";

// const kitchen = new Room([
// 	"+----------------0---------------+", // 0
// 	"|                                |", // 1
// 	"|                                |", // 2
// 	"|          U        D            |", // 3
// 	"|     L                          |", // 4
// 	"|              R                 |", // 5
// 	"|           L                    |", // 6
// 	"|  U                             1", // 7
// 	"3        U    D                  |", // 8
// 	"|         L              R       |", // 9
// 	"|                                |", // 10
// 	"+----------------2---------------+", // 11
// 	//0										 				   33
// ]);

const kitchen = new Room([
	"+----------------0------------------------+", // 0
	"|                                         |", // 1
	"|                                   D     |", // 2
	"|          U        D                     |", // 3
	"|     L                        L          |", // 4
	"|              R             D            |", // 5
	"|           L         D                   |", // 6
	"|  U                           R    U     1", // 7
	"3        U    D   D                       |", // 8
	"|         L              R                |", // 9
	"|                                         |", // 10
	"|               U        U                |", // 10
	"|                                R        |", // 10
	"|                    D                    |", // 10
	"|                                   D     |", // 10
	"|         R                               |", // 10
	"|     U                L     R            |", // 10
	"|                                         |", // 10
	"+----------------2------------------------+", // 11
	//0										 				   33
]);

console.clear();
// Web rendering
let stateCont = 0;

const updateBtn = document.querySelector("#start-btn");
updateBtn.addEventListener("click", start);

async function start() {
	updateBtn.removeEventListener("click", start);
	const animationSpeedInput = document.querySelector("#speed-input").value;
	let allCockroachesInHoles = kitchen.cockroaches.every(
		(cockroach) => cockroach.inHole
	);

	function newFrame() {
		console.log(kitchen.roomLayout);
		updateRoom();
		updateMetrics();
	}

	while (!allCockroachesInHoles) {
		await delay(animationSpeedInput * 1000);
		newFrame();
		allCockroachesInHoles = kitchen.cockroaches.every(
			(cockroach) => cockroach.inHole
		);
	}

	if (allCockroachesInHoles) {
		newFrame();
	}

	console.log(kitchen);
}

function updateRoom() {
	const container = document.querySelector(".container");
	const prevRoom = document.querySelector(".room-layout");

	if (prevRoom) {
		container.removeChild(prevRoom);
	}

	// ok
	const roomContainer = document.createElement("div");
	roomContainer.className = "room-layout";
	roomContainer.id = `${stateCont}`;

	kitchen.roomLayoutsHistory[stateCont].forEach((row) => {
		const p = document.createElement("p");
		p.className = "room-row";
		p.innerText = row.replace(/\s/g, "*");
		roomContainer.appendChild(p);
	});

	container.appendChild(roomContainer);
	stateCont++;

	kitchen.updateCockroachesPositions();
}

function updateMetrics() {
	const metricsContainer = document.querySelector(".metrics");
	const prevMetrics = document.querySelector("#results");

	if (prevMetrics) {
		metricsContainer.removeChild(prevMetrics);
	}

	const metrics = document.createElement("div");
	metrics.id = "results";

	const results = arrayOfZeros(kitchen.cockroaches.length);
	kitchen.cockroaches.forEach((cockroach, index) => {
		if (cockroach.inHole) {
			results[index] = cockroach.inHole.id;
		}
	});

	metrics.innerHTML = `<p>[${results}]</p>`;
	metricsContainer.appendChild(metrics);
}

// end Web rendering

function arrayOfZeros(length) {
	let array = [];

	for (let i = 0; i < length; i++) {
		array.push(0);
	}

	return array;
}

// Delay (use as async code)
function delay(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

// Bugs:
// Si una cuca que va hacia abajo se encuentra con otra que va hacia arriba, se quedan quietas eternamente. Lo mismo pasa horizontalmente. Se resuelve dejando deshabilitado el checkeo de flag isNextTileOccupiedByAnotherCockroach(cockroach) en el metodo updateCockroachPosition de la clase Room.
