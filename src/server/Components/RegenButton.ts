import { Component, Janitor } from "@rbxts/knit";
import { CollectionService } from "@rbxts/services";

class RegenButton implements Component.ComponentClass {
	public static Tag = "RegenButton";

	private readonly _janitor = new Janitor();

	private readonly _basePart: BasePart;

	private _targetInstance: Instance;

	private readonly _cachedTargetInstance: Instance;

	private readonly _clickDetector: ClickDetector;

	private readonly _cooldownDuration;

	private _isCoolingDown = false;

	private readonly _activeColor: Color3;

	private readonly _inactiveColor = BrickColor.Black().Color;

	constructor(basePart: BasePart, cooldownDuration = 1) {
		this._basePart = basePart;
		this._targetInstance = (basePart.WaitForChild("TargetInstance") as ObjectValue).Value as Instance;
		this._cachedTargetInstance = this._targetInstance.Clone();
		this._clickDetector = this._CreateClickDetector(basePart);
		this._cooldownDuration = cooldownDuration;
		this._activeColor = basePart.Color;
		this._CreateGUI(basePart);
	}

	public Destroy() {
		this._janitor.Destroy();
	}

	public Init() {
		this._janitor.Add(
			this._clickDetector.MouseClick.Connect(() => {
				if (!this._isCoolingDown) {
					this._isCoolingDown = true;
					this._basePart.Color = this._inactiveColor;
					this._Regen();
					wait(this._cooldownDuration);
					this._isCoolingDown = false;
					this._basePart.Color = this._activeColor;
				}
			}),
		);
	}

	private _Regen() {
		const parent = this._targetInstance.Parent;

		this._targetInstance.Destroy();
		this._targetInstance = this._cachedTargetInstance.Clone();
		this._targetInstance.Parent = parent;
	}

	private _CreateClickDetector(parent: BasePart) {
		const clickDetector = new Instance("ClickDetector");
		clickDetector.Parent = parent;

		this._janitor.Add(clickDetector);

		return clickDetector;
	}

	private _CreateGUI(parent: BasePart) {
		const gui = new Instance("BillboardGui");
		gui.Parent = parent;
		gui.Size = new UDim2(0.1, 0, 0.1, 0);
		gui.AlwaysOnTop = true;

		const textLabel = new Instance("TextLabel");
		textLabel.Parent = gui;
		textLabel.BackgroundTransparency = 1;
		textLabel.Text = this._targetInstance.Name;
		textLabel.BorderSizePixel = 0;
		textLabel.TextStrokeTransparency = 0;
		textLabel.TextColor3 = BrickColor.White().Color;
		textLabel.Size = new UDim2(1, 0, 1, 0);
	}
}

export = RegenButton;
