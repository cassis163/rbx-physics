interface Workspace extends Model {
	Part: Part;
	Camera: Camera;
	Baseplate: Part & {
		Texture: Texture;
	};
	SpawnLocation: SpawnLocation & {
		Decal: Decal;
	};
}
