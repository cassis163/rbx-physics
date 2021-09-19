import { Component, Janitor } from "@rbxts/knit";
import { RunService, Workspace } from "@rbxts/services";
import { Visualizer } from "@rbxts/visualize";
import { convertMeterAndKiloGram } from "shared/Math/MetricUnits";
import { stabilizeVector3 } from "shared/Math/VectorStablization";

const AIR_DENSITY = convertMeterAndKiloGram(1.225, -3, 1);
const DEBUG = true;

class MediumResistance implements Component.ComponentClass {
	public static Tag = "MediumResistance";

	private readonly _instance: BasePart;

	private readonly _janitor = new Janitor();

	private static readonly _visualizer = new Visualizer();

	private _resistanceVectorForce: VectorForce;

	private _buoyantVectorForce: VectorForce;

	private _attachment: Attachment;

	constructor(instance: BasePart) {
		this._instance = instance;
		this._attachment = this._CreateAttachment();
		this._resistanceVectorForce = this._CreateVectorForce(this._attachment, "MediumResistanceVectorForce");
		this._resistanceVectorForce.RelativeTo = Enum.ActuatorRelativeTo.Attachment0;
		this._buoyantVectorForce = this._CreateVectorForce(this._attachment, "BuoyantVectorForce");
		this._buoyantVectorForce.RelativeTo = Enum.ActuatorRelativeTo.World;
	}

	public Destroy() {
		this._janitor.Destroy();
	}

	public HeartbeatUpdate() {
		this._UpdateForces();
		if (DEBUG) this._UpdateVisualizer();
	}

	private _UpdateForces() {
		this._resistanceVectorForce.Force = this._GetResistanceForce();
		this._buoyantVectorForce.Force = this._GetBuoyantForce();
	}

	private _UpdateVisualizer() {
		MediumResistance._visualizer.vector(
			this._instance.Position,
			this._instance.CFrame.VectorToWorldSpace(this._resistanceVectorForce.Force),
			BrickColor.Blue().Color,
		);
		MediumResistance._visualizer.vector(
			this._instance.Position,
			this._buoyantVectorForce.Force,
			BrickColor.Yellow().Color,
		);
	}

	private _GetResistanceForce(): Vector3 {
		const size = this._instance.Size;
		const relativeMediumVelocity = this._instance.CFrame.VectorToObjectSpace(
			this._instance.GetVelocityAtPosition(this._instance.Position).mul(-1),
		);
		const surfaceArea = new Vector3(size.Y * size.Z, size.X * size.Z, size.X * size.Y);
		const dynamicPressure = new Vector3(
			relativeMediumVelocity.X ** 2 * math.sign(relativeMediumVelocity.X),
			relativeMediumVelocity.Y ** 2 * math.sign(relativeMediumVelocity.Y),
			relativeMediumVelocity.Z ** 2 * math.sign(relativeMediumVelocity.Z),
		)
			.div(2)
			.mul(AIR_DENSITY);

		return stabilizeVector3(dynamicPressure.mul(surfaceArea).mul(0.1));
	}

	private _GetBuoyantForce(): Vector3 {
		const size = this._instance.Size;
		const volume = size.X * size.Y * size.Z;
		const buoyantForceMagnitude = volume * AIR_DENSITY * Workspace.Gravity;

		return stabilizeVector3(new Vector3(0, buoyantForceMagnitude, 0));
	}

	private _CreateVectorForce(attachment: Attachment, name: string): VectorForce {
		const vectorForce: VectorForce = new Instance("VectorForce");
		vectorForce.Name = name;
		vectorForce.Force = new Vector3();
		vectorForce.Attachment0 = attachment;
		vectorForce.Parent = this._instance;

		this._janitor.Add(vectorForce);

		return vectorForce;
	}

	private _CreateAttachment(): Attachment {
		const attachment: Attachment = new Instance("Attachment");
		attachment.Name = "MediumResistanceForce";
		attachment.Parent = this._instance;

		this._janitor.Add(attachment);

		return attachment;
	}
}

export = MediumResistance;
