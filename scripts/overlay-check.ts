// @effect-diagnostics nodeBuiltinImport:off globalConsole:off
// Reconciles a PR's changed upstream paths with the overlay manifest, requires
// a handoff when files outside docs/overlay change, and runs the routing tests.
//
//   node scripts/overlay-check.ts --base origin/overlay/main
//
// "Upstream path" means anything outside the overlay-owned paths. A path the
// merge brought in unchanged from the newest upstream release tag in history
// is upstream's own work, not an overlay change, so only the handoff rule sees
// it. Without --base only the routing tests run.
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import * as NodeURL from "node:url";

const root = NodePath.resolve(import.meta.dirname, "..");

const OWNED_PATHS = [
  "packages/routing",
  "apps/server/src/routing",
  "apps/web/src/components/team",
  "evals/routing",
  "scripts/overlay-check.ts",
  "scripts/overlay-check.test.ts",
  ".github/workflows/overlay-*.yml",
  "docs/overlay",
];
const MANIFEST = "docs/overlay/CHANGES.md";
const HANDOFF_DIR = "docs/overlay/handoffs/";
const RELEASE_TAG = /^v\d+\.\d+\.\d+$/;
const COMMENT_FILE = /\.[cm]?[jt]sx?$/;
const MARKER = /\/\/\s*overlay:/;

const ownedMatchers = OWNED_PATHS.map((pattern) =>
  pattern.includes("*")
    ? new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")}$`)
    : undefined,
);

export const isOverlayOwned = (path: string) =>
  OWNED_PATHS.some(
    (owned, index) =>
      ownedMatchers[index]?.test(path) ?? (path === owned || path.startsWith(`${owned}/`)),
  );

export interface ManifestEntry {
  readonly path: string;
  readonly marker: boolean;
}

