import type { User, UserData } from "ReplicatedStorage/Classes/User";
import fitumi from "@rbxts/fitumi";
import { createUser } from "ServerScriptService/Networking/Implementations/User/UserService";
import { UserRepository } from "ServerScriptService/Networking/Implementations/User/UserRepository";

let c = -1337;

export interface AgentWithUser extends Agent { user: User }
export class Agent {
	public player = fitumi.a.fake<Player>();

	public static withUser (override: Partial<UserData>): AgentWithUser {
		const agent = new Agent() as AgentWithUser;
		const request = createUser(agent.player).await();
		if (!request[0]) throw "Could not create user for Agent!";
		if (!request[1].isOk()) throw "Could not create user for Agent!";
		const data = request[1].unwrap();
		const user = UserRepository.get(agent.player).unwrap();
		UserRepository.set(user.player, user.update({ ...data, ...override }));
		agent.user = user;
		return agent;
	}

	constructor () {
		this.player.ClassName = "Player";
		this.player.UserId = (c--) * 1000;
	}

}
