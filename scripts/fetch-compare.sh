#!/bin/bash
set -euo pipefail

# Accept the URL as an argument or prompt the user to enter it if not provided
if [ -z "${1:-}" ]; then
	# Prompt the user to enter a URL and store it in the variable 'url'
	read -rep "Enter URL: " url
else
	url="$1"
fi

pnpm convex run fetch:compare "$(echo "$url" | jq -Rs '{url: .}')"
