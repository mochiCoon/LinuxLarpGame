import { Flamework, OnInit, OnStart, Service } from "@flamework/core";
import { ReplicatedStorage, Workspace, TweenService } from "@rbxts/services";
import { test } from "shared/classes/test.item"
import { Events } from "server/network";


@Service()
export class ItemService implements OnInit, OnStart {
	private item?: Part;

	onInit(): void {
        function dostuff(player: Player) {
            const plrtelepoint = Workspace.WaitForChild("OhhhImbustingit").WaitForChild("plrpoint") as Attachment;
            const LocalPlayer = player as Player
            const character = LocalPlayer.Character as Model
            character.PivotTo(plrtelepoint.WorldCFrame)
            task.wait(5)
            player.Kick("Using roblox isn't very opsec lil bro");
        }
        Events.Dostuff.connect(dostuff) 
	}

	onStart(): void {


	}
}