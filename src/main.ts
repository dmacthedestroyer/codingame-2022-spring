import { Base, Coordinate, distance, distanceSquared, Hero, minBy, Monster, sortBy, State } from "./state";

function silver(state: State): string[] {
	return state.selfHeroes.map((hero, i) => {
		if (i === 0) {
			return goalie(hero, state);
		}
		if (i === 1) {
			return berserker(hero, state);
		}
		return defaultGuy(hero, state);
	});
}

function goalie(hero: Hero, state: State): string {
	if (state.selfBase.mana < 10) {
		return defaultGuy(hero, state);
	}

	const basePosition = state.selfBase.position;

	const closestMonster = minBy(
		state.monsters.filter(m => m.shieldLife <= 0),
		m => distanceSquared(basePosition, m.position)
	);
	if (closestMonster !== undefined) {
		const monsterFuturePosition = {
			x: closestMonster.position.x + closestMonster.vx,
			y: closestMonster.position.y + closestMonster.vy
		};
		const monsterDistanceFromBase = distance(monsterFuturePosition, basePosition);
		if (state.selfBase.mana >= 10 && monsterDistanceFromBase < WIND_RANGE * 0.75) {
			return `SPELL WIND ${state.enemyBase.position.x} ${state.enemyBase.position.y} FUS`;
		}
	}

	if (state.selfBase.mana >= 10) {
		const closestOpponentHero = minBy(state.opponentHeroes, h => distanceSquared(hero.position, h.position));
		if (closestOpponentHero !== undefined && distance(closestOpponentHero.position, hero.position) <= WIND_RANGE) {
			return `SPELL WIND ${closestOpponentHero.position.x} ${closestOpponentHero.position.y} GIT!`;
		}
	}

	const delta = (WIND_DISTANCE - WIND_RANGE) * (basePosition.x === 0 ? 1 : -1);
	return `MOVE ${basePosition.x + delta} ${basePosition.y + delta} ಠ_ಠ`;
}

function berserker(hero: Hero, state: State): string {
	const xMin = 6000; // MAP_WIDTH / 3;
	const xMax = MAP_WIDTH - xMin; // (2 * MAP_WIDTH) / 3;
	function isWithinSlice(position: Coordinate): boolean {
		return position.x >= xMin && position.x <= xMax;
	}
	if (!isWithinSlice(hero.position)) {
		return `MOVE ${MAP_WIDTH / 2} ${MAP_HEIGHT / 2} OOB`;
	}

	if (state.selfBase.mana < 30) {
		const closestMonster = minBy(
			state.monsters.filter(m => m.isThreatFor !== "opponent" && isWithinSlice(m.position)),
			m => distanceSquared(m.position, hero.position)
		);
		if (closestMonster !== undefined) {
			return `MOVE ${closestMonster.position.x} ${closestMonster.position.y} FFUUU`;
		}

		return `MOVE ${MAP_WIDTH / 2} ${MAP_HEIGHT / 2}`;
	}

	const targetMonster = minBy(
		state.monsters.filter(
			m => !m.isControlled && m.isThreatFor !== "opponent" && distance(m.position, hero.position) <= CONTROL_RANGE
		),
		m => -m.health
	);
	if (targetMonster !== undefined) {
		return `SPELL CONTROL ${targetMonster.id} ${state.enemyBase.position.x} ${state.enemyBase.position.y} ZAP`;
	}

	return `WAIT zZz`;
}

function defaultGuy(hero: Hero, state: State, defaultPosition?: Coordinate): string {
	const aggressiveMonsters = state.monsters.filter(m => m.isThreatFor === "self");
	const closestMonster = minBy(aggressiveMonsters, m => distanceSquared(m.position, hero.position));
	if (closestMonster !== undefined) {
		return `MOVE ${closestMonster.position.x + closestMonster.vx} ${closestMonster.position.y +
			closestMonster.vy} \>:-O`;
	} else if (defaultPosition === undefined) {
		const delta = 2000 * (state.selfBase.position.x === 0 ? 1 : -1);
		const dx = delta;
		const dy = delta;

		return `MOVE ${state.selfBase.position.x + dx} ${state.selfBase.position.y + dy} ಠ_ಠ`;
	} else {
		return `MOVE ${defaultPosition.x} ${defaultPosition.y} ಠ_ಠ`;
	}
}

const WIND_DISTANCE = 2200;
const WIND_RANGE = 1280;
const CONTROL_RANGE = 2200;
const MAP_WIDTH = 17630;
const MAP_HEIGHT = 9000;

export function run() {
	/**
	 * Auto-generated code below aims at helping you parse
	 * the standard input according to the problem statement.
	 **/

	var inputs: string[] = readline().split(" ");
	const baseX: number = parseInt(inputs[0]); // The corner of the map representing your base
	const baseY: number = parseInt(inputs[1]);
	const heroesPerPlayer: number = parseInt(readline()); // Always 3

	const basePosition: Coordinate = { x: baseX, y: baseY };

	// game loop
	while (true) {
		const selfHeroes: Hero[] = [];
		const opponentHeroes: Hero[] = [];
		const monsters: Monster[] = [];

		function buildBaseState(): Omit<Base, "position"> {
			const inputs: string[] = readline().split(" ");
			const health: number = parseInt(inputs[0]); // Your base health
			const mana: number = parseInt(inputs[1]); // Spend ten mana to cast a spell
			return { health, mana };
		}
		const selfBase: Base = { ...buildBaseState(), position: basePosition };
		const enemyBase: Base = {
			...buildBaseState(),
			position: baseX === 0 ? { x: MAP_WIDTH, y: MAP_HEIGHT } : { x: 0, y: 0 }
		};
		const entityCount: number = parseInt(readline()); // Amount of heros and monsters you can see
		for (let i = 0; i < entityCount; i++) {
			var inputs: string[] = readline().split(" ");
			const id: number = parseInt(inputs[0]); // Unique identifier
			const type: number = parseInt(inputs[1]); // 0=monster, 1=your hero, 2=opponent hero
			const x: number = parseInt(inputs[2]); // Position of this entity
			const y: number = parseInt(inputs[3]);
			const shieldLife: number = parseInt(inputs[4]); // Count down until shield spell fades
			const isControlled: number = parseInt(inputs[5]); // Equals 1 when this entity is under a control spell
			const health: number = parseInt(inputs[6]); // Remaining health of this monster
			const vx: number = parseInt(inputs[7]); // Trajectory of this monster
			const vy: number = parseInt(inputs[8]);
			const nearBase: number = parseInt(inputs[9]); // 0=monster with no target yet, 1=monster targeting a base
			const threatFor: number = parseInt(inputs[10]); // Given this monster's trajectory, is it a threat to 1=your base, 2=your opponent's base, 0=neither

			if (type === 0) {
				monsters.push({
					id,
					position: { x, y },
					health,
					vx,
					vy,
					shieldLife,
					isControlled: isControlled === 1,
					isNearBase: nearBase === 1,
					isThreatFor: threatFor === 1 ? "self" : threatFor === 2 ? "opponent" : "none"
				});
			} else if (type === 1) {
				selfHeroes.push({ id, position: { x, y } });
			} else if (type === 2) {
				opponentHeroes.push({ id, position: { x, y } });
			}
		}

		const state: State = { selfBase, enemyBase, selfHeroes, opponentHeroes, monsters };
		silver(state).forEach(cmd => console.log(cmd));
	}
}
