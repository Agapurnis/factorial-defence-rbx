import Remotes from "ReplicatedStorage/Networking/Remotes";
import { createUser, deleteUser, loadUser } from "./UserService";

Remotes.Server.User.CreateUser.SetCallback(createUser);
Remotes.Server.User.DeleteUser.SetCallback(deleteUser);
Remotes.Server.User.LoadUser.SetCallback(loadUser);
