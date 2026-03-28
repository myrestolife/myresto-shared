#!/usr/bin/env bash
# check-conventions.sh — Lint MyResto apps against CONVENTIONS.md + DESIGN-SYSTEM.md
# Usage: bash check-conventions.sh [app-dir]
# If no dir given, checks all known app dirs.
set -uo pipefail

RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m'

VIOLATIONS=0
WARNINGS=0

warn() { echo -e "${YELLOW}⚠ WARN:${NC} $1"; ((WARNINGS++)); }
fail() { echo -e "${RED}✗ FAIL:${NC} $1"; ((VIOLATIONS++)); }
pass() { echo -e "${GREEN}✓${NC} $1"; }

check_app() {
  local dir="$1"
  local name
  name=$(basename "$dir")
  echo ""
  echo "━━━ Checking $name ━━━"

  if [ ! -d "$dir" ]; then
    warn "$dir does not exist, skipping"
    return
  fi

  # --- URL Patterns ---
  # /auth/login instead of /sign-in
  if grep -rn '/auth/login\|/auth/signin\|signInHref="/auth' "$dir" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .next | grep -v '.test.' | head -5 | grep -q .; then
    fail "$name: Found /auth/login references — should be /sign-in"
    grep -rn '/auth/login\|/auth/signin' "$dir" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .next | grep -v '.test.' | head -3
  else
    pass "$name: Auth URLs use /sign-in pattern"
  fi

  # /auth/signup instead of /sign-up
  if grep -rn '/auth/signup\|/auth/register' "$dir" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .next | grep -v '.test.' | head -5 | grep -q .; then
    fail "$name: Found /auth/signup references — should be /sign-up"
    grep -rn '/auth/signup\|/auth/register' "$dir" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .next | grep -v '.test.' | head -3
  else
    pass "$name: Signup URLs use /sign-up pattern"
  fi

  # --- Color Token Naming ---
  # --color-primary instead of --color-accent (in app code, not node_modules)
  if grep -rn '\-\-color-primary' "$dir" --include="*.css" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .next | head -5 | grep -q .; then
    fail "$name: Found --color-primary — should be --color-accent (see DESIGN-SYSTEM.md)"
    grep -rn '\-\-color-primary' "$dir" --include="*.css" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .next | head -3
  else
    pass "$name: Uses --color-accent (not --color-primary)"
  fi

  # --- Naming ---
  # "Browse" label in navbar
  if grep -rn "label: 'Browse'\|label: \"Browse\"" "$dir" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .next | head -5 | grep -q .; then
    fail "$name: Navbar uses 'Browse' — should be 'Explore' (see CONVENTIONS.md)"
    grep -rn "label: 'Browse'\|label: \"Browse\"" "$dir" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .next | head -3
  else
    pass "$name: Uses 'Explore' (not 'Browse')"
  fi

  # --- Dependencies ---
  # file: dependency for myresto-shared
  if grep -q '"file:.*myresto-shared"' "$dir/package.json" 2>/dev/null; then
    fail "$name: Uses file: dependency for myresto-shared — should be github:myrestolife/myresto-shared"
  else
    pass "$name: Shared package dependency format OK"
  fi

  # --- Touch Targets ---
  # py-1 or py-0.5 on buttons/links (potential undersized touch targets)
  local small_targets
  small_targets=$(grep -rn 'className=.*\bpy-0\.5\b.*button\|className=.*\bpy-1\b.*button\|<button.*\bpy-0\.5\b\|<button.*\bpy-1\b' "$dir" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v .next | wc -l)
  if [ "$small_targets" -gt 0 ]; then
    warn "$name: $small_targets potential undersized button touch targets (py-0.5 or py-1 — minimum should be py-2 / 44px)"
  else
    pass "$name: No obviously undersized button touch targets"
  fi

  # --- Unicode Escapes ---
  # Literal \u escapes that should be actual characters
  if grep -rn '\\u[0-9a-fA-F]\{4\}' "$dir" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .next | grep -v '// ' | head -5 | grep -q .; then
    warn "$name: Found literal \\uXXXX escapes — use actual Unicode characters"
    grep -rn '\\u[0-9a-fA-F]\{4\}' "$dir" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .next | grep -v '// ' | head -3
  else
    pass "$name: No literal Unicode escapes"
  fi

  # --- Transition Standards ---
  # transition-all on cards (should be transition-[shadow,border-color])
  local transition_all_cards
  transition_all_cards=$(grep -rn 'transition-all.*rounded-xl\|rounded-xl.*transition-all' "$dir" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v .next | grep -v 'button\|btn\|Button' | wc -l)
  if [ "$transition_all_cards" -gt 0 ]; then
    warn "$name: $transition_all_cards cards use transition-all — prefer transition-[shadow,border-color] (see DESIGN-SYSTEM.md)"
  fi
}

# Main
echo "🔍 MyResto Convention Checker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $# -gt 0 ]; then
  APPS=("$@")
else
  APPS=(
    "$HOME/Projects/myrestogarage"
    "$HOME/Projects/myrestoevent"
    "$HOME/Projects/myrestoclub"
    "$HOME/Projects/myrestolife"
  )
fi

for app in "${APPS[@]}"; do
  check_app "$app"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$VIOLATIONS" -gt 0 ]; then
  echo -e "${RED}✗ $VIOLATIONS violations, $WARNINGS warnings${NC}"
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}⚠ 0 violations, $WARNINGS warnings${NC}"
  exit 0
else
  echo -e "${GREEN}✓ All checks passed${NC}"
  exit 0
fi
