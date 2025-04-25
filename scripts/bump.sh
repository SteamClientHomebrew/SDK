#!/bin/bash

# Extract the version from the root package.json
NEW_VERSION=$(jq -r '.version' ./package.json)

# Check if the version was successfully extracted
if [ -z "$NEW_VERSION" ] || [ "$NEW_VERSION" == "null" ]; then
  echo "Error: Failed to extract version from ./package.json"
  exit 1
fi

# Update the version in all package.json files
for file in ./api/package.json ./client/package.json ./webkit/package.json; do
  jq --arg version "$NEW_VERSION" '.version = $version' "$file" > temp.json && mv temp.json "$file"
done

echo "Updated all package.json files to version $NEW_VERSION"
