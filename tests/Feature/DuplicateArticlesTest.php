<?php

namespace Tests\Feature;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** A duplicate article copy (config/seo.php) redirects to the original and is left out of the blog list and the sitemap */
class DuplicateArticlesTest extends TestCase
{
    use RefreshDatabase;

    public function test_duplicate_goes_to_the_original_and_is_hidden()
    {
        config(['seo.duplicate_article_redirects' => [31 => 29]]);
        foreach ([29, 31, 50] as $id) {
            DB::table('articles')->insert(['id' => $id, 'title' => json_encode(['ar' => "مقال $id"]), 'short_description' => json_encode(['ar' => 'وصف']),
                'content' => json_encode(['ar' => '<p>نص المقال</p>']), 'status' => 2, 'created_at' => now(), 'updated_at' => now()]);
        }

        $this->get('/ar/blogs/details/31-x')->assertStatus(301)->assertRedirect('/ar/blogs/details/' . \App\Http\Controllers\NewUi\PublicController::articleSlug(Article::find(29)));
        $this->get('/ar/blogs/details/50-x')->assertOk();

        $ids = collect($this->getJson('/api/v1/articles')->assertOk()->json('items'))->pluck('id')->map(fn ($i) => (int) $i)->all();
        $this->assertContains(29, $ids);
        $this->assertNotContains(31, $ids);

        $xml = $this->get('/sitemap.xml')->assertOk()->getContent();
        $this->assertStringContainsString('/ar/blogs/details/29-', $xml);
        $this->assertStringNotContainsString('/ar/blogs/details/31-', $xml);
    }
}
