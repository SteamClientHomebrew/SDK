#!/bin/bash

# Get the new version passed as an argument
NEW_VERSION=$1

# Check if version argument is provided
if [ -z "$NEW_VERSION" ]; then
  echo "Error: No version provided"
  exit 1
fi

# Update the version in package.json
jq --arg version "$NEW_VERSION" '.version = $version' ./api/package.json > temp.json && mv temp.json ./api/package.json
jq --arg version "$NEW_VERSION" '.version = $version' ./client/package.json > temp.json && mv temp.json ./client/package.json
jq --arg version "$NEW_VERSION" '.version = $version' ./webkit/package.json > temp.json && mv temp.json ./webkit/package.json

echo "Updated version to $NEW_VERSION"
