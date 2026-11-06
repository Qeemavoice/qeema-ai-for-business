#!/usr/bin/env sh
set -eu

# Run as root inside the app container after mounting public/uploads.
# The host sync user keeps access for rsync; Apache can write new uploads.
sync_uid="${1:-1000}"
uploads_dir=/var/www/html/public/uploads

case "$sync_uid" in
  *[!0-9]*|'') echo 'Expected a numeric sync user ID' >&2; exit 2 ;;
esac

if [ "$(id -u)" -ne 0 ]; then
  echo 'Run this command as root inside the container' >&2
  exit 1
fi

if [ ! -d "$uploads_dir" ]; then
  echo "Missing uploads directory: $uploads_dir" >&2
  exit 1
fi

setfacl -R -m "u:www-data:rwX,u:${sync_uid}:rwX" "$uploads_dir"
find "$uploads_dir" -type d -exec setfacl -m "d:u:www-data:rwx,d:u:${sync_uid}:rwx" {} +
