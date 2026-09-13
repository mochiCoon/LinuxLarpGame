import React from "@rbxts/react";
import { Terminal } from "./components/Terminal"

export function App(): React.Element {
	return (
		<screengui ResetOnSpawn={false} IgnoreGuiInset={true} ZIndexBehavior={Enum.ZIndexBehavior.Sibling}>
			<Terminal />
		</screengui>
	);
}