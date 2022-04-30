export function randBetween(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function floor(n: number): number {
	return Math.floor(n);
}
