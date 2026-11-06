<div class="card mb-5 mb-xl-10" id="kt_profile_details_view">
    <div class="card-header cursor-pointer">
        <div class="card-title m-0">
            <h3 class="fw-bolder m-0">Profile Details</h3>
        </div>
        <a href="{{route_admin('voiceActor.edit',['id'=> $voiceActor->id])}}" class="btn btn-primary align-self-center">Edit Profile</a>
    </div>
    <div class="card-body p-9">
        <div class="row mb-7">
            <label class="col-lg-4 fw-bold text-muted">ID</label>
            <div class="col-lg-8">
                <a href="#" class="fw-bold fs-6 text-gray-800 text-hover-primary">{{$voiceActor->id}}</a>
            </div>
        </div>
        <div class="row mb-7">
            <label class="col-lg-4 fw-bold text-muted">Uniq ID</label>
            <div class="col-lg-8">
                <a href="#" class="fw-bold fs-6 text-gray-800 text-hover-primary">{{$voiceActor->uniq_id}}</a>
            </div>
        </div>
        <div class="row mb-7">
            <label class="col-lg-4 fw-bold text-muted">Full Name</label>
            <div class="col-lg-8">
                <span class="fw-bolder fs-6 text-gray-800">{{{$voiceActor->full_name}}}</span>
            </div>
        </div>
        <div class="row mb-7">
            <label class="col-lg-4 fw-bold text-muted">Email</label>
            <div class="col-lg-8 fv-row">
                <span class="fw-bold text-gray-800 fs-6">{{{$voiceActor->email}}}</span>
            </div>
        </div>
        <div class="row mb-7">
            <label class="col-lg-4 fw-bold text-muted">Phone</label>
            <div class="col-lg-8 d-flex align-items-center">
                <span class="fw-bolder fs-6 text-gray-800 me-2">{{{$voiceActor->mobile}}}</span>
            </div>
        </div>

        <div class="row mb-7">
            <label class="col-lg-4 fw-bold text-muted">last_login</label>
            <div class="col-lg-8">
                <span class="fw-bolder fs-6 text-gray-800">{{{$voiceActor->last_login}}}</span>
            </div>
        </div>
        @isset($voiceActor->status)
        <div class="row mb-7">
            <label class="col-lg-4 fw-bold text-muted">status</label>
            <div class="col-lg-8">
                <span class="fw-bolder fs-6 text-gray-800">{{ $voiceActor->status->name }}</span>
            </div>
        </div>
        @endisset

        @isset($voiceActor->country)
        <div class="row mb-7">
            <label class="col-lg-4 fw-bold text-muted">country</label>
            <div class="col-lg-8">
                <span class="fw-bolder fs-6 text-gray-800">{{ $voiceActor->country->name }}</span>
            </div>
        </div>
        @endisset


        <div class="row mb-7">
            <label class="col-lg-4 fw-bold text-muted">price_per_minute</label>
            <div class="col-lg-8">
                <span class="fw-bolder fs-6 text-gray-800">{{ $voiceActor->price_per_minute }}</span>
            </div>
        </div>
        @isset($voiceActor->business_link)
        <div class="row mb-7">
            <label class="col-lg-4 fw-bold text-muted">business_link</label>
            <div class="col-lg-8">
                <a href="{{ $voiceActor->business_link }}" target="_blank" class="fw-bolder fs-6 text-primary">link</a>
            </div>
        </div>
        @endisset

    </div>
</div><?php
