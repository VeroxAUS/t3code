#!/usr/bin/env bash
# Builds the candidate branch for a new upstream release: the upstream tag, plus the
# feature commits from the usage-strip branch, plus one commit holding the fork's own
# workflow and .fork/ files (upstream's workflows are dropped).
#
# Env: REPO (owner/name of this fork), GH_TOKEN, optional TARGET_TAG, optional DRY_RUN=1
#      (skip the push). Writes key=value lines to $GITHUB_OUTPUT (stdout when unset).
# Exit 0 with skip=true when upstream has nothing newer; non-zero on a conflict or error.
set -euo pipefail

UPSTREAM=pingdotgg/t3code
PATCH_BRANCH=usage-strip
NOREPLY="3145728+VeroxAUS@users.noreply.github.com"

out() { echo "$1=$2" >> "${GITHUB_OUTPUT:-/dev/stdout}"; }

base_tag=$(tr -d '[:space:]' < .fork/BASE_TAG)
target=${TARGET_TAG:-}

if [ -z "$target" ]; then
  target=$(gh api "repos/$UPSTREAM/releases/latest" --jq .tag_name)
  if ! [[ "$target" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "::error::latest upstream release '$target' is not a plain vX.Y.Z tag"; exit 1
  fi
  newest=$(printf '%s\n%s\n' "$base_tag" "$target" | sort -V | tail -1)
  if [ "$target" = "$base_tag" ] || [ "$newest" != "$target" ]; then
    echo "Up to date: fork base $base_tag, upstream latest $target"
    out skip true; exit 0
  fi
fi
# Manual runs may name any upstream tag (for example a nightly, to rehearse an upgrade).
[[ "$target" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "::error::invalid tag '$target'"; exit 1; }
out skip false

git config user.name "VeroxAUS"
git config user.email "$NOREPLY"
git remote get-url upstream >/dev/null 2>&1 || git remote add upstream "https://github.com/$UPSTREAM.git"
# Forced (+) so a repeated run in the same clone can retarget the tags.
git fetch --no-tags --depth=1 upstream \
  "+refs/tags/$target:refs/tags/up-target" "+refs/tags/$base_tag:refs/tags/up-base"
git fetch --no-tags --depth=20 origin \
  "+$PATCH_BRANCH:refs/remotes/origin/$PATCH_BRANCH" "+fork-main:refs/remotes/origin/fork-main"

mapfile -t commits < <(git rev-list --reverse "origin/$PATCH_BRANCH" ^up-base)
[ "${#commits[@]}" -gt 0 ] || { echo "::error::no feature commits between $base_tag and $PATCH_BRANCH"; exit 1; }

# A separate worktree, so this script is not overwritten while it runs.
work=$(mktemp -d)
git worktree add -q --detach "$work" up-target
cd "$work"
git config user.name "VeroxAUS"
git config user.email "$NOREPLY"

if ! git cherry-pick "${commits[@]}"; then
  echo "::error::conflict applying the usage strip onto $target. Conflicting files:"
  git diff --name-only --diff-filter=U
  exit 1
fi
patch_sha=$(git rev-parse HEAD)

# Fork infrastructure: drop upstream's workflows, keep ours and the sync files.
git rm -rq --ignore-unmatch .github/workflows
git checkout origin/fork-main -- .github/workflows/fork-sync.yml .fork
echo "$target" > .fork/BASE_TAG
git add -A
git commit -q -m "fork: workflow and sync files for $target

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
cand_sha=$(git rev-parse HEAD)

# Next free strip number for this base, counting drafts too.
last=$(gh release list --repo "$REPO" --limit 200 --json tagName --jq '.[].tagName' \
  | sed -n "s/^${target}-strip\.\([0-9][0-9]*\)$/\1/p" | sort -n | tail -1)
version="${target#v}-strip.$(( ${last:-0} + 1 ))"

if [ -z "${DRY_RUN:-}" ]; then
  git push --force origin "HEAD:refs/heads/candidate/$version"
fi
out tag "$target"
out version "$version"
out candidate_sha "$cand_sha"
out patch_sha "$patch_sha"
echo "Candidate $version ready: $target + ${#commits[@]} fork commit(s)"
