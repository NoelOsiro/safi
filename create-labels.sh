#!/bin/bash

# Add missing GitHub issue labels to the repository
REPO="NoelOsiro/safi"

declare -A labels
labels=(
  [authentication]="#1f77b4"
  [enhancement]="#17becf"
  [feature]="#2ca02c"
  [cms]="#bcbd22"
  [admin]="#d62728"
  [multimedia]="#9467bd"
  [assessment]="#ff7f0e"
  [ai]="#8c564b"
  [integration]="#e377c2"
  [personalization]="#7f7f7f"
  [analytics]="#bcbd22"
  [mobile]="#1f77b4"
  [pwa]="#aec7e8"
  [accessibility]="#98df8a"
  [i18n]="#ffbb78"
  [localization]="#ff9896"
  [communication]="#c5b0d5"
  [certification]="#c49c94"
  [gamification]="#f7b6d2"
  [performance]="#dbdb8d"
  [optimization]="#9edae5"
  [testing]="#c7c7c7"
  [quality]="#ff7f0e"
  [monitoring]="#c49c94"
  [reliability]="#e377c2"
  [payments]="#98df8a"
  [offline]="#aec7e8"
)

echo "🧩 Creating issue labels for $REPO..."
for label in "${!labels[@]}"; do
  echo "Creating label: $label"
  gh label create "$label" --color "${labels[$label]}" --repo "$REPO" 2>/dev/null || echo "✅ Label '$label' already exists or failed to create."
done

echo "✅ All required labels processed."
