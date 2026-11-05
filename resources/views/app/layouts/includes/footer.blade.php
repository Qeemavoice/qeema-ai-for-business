<div class="footer">
    <div class="container">
        <div class="footer-columns">
            <div class="row">
                <div class="col-sm-12 col-md-3">
                    <div class="single-col">
                        <ul class="pages">
                            <li><div class="footer-logo"><img src="{{isset($data['header_logo']) ? $data['header_logo'] : logoHeaderApp()}}" alt="قيمة فويس"></div></li>
                            @isset($data['footer_about_site'])
                            <li><p style="text-align: justify;">{{$data['footer_about_site']}}</p></li>
                            @endisset
                        </ul>
                    </div>
                </div>
                <div class="col-sm-12 col-md-5">
                    <div class="single-col">
                        <h5 class="page-links">روابط سريعة</h5>
                        <div class="row">
                            <div class="col-sm-6">
                                <ul class="pages">
                                    <li><a href="{{route_app('home.index')}}">الرئيسية</a></li>
                                    <li><a href="{{route_app('category.index',['slug' => $slugCategories])}}">التصنيفات الصوتية</a></li>
                                    <li><a href="{{route_app('voice.index',['slug' => $slugVoices])}}">الأصوات</a></li>
                                    <li><a href="{{route_app('ourWork.index',['slug' => $slugOurWorks])}}">أعمالنا</a></li>
                                    <li><a href="{{route_app('faq.index',['slug' => $slugFaq])}}">الأسئلة الشائعة</a></li>
                                    <li><a href="{{route_app('page.index',['page' => \App\Models\Page::TERMS_OF_USE])}}">سياسة الاستخدام</a></li>
                                </ul>
                            </div>
                            <div class="col-sm-6">
                                <ul class="pages">
                                    <li><a href="{{route_app('home.index')}}#navourclients">عملائنا</a></li>
                                    <li><a href="{{route_app('bookingStep.index',['slug' => $slugBookingSteps])}}">احجز الصوت</a></li>
                                    <li><a href="{{route_app('blog.index',['slug' => $slugBlogs])}}">المدونة</a></li>
                                    <li><a href="{{route_app('page.index',['page' => \App\Models\Page::TRAINING])}}">التدريب</a></li>
                                    <li><a href="{{route_app('contactUs.index',['slug' => $slugContactUs])}}"> تواصل معنا</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-12 col-md-4">
                    <div class="single-col">
                        <h5 class="page-links">اشترك في القائمة البريدية</h5>
                        <newsletter-form inline-template>
                            <form id="mailinglist" role="form" class="formContact contactForm Contact" v-loading="form.loadingDisplay">
                                <div class="input-group mb-3">
                                    <div class="input-group-prepend">
                                        <button @click="save" class="btn btn-outline-secondary" type="button"><i class="fas fa-arrow-right"></i></button>
                                    </div>
                                    <input type="email" required v-model="email" class="form-control" placeholder="info@email.com" aria-label="" style="direction: ltr;">
                                </div>
                                <span v-if="form.validation && form.validation.email" class="error-block">@{{ form.validation.email[0] }}</span>
                            </form>
                        </newsletter-form>

                        <ul class="contact-list">
                            @isset($data['email'])
                            <li>{{ $data['email'] }}</li>
                            @endisset
                            <li class="social-medeia">
                                <ul class="social-link">
                                    @isset($data['whatsapp'])
                                    <li><a target="_blank" href="https://wa.me/{{$data['whatsapp']}}"><i class="fab fa-whatsapp"></i></a></li>
                                    @endisset
                                    @isset($data['instagram'])
                                    <li><a target="_blank" href="{{$data['instagram']}}"><i class="fab fa-instagram"></i></a></li>
                                    @endisset
                                    @isset($data['facebook'])
                                    <li><a target="_blank" href="{{$data['facebook']}}"><i class="fab fa-facebook-f"></i></a></li>
                                    @endisset
                                     @isset($data['linkedin'])
                                    <li><a target="_blank" href="{{$data['linkedin']}}"><i class="fab fa-linkedin-in"></i></a></li>
                                    @endisset
                                    @isset($data['twitter'])
                                    <li><a target="_blank" href="{{$data['twitter']}}"><i class="fab fa-twitter"></i></a></li>
                                    @endisset
                                    @isset($data['youtube'])
                                    <li><a target="_blank" href="{{$data['youtube']}}"><i class="fab fa-youtube"></i></a></li>
                                    @endisset
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="foot-foot">
                        <span>جميع الحقوق محفوظة لصالح قيمة</span>
                        <span>© {!! date('Y') !!}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
