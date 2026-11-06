#!/usr/bin/env bash
set -euo pipefail

stack_dir="${1:-$(pwd)}"
env_file="$stack_dir/.env.legacy"

if [[ -e "$env_file" ]]; then
    echo "$env_file already exists; leaving it unchanged."
    exit 0
fi

umask 077
root_password="$(openssl rand -hex 24)"
app_password="$(openssl rand -hex 24)"

printf 'LEGACY_DB_ROOT_PASSWORD=%s\nLEGACY_DB_PASSWORD=%s\n' \
    "$root_password" \
    "$app_password" \
    > "$env_file"

echo "Created $env_file with mode 600."
