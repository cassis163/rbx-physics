import mapVector from "./mapVector";

const LIMIT = 2 ** 19; // Numerical limit: 2 ** 24;

const stabilizeAxis = (x: number): number => math.clamp(x, -LIMIT, LIMIT);

export const stabilizeVector3 = (v: Vector3): Vector3 => mapVector(v, stabilizeAxis);
