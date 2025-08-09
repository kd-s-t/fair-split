#!/usr/bin/env bash
# dfx-deploy-local.sh — Deploy Motoko canisters to the local replica inside the dfx container
# Usage (on EC2): sudo bash ~/apps/safesplit/scripts/dfx-deploy-local.sh

set -euo pipefail

REPO_DIR=${REPO_DIR:-$HOME/apps/safesplit}
DFX_DIR=${DFX_DIR:-$HOME/dfxproj}

echo "📁 Syncing Motoko sources to $DFX_DIR"
mkdir -p "$DFX_DIR/src"
cp -f "$REPO_DIR/dfx.json" "$DFX_DIR/"
rsync -av --delete "$REPO_DIR/icp/src/" "$DFX_DIR/src/"

echo "🐳 Ensuring dfx container is running"
docker restart dfx >/dev/null 2>&1 || true
sleep 3

echo "⏳ Waiting for replica to become ready"
if ! docker exec -i dfx bash -lc 'for i in $(seq 1 60); do dfx ping local >/dev/null 2>&1 && exit 0 || sleep 2; done; exit 1'; then
  echo "❌ Replica not responding"
  exit 1
fi

echo "🚀 Deploying canisters"
docker exec -it dfx bash -lc 'cd /app && (dfx identity list | grep -q "^deployer$" || dfx identity new deployer) && dfx identity use deployer && dfx deploy --network local'

LOCAL_ID=$(docker exec -i dfx bash -lc 'cd /app && dfx canister id split_dapp' | tr -d '\r')
echo "✅ Local canister ID: $LOCAL_ID"

echo "🔑 (Optional) Update SSM for frontend"
echo "    aws ssm put-parameter --name \"/splitsafe/development/NEXT_PUBLIC_DFX_HOST\" --type String --value \"https://thesplitsafe.com\" --overwrite --region us-east-1"
echo "    aws ssm put-parameter --name \"/splitsafe/development/NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP\" --type String --value \"$LOCAL_ID\" --overwrite --region us-east-1"

echo "✨ Done."


