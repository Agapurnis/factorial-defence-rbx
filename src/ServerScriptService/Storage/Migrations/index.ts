/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerScriptService } from "@rbxts/services";

export const UserMigrations = ServerScriptService
	.WaitForChild("TS")!
	.WaitForChild("Storage")!
	.WaitForChild("Migrations")!
	.WaitForChild("User")!
	.GetChildren()
	.map((child) => {
		if (!child.IsA("ModuleScript")) throw "User migration must be a module script!";
		const migrate = require(child) as (last: any) => any;
		return [tonumber(child.Name)!, migrate] as const;
	});

export const ItemMigrations = ServerScriptService
	.WaitForChild("TS")!
	.WaitForChild("Storage")!
	.WaitForChild("Migrations")!
	.WaitForChild("Item")!
	.GetChildren()
	.map((child) => {
		if (!child.IsA("ModuleScript")) throw "Item migration must be a module script!";
		const migrate = require(child) as (last: any) => any;
		return [tonumber(child.Name)!, migrate] as const;
	});
