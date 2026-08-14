import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/hooks/index.ts", "src/icons/index.ts"],
	format: ["esm"],
	dts: true,
	splitting: true,
	// NOTE: the "use client" directive is applied by scripts/postbuild.mjs, not by
	// a `banner` here. esbuild does inject a banner, but `treeshake: true` below
	// pipes the output through rollup, which strips module level directives
	// ("Module level directives cause errors when bundled ... was ignored"). See
	// that script for the full rationale.
	sourcemap: true,
	clean: true,
	treeshake: true,
	external: [
		"react",
		"react-dom",
		"lucide-react",
		"@tiptap/react",
		"@tiptap/starter-kit",
		"@tiptap/extension-link",
		"@tiptap/extension-placeholder",
		"@tiptap/extension-underline",
		"@tiptap/pm",
	],
	onSuccess: "node scripts/postbuild.mjs",
});
