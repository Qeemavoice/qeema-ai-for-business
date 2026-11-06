<?php

return [
    /*
    | Duplicate blog articles: same title and (almost) the same text.
    | The copy with the most views is the original; every other copy redirects to it permanently (301)
    | and is left out of the blog list and the sitemap. Data is kept intact.
    | Built from the articles table on 2026-11-06 (same ids on production). These copies were already
    | deleted in the old dashboard (deleted_at); the Article model ignores that column, so they are listed here.
    */
    'duplicate_article_redirects' => [
        29 => 32,   30 => 32,   31 => 32,                      // deleted in 2022 -> the live rewrite (2,511)
        37 => 42,                                              // 26 -> 2,705
        71 => 72,                                              // 0 -> 4,307
        91 => 92,   93 => 92,   94 => 92,                      // 20-29 -> 7,208
        95 => 85,                                              // 0 -> 3,218
        98 => 101,  99 => 101,  100 => 101,                    // 0 -> 3,989
        124 => 123, 125 => 123, 126 => 123,                    // 7-10 -> 4,484
        132 => 131, 133 => 131, 134 => 131,                    // 3-6 -> 4,931
        136 => 140, 137 => 140, 138 => 140, 139 => 140,        // 0 -> 7,287
        164 => 166, 165 => 166,                                // 0 -> 4,166
    ],
];
