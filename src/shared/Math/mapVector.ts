type AxisCallback = (x: number) => number;

const mapVector = (v: Vector3, f: AxisCallback): Vector3 => new Vector3(f(v.X), f(v.Y), f(v.Z));

export default mapVector;
