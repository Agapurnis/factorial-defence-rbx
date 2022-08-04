import { MetaMenuState } from "./MetaMenuState";

const SFX_FOLDER_NAME = "Active SFX";
const SFX_FOLDER_PARENT = script.Parent as ModuleScript;

const SFX_Folder = SFX_FOLDER_PARENT.FindFirstChild(SFX_FOLDER_NAME) ?? new Instance("Folder");
SFX_Folder.Name = SFX_FOLDER_NAME;
SFX_Folder.Parent = SFX_FOLDER_PARENT;

function PlaySFX (id: string, name?: string) {
	let Sound: Sound | undefined = new Instance("Sound", SFX_Folder);
	Sound.SoundId = id;
	if (!Sound.IsLoaded) { Sound.Loaded.Wait(); }
	if (name !== undefined) { Sound.Name = name; }
	Sound.Play();
	Sound.Ended.Connect(() => {
		Sound!.Destroy();
		Sound = undefined;
	});
}

MetaMenuState.GetChangedSignal("Active").Connect(() => {
	PlaySFX(MetaMenuState.Get("ToggleSound"), "CloseSFX");
});

MetaMenuState.GetChangedSignal("Page").Connect(() => {
	PlaySFX(MetaMenuState.Get("PageSwitchSound"), "PageSwapSFX");
});
