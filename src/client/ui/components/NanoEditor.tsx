import React, { useEffect, useRef } from "@rbxts/react";
import { FsNode } from "../filesystem";
import { theme } from "../theme";

interface NanoEditorProps {
	file?: FsNode;
	draft: string;
	onDraftChange: (text: string) => void;
	onSave: () => void;
	onDiscard: () => void;
}

export function NanoEditor({ file, draft, onDraftChange, onSave, onDiscard }: NanoEditorProps): React.Element {
	const editorRef = useRef<TextBox>(undefined!);

	useEffect(() => {
		if (file !== undefined) {
			editorRef.current?.CaptureFocus();
		}
	}, [file]);

	if (file === undefined) {
		return <frame Visible={false} Size={new UDim2(0, 0, 0, 0)} BackgroundTransparency={1} />;
	}

	return (
		<textbutton
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={theme.BACKGROUND}
			BorderSizePixel={0}
			ZIndex={50}
			AutoButtonColor={false}
			Text={""}
			Event={{
				MouseButton1Click: () => editorRef.current?.CaptureFocus(),
			}}
		>
			<textlabel
				Size={new UDim2(1, -32, 0, 22)}
				Position={new UDim2(0, 16, 0, 8)}
				BackgroundTransparency={1}
				Text={`GNU nano 7.2                                    ${file.name}`}
				TextColor3={theme.FG}
				Font={Enum.Font.Code}
				TextSize={16}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>

			<textbox
				ref={editorRef}
				Size={new UDim2(1, -32, 1, -80)}
				Position={new UDim2(0, 16, 0, 36)}
				BackgroundTransparency={1}
				TextColor3={theme.FG}
				Font={Enum.Font.Code}
				TextSize={16}
				MultiLine={true}
				ClearTextOnFocus={false}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Top}
				TextWrapped={true}
				Text={draft}
				Change={{
					Text: (rbx) => onDraftChange(rbx.Text),
				}}
			/>

			<frame
				Size={new UDim2(1, -32, 0, 26)}
				Position={new UDim2(0, 16, 1, -34)}
				BackgroundColor3={theme.FG}
				BorderSizePixel={0}
			>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 32)} />
				<textbutton
					Size={new UDim2(0, 220, 1, 0)}
					BackgroundTransparency={1}
					TextColor3={theme.BACKGROUND}
					Font={Enum.Font.Code}
					TextSize={15}
					Text={"^O Write Out"}
					TextXAlignment={Enum.TextXAlignment.Left}
					Event={{
						MouseButton1Click: onSave,
					}}
				/>
				<textbutton
					Size={new UDim2(0, 220, 1, 0)}
					BackgroundTransparency={1}
					TextColor3={theme.BACKGROUND}
					Font={Enum.Font.Code}
					TextSize={15}
					Text={"^X Exit"}
					TextXAlignment={Enum.TextXAlignment.Left}
					Event={{
						MouseButton1Click: onDiscard,
					}}
				/>
			</frame>
		</textbutton>
	);
}