import { Players, Workspace } from "@rbxts/services";
import { FsNode, createDir, createFile, pathOf, sortedChildNames } from "./filesystem";
import { theme } from "./theme";
import {Events} from "../network"

export interface TerminalLine {
	text: string;
	color: Color3;
	rich?: boolean;
}

export interface CommandContext {
	getCwd: () => FsNode;
	setCwd: (node: FsNode) => void;
	root: FsNode;
	print: (text: string, color?: Color3, rich?: boolean) => void;
	clear: () => void;
	openNano: (file: FsNode) => void;
	username: string;
}

export type CommandHandler = (arg: string, ctx: CommandContext) => void;

function runFastfetch(ctx: CommandContext): void {
	const logo = [
		"      /\\",
		"     /  \\",
		"    /\\   \\",
		"   /  __  \\",
		"  /  (  )  \\",
		" / .-'    '-.\\",
		"/_-'        '-_\\",
	];
	const info = [
		`${ctx.username}@archiso`,
		"----------------",
		"OS: Arch Linux x86_64",
		"Kernel: Linux 6.10.1-arch1-1",
		"Shell: bash 5.2.26",
		"Terminal: tty1",
		"CPU: Imaginary Cores (fake)",
		"Memory: 512MiB / 2048MiB",
	];

	ctx.print("");
	const rows = math.max(logo.size(), info.size());
	for (let i = 0; i < rows; i++) {
		const left = logo[i] ?? "                ";
		const right = info[i] ?? "";
		ctx.print(
			`<font color="#1793D1">${left}</font>   <font color="#DDDDDD">${right}</font>`,
			theme.FG,
			true,
		);
	}
	ctx.print("");
}
export const commands: Record<string, CommandHandler> = {
	help: (_arg, ctx) => {
		ctx.print("Available commands:");
		ctx.print("  fastfetch / neofetch  - system info");
		ctx.print("  pwd                   - print working directory");
		ctx.print("  ls                    - list files/folders");
		ctx.print("  cd <name|..|/>        - change directory");
		ctx.print("  mkdir <name>          - create a folder");
		ctx.print("  touch <name>          - create an empty file");
		ctx.print("  nano <name>           - edit a file");
		ctx.print("  cat <name>            - print a file's contents");
		ctx.print("  rm <name>             - delete a file");
		ctx.print("  rmdir <name>          - delete an empty folder");
		ctx.print("  whoami / clear / help / sudo ");
	},

	clear: (_arg, ctx) => ctx.clear(),

	whoami: (_arg, ctx) => ctx.print(ctx.username),

	pwd: (_arg, ctx) => ctx.print(pathOf(ctx.getCwd())),

	ls: (_arg, ctx) => {
		const cwd = ctx.getCwd();
		const names = sortedChildNames(cwd);
		if (names.size() === 0) {
			ctx.print("(empty)", theme.DIM);
			return;
		}
		for (const name of names) {
			const child = cwd.children.get(name)!;
			if (child.type === "dir") {
				ctx.print(`${name}/`, theme.DIR);
			} else {
				ctx.print(name, theme.FG);
			}
		}
	},

	cd: (arg, ctx) => {
		const cwd = ctx.getCwd();
		if (arg === "" || arg === "/") {
			ctx.setCwd(ctx.root);
			return;
		}
		if (arg === "..") {
			if (cwd.parent !== undefined) {
				ctx.setCwd(cwd.parent);
			}
			return;
		}
		const target = cwd.children.get(arg);
		if (target === undefined) {
			ctx.print(`cd: no such directory: ${arg}`, theme.ERROR);
		} else if (target.type !== "dir") {
			ctx.print(`cd: not a directory: ${arg}`, theme.ERROR);
		} else {
			ctx.setCwd(target);
		}
	},

	mkdir: (arg, ctx) => {
		const cwd = ctx.getCwd();
		if (arg === "") {
			ctx.print("mkdir: missing folder name", theme.ERROR);
			return;
		}
		if (cwd.children.has(arg)) {
			ctx.print(`mkdir: '${arg}' already exists`, theme.ERROR);
			return;
		}
		cwd.children.set(arg, createDir(arg, cwd));
	},

	touch: (arg, ctx) => {
		const cwd = ctx.getCwd();
		if (arg === "") {
			ctx.print("touch: missing file name", theme.ERROR);
			return;
		}
		if (!cwd.children.has(arg)) {
			cwd.children.set(arg, createFile(arg, cwd));
		}
	},

	nano: (arg, ctx) => {
		const cwd = ctx.getCwd();
		if (arg === "") {
			ctx.print("nano: missing file name", theme.ERROR);
			return;
		}
		let node = cwd.children.get(arg);
		if (node !== undefined && node.type === "dir") {
			ctx.print(`nano: '${arg}' is a directory`, theme.ERROR);
			return;
		}
		if (node === undefined) {
			node = createFile(arg, cwd);
			cwd.children.set(arg, node);
		}
		ctx.openNano(node);
	},

	cat: (arg, ctx) => {
		const cwd = ctx.getCwd();
		if (arg === "") {
			ctx.print("cat: missing file name", theme.ERROR);
			return;
		}
		const node = cwd.children.get(arg);
		if (node === undefined) {
			ctx.print(`cat: no such file: ${arg}`, theme.ERROR);
			return;
		}
		if (node.type === "dir") {
			ctx.print(`cat: '${arg}' is a directory`, theme.ERROR);
			return;
		}
		if (node.content === "") {
			ctx.print("(empty file)", theme.DIM);
		} else {
			for (const line of node.content.split("\n")) {
				ctx.print(line);
			}
		}
	},

	rm: (arg, ctx) => {
		const cwd = ctx.getCwd();
		const node = cwd.children.get(arg);
		if (node === undefined) {
			ctx.print(`rm: no such file: ${arg}`, theme.ERROR);
		} else if (node.type === "dir") {
			ctx.print(`rm: '${arg}' is a directory (use rmdir)`, theme.ERROR);
		} else {
			cwd.children.delete(arg);
		}
	},

	rmdir: (arg, ctx) => {
		const cwd = ctx.getCwd();
		const node = cwd.children.get(arg);
		if (node === undefined) {
			ctx.print(`rmdir: no such directory: ${arg}`, theme.ERROR);
		} else if (node.type !== "dir") {
			ctx.print(`rmdir: not a directory: ${arg}`, theme.ERROR);
		} else if (node.children.size() > 0) {
			ctx.print(`rmdir: '${arg}' is not empty`, theme.ERROR);
		} else {
			cwd.children.delete(arg);
		}
	},

	fastfetch: (_arg, ctx) => runFastfetch(ctx),
	neofetch: (_arg, ctx) => runFastfetch(ctx),

    sudo: (arg, ctx) => {
        const cwd = ctx.getCwd();
		if (arg === "") {
			ctx.print("sudo: empty command", theme.ERROR);
			return;
		}
        if (arg === "pacman -S opsec" || arg === "opsec") {
            const plrtelepoint = Workspace.WaitForChild("OhhhImbustingit").WaitForChild("plrpoint") as Attachment;
            const LocalPlayer = Players.LocalPlayer as Player
            const character = LocalPlayer.Character as Model
            character.PivotTo(plrtelepoint.WorldCFrame)
            Events.Dostuff.fire();
            
            LocalPlayer.WaitForChild("PlayerGui").WaitForChild("ScreenGui").Destroy();
            return;
        }
    },
};