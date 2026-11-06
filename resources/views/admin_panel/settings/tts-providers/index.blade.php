@extends('admin_panel.layouts.app')

@push('page-title')
    {{ meta('breadcrumbs-title') }}
@endpush

@section('content')
    <div class="card">
        <div class="card-header"><h2 class="card-title">مزوّدو تحويل النص إلى صوت</h2></div>
        <div class="card-body">
            @if(session('success'))
                <div class="alert alert-success">{{ session('success') }}</div>
            @endif
            @if($errors->any())
                <div class="alert alert-danger">{{ $errors->first() }}</div>
            @endif

            <p class="text-muted mb-6">فعّل المزوّدات التي تريد إتاحتها في الاستديو واختر المزوّد الافتراضي. أضف مفاتيح API إلى ملف <code>.env.staging</code> على الخادم؛ لا تُدخل المفاتيح في لوحة الإدارة.</p>

            <form method="POST" action="{{ route_admin('setting.tts-providers.update') }}">
                @csrf
                <div class="row g-5">
                    @foreach($settings['providers'] as $providerId => $provider)
                        <div class="col-md-6">
                            <label class="d-flex align-items-start gap-4 border rounded p-5 h-100">
                                <input class="form-check-input mt-1" type="checkbox" name="enabled[]" value="{{ $providerId }}" {{ in_array($providerId, old('enabled', $settings['enabled']), true) ? 'checked' : '' }} {{ !$provider['configured'] ? 'disabled' : '' }}>
                                <span class="flex-grow-1">
                                    <strong class="d-block">{{ $provider['label'] }}</strong>
                                    <span class="text-muted d-block mt-2">
                                        @if($provider['configured'])
                                            المفتاح موجود على الخادم، ويمكن تفعيل المحرك.
                                        @else
                                            المفتاح غير مضبوط. أضفه إلى ملف البيئة ثم أعد تشغيل التطبيق.
                                        @endif
                                    </span>
                                    @if($providerId === 'munsit')
                                        <span class="text-muted d-block mt-2">كتالوج أصوات عربية ولهجات، تشكيل للفصحى، وخيارات سرعة ومشاعر.</span>
                                    @else
                                        <span class="text-muted d-block mt-2">نماذج الأصوات البشرية المرتبطة في لوحة الأصوات.</span>
                                    @endif
                                </span>
                            </label>
                        </div>
                    @endforeach
                </div>

                <div class="row mt-6">
                    <div class="col-md-6">
                        <label class="form-label" for="active-provider">المزوّد الافتراضي</label>
                        <select id="active-provider" name="active" class="form-select" required>
                            @foreach($settings['providers'] as $providerId => $provider)
                                @if($provider['configured'])
                                <option value="{{ $providerId }}" {{ old('active', $settings['active']) === $providerId ? 'selected' : '' }}>{{ $settings['providers'][$providerId]['label'] }}</option>
                                @endif
                            @endforeach
                        </select>
                        @if(count($settings['enabled']) === 0)
                            <span class="text-danger d-block mt-2">لا توجد مفاتيح مزوّدين مضبوطة حاليًا.</span>
                        @endif
                    </div>
                </div>

                <div class="d-flex justify-content-end mt-6">
                    <button class="btn btn-primary" type="submit" {{ count($settings['enabled']) === 0 ? 'disabled' : '' }}>حفظ إعدادات الصوت</button>
                </div>
            </form>
        </div>
    </div>
@endsection
