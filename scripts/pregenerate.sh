#!/usr/bin/env bash

# Write out repo metadata
node ./scripts/write-repo-metadata > repo-metadata.json

# Generate GraphQL typings for urql
# npm run codegen:graphql

# Generate Apollo typings
npm run codegen:apollo

# Fetch EVM networks metadata
node ./scripts/write-networks-metadata > content/networks-metadata.json