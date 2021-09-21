export const safeUnit = (v: Vector3): Vector3 => (v.Magnitude > 0 ? v.Unit : new Vector3());
