import { Flamework } from "@flamework/core";

import("@flamework/components");

Flamework.addPaths("./Services/");
Flamework.addPaths("./Components/");
Flamework.addPaths("src/ReplicatedStorage/Components/");
Flamework.ignite();
print("All services initialized!");
