// export const stabilizeVector3 = (v: Vector3, vPrevious: Vector3, assemblyMass: number): Vector3 => {
// 	if (v.Dot(vPrevious) < 0) {
// 		return new Vector3();
// 	} else if (v.Magnitude > vPrevious.Magnitude) {
// 		const x0: number = 1 / (assemblyMass / 2e6);
// 		const x1: number = x0 + 1;

// 		return v.mul((v.Magnitude + vPrevious.Magnitude * x0) / (x1 * v.Magnitude));
// 	} else {
// 		return v;
// 	}
// };

const LIMIT = 2 ** 19; // Numerical limit: 2 ** 24;

const stabilizeAxis = (x: number): number => math.clamp(x, -LIMIT, LIMIT);

export const stabilizeVector3 = (v: Vector3): Vector3 =>
	new Vector3(stabilizeAxis(v.X), stabilizeAxis(v.Y), stabilizeAxis(v.Z));
