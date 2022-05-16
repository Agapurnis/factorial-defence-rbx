import { UserRepository } from "ServerScriptService/Networking/Implementations/User/UserRepository";
import { UserStores } from "ServerScriptService/Storage/UserStore";
import { Timer } from "@rbxts/timer";

let timer: Timer;

function loopUpdateMoney () {
	UserRepository.forEach((user, id) => {
		const store = UserStores.get(id)!;
		store.Set({ ...store.Get()!, currency: user.money });
	});

	timer = new Timer(1);
	timer.completed.Connect(loopUpdateMoney);
	timer.start();
}

loopUpdateMoney();
