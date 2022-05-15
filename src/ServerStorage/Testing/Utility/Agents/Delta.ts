import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { Agent } from "../Agent";

/**
 * Agent Delta has:
 *  - An assigned user with a starting balance of 2000;
 */
export const AgentDelta = Agent.withUser({
	currency: {
		[Currency.FREE]: 2000,
		[Currency.PAID]: 0,
	}
})