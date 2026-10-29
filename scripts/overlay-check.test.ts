// @effect-diagnostics nodeBuiltinImport:off
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";
import { assert, it } from "@effect/vitest";

import {
  changedPaths,
  handoffRuleBroken,
  isOverlayOwned,
  missingMarkers,
  newestMergedReleaseTag,
  overlayChangedPaths,
  parseManifest,
  reconcileManifest,
} from "./overlay-check.ts";

const manifestText = [
  "# Overlay change manifest",
  "",
  "## Test command",
  "",
  "- `vp run check:changed` before every push.",
  "",
  "## Changed upstream files",
  "",
  "- `apps/server/src/a.ts` — reason. Marker: yes",
  "- `package.json` — reason. Marker: no (JSON)",
].join("\n");

it("treats the overlay-owned paths and workflow glob as owned", () => {
  assert.isTrue(isOverlayOwned("packages/routing/src/index.ts"));
  assert.isTrue(isOverlayOwned(".github/workflows/overlay-check.yml"));
  assert.isTrue(isOverlayOwned("docs/overlay/handoffs/phase-0-step-6.md"));
  assert.isFalse(isOverlayOwned("packages/routing-extra/index.ts"));
  assert.isFalse(isOverlayOwned(".github/workflows/ci.yml"));
  assert.isFalse(isOverlayOwned("docs/overlay-notes.md"));
});

it("reads only the changed-upstream-files section of the manifest", () => {
  const { entries, problems } = parseManifest(manifestText);
  assert.deepEqual(entries, [
    { path: "apps/server/src/a.ts", marker: true },
    { path: "package.json", marker: false },
  ]);
  assert.deepEqual(problems, []);
  assert.lengthOf(parseManifest(`${manifestText}\n- \`x.ts\` — no marker`).problems, 1);
});

it("fails in both directions: unlisted change and listed path that is gone", () => {
  const { entries } = parseManifest(manifestText);
  const result = reconcileManifest({
    changed: ["apps/server/src/a.ts", "apps/web/src/b.ts"],
    entries,
    exists: (path) => path !== "package.json",
  });
  assert.deepEqual(result.missing, ["apps/web/src/b.ts"]);
  assert.deepEqual(result.stale, ["package.json"]);
});

it("warns only for commentable files whose marker is missing", () => {
  const { entries } = parseManifest(manifestText);
  assert.deepEqual(
    missingMarkers(entries, () => "export const a = 1;"),
    ["apps/server/src/a.ts"],
  );
  assert.deepEqual(
    missingMarkers(entries, () => "// overlay: why\nexport const a = 1;"),
    [],
  );
});

it("requires a handoff only when upstream paths change", () => {
  assert.isTrue(handoffRuleBroken(["apps/server/src/a.ts"]));
  assert.isTrue(handoffRuleBroken(["apps/server/src/a.ts", "docs/overlay/CHANGES.md"]));
  assert.isFalse(
    handoffRuleBroken(["apps/server/src/a.ts", "docs/overlay/handoffs/phase-0-step-6.md"]),
  );
  assert.isFalse(
    handoffRuleBroken(["apps/server/src/a.ts", "docs/overlay/handoffs/sync-v1.0.0.md"]),
  );
  assert.isFalse(handoffRuleBroken(["packages/routing/src/index.ts"]));
});

it("ignores paths a sync merge brought in unchanged from the upstream tag", () => {
  const dir = NodeFS.mkdtempSync(NodePath.join(NodeOS.tmpdir(), "overlay-check-"));
  try {
    const git = (...args: Array<string>) =>
      NodeChildProcess.execFileSync(
        "git",
        ["-c", "user.name=test", "-c", "user.email=test@example.com", ...args],
        { cwd: dir, encoding: "utf8" },
      );
    const write = (path: string, text: string) => {
      NodeFS.mkdirSync(NodePath.dirname(NodePath.join(dir, path)), { recursive: true });
      NodeFS.writeFileSync(NodePath.join(dir, path), text);
    };
    const commit = (message: string) => {
      git("add", "-A");
      git("commit", "-m", message);
    };

    git("init", "-b", "main");
    write("up.txt", "0\n");
    write("kept.txt", "0\n");
    commit("base");
    git("branch", "base");

    git("switch", "-c", "upstream");
    write("up.txt", "1\n");
    write("new.txt", "1\n");
    commit("upstream release");
    git("tag", "v1.0.0");

    git("switch", "-c", "sync", "base");
    write("kept.txt", "overlay\n");
    write("packages/routing/src/index.ts", "export {};\n");
    commit("overlay edit");
    git("merge", "--no-edit", "--no-ff", "v1.0.0");

    assert.equal(newestMergedReleaseTag(dir), "v1.0.0");
    const diff = changedPaths(dir, "base");
    assert.deepEqual([...diff].sort(), [
      "kept.txt",
      "new.txt",
      "packages/routing/src/index.ts",
      "up.txt",
    ]);
    assert.deepEqual(overlayChangedPaths(dir, diff, "v1.0.0"), ["kept.txt"]);
    assert.deepEqual([...overlayChangedPaths(dir, diff, undefined)].sort(), [
      "kept.txt",
      "new.txt",
      "up.txt",
    ]);
  } finally {
    NodeFS.rmSync(dir, { recursive: true, force: true });
  }
});
