#!/usr/bin/env bash
set -euo pipefail

APP_CONTAINER="qeemavoice-legacy-v2-1"

docker exec "$APP_CONTAINER" php -r '
require "/var/www/html/vendor/autoload.php";
$app = require "/var/www/html/bootstrap/app.php";
$kernelClass = "Illuminate\\Contracts\\Console\\Kernel";
$articleClass = "App\\Models\\Article";
$statusClass = "App\\Models\\ArticleStatus";
$kernel = $app->make($kernelClass);
$kernel->bootstrap();

$normalize = function ($value) {
    $value = html_entity_decode(strip_tags((string) $value), ENT_QUOTES | ENT_HTML5, "UTF-8");
    $value = preg_replace("/\\s+/u", " ", trim($value));
    return mb_strtolower($value, "UTF-8");
};

$articles = $articleClass::where("status", $statusClass::PUBLISHED)
    ->get(["id", "title", "content", "short_description"]);

$titleGroups = [];
$contentGroups = [];

foreach ($articles as $article) {
    $titleKey = $normalize($article->title);
    if ($titleKey !== "") {
        $titleGroups[$titleKey][] = $article;
    }

    $contentKey = $normalize($article->content);
    if ($contentKey !== "") {
        $contentGroups[sha1($contentKey)][] = $article;
    }
}

echo "=== DUPLICATE ARTICLE TITLES ===" . PHP_EOL;
$titleDuplicateCount = 0;
foreach ($titleGroups as $items) {
    if (count($items) < 2) continue;
    $titleDuplicateCount++;
    echo "TITLE: " . $items[0]->title . PHP_EOL;
    echo "IDS: " . implode(",", array_map(fn($item) => $item->id, $items)) . PHP_EOL;
}
if ($titleDuplicateCount === 0) {
    echo "none" . PHP_EOL;
}

echo "=== DUPLICATE ARTICLE CONTENT ===" . PHP_EOL;
$contentDuplicateCount = 0;
foreach ($contentGroups as $items) {
    if (count($items) < 2) continue;
    $contentDuplicateCount++;
    echo "TITLE: " . $items[0]->title . PHP_EOL;
    echo "IDS: " . implode(",", array_map(fn($item) => $item->id, $items)) . PHP_EOL;
}
if ($contentDuplicateCount === 0) {
    echo "none" . PHP_EOL;
}

echo "SUMMARY title_groups=" . $titleDuplicateCount . " content_groups=" . $contentDuplicateCount . PHP_EOL;
'
