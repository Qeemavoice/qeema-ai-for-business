#!/bin/sh
set -eu

mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache

rm -f \
    bootstrap/cache/config.php \
    bootstrap/cache/packages.php \
    bootstrap/cache/routes.php \
    bootstrap/cache/services.php

exec "$@"
