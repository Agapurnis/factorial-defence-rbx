import { Flamework } from "@flamework/core";

import("@flamework/components");

Flamework.addPaths("./Components/");
Flamework.addPaths("./Controllers/");
Flamework.addPaths("src/ReplicatedStorage/Components/");
Flamework.ignite();
print("All controllers initialized!");
