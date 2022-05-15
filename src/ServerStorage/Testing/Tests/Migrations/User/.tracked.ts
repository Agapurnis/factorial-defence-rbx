import { Currency } from "ReplicatedStorage/Data/Enums/Currency"
import { ItemRegisterList } from "ReplicatedStorage/Data/Registers/Items/ItemRegistry"

const chosenItemRegisters: string[] = []
function pickRandomItemRegisterNotAlreadyChosen (): typeof ItemRegisterList[number] {
	const length = ItemRegisterList.filter((e) => !chosenItemRegisters.includes(e.id)).size();
	if (length === 0) throw "Could not pick random item for usage in testing!"
	const index = math.random(0, length - 1);
	const regis = ItemRegisterList[index];
	chosenItemRegisters.push(regis.id);
	return regis;
}

interface InitialUserDataSchma {
	inventory: Record<string, number>
	currency: Record<string, number>;
	placed: Record<string, unknown>
}

let state = {
	inventory: {
		[pickRandomItemRegisterNotAlreadyChosen().id]: math.random(1, 10),
		[pickRandomItemRegisterNotAlreadyChosen().id]: math.random(1, 10),
	},
	placed: {},
	currency: {
		[Currency.FREE]: 0,
		[Currency.PAID]: 0,
	}
} as InitialUserDataSchma

export function getMigratable () { return state }
export function setMigratable (newState: unknown) { state = newState as InitialUserDataSchma }
