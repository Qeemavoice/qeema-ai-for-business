
@extends('admin_panel.layouts.app')

@push('page-title')
    {{ meta('breadcrumbs-title') }}
@endpush

@section('content')
    <setting-email-form :page="'{{$page}}'" :settings="{{ isset($settings) ? json_encode($settings) : 'null' }}" inline-template>
        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
            <div class="d-flex flex-column gap-7 gap-lg-10">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{ meta('breadcrumbs-title') }}</h2>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="fv-row w-100 flex-md-root">
                            <div class="row">
                                <div class="mb-10 col-md-12">
                                    <label for="from_address" class="form-label mb-2">Mail Driver</label>
                                    <input type="email" v-model="email.mail_driver" disabled class="form-control" id="mail_driver" aria-describedby="emailHelp" placeholder=" ">
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.mail_driver">@{{ form.validation.mail_driver[0] }}</span>
                                </div>
                                <div class="mb-10 col-md-6">
                                    <label for="from_address" class="form-label mb-2">Mail From Address</label>
                                    <input type="email" v-model="email.from_address" class="form-control" id="from_address" aria-describedby="emailHelp" placeholder=" ">
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.mail_from_address">@{{ form.validation.mail_from_address[0] }}</span>
                                </div>
                                <div class="mb-10 col-md-6">
                                    <label for="from_name" class="form-label mb-2">Mail From Name</label>
                                    <input type="text" v-model="email.from_name" class="form-control" id="from_name" aria-describedby="emailHelp" placeholder=" ">
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.mail_from_name">@{{ form.validation.mail_from_name[0] }}</span>
                                </div>
                                <div class="mb-10 col-md-6">
                                    <label for="host" class="form-label mb-2">Mail Host</label>
                                    <input type="text" v-model="email.host" class="form-control" id="host" aria-describedby="emailHelp" placeholder=" ">
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.mail_host">@{{ form.validation.mail_host[0] }}</span>
                                </div>
                                <div class="mb-10 col-md-6">
                                    <label for="port" class="form-label mb-2">Mail Port</label>
                                    <input type="text" v-model="email.port" class="form-control" id="port" aria-describedby="emailHelp" placeholder=" ">
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.mail_port">@{{ form.validation.mail_port[0] }}</span>
                                </div>
                                <div class="mb-10 col-md-6">
                                    <label for="username" class="form-label mb-2">Mail Username</label>
                                    <input type="text" v-model="email.username" class="form-control" id="username" aria-describedby="emailHelp" placeholder=" ">
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.mail_username">@{{ form.validation.mail_username[0] }}</span>
                                </div>
                                <div class="mb-10 col-md-6">
                                    <label for="password" class="form-label mb-2">Mail Password</label>
                                    <input type="password" v-model="email.password" class="form-control" id="password" aria-describedby="emailHelp" placeholder="Enter ">
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.mail_password">@{{ form.validation.mail_password[0] }}</span>
                                </div>
                                <div class="mb-10 col-md-12">
                                    <label for="encryption" class="form-label mb-2">Mail Encryption</label>
                                    <select v-model="email.encryption" class="form-select mb-2" id="encryption">
                                        <option value="">Please Select</option>
                                        <option value="ssl">SSL</option>
                                        <option value="tls">TLS</option>
                                    </select>
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.mail_encryption">@{{ form.validation.mail_encryption[0] }}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end">
                @include('admin_panel.includes.buttons.cancel')
                @include('admin_panel.includes.buttons.save')
            </div>
        </div>

    </setting-email-form>
@endsection



