import { distanceSquared, Hero, minBy, Monster, sortBy, State } from "./state";

export function run() {
  /**
   * Auto-generated code below aims at helping you parse
   * the standard input according to the problem statement.
   **/
  function main() {
    var inputs: string[] = readline().split(' ');
    const baseX: number = parseInt(inputs[0]); // The corner of the map representing your base
    const baseY: number = parseInt(inputs[1]);
    const heroesPerPlayer: number = parseInt(readline()); // Always 3

    const heroes: Hero[] = [];
    const monsters: Monster[] = [];

    // game loop
    while (true) {
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

        switch (type) {
          case 0:
            const isTargetingBase = nearBase ? (threatFor === 1 ? "self" : threatFor === 2 ? "opponent" : false) : false;
            monsters.push({ id, position: { x, y }, health, vx, vy, isTargetingBase });
          case 1:
            heroes.push({ id, position: { x, y } })
          default:
            console.error({ id, type, x, y })
        }
      }

      const state: State = {
        basePosition: { x: baseX, y: baseY },
        selfHeroes: sortBy(heroes, h => h.id),
        monsters
      }

      action(state).forEach(cmd => console.log(cmd))
    }
  }

  function action(state: State): string[] {
    return state.selfHeroes.map((h, i) => {
      const delta = state.basePosition.x === 0 ? 400 : -400
      const dx = delta * (state.selfHeroes.length - i);
      const dy = delta * (i + 1)

      return `MOVE ${state.basePosition.x + dx} ${state.basePosition.y + dy} ${h.id}: HOLD!`
    })
  }

  function action2(state: State): string[] {
    const aggressiveMonsters = state.monsters.filter(monster => monster.isTargetingBase === "self" && distanceSquared(monster.position, state.basePosition) <= (delta * delta * 4));
    return state.selfHeroes.map((hero, i) => {
      const closestMonster = minBy(aggressiveMonsters, m => distanceSquared(m.position, hero.position))
      if (closestMonster !== undefined) {
        return `MOVE ${closestMonster.position.x + closestMonster.vx} ${closestMonster.position.y + closestMonster.vy} HAVE AT YOU!`
      } else {
        const delta = state.basePosition.x === 0 ? 400 : -400
        const dx = delta * (state.selfHeroes.length - i);
        const dy = delta * (i + 1)

        return `MOVE ${state.basePosition.x + dx} ${state.basePosition.y + dy} HOLD!`
      }
    })
  }

  main()
}
