import { Component, KnitServer as Knit } from "@rbxts/knit";
import { ReplicatedStorage, ServerScriptService } from "@rbxts/services";

Knit.Start().await();

Component.Auto(ReplicatedStorage.WaitForChild("TS").WaitForChild("Components"));
// Component.Auto(ServerScriptService.WaitForChild("TS").WaitForChild("Components"));
