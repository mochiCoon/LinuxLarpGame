import { Controller, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { App } from "client/ui/App";

@Controller()
export class AppController implements OnStart {
	onStart(): void {
		const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

		const root = createRoot(new Instance("Folder"));
		root.render(createPortal(React.createElement(App), playerGui));
	}
}