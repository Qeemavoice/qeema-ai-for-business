<div class="tab-pane fade active show" id="form_tab" role="tab-panel">
    <div class="d-flex flex-column gap-7 gap-lg-10">

        <div class="d-flex flex-column gap-7 gap-lg-12">
            <div class="d-flex flex-column flex-xl-row gap-7 gap-lg-10">
                <div class="card card-flush py-4 flex-row-fluid overflow-hidden col-md-12">
                    <div class="card-header">
                        <div class="card-title">

                            <h2>{{$form->title}}</h2>
                        </div>
                        <div class="card-title">

                        </div>
                    </div>
                    <div class="card-body pt-0">


                        @isset($form->fields)
                            @foreach($form->fields as $field)
                                @if($field->input_field_id === \App\Models\InputField::TEXT)
                                    <div class="fv-row w-100 flex-md-root mb-10">
                                        <label class="form-label">{{$field->label}}</label>
                                        <input type="text"  class="form-control" />
                                    </div>
                                @endif
                                    @if($field->input_field_id === \App\Models\InputField::TEXT_AREA)
                                        <div class="fv-row w-100 flex-md-root mb-10">
                                            <label class="form-label">{{$field->label}}</label>
                                            <textarea class="form-control mb-3"></textarea>
                                        </div>
                                    @endif

                                    @if($field->input_field_id === \App\Models\InputField::RADIO)
                                        <div class="fv-row w-100 flex-md-root mb-10">
                                            <label class="form-label">{{$field->label}}</label>
                                            <div class="d-flex">
                                                @foreach($field->listOfOptions as $index => $option)
                                                <span class="form-check form-check-custom form-check-solid" style="{{$index>=1?'margin-right:2rem;':''}}">
                                                    <input class="form-check-input" type="radio" value="{{$option->value}}">
                                                    <label class="form-label" style="margin-right: 0.5rem;">{{$option->value}}</label>
                                                </span>
                                                @endforeach
                                            </div>
                                        </div>
                                    @endif
                                    @if($field->input_field_id === \App\Models\InputField::CHECKBOX)
                                        <div class="fv-row w-100 flex-md-root mb-10">
                                            <label class="form-label">{{$field->label}}</label>
                                            <div class="d-flex align-items-center mt-3">
                                                @foreach($field->listOfOptions as $index => $option)
                                                <label class="form-check is-invalid">
                                                    <input class="form-check-input"  type="checkbox" value="{{$option->value}}">
                                                    <span class="fw-bold ps-2 fs-6">{{$option->value}}</span>
                                                </label>
                                                @endforeach
                                            </div>
                                        </div>
                                    @endif
                                    @if($field->input_field_id === \App\Models\InputField::DROP_DOWN_LIST)
                                        <div class="fv-row w-100 flex-md-root mb-10">
                                            <label class="form-label">{{$field->label}}</label>
                                            <select  class="form-control mb-3">
                                                <option value="" disabled>{{trans_admin('select_option')}}</option>
                                                @foreach($field->listOfOptions as $option)
                                                <option value="{{$option->value}}">{{$option->value}}</option>
                                                @endforeach
                                            </select>
                                        </div>
                                    @endif
                                    @if($field->input_field_id === \App\Models\InputField::FILE)
                                        <div class="fv-row w-100 flex-md-root mb-10">
                                        <label class="form-label">{{$field->label}}</label>
                                        <input type="file"  class="form-control mb-3" />
                                        </div>
                                    @endif
                            @endforeach
                        @endisset
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
