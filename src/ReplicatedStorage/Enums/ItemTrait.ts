/**
 * Various 'traits' of an item that are used to check desired behavior at runtime and ensure type-safety during development.
 */
export const enum ItemTraitEnum {
	DROPPER = "DROPPER", // creates ores
	FURNACE = "FURNACE", // destroys ores (sells)
	UPGRADER = "UPGRADER", // upgrades ores
	CONVEYOR = "CONVEYOR", // moves ores
}
