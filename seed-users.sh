#!/bin/bash

# Output JSON file
OUTPUT_FILE="principals.json"
IDENTITIES=("user1" "user2" "user3" "user4")

echo "🚀 Creating identities and fetching principals..."

# Start JSON object with the new format
echo "{" > "$OUTPUT_FILE"
echo "  \"title\": \"Strategic Income\"," >> "$OUTPUT_FILE"
echo "  \"recipients\": [" >> "$OUTPUT_FILE"

for i in "${!IDENTITIES[@]}"; do
  IDENTITY="${IDENTITIES[$i]}"

  echo "👤 Creating identity: $IDENTITY..."
  dfx identity new "$IDENTITY" 2>/dev/null || echo "ℹ️ Identity '$IDENTITY' already exists."

  echo "🔄 Switching to identity: $IDENTITY..."
  dfx identity use "$IDENTITY"

  PRINCIPAL=$(dfx identity get-principal)
  echo "🔐 $IDENTITY principal: $PRINCIPAL"

  # Add to JSON array
  if [ "$i" -lt $((${#IDENTITIES[@]} - 1)) ]; then
    echo "    \"$PRINCIPAL\"," >> "$OUTPUT_FILE"
  else
    echo "    \"$PRINCIPAL\"" >> "$OUTPUT_FILE"
  fi
done

# End JSON object
echo "  ]" >> "$OUTPUT_FILE"
echo "}" >> "$OUTPUT_FILE"

echo "📄 Principals saved to $OUTPUT_FILE"
echo "✅ Format: { title: 'Strategic Income', recipients: [principal1, principal2, ...] }"
