# SEO Handoff Document — وثيقة تسليم السيو لمطور Laravel (Qeema Voice)

تم إعداد وتجهيز كافة مسارات وروابط موقع **قيمة فويس** لتطابق بنية المسارات الحالية لموقع `qeemavoice.com`، ولتكون جاهزة للنقل المباشر كقوالب Blade في Laravel بدون أي فقدان لحركة المرور وسيو Google.

---

## 1. جدول خريطة المسارات وبيانات السيو (SEO Matrix)

| المسار (Route) | مكوّن الصفحة (Component) | عنوان الصفحة (Title) | الترويسة الرئيسية (H1) | الوصف التعريفي (Meta Description) | نوع Schema (JSON-LD) | الروابط الداخلية الخارجة (Outgoing Internal Links) |
|---|---|---|---|---|---|---|
| `/ar` | `HomePage.tsx` | فويس اوفر عربي وتعليق صوتي احترافي بكل اللهجات \| قيمة فويس | فويس اوفر عربي بأصوات بشرية حقيقية | أكثر من 1000 معلق صوتي عربي محترف بكل اللهجات للإعلانات والوثائقيات والبودكاست والرد الآلي. استمع للعينات واحجز معلقك اليوم. | `Organization` + `WebSite` | `/ar/voices`, `/ar/services/dubbing`, `/ar/services/audiobooks`, `/ar/services/podcast`, `/ar/services/ivr`, `/ar/text-to-speech`, `/ar/pricing`, `/ar/saudi-voice-over`, `/ar/emirati-voice-over`, `/ar/egyptian-voice-over`, `/ar/jobs`, `/ar/contact-us` |
| `/ar/voices` | `VoicesPage.tsx` | مكتبة الأصوات: عينات تعليق صوتي رجالي ونسائي \| قيمة فويس *(ديناميكي عند وجود category)* | مكتبة أصوات المعلقين العرب *(ديناميكي: أصوات {اسم التصنيف})* | استمع لعينات أكثر من 1000 معلق صوتي عربي، رجالي ونسائي، بالفصحى والسعودية والإماراتية والمصرية وكل اللهجات، واختر الصوت المناسب لمشروعك. | `BreadcrumbList` | `/ar/booking/:slug`, `/ar/text-to-speech`, `/ar/voices?category=...`, `/ar/contact-us` |
| `/ar/booking/:slug` | `BookingVoicePage.tsx` | `{اسم المعلق} - تعليق صوتي {اللهجة} \| قيمة فويس` | `عينة صوت: {اسم المعلق}` | استمع إلى عينة التعليق الصوتي للمؤدي {اسم المعلق}، لهجة {اللهجة}، تخصص {التصنيف}. احجز معلقك مباشرة بجودة 48kHz. | `AudioObject` + `BreadcrumbList` | `/ar/voices`, `/ar/contact-us` |
| `/ar/blogs` | `BlogsPage.tsx` | مدونة التعليق الصوتي والدوبلاج \| قيمة فويس | مدونة قيمة فويس | دروس ونصائح في التعليق الصوتي والدوبلاج والبودكاست والكتب الصوتية: سكربتات للتدريب، وبرامج تسجيل، ومعدات، وأسرار المحترفين. | `BreadcrumbList` | `/ar/blogs/details/:slug`, `/ar/voices` |
| `/ar/blogs/details/:slug` | `BlogDetailsPage.tsx` | `{عنوان المقال} \| قيمة فويس` | `{عنوان المقال}` | `short_description` مقتطع إلى 155 حرفاً | `Article` + `BreadcrumbList` | الصفحة التجارية المقابلة في الـ CTA (مثل `/ar/services/dubbing`, `/ar/services/audiobooks`, `/ar/services/podcast`, `/ar/pricing`, `/ar/saudi-voice-over`, `/ar/text-to-speech`, `/ar/jobs`, `/ar/voices`) + 3 مقالات ذات صلة |
| `/ar/jobs` | `JobsPage.tsx` | وظائف تعليق صوتي أون لاين: انضم كمعلق \| قيمة فويس | انضم إلى قيمة فويس كمعلق صوتي | تبحث عن شغل فويس اوفر أون لاين من المنزل؟ أنشئ حسابك كمعلق صوتي، وأضف حتى 5 عينات، وابدأ باستقبال مشاريع من شركات عربية. | `BreadcrumbList` | `/ar/guides`, `/ar/p/terms-of-use` |
| `/ar/guides` | `GuidesPage.tsx` | أدلة التعليق الصوتي والإنتاج \| قيمة فويس | أدلة التعليق الصوتي والإنتاج | أدلة إرشادية وتدريبية متخصصة لشركات الإنتاج والمعلقين الصوتيين حول مواصفات الاستوديو وضبط الصوت. | `BreadcrumbList` | `/ar/jobs`, `/ar/blogs`, `/ar/services/audiobooks` |
| `/ar/p/about-us` | `AboutUsPage.tsx` | من نحن \| قيمة فويس | من نحن | قيمة فويس منصة عربية للتعليق الصوتي تجمع أكثر من 1000 معلق محترف بكل اللهجات، وخدمت أكثر من 5000 شركة عربية. | `BreadcrumbList` | `/ar/voices`, `/ar/contact-us` |
| `/ar/contact-us` | `ContactUsPage.tsx` | تواصل معنا \| قيمة فويس | تواصل معنا | تواصل مع فريق قيمة فويس لطلب عرض سعر أو استشارة حول مشروعك الصوتي. | `BreadcrumbList` | `/ar/jobs`, `mailto:info@qeemavoice.com` |
| `/ar/p/terms-of-use` | `TermsOfUsePage.tsx` | الشروط والأحكام \| قيمة فويس | الشروط والأحكام والتراخيص التجارية | الشروط والأحكام المنظمة لاستخدام منصة قيمة فويس، وتراخيص حقوق الملكية الفكرية وعقود الأصوات البشرية والذكاء الاصطناعي. | `BreadcrumbList` | `/ar/contact-us` |
| `/ar/faqs` | `FaqsPage.tsx` | الأسئلة الشائعة \| قيمة فويس | الأسئلة الشائعة | إجابات عن أكثر الأسئلة حول طلب التعليق الصوتي في قيمة فويس: الحجز والدفع والتعديلات ومدة التسليم وحقوق الاستخدام. | `FAQPage` + `BreadcrumbList` | `/ar/contact-us`, `/ar/voices` |
| `/ar/booking-steps` | `BookingStepsPage.tsx` | خطوات حجز معلق صوتي \| قيمة فويس | كيف تحجز معلقك الصوتي | خطوات حجز معلق صوتي في قيمة فويس: اختر الصوت، وأرسل النص، واستلم التسجيل النهائي بجودة احترافية. | `BreadcrumbList` | `/ar/voices`, `/ar/contact-us` |
| `/ar/our-works` | `OurWorksPage.tsx` | أعمالنا: نماذج تعليق صوتي \| قيمة فويس | أعمالنا | نماذج من مشاريع تعليق صوتي نفذتها قيمة فويس لشركات وجهات حكومية عربية في الإعلان والتعليم ومراكز الاتصال. | `BreadcrumbList` | `/ar/voices`, `/ar/contact-us` |
| `/ar/categories` | `CategoriesPage.tsx` | تصنيفات التعليق الصوتي والأصوات \| قيمة فويس | تصنيفات التعليق الصوتي | استكشف كافة مجالات وتصنيفات التعليق الصوتي: إعلانات تجارية، وثائقي، دوبلاج، كتب صوتية، بودكاست، ورد آلي. | `BreadcrumbList` | `/ar/voices?category=1-إعلانات`, `/ar/services/dubbing`, `/ar/services/audiobooks`, `/ar/services/podcast`, `/ar/services/ivr` |
| `/ar/services/dubbing` | `DubbingServicePage.tsx` | دوبلاج احترافي بأصوات عربية بشرية \| قيمة فويس | خدمة الدوبلاج العربي | دوبلاج للكرتون والأفلام والمسلسلات والإعلانات بأصوات معلقين عرب محترفين، بالفصحى واللهجات، مع إخراج صوتي ومزامنة دقيقة. | `Service` + `FAQPage` + `BreadcrumbList` | `/ar/contact-us`, `/ar/voices`, `/ar/pricing`, مقالات مدونة ذات صلة (177, 161, 160, 48) |
| `/ar/services/audiobooks` | `AudiobooksServicePage.tsx` | تسجيل الكتب الصوتية بأصوات عربية محترفة \| قيمة فويس | تسجيل الكتب الصوتية | حوّل كتابك إلى كتاب صوتي بصوت معلق عربي محترف، بنطق سليم للفصحى وإيقاع مريح للاستماع الطويل، من التسجيل حتى التسليم الجاهز للنشر. | `Service` + `FAQPage` + `BreadcrumbList` | `/ar/contact-us`, `/ar/voices`, `/ar/pricing`, مقالات مدونة ذات صلة (107, 48, 160, 46) |
| `/ar/services/podcast` | `PodcastServicePage.tsx` | إنتاج بودكاست عربي: مقدمات وتعليق صوتي \| قيمة فويس | خدمة إنتاج البودكاست | أصوات احترافية لمقدمات وخواتيم البودكاست والإعلانات داخل الحلقات، بالفصحى أو بلهجة جمهورك، مع تسليم سريع. | `Service` + `FAQPage` + `BreadcrumbList` | `/ar/contact-us`, `/ar/voices`, `/ar/pricing`, مقالات مدونة ذات صلة (142, 158, 160, 57) |
| `/ar/services/ivr` | `IvrServicePage.tsx` | تسجيلات الرد الآلي IVR لمراكز الاتصال \| قيمة فويس | تسجيلات الرد الآلي ومراكز الاتصال | رسائل ترحيب وقوائم رد آلي وانتظار بأصوات عربية واضحة ومهنية، بالفصحى واللهجات الخليجية، جاهزة لأنظمة مراكز الاتصال. | `Service` + `FAQPage` + `BreadcrumbList` | `/ar/contact-us`, `/ar/voices`, `/ar/pricing`, مقالات مدونة ذات صلة (160, 57, 158, 46) |
| `/ar/text-to-speech` | `TextToSpeechPage.tsx` | تحويل النص إلى صوت عربي بأصوات مرخّصة \| قيمة فويس | تحويل النص إلى صوت عربي | استمع لنصك بأصوات AI مرخّصة من معلقين عرب حقيقيين بموافقتهم وبتقاسم الأرباح معهم، ثم احجز المعلق البشري نفسه للنسخة النهائية. | `Service` + `FAQPage` + `BreadcrumbList` | `/ar/contact-us`, `/ar/voices`, مقالات مدونة ذات صلة (66, 160, 57, 46) |
| `/ar/pricing` | `PricingPage.tsx` | أسعار التعليق الصوتي والفويس اوفر \| قيمة فويس | أسعار التعليق الصوتي | تعرّف على أسعار التعليق الصوتي في قيمة فويس حسب نوع المشروع ومدته واللهجة وحقوق الاستخدام، واطلب عرض سعر لمشروعك. | `Service` + `FAQPage` + `BreadcrumbList` | `/ar/contact-us`, `/ar/voices`, مقالات مدونة ذات صلة (46, 57, 160, 158) |
| `/ar/saudi-voice-over` | `SaudiVoiceOverPage.tsx` | فويس اوفر سعودي: معلقون سعوديون محترفون \| قيمة فويس | فويس اوفر سعودي | معلقون صوتيون سعوديون محترفون للإعلانات والفيديوهات التعريفية والرد الآلي باللهجة النجدية والحجازية والفصحى. استمع واحجز الآن. | `Service` + `FAQPage` + `BreadcrumbList` | `/ar/contact-us`, `/ar/voices`, `/ar/pricing`, مقالات مدونة ذات صلة (158, 57, 160, 46) |
| `/ar/emirati-voice-over` | `EmiratiVoiceOverPage.tsx` | فويس اوفر إماراتي: معلقون إماراتيون محترفون \| قيمة فويس | فويس اوفر إماراتي | أصوات إماراتية وخليجية محترفة للإعلانات والجهات الحكومية والفعاليات ومراكز الاتصال في الإمارات. استمع للعينات واحجز معلقك. | `Service` + `FAQPage` + `BreadcrumbList` | `/ar/contact-us`, `/ar/voices`, `/ar/pricing`, مقالات مدونة ذات صلة (160, 57, 142, 46) |
| `/ar/egyptian-voice-over` | `EgyptianVoiceOverPage.tsx` | فويس اوفر مصري: معلقون مصريون محترفون \| قيمة فويس | فويس اوفر مصري | معلقون صوتيون مصريون للإعلانات والسوشيال ميديا والبودكاست والفيديوهات التعليمية، بنبرات متنوعة تناسب جمهورك. | `Service` + `FAQPage` + `BreadcrumbList` | `/ar/contact-us`, `/ar/voices`, `/ar/pricing`, مقالات مدونة ذات صلة (160, 57, 177, 46) |
| `*` (أي مسار غير معروف) | `NotFoundPage.tsx` | الصفحة غير موجودة 404 \| قيمة فويس | الصفحة غير موجودة (404) | عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى رابط آخر. | `noindex, nofollow` | `/ar`, `/ar/voices`, `/ar/blogs` |

