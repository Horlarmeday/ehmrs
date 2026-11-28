#!/usr/bin/env sh

STAGED=$(git diff --cached --name-only --diff-filter=ACMRD)

needs_twin=""
for file in $STAGED; do
  case "$file" in
    client/src/axios.js|client/src/App.vue|client/src/router.js)
      needs_twin="$needs_twin $file"
      ;;
    client/src/core/services/store/*/*)
      module=$(echo "$file" | cut -d/ -f6)
      if [ -f "client-vue3/src/stores/$module.ts" ]; then
        needs_twin="$needs_twin $file"
      fi
      ;;
  esac
done

[ -z "$needs_twin" ] && exit 0

for file in $STAGED; do
  case "$file" in
    client-vue3/src/stores/*|client-vue3/src/core/*|client-vue3/src/router/*|client-vue3/src/contract/*)
      exit 0
      ;;
  esac
done

if [ -n "$TWIN_PATCH_LINKED" ]; then
  if echo "$TWIN_PATCH_LINKED" | grep -Eq '^#?[0-9]+$'; then
    echo "twin-patch: legacy logic change committed with its twin in linked PR $TWIN_PATCH_LINKED (ADR-0008)."
    exit 0
  fi
  echo "twin-patch: TWIN_PATCH_LINKED must be a PR number such as #123, got '$TWIN_PATCH_LINKED'."
  exit 1
fi

echo "twin-patch: these legacy logic files have a Vue 3 twin (ADR-0008):"
for file in $needs_twin; do
  echo "  $file"
done
echo "Stage the Pinia twin and its contract fixtures in the same commit"
echo "(client-vue3/src/stores, core, router or contract), or name the blocking-linked PR:"
echo "  TWIN_PATCH_LINKED=#<pr> git commit ..."
exit 1
