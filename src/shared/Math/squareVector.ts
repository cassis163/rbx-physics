import mapVector from "./mapVector";

const squareVector = (vector: Vector3): Vector3 => mapVector(vector, (x: number) => x * x * math.sign(x));

export default squareVector;
