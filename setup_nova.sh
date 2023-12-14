#!/bin/bash
SDK_DIR="iota-sdk"
TARGET_COMMIT="05b7cec884177ba11c8848d0d52c850a8bb496fe"

if [ ! -d "$SDK_DIR" ]; then
  git clone -b 2.0 git@github.com:iotaledger/iota-sdk.git
  cd "./$SDK_DIR"
else
  echo "Pulling nova-sdk..."
  cd "./$SDK_DIR"
  git reset --hard 2.0
  git pull
fi

echo "Checking out nova-sdk commit $TARGET_COMMIT"
git checkout "$TARGET_COMMIT"

cd "./bindings/nodejs"
echo "Renaming nodejs sdk (sdk-nova)"
sed -i '' '2s/.*/    \"name\": \"@iota\/sdk-nova\",/' package.json
echo "Building nodejs bindings"
yarn
yarn build

cd "../wasm"
echo "Renaming wask sdk (sdk-wasm-nova)"
sed -i '' '2s/.*/    \"name\": \"@iota\/sdk-wasm-nova\",/' package.json
echo "Building wasm bindings"
yarn
yarn build


