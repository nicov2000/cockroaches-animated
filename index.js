import { Room } from "./classes.js";
import { arrayOfZeros, delay } from "./functions.js";

const kitchen = new Room([
	"+----------------1------------------------+",
	"|                                         |",
	"|                                   D     |",
	"|          U        D                     |",
	"|     L                        L          |",
	"|              R             D            |",
	"|           L         D                   |",
	"|  U                           R    U     2",
	"4        U    D   D                       |",
	"|         L              R                |",
	"|                                         |",
	"|               U        U                |",
	"|                                R        |",
	"|                    D                    |",
	"|                                   D     |",
	"|         R                               |",
	"|     U                L     R            |",
	"|                                         |",
	"+----------------3------------------------+",
]);

// Web rendering
console.clear();

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
		updateWebScenario();
		updateWebMetrics();
	}

	let stateCont = 0;
	function updateWebScenario() {
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

	function updateWebMetrics() {
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
// end Web rendering

// Bugs:
// Si una cuca que va hacia abajo se encuentra con otra que va hacia arriba, se quedan quietas eternamente. Lo mismo pasa horizontalmente. Se resuelve dejando deshabilitado el checkeo de flag isNextTileOccupiedByAnotherCockroach(cockroach) en el metodo updateCockroachPosition de la clase Room.
