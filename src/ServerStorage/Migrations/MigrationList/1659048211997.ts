import { MigrationSpecification } from "../MigrationSpecification";
import { MigratableDataStructure } from "ReplicatedStorage/Enums/MigratableDataStructure";

interface OldUserData {
	// ...
	Balance: {
		"CREDITS": number,
		"TICKETS": number,
		"DOLLARS": number,
	}
	// ...
}

interface NewUserData {
	// ...
	Balance: {
		"PREMIUM": number,
		"CREDITS": number,
	}
	// ...
}

export = new MigrationSpecification<
	OldUserData,
	NewUserData
>(script, MigratableDataStructure.USER_DATA, (previous, transformed) => {
	transformed.Balance!.PREMIUM = tonumber(previous.Balance.CREDITS);
	transformed.Balance!.CREDITS = tonumber(previous.Balance.DOLLARS);
	transformed.Balance!.DOLLARS = undefined;
	transformed.Balance!.TICKETS = undefined;
	return transformed;
});
