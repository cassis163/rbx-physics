import { Component } from "@rbxts/knit";
import { CollectionService } from "@rbxts/services";

const COMPONENTS = ["MediumResistance", "TensileStrength"];

class Vehicle implements Component.ComponentClass {
	public static Tag = "Vehicle";

	private readonly _baseParts: BasePart[];

	constructor(instance: Instance) {
		this._baseParts = instance.GetDescendants().mapFiltered((descendant: Instance) => {
			if (descendant.IsA("BasePart")) return descendant;
		});
	}

	public Destroy() {
		this._baseParts.forEach((basePart: BasePart) =>
			COMPONENTS.forEach((component) => CollectionService.RemoveTag(basePart, component)),
		);
	}

	public Init() {
		this._baseParts.forEach((basePart: BasePart) =>
			COMPONENTS.forEach((component) => CollectionService.AddTag(basePart, component)),
		);
	}
}

export = Vehicle;