export const parseManifest = (text: string) => {
  const entries: Array<ManifestEntry> = [];
  const problems: Array<string> = [];
  let inSection = false;
  for (const line of text.split("\n")) {
    if (line.startsWith("## ")) inSection = line.trim() === "## Changed upstream files";
    if (!inSection || !line.startsWith("- `")) continue;
    const path = /^- `([^`]+)`/.exec(line)?.[1];
    const marker = /Marker:\s*(yes|no)\b/i.exec(line)?.[1];
    if (!path || !marker) {
      problems.push(`manifest line needs a path and "Marker: yes|no": ${line}`);
      continue;
    }
    entries.push({ path, marker: marker.toLowerCase() === "yes" });
  }
  return { entries, problems };
};

export const reconcileManifest = (input: {
  readonly changed: ReadonlyArray<string>;
  readonly entries: ReadonlyArray<ManifestEntry>;
  readonly exists: (path: string) => boolean;
}) => {
  const listed = new Set(input.entries.map((entry) => entry.path));
  return {
    missing: input.changed.filter((path) => !listed.has(path)),
    stale: input.entries.map((entry) => entry.path).filter((path) => !input.exists(path)),
  };
};

export const missingMarkers = (
  entries: ReadonlyArray<ManifestEntry>,
  read: (path: string) => string | undefined,
) =>
  entries
    .filter((entry) => entry.marker && COMMENT_FILE.test(entry.path))
    .map((entry) => entry.path)
    .filter((path) => {
      const text = read(path);
      return text !== undefined && !MARKER.test(text);
    });

// Any change outside docs/overlay needs a handoff, overlay-owned code included: one PR per step.
export const handoffRuleBroken = (diffPaths: ReadonlyArray<string>) =>
  diffPaths.some((path) => !path.startsWith("docs/overlay/")) &&
  !diffPaths.some((path) => path.startsWith(HANDOFF_DIR));

// quotePath=false keeps non-ASCII paths as real paths instead of quoted escapes.
const git = (cwd: string, ...args: Array<string>) =>
  NodeChildProcess.execFileSync("git", ["-c", "core.quotePath=false", ...args], {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\n")
    .filter(Boolean);

// Deletions are not listed: nothing is left for the manifest to name.
export const changedPaths = (cwd: string, base: string) =>
  git(cwd, "diff", "--name-only", "--no-renames", "--diff-filter=ACMRT", `${base}...HEAD`, "--");

export const newestMergedReleaseTag = (cwd: string) =>
  git(cwd, "tag", "--merged", "HEAD", "--list", "v*", "--sort=-v:refname").find((tag) =>
    RELEASE_TAG.test(tag),
  );

export const overlayChangedPaths = (cwd: string, paths: ReadonlyArray<string>, tag?: string) => {
  const upstream = paths.filter((path) => !isOverlayOwned(path));
  if (tag === undefined) return upstream;
  const differs = new Set(git(cwd, "diff", "--name-only", "--no-renames", tag, "HEAD", "--"));
  return upstream.filter((path) => differs.has(path));
};

const annotate = (level: "error" | "warning", message: string) =>
  console.log(process.env.GITHUB_ACTIONS ? `::${level}::${message}` : `${level}: ${message}`);

const run = () => {
  const baseIndex = process.argv.indexOf("--base");
  const base = baseIndex === -1 ? undefined : process.argv[baseIndex + 1];
  if (baseIndex !== -1 && !base) {
    console.error("overlay-check: --base needs a ref.");
    return 1;
  }
  let failed = false;
  const fail = (message: string) => {
    annotate("error", message);
    failed = true;
  };

  if (base === undefined) {
    console.log("overlay-check: no --base, skipping the manifest and handoff checks.");
  } else {
    if (NodeChildProcess.spawnSync("git", ["rev-parse", "--verify", base], { cwd: root }).status) {
      console.error(`overlay-check: unknown ref ${base}. Run \`git fetch origin\`.`);
      return 1;
    }
    const diffPaths = changedPaths(root, base);
    const tag = newestMergedReleaseTag(root);
    if (tag === undefined) {
      console.log(
        "overlay-check: no upstream release tag in history; every non-owned change counts as an overlay change.",
      );
    }
    const changed = overlayChangedPaths(root, diffPaths, tag);
    console.log(
      `overlay-check: ${diffPaths.length} paths changed since ${base}; ${changed.length} overlay changes to upstream files${tag ? ` (upstream ${tag})` : ""}.`,
    );
    for (const path of changed) console.log(`  ${path}`);

    const manifestPath = NodePath.join(root, MANIFEST);
    if (!NodeFS.existsSync(manifestPath)) {
      fail(`${MANIFEST} is missing.`);
    } else {
      const { entries, problems } = parseManifest(NodeFS.readFileSync(manifestPath, "utf8"));
      for (const problem of problems) fail(problem);
      const { missing, stale } = reconcileManifest({
        changed,
        entries,
        exists: (path) => NodeFS.existsSync(NodePath.join(root, path)),
      });
      for (const path of missing) fail(`${path} changed but ${MANIFEST} has no line for it.`);
      for (const path of stale) fail(`${MANIFEST} names ${path}, which the repo does not contain.`);
      const unmarked = missingMarkers(entries, (path) => {
        try {
          return NodeFS.readFileSync(NodePath.join(root, path), "utf8");
        } catch {
          return undefined;
        }
      });
      for (const path of unmarked) {
        annotate("warning", `${path} says "Marker: yes" but has no \`// overlay:\` line.`);
      }
    }

    if (handoffRuleBroken(diffPaths)) {
      fail(
        `This diff changes files outside docs/overlay but adds or changes none under ${HANDOFF_DIR}.`,
      );
    }
  }

  if (NodeFS.existsSync(NodePath.join(root, "packages/routing"))) {
    const tests = NodeChildProcess.spawnSync("vp", ["test", "run", "packages/routing"], {
      cwd: root,
      stdio: "inherit",
    });
    if (tests.status !== 0) fail("vp test run packages/routing failed.");
  } else {
    console.log("overlay-check: packages/routing does not exist yet; skipping its tests.");
  }

  console.log(failed ? "overlay-check: FAIL" : "overlay-check: pass");
  return failed ? 1 : 0;
};

if (
  process.argv[1] &&
  NodePath.resolve(process.argv[1]) === NodeURL.fileURLToPath(import.meta.url)
) {
  process.exitCode = run();
}
