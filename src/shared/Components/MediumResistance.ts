import { Component, Janitor } from "@rbxts/knit";
import { Workspace } from "@rbxts/services";
import { Visualizer } from "@rbxts/visualize";
import mapVector from "shared/Math/mapVector";
import { convertMeterAndKiloGram } from "shared/Math/MetricUnits";
import squareVector from "shared/Math/squareVector";
import transformDebugVector from "shared/Math/transformDebugVector";
import { stabilizeVector3 } from "shared/Math/VectorStablization";

// Raycasting
const OBSTRUCTION_DISTANCE = 20;
// Physics
const AIR_DENSITY = convertMeterAndKiloGram(1.225, -3, 1);
const RATIO_OF_SPECIFIC_HEATS = 1.4;
const STATIC_AIR_PRESSURE = convertMeterAndKiloGram(100e3, -1, 1);
// Debugging
const DEBUG = true;

class MediumResistance implements Component.ComponentClass {
	public static Tag = "MediumResistance";

	private readonly _instance: BasePart;

	private readonly _janitor = new Janitor();

	private static readonly _visualizer = new Visualizer();

	private _resistanceVectorForce: VectorForce;

	private _buoyantVectorForce: VectorForce;

	private _resistanceTorque: Torque;

	private _attachment: Attachment;

	private readonly _raycastParams: RaycastParams;

	constructor(instance: BasePart) {
		this._instance = instance;
		this._attachment = this._CreateAttachment("MediumResistanceAttachment");
		this._resistanceVectorForce = this._CreateVectorForce(this._attachment, "MediumResistanceVectorForce");
		this._resistanceVectorForce.RelativeTo = Enum.ActuatorRelativeTo.Attachment0;
		this._resistanceTorque = this._CreateTorque(this._attachment, "MediumResistanceTorque");
		this._resistanceTorque.RelativeTo = Enum.ActuatorRelativeTo.Attachment0;
		this._buoyantVectorForce = this._CreateVectorForce(this._attachment, "BuoyantVectorForce");
		this._buoyantVectorForce.RelativeTo = Enum.ActuatorRelativeTo.World;
		this._raycastParams = this._CreateRaycastParams();
	}

	public Destroy() {
		this._janitor.Destroy();
	}

	public HeartbeatUpdate() {
		this._UpdateForces();
	}

	private _UpdateForces() {
		const surfaceArea = this._GetSurfaceArea();
		const velocity: Vector3 = this._instance.CFrame.VectorToObjectSpace(
			this._instance.GetVelocityAtPosition(this._instance.Position),
		).mul(-1);

		if (velocity.Magnitude > 1e-4) {
			const obstructionVector: Vector3 = this._GetObstructionVector(velocity);

			this._resistanceTorque.Torque = this._GetResistanceTorque(obstructionVector, surfaceArea);
			this._resistanceVectorForce.Force = this._GetResistanceForce(velocity, obstructionVector, surfaceArea);
			this._buoyantVectorForce.Force = this._GetBuoyantForce();
		} else {
			this._resistanceTorque.Torque = new Vector3();
			this._resistanceVectorForce.Force = new Vector3();
			this._buoyantVectorForce.Force = new Vector3();
		}
	}

	private _GetResistanceTorque(obstructionVector: Vector3, surfaceArea: Vector3): Vector3 {
		const angularVelocity = this._instance.AssemblyAngularVelocity.mul(-1);

		return this._CalculateCompressibleFlowEquation(angularVelocity, obstructionVector, surfaceArea);
	}

	private _GetResistanceForce(velocity: Vector3, obstructionVector: Vector3, surfaceArea: Vector3): Vector3 {
		const force = this._CalculateCompressibleFlowEquation(velocity, obstructionVector, surfaceArea);

		if (DEBUG) {
			MediumResistance._visualizer.vector(
				this._attachment.WorldPosition,
				transformDebugVector(this._instance.CFrame.VectorToWorldSpace(force)),
				BrickColor.Blue().Color,
			);
		}

		return force;
	}

	private _GetBuoyantForce(): Vector3 {
		const size = this._instance.Size;
		const volume = size.X * size.Y * size.Z;
		const buoyantForceMagnitude = volume * AIR_DENSITY * Workspace.Gravity;
		const force = stabilizeVector3(new Vector3(0, buoyantForceMagnitude, 0));

		if (DEBUG) {
			MediumResistance._visualizer.vector(
				this._attachment.WorldPosition,
				transformDebugVector(force),
				BrickColor.Yellow().Color,
			);
		}

		return force;
	}

	private _CalculateCompressibleFlowEquation(
		velocity: Vector3,
		obstructionVector: Vector3,
		surfaceArea: Vector3,
	): Vector3 {
		const dynamicPressure = squareVector(velocity)
			.div(((RATIO_OF_SPECIFIC_HEATS * STATIC_AIR_PRESSURE) / AIR_DENSITY) * 2)
			.mul(RATIO_OF_SPECIFIC_HEATS * STATIC_AIR_PRESSURE);

		return stabilizeVector3(dynamicPressure.mul(surfaceArea).mul(obstructionVector));
	}

	private _GetObstructionVector(velocity: Vector3): Vector3 {
		const size = this._instance.Size;
		const rightVector = this._instance.CFrame.RightVector;
		const upVector = this._instance.CFrame.UpVector;
		const lookVector = this._instance.CFrame.LookVector;

		return new Vector3(
			this._GetObstructionFactor(rightVector.mul(math.sign(-velocity.Dot(rightVector))), size.X / 2),
			this._GetObstructionFactor(upVector.mul(math.sign(-velocity.Dot(upVector))), size.Y / 2),
			this._GetObstructionFactor(lookVector.mul(math.sign(-velocity.Dot(lookVector))), size.Z / 2),
		);
	}

	private _GetObstructionFactor(direction: Vector3, offset: number): number {
		const origin = this._instance.Position.add(direction.mul(offset));
		const raycastResult = Workspace.Raycast(origin, direction.mul(OBSTRUCTION_DISTANCE), this._raycastParams);

		if (DEBUG) {
			MediumResistance._visualizer.line(
				origin,
				raycastResult ? raycastResult.Position : origin.add(direction.mul(OBSTRUCTION_DISTANCE)),
				raycastResult ? BrickColor.Red().Color : BrickColor.White().Color,
			);
		}

		return raycastResult ? 0 : 1;
	}

	private _GetSurfaceArea(): Vector3 {
		const size = this._instance.Size;

		return new Vector3(size.Y * size.Z, size.X * size.Z, size.X * size.Y);
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

	private _CreateAttachment(name: string): Attachment {
		const attachment: Attachment = new Instance("Attachment");
		attachment.Name = name;
		attachment.Position = this._instance.CenterOfMass;
		attachment.Parent = this._instance;

		this._janitor.Add(attachment);

		return attachment;
	}

	private _CreateTorque(attachment: Attachment, name: string): Torque {
		const torque: Torque = new Instance("Torque");
		torque.Name = name;
		torque.Attachment0 = attachment;
		torque.Parent = this._instance;

		this._janitor.Add(torque);

		return torque;
	}

	private _CreateRaycastParams(): RaycastParams {
		const raycastParams = new RaycastParams();
		raycastParams.IgnoreWater = true;
		raycastParams.FilterType = Enum.RaycastFilterType.Blacklist;
		raycastParams.FilterDescendantsInstances = [this._instance];

		return raycastParams;
	}
}

export = MediumResistance;
