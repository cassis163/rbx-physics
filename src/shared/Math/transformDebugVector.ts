import { safeUnit } from "./safeUnit";

const transformDebugVector = (v: Vector3): Vector3 => safeUnit(v).mul(math.log(v.Magnitude, 1.1));

export default transformDebugVector;
