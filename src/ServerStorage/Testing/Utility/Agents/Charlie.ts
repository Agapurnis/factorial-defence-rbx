import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { Agent } from "../Agent";
/**
 * Agent Charlie has:
 *  - An assigned user with a starting balance of 27500
 */
export const AgentCharlie = Agent.withUser({
	currency: {
		[Currency.FREE]: 27500,
		[Currency.PAID]: 0,
	}
})