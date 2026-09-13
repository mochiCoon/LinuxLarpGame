import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Players, UserInputService } from "@rbxts/services";
import { commands, CommandContext, TerminalLine } from "../commands";
import { FsNode, createDir, pathOf } from "../filesystem";
import { theme } from "../theme";
import { NanoEditor } from "./NanoEditor";

const BOOT_LINES: TerminalLine[] = [
	{ text: "Arch Linux 6.10.1-arch1-1 (tty1)", color: theme.DIM },
	{ text: "", color: theme.DIM },
	{ text: "archiso login: root (automatic login)", color: theme.DIM },
	{ text: "", color: theme.DIM },
];

function trim(value: string): string {
	const [noLeading] = string.gsub(value, "^%s+", "");
	const [noTrailing] = string.gsub(noLeading, "%s+$", "");
	return noTrailing;
}

function parseCommand(raw: string): [string, string] {
	const trimmed = trim(raw);
	const [spaceIndex] = string.find(trimmed, " ", 1, true);
	if (spaceIndex === undefined) {
		return [trimmed.lower(), ""];
	}
	const cmd = trimmed.sub(1, spaceIndex - 1).lower();
	const arg = trim(trimmed.sub(spaceIndex + 1));
	return [cmd, arg];
}

export function Terminal(): React.Element {
	const player = Players.LocalPlayer;

	const rootRef = useRef<FsNode>(createDir("/"));
	const cwdRef = useRef<FsNode>(rootRef.current);

	const [lines, setLines] = useState<TerminalLine[]>(BOOT_LINES);
	const [promptPath, setPromptPath] = useState("/");
	const [nanoFile, setNanoFile] = useState<FsNode | undefined>(undefined);
	const [nanoDraft, setNanoDraft] = useState("");

	const outputRef = useRef<ScrollingFrame>(undefined!);
	const inputRef = useRef<TextBox>(undefined!);
	const historyRef = useRef<string[]>([]);
	const historyIndexRef = useRef<number>(0);

	const print = (text: string, color?: Color3, rich?: boolean) => {
		setLines((prev) => [...prev, { text, color: color ?? theme.FG, rich: rich ?? false }]);
	};

	const clearLines = () => setLines([]);

	const openNano = (file: FsNode) => {
		setNanoFile(file);
		setNanoDraft(file.content);
	};

	const saveNano = () => {
		if (nanoFile !== undefined) {
			nanoFile.content = nanoDraft;
			print(`Saved ${nanoFile.name} (${nanoDraft.size()} bytes)`, theme.DIM);
		}
		setNanoFile(undefined);
		inputRef.current.CaptureFocus();
	};

	const discardNano = () => {
		setNanoFile(undefined);
		inputRef.current.CaptureFocus();
	};

	const ctx: CommandContext = {
		getCwd: () => cwdRef.current,
		setCwd: (node) => {
			cwdRef.current = node;
			setPromptPath(pathOf(node));
		},
		root: rootRef.current,
		print,
		clear: clearLines,
		openNano,
		username: "root",
	};

	useEffect(() => {
		task.defer(() => {
			if (outputRef.current !== undefined) {
				outputRef.current.CanvasPosition = new Vector2(0, math.huge);
			}
		});
	}, [lines]);

	useEffect(() => {
		inputRef.current?.CaptureFocus();
	}, []);

	useEffect(() => {
		const connection = UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (nanoFile !== undefined) {
				return;
			}
			if (inputRef.current === undefined || !inputRef.current.IsFocused()) {
				return;
			}
			const history = historyRef.current;
			if (history.size() === 0) {
				return;
			}

			if (input.KeyCode === Enum.KeyCode.Up) {
				historyIndexRef.current = math.max(0, historyIndexRef.current - 1);
				const cmd = history[historyIndexRef.current];
				inputRef.current.Text = cmd;
				inputRef.current.CursorPosition = cmd.size() + 1;
			} else if (input.KeyCode === Enum.KeyCode.Down) {
				historyIndexRef.current = math.min(history.size(), historyIndexRef.current + 1);
				const cmd = history[historyIndexRef.current] ?? "";
				inputRef.current.Text = cmd;
				inputRef.current.CursorPosition = cmd.size() + 1;
			}
		});
		return () => connection.Disconnect();
	}, [nanoFile]);

	const focusInput = () => {
		if (nanoFile === undefined) {
			inputRef.current?.CaptureFocus();
		}
	};

	const handleFocusLost = (rbx: TextBox, enterPressed: boolean) => {
		if (!enterPressed) {
			return;
		}
		const raw = rbx.Text;
		rbx.Text = "";
		rbx.CaptureFocus();

		if (trim(raw) === "") {
			return;
		}

		const history = historyRef.current;
		if (history[history.size() - 1] !== raw) {
			history.push(raw);
		}
		historyIndexRef.current = history.size();

		print(`[${ctx.username}@archiso ${promptPath}]# ${raw}`);

		const [cmd, arg] = parseCommand(raw);
		const handler = commands[cmd];
		if (handler !== undefined) {
			handler(arg, ctx);
		} else if (cmd !== "") {
			print(`bash: ${cmd}: command not found`, theme.ERROR);
		}
	};

	return (
		<textbutton
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={theme.BACKGROUND}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text={""}
			Event={{
				MouseButton1Click: focusInput,
			}}
		>
			<scrollingframe
				ref={outputRef}
				Size={new UDim2(1, -32, 1, -56)}
				Position={new UDim2(0, 16, 0, 10)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				ScrollBarThickness={4}
				ScrollBarImageColor3={theme.DIM}
				CanvasSize={new UDim2(0, 0, 0, 0)}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
			>
				<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />
				{lines.map((line, index) => (
					<textlabel
						key={`line-${index}`}
						Size={new UDim2(1, 0, 0, 18)}
						BackgroundTransparency={1}
						Text={line.text}
						RichText={line.rich === true}
						TextColor3={line.color}
						Font={Enum.Font.Code}
						TextSize={16}
						TextXAlignment={Enum.TextXAlignment.Left}
						LayoutOrder={index}
					/>
				))}
			</scrollingframe>

			<frame Size={new UDim2(1, -32, 0, 20)} Position={new UDim2(0, 16, 1, -30)} BackgroundTransparency={1}>
				<textlabel
					Size={new UDim2(0, 260, 1, 0)}
					BackgroundTransparency={1}
					Text={`[${ctx.username}@archiso ${promptPath}]# `}
					TextColor3={theme.FG}
					Font={Enum.Font.Code}
					TextSize={16}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
				<textbox
					ref={inputRef}
					Size={new UDim2(1, -260, 1, 0)}
					Position={new UDim2(0, 260, 0, 0)}
					BackgroundTransparency={1}
					TextColor3={theme.FG}
					Font={Enum.Font.Code}
					TextSize={16}
					ClearTextOnFocus={false}
					Text={""}
					TextXAlignment={Enum.TextXAlignment.Left}
					Event={{
						FocusLost: handleFocusLost,
					}}
				/>
			</frame>

			<NanoEditor
				file={nanoFile}
				draft={nanoDraft}
				onDraftChange={setNanoDraft}
				onSave={saveNano}
				onDiscard={discardNano}
			/>
		</textbutton>
	);
}