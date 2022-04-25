export type Coordinate = {
  x: number;
  y: number;
};

export type Hero = {
  id: number;
  position: Coordinate;
};

export type Monster = {
  id: number;
  position: Coordinate;
  health: number;
  vx: number;
  vy: number;
  isTargetingBase: "self" | "opponent" | false;
};

export type State = {
  basePosition: Coordinate;
  selfHeroes: Hero[];
  monsters: Monster[];
};

export function distanceSquared(c1: Coordinate, c2: Coordinate): number {
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;

  return dx * dx + dy * dy;
}

export function distance(c1: Coordinate, c2: Coordinate): number {
  return Math.sqrt(distanceSquared(c1, c2));
}

export function translate(coord: Coordinate, delta: Coordinate): Coordinate {
  return {
    x: coord.x + delta.x,
    y: coord.y + delta.y,
  };
}

export function minBy<T>(ts: T[], f: (t: T) => number): T | undefined {
  const initialValue: [T | undefined, number] = [undefined, Number.MAX_VALUE];

  let minValue = Number.MAX_VALUE;
  let minT: T | undefined = undefined;

  ts.forEach((t) => {
    const value = f(t);
    if (value < minValue) {
      minValue = value;
      minT = t;
    }
  });

  return minT;
}

export function sortBy<T, TValue>(ts: T[], f: (t: T) => TValue): T[] {
  const copy = [...ts];
  copy.sort((a, b) => {
    const va = f(a);
    const vb = f(b);

    return va < vb ? -1 : va > vb ? 1 : 0;
  });

  return copy;
}

export function countBy<T, TKey>(
  ts: T[],
  keyFunc: (t: T) => TKey
): Map<TKey, number> {
  return ts.reduce((counts, t) => {
    const key = keyFunc(t);
    counts.set(key, (counts.get(key) ?? 0) + 1);

    return counts;
  }, new Map<TKey, number>());
}
