<div class="page-header">
    <div class="container">
        <div class="search-area">
            <div class="row">
                <div class="col-12">
                    <form method="get" action="#" >
                        <div class="select-area">
                            <div class="btn-group">
                                <select v-model="filter.language" name="languge_id" class="form-control" id="language">
                                    <option value="0">اللغة:الكل</option>
                                    @foreach($languages as $key => $value)
                                        <option value="{{$value->id}}">{{$value->name}}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="btn-group">

                                <select v-model="filter.type" name="type" class="form-control" id="by">
                                    <option value="0">المؤدي:الكل</option>
                                    @foreach($types as $key => $value)
                                    <option  value="{{$value->id}}">{{$value->name}}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="btn-group">
                                <select  v-model="filter.dialect" name="dialect"  class="form-control" id="dialect"  style="width:204px;">
                                    <option  value="0">اللهجة:الكل</option>
                                    @foreach($dialects as $key => $value)
                                        <option  value="{{$value->id}}">{{$value->name}}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="btn-group">
                                <select v-model="orderBy.column" name="default_order"  class="form-control" id="default_order">
                                    <option  selected  value="id">الترتيب الافتراضي</option>
                                    <option  value="most_requested">ترتيب حسب الأعلى طلبًا </option>
{{--                                    <option  value="fastest_delivery">ترتيب حسب الأسرع تسليمًا </option>--}}
{{--                                    <option  value="most_popular">ترتيب حسب الأكثر شهرة </option>--}}
                                    <option  value="lowest_price">ترتيب حسب الأدنى سعرًا</option>
                                    <option  value="highest_price">ترتيب حسب الاعلى سعرًا </option>
                                </select>
                            </div>
                            <div class="btn-group ser-btn">
                                <button type="button" :disabled="form.disabledButton" @click="search" class="search-btn">إبحث</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="col-12">
                    <div class="sound-type">
                        <table class="minha-table">
                            <tr>
                                @foreach($categories as $key => $value)
                                <td class="mb-2" id="category_{{$value->id}}">
                                    <label><input type="checkbox" @click="checkedCategoryField({{$value->id}})" v-model="filter.categories"  value="{{$value->id}}">{{$value->name}}</label>
                                </td>
                                @endforeach
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
