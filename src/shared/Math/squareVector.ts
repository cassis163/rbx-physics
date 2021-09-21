const squareVector = (vector: Vector3): Vector3 =>
	new Vector3(
		vector.X * vector.X * math.sign(vector.X),
		vector.Y * vector.Y * math.sign(vector.Y),
		vector.Z * vector.Z * math.sign(vector.Z),
	);

export default squareVector;
