#!/usr/bin/env bash
set -euo pipefail

stack_dir="${1:-$(pwd)}"
dumps_dir="${2:-/home/qemaops/backups/digitalocean-2026-10-20/migration-data/databases}"
compose_file="$stack_dir/docker-compose.legacy.yml"
env_file="$stack_dir/.env.legacy"

if [[ ! -f "$env_file" ]]; then
    echo "Missing $env_file. Run scripts/prepare-legacy-env.sh first." >&2
    exit 1
fi

for database in qeemavoice_v2_prod qeemavoice_v2 qeemavoice_prod; do
    if [[ ! -f "$dumps_dir/$database.sql.gz" ]]; then
        echo "Missing dump: $dumps_dir/$database.sql.gz" >&2
        exit 1
    fi
done

set -a
# shellcheck disable=SC1090
source "$env_file"
set +a

compose=(docker compose --env-file "$env_file" -f "$compose_file")
"${compose[@]}" up -d db

echo "Waiting for the legacy database..."
until "${compose[@]}" exec -T db mysqladmin ping -h 127.0.0.1 -uroot -p"$LEGACY_DB_ROOT_PASSWORD" --silent 2>/dev/null; do
    sleep 3
done

for database in qeemavoice_v2_prod qeemavoice_v2 qeemavoice_prod; do
    table_count="$("${compose[@]}" exec -T db mysql -uroot -p"$LEGACY_DB_ROOT_PASSWORD" -NBe \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$database';" 2>/dev/null)"

    if [[ "$table_count" != "0" ]]; then
        echo "Skipping $database; it already contains $table_count tables."
        continue
    fi

    echo "Restoring $database..."
    "${compose[@]}" exec -T db mysql -uroot -p"$LEGACY_DB_ROOT_PASSWORD" -e \
        "CREATE DATABASE IF NOT EXISTS \`$database\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    gzip -dc "$dumps_dir/$database.sql.gz" | \
        "${compose[@]}" exec -T db mysql -uroot -p"$LEGACY_DB_ROOT_PASSWORD" "$database"
    echo "RESTORE OK: $database"
done

"${compose[@]}" exec -T db mysql -uroot -p"$LEGACY_DB_ROOT_PASSWORD" -e \
    "CREATE USER IF NOT EXISTS 'qema_legacy'@'%' IDENTIFIED BY '$LEGACY_DB_PASSWORD'; \
     ALTER USER 'qema_legacy'@'%' IDENTIFIED BY '$LEGACY_DB_PASSWORD'; \
     GRANT ALL PRIVILEGES ON qeemavoice_v2.* TO 'qema_legacy'@'%'; \
     GRANT ALL PRIVILEGES ON qeemavoice_prod.* TO 'qema_legacy'@'%'; \
     FLUSH PRIVILEGES;"

"${compose[@]}" exec -T db mysql -uroot -p"$LEGACY_DB_ROOT_PASSWORD" -NBe \
    "SELECT table_schema, COUNT(*) FROM information_schema.tables \
     WHERE table_schema IN ('qeemavoice_v2_prod','qeemavoice_v2','qeemavoice_prod') \
     GROUP BY table_schema;"
