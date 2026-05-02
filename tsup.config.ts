import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/hooks/index.ts", "src/icons/index.ts", "src/illustrations/index.ts"],
	format: ["esm"],
	dts: true,
	splitting: true,
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
	// CSS files copied to dist/ post-build. src/*.css doesn't exist until
	// 13.5-04 lands tokens.css/primitives.css/utilities.css; the `|| true`
	// hides the no-source error until then.
	onSuccess: "cp src/*.css dist/ 2>/dev/null || true",
});
