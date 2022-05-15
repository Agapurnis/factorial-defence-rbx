type ScreenRegion = [Vector2, Vector2];

const ProhibitedScreenRegions: ScreenRegion[] = []
const KeyLookup: Record<string, number> = {};

function openIndex (): number {
	let index = 0;
	while (!typeIs(ProhibitedScreenRegions[index], "nil")) { index++; }
	return index;
}

export function getProhibitedScreenRegions (): ScreenRegion[] { return ProhibitedScreenRegions; }
export function setProhibitedScreenRegion (key: string, range: ScreenRegion): void { KeyLookup[key] ??= openIndex(); ProhibitedScreenRegions[KeyLookup[key]] = range; }
export function delProhibitedScreenRegion (key: string): void { const idx = KeyLookup[key]; ProhibitedScreenRegions[idx] = undefined!; KeyLookup[key] = undefined!; }
