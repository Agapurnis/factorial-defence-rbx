import { PlacementBehavior } from "ReplicatedStorage/Data/Enums/Settings/PlacemodeBehavior";

const NEW_SETTINGS_DEFAULT = {
	settings: {
		placement: {
			behavior: [PlacementBehavior.OFF_OF_TARGET, true] as [PlacementBehavior, boolean]
		}
	}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export = function (previous: any): any {
 return { ...previous,  ...NEW_SETTINGS_DEFAULT };
};
