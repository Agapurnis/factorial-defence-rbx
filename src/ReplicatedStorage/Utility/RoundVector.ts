/**
 * Rounds the vector based on the provided input.
 * @param vector - The vector to be rounded.
 * @param round - The manner in which to round the provided vector.
 * @returns The rounded vector.
 * @remarks
 *  - A rounding of '0' is interpreted to mean that the vector should not be rounded.
 */
export function roundvec (vector: Vector3, round: Vector3 | number) {
	if (typeIs(round, "number")) {
		if (round === 0) return vector;
		return new Vector3(
			math.round(vector.X / round) * round,
			math.round(vector.Y / round) * round,
			math.round(vector.Z / round) * round
		);
	} else {
		return new Vector3(
			(round.X === 0) ? vector.X : math.round(vector.X / round.X) * round.X,
			(round.Y === 0) ? vector.Y : math.round(vector.Y / round.Y) * round.Y,
			(round.Z === 0) ? vector.Z : math.round(vector.Z / round.Z) * round.Z
		);
	}
}