---

## 2. قواعد التوافق مع Laravel Blade

1. **البيانات المركزية**: تم فصل بيانات الخدمات والمقالات والمسارات بالكامل في مجلد `src/data/` (`blogData.ts`, `commercialServicesData.ts`).
2. **روابط المقالات**: كل رابط يبنى كالتالي:
   ```php
   /ar/blogs/details/{$article->slug}
   ```
   حيث `$article->slug` يمثل `{id}-{العنوان-بالعربية}` كما هو مخزن بقاعدة بيانات Laravel.
3. **الربط الداخلي من المدونة للخدمات التجارية**:
   تم تضمين CTA في المقال بعد الثلث الأول وفي نهايته بناءً على رقم المقال:
   - 177, 161, 97, 80, 90 -> `/ar/services/dubbing`
   - 107, 47 -> `/ar/services/audiobooks`
   - 142, 184 -> `/ar/services/podcast`
   - 46 -> `/ar/pricing`
   - 158 -> `/ar/saudi-voice-over`
   - 66, 145, 141 -> `/ar/text-to-speech`
   - 148, 178, 88, 147, 10 -> `/ar/jobs`
   - 160, 57, 62, 48, 130, 2, 7, 49 -> `/ar/voices`
4. **التحويلات وSitemap وRobots**:
   لم يتم تضمين أي تحويلات 301 أو sitemap.xml أو ملف robots.txt داخل تطبيق React؛ حيث سيتولاها Laravel عبر وحدات التحكم الحالية (`LegacySeoRedirects`, `BlogController`, `SitemapXmlController`, `public/robots.txt`).
5. **حماية بيئة المعاينة**:
   تم تضمين تحقق تلقائي في هوك `useSeo()` بحيث إذا لم يكن النطاق هو `qeemavoice.com`، يتم تفعيل `noindex, nofollow` فوراً لمنع Google من فهرسة مسودات AI Studio كصفحات مكررة.
