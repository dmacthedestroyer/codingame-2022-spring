import { Base, Coordinate, distance, distanceSquared, Hero, minBy, Monster, sortBy, State } from "./state";
import { randBetween, floor } from "./util";

// TODO: make better harasser

function silver(state: State): string[] {
	return state.selfHeroes.map((hero, i) => {
		if (i === 0) {
			return goalie(hero, state);
		}
		if (i === 1) {
			return berserker(hero, state);
		}
		return harasser(hero, state);
	});
}

/**
 * if position close enough to base and enemies are present and we have mana, cast wind towards enemy base
 * else if enemies are present, move towards nearest enemy's next location
 * else sit at idle position
 */
function goalie(hero: Hero, state: State): string {
	const enemyTriggerDistance = 8000;
	const windTriggerDistance = 800;
	const idleDistance = 1200;

	const selfBasePosition = state.selfBase.position;

	const eligibleMonsters = state.monsters.filter(m => distance(m.position, selfBasePosition) <= enemyTriggerDistance);
	const closestMonster = minBy(eligibleMonsters, m => distanceSquared(selfBasePosition, m.position));

	if (closestMonster !== undefined) {
		if (distance(closestMonster.position, selfBasePosition) <= windTriggerDistance) {
			if (closestMonster.shieldLife <= 0 && state.selfBase.mana >= 10) {
				return `SPELL WIND ${state.enemyBase.position.x} ${state.enemyBase.position.y} FUS`;
			}
		}
		return `MOVE ${closestMonster.position.x + closestMonster.vx * 2} ${closestMonster.position.y +
			closestMonster.vy * 2} BEGONE!`;
	}

	const delta = idleDistance * (selfBasePosition.x === 0 ? 1 : -1);
	return `MOVE ${selfBasePosition.x + delta} ${selfBasePosition.y + delta} ಠ_ಠ`;
}

function berserker(hero: Hero, state: State): string {
	const manaMin = 30;
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

		return `MOVE ${floor(randBetween(xMin, xMax))} ${floor(randBetween(0, MAP_HEIGHT))} RECHARGE`;
	}

	const targetMonster = minBy(
		state.monsters.filter(m => {
			if (m.isControlled || m.isThreatFor === "opponent") {
				return false;
			}
			const distanceToHero = distance(m.position, hero.position);
			return distanceToHero > ATTACK_RANGE && distanceToHero <= CONTROL_RANGE;
		}),
		m => -m.health
	);
	if (targetMonster !== undefined) {
		return `SPELL CONTROL ${targetMonster.id} ${state.enemyBase.position.x} ${state.enemyBase.position.y} WOLOLO`;
	}

	return `MOVE ${floor(randBetween(xMin, xMax))} ${floor(randBetween(0, MAP_HEIGHT))} ಠ_ಠ`;
}

function harasser(hero: Hero, state: State): string {
	const idleDistance = SHIELD_RANGE;
	if (distance(hero.position, state.enemyBase.position) > idleDistance * 4) {
		const enemyBasePosition = state.enemyBase.position;
		const delta = idleDistance * (enemyBasePosition.x === 0 ? 1 : -1);
		return `MOVE ${enemyBasePosition.x + delta} ${enemyBasePosition.y + delta} HEHEHE`;
	}

	if (state.selfBase.mana >= 30) {
		const targetMonsters = state.monsters
			.map(m => {
				const distanceToEnemyBase = distance(m.position, state.enemyBase.position);
				const distanceToHero = distance(m.position, hero.position);
				return {
					distanceToEnemyBase,
					canUseWind: m.shieldLife <= 0 && distanceToHero <= WIND_RANGE,
					canUseShield: m.shieldLife <= 0 && distanceToHero <= SHIELD_RANGE,
					...m
				};
			})
			.filter(m => m.distanceToEnemyBase < idleDistance);

		// push any monsters that aren't shielded
		if (targetMonsters.filter(m => m.canUseWind).length > 0) {
			return `SPELL WIND ${state.enemyBase.position.x} ${state.enemyBase.position.y} FUS`;
		}
		const shieldableMonster = minBy(
			targetMonsters.filter(m => m.canUseShield),
			m => m.distanceToEnemyBase
		);
		if (shieldableMonster !== undefined) {
			return `SPELL SHIELD ${shieldableMonster.id}`;
		}
	}

	return `WAIT ಠ_ಠ`;
}

const ATTACK_RANGE = 800;
const WIND_DISTANCE = 2200;
const WIND_RANGE = 1280;
const SHIELD_RANGE = 2200;
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
