interface ReplicatedStorage {
	Models: Folder & {
		Tycoon: Folder & { [key: string]: Model },
		Fun: Folder & { [key: string]: Model },
	}
}
