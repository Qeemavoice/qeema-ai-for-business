<div class="col-md-4 profile-data">
    <div class="card card-aside">
        <img src="{{user()->image_url}}" class="card-img-top img_profile" alt="{{user()->full_name}}">
        <div class="card-body table-responsive">
            <table class="table table-borderless">
                <tbody>
                <tr>
                    <td><b> الاسم </b></td>
                    <td>{{user()->full_name}}</td>
                </tr>
                <tr>
                    <td><b>البريد الالكتروني </b></td>
                    <td class="p_email">{{user()->email}}</td>
                </tr>
                <tr>
                    <td><b> رقم الجوال </b></td>
                    @if(user()->profile&&user()->profile->whatsapp_number)
                        <td class="p_mobile">{{ user()->profile->whatsapp_number}}</td>
                    @else
                        <td class="p_mobile">-</td>
                    @endif
                </tr>
                @if(user()->profile&&user()->profile->country)
                    <tr>
                        <td><b>  الدولة </b></td>
                        <td class="p_address">{{user()->profile->country->name}}</td>
                    </tr>
                @endif
                </tbody>
            </table>
        </div>
    </div>
</div>
