@extends('admin_panel.layouts.app')

@push('page-title')
    قصص النجاح
@endpush

@section('content')
    <div class="card">
        <div class="card-header border-0 pt-6">
            <div class="card-title">
                <div>
                    <h2 class="mb-1">قصص النجاح</h2>
                    <div class="text-muted fs-7">المصدر هو قاعدة البيانات. المنشور والمعتمد فقط يظهر في الموقع العام.</div>
                </div>
            </div>
            <div class="card-toolbar">
                <form method="POST" action="{{ route_admin('successStory.import') }}">
                    @csrf
                    <button class="btn btn-primary" type="submit">استيراد/تحديث من test</button>
                </form>
            </div>
        </div>
        <div class="card-body pt-0">
            @if(session('success'))
                <div class="alert alert-success">{{ session('success') }}</div>
            @endif
            <div class="table-responsive">
                <table class="table table-row-bordered table-row-dashed gy-4 align-middle">
                    <thead class="fs-7 text-gray-400 text-uppercase">
                    <tr><th>العميل والقصة</th><th>التصنيف</th><th>العينة</th><th>الترتيب</th><th>النشر</th><th>مميز</th><th>إذن النشر</th><th></th></tr>
                    </thead>
                    <tbody>
                    @forelse($stories as $story)
                        <tr>
                            <td><strong>{{ $story->brand }}</strong><div class="text-muted fs-8">{{ $story->title }}</div></td>
                            <td>{{ $story->voice_category ?: '—' }}</td>
                            <td>@if($story->audio_url)<audio controls preload="none" style="max-width:190px" src="{{ $story->audio_url }}"></audio>@else — @endif</td>
                            <td colspan="5">
                                <form class="d-flex flex-wrap gap-4 align-items-center" method="POST" action="{{ route_admin('successStory.update', $story) }}">
                                    @csrf
                                    <input class="form-control form-control-sm w-80px" type="number" min="0" name="sort_order" value="{{ $story->sort_order }}">
                                    <label class="form-check form-switch"><input class="form-check-input" type="checkbox" name="is_published" value="1" @checked($story->is_published)><span class="form-check-label">منشور</span></label>
                                    <label class="form-check form-switch"><input class="form-check-input" type="checkbox" name="is_featured" value="1" @checked($story->is_featured)><span class="form-check-label">مميز</span></label>
                                    <label class="form-check form-switch"><input class="form-check-input" type="checkbox" name="permission_confirmed" value="1" @checked($story->permission_confirmed)><span class="form-check-label">مسموح بالنشر</span></label>
                                    <button class="btn btn-sm btn-light-primary" type="submit">حفظ</button>
                                    @if($story->source_url)<a class="btn btn-sm btn-light" target="_blank" href="{{ $story->source_url }}">مصدر test</a>@endif
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="8" class="text-center text-muted py-10">لا توجد قصص. اضغط استيراد/تحديث من test.</td></tr>
                    @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
@endsection
