import { Component } from "@rbxts/knit";
import { CollectionService } from "@rbxts/services";
import { convertMeterAndKiloGram } from "shared/Math/MetricUnits";

const TENSILE_STRENGTH = convertMeterAndKiloGram(4e3, -1, 1);

class TensileStrength implements Component.ComponentClass {
	public static Tag = "TensileStrength";

	private readonly _instance: BasePart;

	private _vectorForces: VectorForce[] = [];

	constructor(instance: BasePart) {
		this._instance = instance;
	}

	public Init() {
		this._vectorForces = this._instance.GetChildren().mapFiltered((descendant) => {
			if (descendant.IsA("VectorForce")) return descendant;
		});
	}

	public HeartbeatUpdate() {
		const forces: Vector3[] = this._vectorForces.map((vectorForce) => {
			return vectorForce.RelativeTo !== Enum.ActuatorRelativeTo.World
				? vectorForce.Force
				: this._instance.CFrame.VectorToWorldSpace(vectorForce.Force);
		});
		const totalForce = forces.reduce((previous, current) => previous.add(current), new Vector3());
		const surfaceArea = this._GetSurfaceArea();
		const pressure = totalForce.div(surfaceArea);

		if (
			math.abs(pressure.X) > TENSILE_STRENGTH &&
			math.abs(pressure.Y) > TENSILE_STRENGTH &&
			math.abs(pressure.Z) > TENSILE_STRENGTH
		) {
			this._instance.BreakJoints();
			this.Destroy();
		}
	}

	public Destroy() {
		CollectionService.RemoveTag(this._instance, TensileStrength.Tag);
	}

	private _GetSurfaceArea(): Vector3 {
		const size = this._instance.Size;

		return new Vector3(size.Y * size.Z, size.X * size.Z, size.X * size.Y);
	}
}

export = TensileStrength;
