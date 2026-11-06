<div class="tab-pane fade" id="favorite" role="tabpanel" aria-labelledby="favorite-tab">
    <favorites-index inline-template>
        <div class="card card-main" id="">
            <div class="card-header"><h4> المفضلة </h4></div>
            <div class="card-body table-responsive">
                <table class="table table-hover">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col"> كود الصوت</th>
                        <th scope="col"> الاسم</th>
                        <th scope="col"> سعر الدقيقة</th>
                        <th scope="col"> احجز الآن</th>
                        <!--<th scope="col"> عرض</th>-->
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="favorite in data">
                        <th scope="row">@{{ favorite.id }}</th>
                        <td>@{{ favorite.voice_total_code }}</td>
                        <td>@{{ favorite.user_full_name }}</td>
                        <td>@{{ favorite.voice_total_price }}</td>
                        <td><a :href="'{{ route_app('booking.index', ['slug' => '__slug__']) }}'.replace('__slug__', order.voide_slug)" target="_blank" style="float: unset !important; width: 43px; "  class="pull-right show_voice"><i class="fa fa-book"></i></a></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </favorites-index>
</div>
