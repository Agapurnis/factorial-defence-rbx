/**
 * Rounds the vector based on the provided input.
 * @param vec - The vector to be rounded.
 * @param round - The manner in which to round the provided vector.
 * @returns The rounded vector.
 * @throws if during the round, a division by zero was attempted
 */
export function roundvec (vec: Vector3, round: Vector3 | number) {
	if (typeIs(round, "number")) {
		if (round === 0) throw "roundvec: cannot round with zero";
		return new Vector3(
			math.round(vec.X / round) * round,
			math.round(vec.Y / round) * round,
			math.round(vec.Z / round) * round
		);
	} else {
		if (
			round.X === 0 ||
			round.Y === 0 ||
			round.Z === 0
		) throw "roundvec: cannot round with zero";

		return new Vector3(
			math.round(vec.X / round.X) * round.X,
			math.round(vec.Y / round.Y) * round.Y,
			math.round(vec.Z / round.Z) * round.Z
		);
	}
}
