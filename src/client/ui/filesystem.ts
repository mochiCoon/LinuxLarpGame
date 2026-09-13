export type FsNodeType = "file" | "dir";

export interface FsNode {
	name: string;
	type: FsNodeType;
	content: string; // only meaningful for files
	children: Map<string, FsNode>; // only meaningful for dirs
	parent?: FsNode;
}

export function createDir(name: string, parent?: FsNode): FsNode {
	return {
		name,
		type: "dir",
		content: "",
		children: new Map<string, FsNode>(),
		parent,
	};
}

export function createFile(name: string, parent: FsNode, content = ""): FsNode {
	return {
		name,
		type: "file",
		content,
		children: new Map<string, FsNode>(),
		parent,
	};
}

export function pathOf(node: FsNode): string {
	const parts: string[] = [];
	let current: FsNode | undefined = node;
	while (current !== undefined && current.parent !== undefined) {
		parts.push(current.name);
		current = current.parent;
	}

	let path = "";
	for (let i = parts.size() - 1; i >= 0; i--) {
		path += "/" + parts[i];
	}
	return path === "" ? "/" : path;
}

export function sortedChildNames(dir: FsNode): string[] {
	const names: string[] = [];
	for (const [name] of dir.children) {
		names.push(name);
	}
	names.sort();
	return names;
}
