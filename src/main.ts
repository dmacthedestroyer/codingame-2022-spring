import { Coordinate, countBy, distance, distanceSquared, Hero, minBy, Monster, sortBy, State } from "./state";

function action2(state: State): string[] {
    const aggressiveMonsters = state.monsters.filter(monster => monster.isTargetingBase === "self");
    const closestToBase = minBy(aggressiveMonsters, m => distanceSquared(m.position, state.basePosition))
    return state.selfHeroes.map((hero, i) => {
        // the first hero guards the base, the other two go frenzy
        const closestMonster = i === 0 ? closestToBase : minBy(aggressiveMonsters, m => distanceSquared(m.position, hero.position))
        if (closestMonster !== undefined) {
            return `MOVE ${closestMonster.position.x + closestMonster.vx} ${closestMonster.position.y + closestMonster.vy} >:-O`
        } else {
            const delta = state.basePosition.x === 0 ? 400 : -400
            const dx = delta * (state.selfHeroes.length - i);
            const dy = delta * (i + 1)

            return `MOVE ${state.basePosition.x + dx} ${state.basePosition.y + dy} ಠ_ಠ`
        }
    })
}

function action3(state: State): string[] {
    const aggressiveMonsters = state.monsters.filter(monster => monster.isTargetingBase === "self");
    const closestToBase = minBy(aggressiveMonsters, m => distanceSquared(m.position, state.basePosition))
    return state.selfHeroes.map((hero, i) => {
        if (i === 0) {
            return goalie(hero, state)
        }

        const closestMonster = minBy(aggressiveMonsters, m => distanceSquared(m.position, hero.position))
        if (closestMonster !== undefined) {
            return `MOVE ${closestMonster.position.x + closestMonster.vx} ${closestMonster.position.y + closestMonster.vy} >:-O`
        } else {
            const delta = 2000 * (state.basePosition.x === 0 ? 1 : -1)
            const dx = delta * (state.selfHeroes.length - i);
            const dy = delta * (i + 1)

            return `MOVE ${state.basePosition.x + dx} ${state.basePosition.y + dy} ಠ_ಠ`
        }
    })
}

function goalie(hero: Hero, state: State): string {
    const targetPosition = state.basePosition;

    const windDistance = 1280;
    const closestMonster = minBy(state.monsters, m => distanceSquared(targetPosition, m.position));
    if (closestMonster !== undefined && distance(closestMonster.position, targetPosition) < windDistance) {
        return `SPELL WIND ${closestMonster.position.x} ${closestMonster.position.y} FUS`
    }

    return `MOVE ${targetPosition.x} ${targetPosition.y} ಠ_ಠ`
}


export function run() {
    /**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

    var inputs: string[] = readline().split(' ');
    const baseX: number = parseInt(inputs[0]); // The corner of the map representing your base
    const baseY: number = parseInt(inputs[1]);
    const heroesPerPlayer: number = parseInt(readline()); // Always 3

    const basePosition: Coordinate = { x: baseX, y: baseY }

    // game loop
    while (true) {
        const selfHeroes: Hero[] = [];
        const monsters: Monster[] = [];

        for (let i = 0; i < 2; i++) {
            var inputs: string[] = readline().split(' ');
            const health: number = parseInt(inputs[0]); // Your base health
            const mana: number = parseInt(inputs[1]); // Ignore in the first league; Spend ten mana to cast a spell
        }
        const entityCount: number = parseInt(readline()); // Amount of heros and monsters you can see
        for (let i = 0; i < entityCount; i++) {
            var inputs: string[] = readline().split(' ');
            const id: number = parseInt(inputs[0]); // Unique identifier
            const type: number = parseInt(inputs[1]); // 0=monster, 1=your hero, 2=opponent hero
            const x: number = parseInt(inputs[2]); // Position of this entity
            const y: number = parseInt(inputs[3]);
            const shieldLife: number = parseInt(inputs[4]); // Ignore for this league; Count down until shield spell fades
            const isControlled: number = parseInt(inputs[5]); // Ignore for this league; Equals 1 when this entity is under a control spell
            const health: number = parseInt(inputs[6]); // Remaining health of this monster
            const vx: number = parseInt(inputs[7]); // Trajectory of this monster
            const vy: number = parseInt(inputs[8]);
            const nearBase: number = parseInt(inputs[9]); // 0=monster with no target yet, 1=monster targeting a base
            const threatFor: number = parseInt(inputs[10]); // Given this monster's trajectory, is it a threat to 1=your base, 2=your opponent's base, 0=neither

            if (type === 0) {
                const isTargetingBase = nearBase ? (threatFor === 1 ? "self" : threatFor === 2 ? "opponent" : false) : false;
                monsters.push({ id, position: { x, y }, health, vx, vy, isTargetingBase });
            } else if (type === 1) {
                selfHeroes.push({ id, position: { x, y } })
            }
        }

        const state: State = {
            basePosition,
            selfHeroes,
            monsters
        }

        const targetingMonsters = state.monsters.filter(m => m.isTargetingBase).map(({ id, health, position }) => ({ id, health, position, distance: distance(position, state.basePosition) }))
        sortBy(targetingMonsters, tm => tm.distance).forEach(m => console.error({ ...m, wind: m.distance < 1280 }))

        action3(state).forEach(cmd => console.log(cmd))
    }
}