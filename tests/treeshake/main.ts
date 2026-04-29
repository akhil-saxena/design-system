// Single-icon import fixture (DS-60). After Plan 01 lands the icons barrel,
// run: npx esbuild tests/treeshake/main.ts --bundle --minify --format=esm \
//   --external:react --external:react-dom | wc -c
// Expected: < 5000 bytes. Larger output indicates tree-shake regression.
import { ChevronDown } from "../../src/icons/index";
console.log(typeof ChevronDown);
