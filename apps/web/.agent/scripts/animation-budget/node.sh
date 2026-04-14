#!/usr/bin/env bash
# animation-budget/node.sh — Animation Performance Budget Checker
# Nexus Studio | TIER 3 — ADVISORY
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "🎬 Animation Budget Checker..."

WARN=0

# Check Framer Motion installation
if [ -d "$CWD/node_modules/framer-motion" ]; then
  echo "  → Framer Motion detected. Checking for reduced-motion support..."
  REDUCED=$(grep -r "useReducedMotion\|prefers-reduced-motion" "$CWD/src" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$REDUCED" -eq 0 ]; then
    echo "  ⚠️  No prefers-reduced-motion handling found!"
    echo "     Add: import { useReducedMotion } from 'framer-motion'"
    WARN=1
  else
    echo "  ✅ Reduced-motion support found ($REDUCED references)."
  fi
fi

# Check GSAP installation
if [ -d "$CWD/node_modules/gsap" ]; then
  echo "  → GSAP detected. Checking for useGSAP usage (React-safe pattern)..."
  USE_GSAP_HOOK=$(grep -r "useGSAP\|@gsap/react" "$CWD/src" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  RAW_USE_EFFECT_GSAP=$(grep -r "useEffect.*gsap\|gsap.*useEffect" "$CWD/src" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$RAW_USE_EFFECT_GSAP" -gt 0 ]; then
    echo "  ⚠️  Found $RAW_USE_EFFECT_GSAP instances of raw useEffect + gsap pattern."
    echo "     Replace with useGSAP() from @gsap/react for proper cleanup."
    WARN=1
  else
    echo "  ✅ GSAP React integration patterns look correct."
  fi
fi

# Check Lottie JSON file sizes
if [ -d "$CWD/src/assets/lottie" ] || find "$CWD/src" -name "*.json" -path "*/lottie/*" &>/dev/null 2>&1; then
  echo "  → Checking Lottie JSON file sizes..."
  find "$CWD/src" -name "*.json" -not -path "*/node_modules/*" 2>/dev/null | while read -r f; do
    SIZE_KB=$(du -k "$f" | cut -f1)
    if [ "$SIZE_KB" -gt 50 ]; then
      echo "  ⚠️  Large Lottie JSON: ${f#$CWD/} (${SIZE_KB}KB) — compress at lottiefiles.com"
    fi
  done
fi

# Check for non-compositor CSS properties being animated
echo "  → Scanning for potential jank-causing animation targets..."
JANK=$(grep -r --include="*.tsx" --include="*.ts" --include="*.css" \
  -E "(animate|whileHover|whileTap|initial|transition).*[\"'](width|height|margin|padding|top|left|right|bottom|font-size)" \
  "$CWD/src" 2>/dev/null | wc -l | tr -d ' ')
if [ "$JANK" -gt 0 ]; then
  echo "  ⚠️  Found $JANK potential non-compositor animation targets (width/height/margin/top/left)."
  echo "     Use transform/opacity instead: scaleX for width, translateY for top."
  WARN=1
fi

if [ "$WARN" -eq 0 ]; then
  echo "✅ Animation budget check passed."
else
  echo "⚠️  Animation budget check complete with warnings (advisory — not blocking)."
fi
exit 0
