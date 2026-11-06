#!/usr/bin/env bash
set -euo pipefail

TARGET_ROOT="/home/qemaops/apps/qeemavoice-legacy/v2/public/uploads"
SOURCE_ROOT="/home/qemaops/apps/qeemavoice-legacy/v3/public/uploads"
APP_CONTAINER="qeemavoice-legacy-v2-1"

if [[ ! -d "$SOURCE_ROOT" ]]; then
  echo "Legacy v3 uploads directory not found: $SOURCE_ROOT"
  exit 1
fi

mkdir -p \
  "$TARGET_ROOT/voices" \
  "$TARGET_ROOT/logos" \
  "$TARGET_ROOT/articles" \
  "$TARGET_ROOT/guides" \
  "$TARGET_ROOT/partners" \
  "$TARGET_ROOT/customers"

declare -A source_by_name
while IFS= read -r -d '' source_file; do
  base_name="$(basename "$source_file")"
  if [[ -z "${source_by_name[$base_name]+x}" ]]; then
    source_by_name["$base_name"]="$source_file"
  fi
done < <(find "$SOURCE_ROOT" -type f -size +0c -print0)

references="$(
  docker exec "$APP_CONTAINER" php -r '
    require "/var/www/html/vendor/autoload.php";
    $app = require "/var/www/html/bootstrap/app.php";

    $kernelClass = "Illuminate\\Contracts\\Console\\Kernel";
    $voiceClass = "App\\Models\\Voice";
    $settingClass = "App\\Models\\Setting";
    $articleClass = "App\\Models\\Article";
    $guideClass = "App\\Models\\Guide";
    $partnerClass = "App\\Models\\Partner";
    $customerClass = "App\\Models\\Customer";

    $kernel = $app->make($kernelClass);
    $kernel->bootstrap();

    foreach ($voiceClass::whereNotNull("audio_file")->pluck("audio_file") as $file) {
        if (is_string($file) && $file !== "") {
            echo "voices" . chr(9) . basename($file) . PHP_EOL;
        }
    }


    foreach ($articleClass::get(["external_image", "internal_image"]) as $article) {
        foreach (["external_image", "internal_image"] as $field) {
            $file = $article->{$field};
            if (is_string($file) && $file !== "") {
                echo "articles" . chr(9) . basename($file) . PHP_EOL;
            }
        }
    }

    foreach ($guideClass::get(["image", "file"]) as $guide) {
        foreach (["image", "file"] as $field) {
            $file = $guide->{$field};
            if (is_string($file) && $file !== "") {
                echo "guides" . chr(9) . basename($file) . PHP_EOL;
            }
        }
    }

    foreach ($partnerClass::whereNotNull("image")->pluck("image") as $file) {
        if (is_string($file) && $file !== "") {
            echo "partners" . chr(9) . basename($file) . PHP_EOL;
        }
    }

    foreach ($customerClass::whereNotNull("image")->pluck("image") as $file) {
        if (is_string($file) && $file !== "") {
            echo "customers" . chr(9) . basename($file) . PHP_EOL;
        }
    }

    foreach ($settingClass::whereIn("key", ["header_logo", "favicon", "logo"])->get(["key", "value"]) as $setting) {
        if (is_string($setting->value) && $setting->value !== "") {
            echo "logos" . chr(9) . basename($setting->value) . PHP_EOL;
        }
    }
  '
)"

repaired=0
missing=0
healthy=0

while IFS=$'\t' read -r directory filename; do
  [[ -n "$directory" && -n "$filename" ]] || continue

  target="$TARGET_ROOT/$directory/$filename"

  if [[ -s "$target" ]]; then
    healthy=$((healthy + 1))
    continue
  fi

  source_file="${source_by_name[$filename]:-}"
  if [[ -n "$source_file" && -s "$source_file" ]]; then
    mkdir -p "$(dirname "$target")"
    cp -p "$source_file" "$target"
    echo "Restored $directory/$filename"
    repaired=$((repaired + 1))
  else
    echo "Missing source for $directory/$filename"
    missing=$((missing + 1))
  fi
done <<< "$references"

echo "Media repair summary: healthy=$healthy repaired=$repaired missing=$missing"
exit 0
