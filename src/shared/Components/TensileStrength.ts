import { Component } from "@rbxts/knit";
import { CollectionService } from "@rbxts/services";
import { convertMeterAndKiloGram } from "shared/Math/MetricUnits";

const TENSILE_STRENGTH = convertMeterAndKiloGram(158600, -1, 1);

class TensileStrength implements Component.ComponentClass {
	public static Tag = "TensileStrength";

	private readonly _instance: BasePart;

	private _vectorForces: VectorForce[] = [];

	private static highestForce = 0;

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
		const totalForce = forces.reduce((previous, current) => previous.add(current));

		if (totalForce.Magnitude > TENSILE_STRENGTH) {
			this._instance.BreakJoints();
			this.Destroy();
		}
	}

	public Destroy() {
		CollectionService.RemoveTag(this._instance, TensileStrength.Tag);
	}
}

export = TensileStrength;
