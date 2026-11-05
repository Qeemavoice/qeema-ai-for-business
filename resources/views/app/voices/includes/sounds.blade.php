<div class="container">
    <div class="soundss " id="sound">
        <h1 class="title">الأصوات</h1>
        <h2>استمع إلى نخبة من أفضل معلقينا الصوتيين</h2>
        <div class="sonds cnt" id="load-more">
            <div class="row" id="post-data">
                @include('app.voices.includes.sounds-more')
            </div>
            <div class="load-more" style="margin-left: 50%;margin-right: 47%;">
                <button type="button" @click="loadMore" :disabled="form.disabledButton" class="save-clients-working">تحميل المزيد</button>
            </div>
        </div>

    </div>
</div>
