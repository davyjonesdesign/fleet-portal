#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Error: build directory not found at $BUILD_DIR"
  echo "Run npm run build first."
  exit 1
fi

if [[ -n "$(git -C "$ROOT_DIR" status --porcelain --untracked-files=no)" ]]; then
  echo "Error: repository has uncommitted tracked changes."
  echo "Commit or stash changes before deploying."
  exit 1
fi

TMP_DIR="$(mktemp -d)"
cleanup() {
  git -C "$ROOT_DIR" worktree remove "$TMP_DIR" --force >/dev/null 2>&1 || true
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if git -C "$ROOT_DIR" show-ref --verify --quiet refs/heads/gh-pages; then
  git -C "$ROOT_DIR" worktree add "$TMP_DIR" gh-pages >/dev/null
else
  git -C "$ROOT_DIR" worktree add -B gh-pages "$TMP_DIR" >/dev/null
fi

find "$TMP_DIR" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R "$BUILD_DIR"/. "$TMP_DIR"/
touch "$TMP_DIR/.nojekyll"

pushd "$TMP_DIR" >/dev/null
git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy on gh-pages."
  exit 0
fi

git commit -m "Deploy build to gh-pages on $(date -u +%Y-%m-%d)" >/dev/null
popd >/dev/null

echo "Updated local gh-pages branch."
echo "Push with: git push origin gh-pages"
