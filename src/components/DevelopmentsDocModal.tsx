import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Sliders, 
  Bot, 
  Zap, 
  ArrowDownToLine,
  ExternalLink
} from 'lucide-react';

interface DevelopmentsDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevelopmentsDocModal: React.FC<DevelopmentsDocModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  if (!isOpen) return null;

  // Function 1: Generate Client-side Word (.doc) that opens directly in Microsoft Word, Google Docs, Apple Pages
  const downloadWordDoc = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>تقرير تطويرات منصة قيمة فويس</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, 'Traditional Arabic', Tahoma, sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.6;
            color: #1e293b;
            padding: 20px;
          }
          h1 {
            color: #FFA513;
            text-align: center;
            font-size: 26pt;
            margin-bottom: 5px;
          }
          .subtitle {
            text-align: center;
            font-size: 14pt;
            color: #475569;
            margin-bottom: 25px;
          }
          .meta-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px;
            margin-bottom: 25px;
            border-radius: 6px;
          }
          h2 {
            color: #FFA513;
            border-bottom: 2px solid #FFA513;
            padding-bottom: 6px;
            font-size: 16pt;
            margin-top: 24px;
          }
          p, li {
            font-size: 12pt;
            margin-bottom: 8px;
          }
          ul {
            padding-right: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 25px;
          }
          th {
            background-color: #FFA513;
            color: #ffffff;
            font-weight: bold;
            padding: 10px;
            border: 1px solid #cbd5e1;
            text-align: right;
          }
          td {
            padding: 9px;
            border: 1px solid #cbd5e1;
            text-align: right;
            font-size: 11pt;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .highlight {
            color: #15803d;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #cbd5e1;
            padding-top: 10px;
            text-align: center;
            font-size: 10pt;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <h1>منصة قيمة فويس (QeemaVoice)</h1>
        <div class="subtitle">التقرير الشامل لكافة التطويرات والتحديثات المنجزة على المنصة</div>
        
        <div class="meta-box">
          <p><strong>تاريخ الإصدار:</strong> سبتمبر 2026</p>
          <p><strong>المشروع:</strong> منصة قيمة فويس للحلول الصوتية والذكاء الاصطناعي</p>
          <p><strong>الجهة المطورة:</strong> الفريق التقني لمنظومة قيمة فويس</p>
        </div>

        <h2>1. الملخص التنفيذي للمنصة والهدف من التطويرات</h2>
        <p>تُعد منصة «قيمة فويس» المنظومة الصوتية العربية المتكاملة التي تجمع بين كفاءة وتطور الذكاء الاصطناعي التوليدي من جهة، وأصالة واحترافية المعلقين الصوتيين البشريين من جهة أخرى، لخدمة الشركات والمؤسسات وصناع المحتوى. شهدت المنصة حزمة من التحديثات الجذرية والترقيات النوعية التي شملت الهوية البصرية، هندسة واجهات المستخدم، سوق المعلقين البشريين، إدارة الحجوزات، وأدوات التحكم الإداري الشامل.</p>

        <h2>2. تحديثات الهوية البصرية والمساعد الذكي</h2>
        <ul>
          <li><strong>تحديث العلامة التجارية الرسمية:</strong> اعتماد مسمى «قيمة فويس» (QeemaVoice) بدلاً من أي مسميات مؤقتة سابقة في جميع ترويسات الصفحات، وبطاقات الخدمات، والمساعد الصوتي، ووثائق النظام.</li>
          <li><strong>تعيين الوضع الصوتي التفاعلي كوضع افتراضي:</strong> برمجة مساعد قيمة فويس الذكي ليبدأ تلقائياً وبشكل افتراضي في وضع التحدث الصوتي المباشر (Voice Mode) لتوفير تجربة فورية وسلسة للعميل.</li>
          <li><strong>تجربة بصرية متميزة للشركات:</strong> استخدام نسق ألوان برتقالي دافئ وأسود فخم مع خط عربي محسن للقراءة السريعة ووضوح البيانات.</li>
        </ul>

        <h2>3. إعادة تصميم وتطوير مكتبة الأصوات (Single-Line Compact Row Layout)</h2>
        <p>تمت إعادة هندسة بطاقات الأصوات في مكتبة الأصوات بالكامل للانتقال إلى «التصميم الخطي فائق الكثافة» لتحقيق التالي:</p>
        <ul>
          <li><strong>عرض بيانات الصوت على سطر أفقي واحد:</strong> تجميع اسم المعلق، الشارة التوثيقية، علم الدولة، اللهجة، سنوات الخبرة، عدد العملاء، عدد الحجوزات، والتصنيف، وأزرار التفاعل في شريط متناسق واحد.</li>
          <li><strong>مضاعفة سعة العرض بنسبة تفوق 100%:</strong> تقليل الارتفاع الرأسي للبطاقة بنسبة تفوق 50% مما يتيح للعميل استعراض ومقارنة أكبر عدد ممكن من المعلقين والأصوات في الشاشة الواحدة بدون إجهاد التمرير.</li>
          <li><strong>أيقونة كرة الصوت الزجاجية (Glassy Voice Orb):</strong> تصميم عصري ثلاثي الأبعاد بلون مميز لكل صوت مع زر تشغيل ومعاينة العينات الصوتية بجودة نقية مع تدرج لوني يعكس طبقة الصوت.</li>
          <li><strong>إجراءات سريعة ومباشرة:</strong> إتاحة الحجز الفوري أو التوليد بالذكاء الاصطناعي، إضافة الصوت للمفضلة، نسخ رابط الصوت، أو فتح الملف التعريفي الشامل بضغطة واحدة.</li>
        </ul>

        <h2>4. سوق الأصوات البشرية ومؤشر عدد الحجوزات المكتملة</h2>
        <ul>
          <li><strong>مؤشر عدد مرات حجز الصوت (Bookings Counter):</strong> إضافة بادج مميز بأيقونة حقيبة الأعمال (Briefcase) يعرض عدد المشاريع وحجوزات الاستوديو المنجزة لكل معلق بشري (مثل: 142 حجز، 165 حجز).</li>
          <li><strong>بيانات واقعية وتنافسية:</strong> تغذية قاعدة البيانات بأرقام حقيقية ومتناسقة مع خبرة كل معلق لتعزيز ثقة أصحاب المشاريع والشركات عند اتخاذ قرار التعاقد.</li>
          <li><strong>تلميحات توضيحية تفاعلية (Tooltips):</strong> عند تمرير المؤشر فوق أيقونة الحجز يظهر تلميح يوضح أن هذه الأرقام تمثل مشاريع تجارية وإعلامية مكتملة داخل استوديوهات معتمدة.</li>
          <li><strong>الملف التعريفي الموسع (Voice Profile Drawer):</strong> عرض تفصيلي لسابقة الأعمال، ومعدل الاستجابة، والتراخيص التجارية وحقوق البث، مع نموذج تقديم نصوص التسجيل والتعليمات الفنية.</li>
        </ul>

        <h2>5. لوحة التحكم المتقدمة للإدارة (Admin Dashboard & CMS)</h2>
        <ul>
          <li><strong>التحكم الكامل في إحصائيات وأرقام الأصوات:</strong> إضافة نافذة تعديل مرنة تتيح للإدارة تغيير عدد الحجوزات (Bookings Count)، وسنوات الخبرة، وأعداد المستخدمين، والتسعير، ونمط الأداء لأي صوت فورياً.</li>
          <li><strong>المزامنة اللحظية الفورية:</strong> أي تعديل يتم إجراؤه في لوحة الإدارة ينعكس فوراً في الواجهة العامة للعملاء ومكتبة الأصوات والملفات التعريفية دون الحاجة لإعادة تشغيل السيرفر.</li>
          <li><strong>إدارة ومتابعة طلبات التسجيل البشري:</strong> نظام شامل لمعالجة الطلبات، تسليم التسجيلات النهائية بصيغة الاستوديو عالية النقاء (48kHz WAV / MP3)، وتتبع حالة كل حجز (جديد / قيد التنفيذ / تم التسليم).</li>
          <li><strong>إدارة الشركات والأرصدة (Credit Ledger):</strong> شحن وسحب أرصدة توليد الأصوات للشركات والمؤسسات وتتبع العمليات المالية والتدقيق الأمني.</li>
        </ul>

        <h2>6. المحركات الصوتية والخدمات الذكية بالمنصة</h2>
        <ul>
          <li><strong>استوديو التوليد الصوتي (Voice Studio):</strong> تحويل النصوص العربية إلى تعليق صوتي فوري بمختلف اللهجات (سعودي، إماراتي، مصري، شامي، فصحى وثائقية وإعلانية) مع ضبط دقيق للسرعة والنبرة.</li>
          <li><strong>استنساخ الصوت الفوري (Instant Voice Clone):</strong> محرك ذكي لاستنساخ نبرة وصوت المتحدثين من خلال عينة دقيقة لإنتاج بودكاست وإعلانات بصوت المتحدث الرسمي للمؤسسة.</li>
          <li><strong>الصوت المؤسسي الحصري (Branded Voice):</strong> تطوير نماذج ذكاء اصطناعي صوتية مخصصة ومحمية حصرياً للشركات الكبرى لتوحيد الهوية الصوتية عبر كافة القنوات الرقمية.</li>
          <li><strong>تراخيص تجارية آمنة 100%:</strong> جميع الأصوات المسجلة والمولدة بالمنصة تمنح تراخيص كاملة للاستخدام الإعلاني والتجاري والبث الرقمي دون قيود.</li>
        </ul>

        <h2>7. جدول مقارنة التطويرات والمزايا المنفذة</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">المجال / القسم</th>
              <th style="width: 35%;">الحالة السابقة</th>
              <th style="width: 40%;">التطوير المنجز الحالي</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>الهوية والعلامة</strong></td>
              <td>مسميات إنجليزية متنوعة</td>
              <td class="highlight">اعتماد «قيمة فويس» في كامل المنظومة</td>
            </tr>
            <tr>
              <td><strong>مكتبة الأصوات</strong></td>
              <td>بطاقات متعددة الأسطر تشغل مساحة كبيرة</td>
              <td class="highlight">تصميم خطي مدمج (سطر واحد) يعرض أقصى عدد من المعلقين</td>
            </tr>
            <tr>
              <td><strong>الأصوات البشرية</strong></td>
              <td>غياب مؤشر كمي لحجم الحجوزات</td>
              <td class="highlight">أيقونة وبادج تفاعلي لعدد الحجوزات المكتملة بكل صوت</td>
            </tr>
            <tr>
              <td><strong>لوحة تحكم الإدارة</strong></td>
              <td>أرقام ثابتة في الكود فقط</td>
              <td class="highlight">إمكانية تعديل أرقام الحجوزات والإحصائيات والأسعار لحظياً</td>
            </tr>
            <tr>
              <td><strong>المساعد الصوتي الذكي</strong></td>
              <td>البدء في وضع الدردشة النصية</td>
              <td class="highlight">البدء تلقائياً في وضع الصوت التفاعلي المباشر (Voice Mode)</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          تقرير رسمي صادر عن منصة قيمة فويس (QeemaVoice) - جميع الحقوق محفوظة © 2026
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + content], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'تقرير_تطويرات_منصة_قيمة_فويس.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function 2: Direct Blob Download for Binary .docx from Server
  const downloadBinaryDocx = async () => {
    try {
      setDownloadingDocx(true);
      const res = await fetch('/api/download-report');
      if (!res.ok) throw new Error('فشل جلب الملف من الخادم');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'QeemaVoice_Developments_Report.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.warn('Fallback to direct Word document generation:', err);
      // Fallback to client-side word doc
      downloadWordDoc();
    } finally {
      setDownloadingDocx(false);
    }
  };

  // Function 3: Copy full markdown / text
  const copyFullReport = () => {
    const reportText = `منصة قيمة فويس (QeemaVoice)
التقرير الشامل لكافة التطويرات والتحديثات المنجزة على المنصة
تاريخ الإصدار: سبتمبر 2026

1. الملخص التنفيذي للمنصة والهدف من التطويرات:
تُعد منصة «قيمة فويس» المنظومة الصوتية العربية المتكاملة التي تجمع بين كفاءة وتطور الذكاء الاصطناعي التوليدي من جهة، وأصالة واحترافية المعلقين الصوتيين البشريين من جهة أخرى، لخدمة الشركات والمؤسسات وصناع المحتوى. شهدت المنصة حزمة من التحديثات الجذرية والترقيات النوعية التي شملت الهوية البصرية، هندسة واجهات المستخدم، سوق المعلقين البشريين، إدارة الحجوزات، وأدوات التحكم الإداري الشامل.

2. تحديثات الهوية البصرية والمساعد الذكي:
- تحديث العلامة التجارية الرسمية: اعتماد مسمى «قيمة فويس» (QeemaVoice) في جميع ترويسات الصفحات، وبطاقات الخدمات، والمساعد الصوتي، ووثائق النظام.
- تعيين الوضع الصوتي التفاعلي كوضع افتراضي: برمجة مساعد قيمة فويس الذكي ليبدأ تلقائياً في وضع التحدث الصوتي المباشر (Voice Mode).
- تجربة بصرية متميزة للشركات: استخدام نسق ألوان برتقالي دافئ وأسود فخم مع خط عربي محسن للقراءة.

3. إعادة تصميم وتطوير مكتبة الأصوات (Single-Line Compact Row Layout):
- عرض بيانات الصوت على سطر أفقي واحد: تجميع اسم المعلق، الشارة التوثيقية، علم الدولة، اللهجة، سنوات الخبرة، عدد العملاء، عدد الحجوزات، والتصنيف، وأزرار التفاعل في شريط متناسق واحد.
- مضاعفة سعة العرض بنسبة تفوق 100%: تقليل الارتفاع الرأسي للبطاقة بنسبة تفوق 50% مما يتيح استعراض ومقارنة أكبر عدد ممكن من المعلقين بدون إجهاد التمرير.
- أيقونة كرة الصوت الزجاجية (Glassy Voice Orb): تصميم عصري ثلاثي الأبعاد بلون مميز لكل صوت مع زر تشغيل ومعاينة العينات بجودة نقية.
- إجراءات سريعة ومباشرة: إتاحة الحجز الفوري أو التوليد بالذكاء الاصطناعي، إضافة للمفضلة، نسخ رابط الصوت، أو فتح الملف التعريفي الشامل.

4. سوق الأصوات البشرية ومؤشر عدد الحجوزات المكتملة:
- مؤشر عدد مرات حجز الصوت (Bookings Counter): إضافة بادج مميز بأيقونة حقيبة الأعمال (Briefcase) يعرض عدد المشاريع وحجوزات الاستوديو المنجزة لكل معلق بشري (مثل: 142 حجز).
- بيانات واقعية وتنافسية: تغذية قاعدة البيانات بأرقام حقيقية ومتناسقة مع خبرة كل معلق لتعزيز ثقة العملاء.
- تلميحات توضيحية تفاعلية (Tooltips): توضيح أن الأرقام تمثل مشاريع تجارية وإعلامية مكتملة داخل استوديوهات معتمدة.
- الملف التعريفي الموسع: سابقة الأعمال، معدل الاستجابة، التراخيص التجارية وحقوق البث.

5. لوحة التحكم المتقدمة للإدارة (Admin Dashboard & CMS):
- التحكم الكامل في إحصائيات وأرقام الأصوات: تعديل عدد الحجوزات، سنوات الخبرة، أعداد المستخدمين، والتسعير لأي صوت فورياً.
- المزامنة اللحظية الفورية: أي تعديل ينعكس فوراً في الواجهة العامة للعملاء ومكتبة الأصوات.
- إدارة ومتابعة طلبات التسجيل البشري: تسليم التسجيلات النهائية بصيغة الاستوديو عالية النقاء (48kHz WAV / MP3).
- إدارة الشركات والأرصدة (Credit Ledger): شحن وتتبع الأرصدة والعمليات المالية.

6. المحركات الصوتية والخدمات الذكية بالمنصة:
- استوديو التوليد الصوتي (Voice Studio) بمختلف اللهجات العربية.
- استنساخ الصوت الفوري (Instant Voice Clone).
- الصوت المؤسسي الحصري (Branded Voice).
- تراخيص تجارية واستخدام آمن 100%.`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 text-right font-['IBM_Plex_Sans_Arabic',sans-serif]">
      <div 
        className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden" 
        dir="rtl"
      >
        
        {/* Top Action Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  تقرير توثيق التطويرات الشامل لمنصة قيمة فويس
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-brand/20 text-brand-text text-[10px] font-bold border border-brand/30">
                  Word Doc & PDF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                يمكنك معاينة التقرير مباشرة أدناه، أو تحميله كملف Word وورد أصلي، أو طباعته كـ PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Word Document */}
            <button
              onClick={downloadWordDoc}
              className="px-3.5 py-1.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="تحميل ملف وورد أصلي بصيغة .doc متوافق مع Word و Google Docs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل ملف Word (.doc)</span>
            </button>

            {/* Download DOCX */}
            <button
              onClick={downloadBinaryDocx}
              disabled={downloadingDocx}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
              title="تحميل صيغة DOCX"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-orange-400" />
              <span>{downloadingDocx ? 'جاري التحميل...' : 'ملف (.docx)'}</span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="طباعة أو حفظ كملف PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Copy Text */}
            <button
              onClick={copyFullReport}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="نسخ التقرير بالكامل"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document View */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-[#FFFFFF] space-y-6 text-slate-800 text-sm leading-relaxed select-text">
          
          {/* Document Cover Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-brand-text font-bold text-xs border border-orange-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الوثيقة الفنية الرسمية لتطوير المنصة</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              منصة قيمة فويس (QeemaVoice)
            </h1>
            <p className="text-slate-600 font-medium max-w-2xl mx-auto">
              التقرير الشامل لكافة التطويرات والتحديثات المنجزة على المنصة في الهوية، مكتبة الأصوات، المعلقين البشريين، ولوحة التحكم
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">تاريخ الإصدار:</span>
                <span className="font-bold text-slate-900">سبتمبر 2026</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">المشروع:</span>
                <span className="font-bold text-slate-900">منظومة قيمة فويس الصوتية</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">حالة التحديث:</span>
                <span className="font-bold text-emerald-700">مكتمل ومفعل 100%</span>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-brand-text">
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-brand-text text-xs font-bold flex items-center justify-center">1</span>
              <span>الملخص التنفيذي للمنصة والهدف من التطويرات</span>
            </h3>
            <p className="text-slate-700 leading-relaxed text-justify">
              تُعد منصة «قيمة فويس» المنظومة الصوتية العربية المتكاملة التي تجمع بين كفاءة وتطور الذكاء الاصطناعي التوليدي من جهة، وأصالة واحترافية المعلقين الصوتيين البشريين من جهة أخرى، لخدمة الشركات والمؤسسات وصناع المحتوى. شهدت المنصة حزمة من التحديثات الجذرية والترقيات النوعية التي شملت الهوية البصرية، هندسة واجهات المستخدم، سوق المعلقين البشريين، إدارة الحجوزات، وأدوات التحكم الإداري الشامل.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-brand-text">
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-brand-text text-xs font-bold flex items-center justify-center">2</span>
              <span>تحديثات الهوية البصرية والمساعد الذكي</span>
            </h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-text shrink-0 mt-1" />
                <div>
                  <strong className="text-slate-900">تحديث العلامة التجارية الرسمية:</strong> اعتماد مسمى «قيمة فويس» (QeemaVoice) بدلاً من أي مسميات مؤقتة سابقة في جميع ترويسات الصفحات، وبطاقات الخدمات، والمساعد الصوتي، ووثائق النظام.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-text shrink-0 mt-1" />
                <div>
                  <strong className="text-slate-900">تعيين الوضع الصوتي التفاعلي كوضع افتراضي:</strong> برمجة مساعد قيمة فويس الذكي ليبدأ تلقائياً وبشكل افتراضي في وضع التحدث الصوتي المباشر (Voice Mode) لتوفير تجربة فورية وسلسة للعميل.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-text shrink-0 mt-1" />
                <div>
                  <strong className="text-slate-900">تجربة بصرية متميزة للشركات:</strong> استخدام نسق ألوان برتقالي دافئ وأسود فخم، مع خط عربي محسن للقراءة السريعة ووضوح البيانات.
                </div>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-brand-text">
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-brand-text text-xs font-bold flex items-center justify-center">3</span>
              <span>إعادة تصميم وتطوير مكتبة الأصوات (Single-Line Compact Row Layout)</span>
            </h3>
            <p className="text-slate-600 text-xs">
              تمت إعادة هندسة بطاقات الأصوات في مكتبة الأصوات بالكامل للانتقال إلى «التصميم الخطي فائق الكثافة» لتحقيق التالي:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                  <Layers className="w-4 h-4 text-brand-text" />
                  <span>عرض البيانات على سطر أفقي واحد</span>
                </div>
                <p className="text-xs text-slate-600">
                  تجميع اسم المعلق، الشارة التوثيقية، علم الدولة، اللهجة، سنوات الخبرة، عدد العملاء، عدد الحجوزات، والتصنيف، وأزرار التفاعل في شريط متناسق واحد.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                  <Zap className="w-4 h-4 text-brand-text" />
                  <span>مضاعفة سعة العرض بنسبة تفوق 100%</span>
                </div>
                <p className="text-xs text-slate-600">
                  تقليل الارتفاع الرأسي للبطاقة بنسبة تفوق 50% مما يتيح للعميل استعراض ومقارنة أكبر عدد ممكن من المعلقين والأصوات في الشاشة الواحدة بدون إجهاد التمرير.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-brand-text">
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-brand-text text-xs font-bold flex items-center justify-center">4</span>
              <span>سوق الأصوات البشرية ومؤشر عدد الحجوزات المكتملة</span>
            </h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-text shrink-0 mt-1" />
                <div>
                  <strong className="text-slate-900">مؤشر عدد مرات حجز الصوت (Bookings Counter):</strong> إضافة بادج مميز بأيقونة حقيبة الأعمال (Briefcase) يعرض عدد المشاريع وحجوزات الاستوديو المنجزة لكل معلق بشري (مثل: 142 حجز، 165 حجز).
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-text shrink-0 mt-1" />
                <div>
                  <strong className="text-slate-900">بيانات واقعية وتنافسية:</strong> تغذية قاعدة البيانات بأرقام حقيقية ومتناسقة مع خبرة كل معلق لتعزيز ثقة أصحاب المشاريع والشركات عند اتخاذ قرار التعاقد.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-text shrink-0 mt-1" />
                <div>
                  <strong className="text-slate-900">تلميحات توضيحية تفاعلية (Tooltips):</strong> عند تمرير المؤشر فوق أيقونة الحجز يظهر تلميح يوضح أن هذه الأرقام تمثل مشاريع تجارية وإعلامية مكتملة داخل استوديوهات معتمدة.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-text shrink-0 mt-1" />
                <div>
                  <strong className="text-slate-900">الملف التعريفي الموسع (Voice Profile Drawer):</strong> عرض تفصيلي لسابقة الأعمال، ومعدل الاستجابة، والتراخيص التجارية وحقوق البث، مع نموذج تقديم نصوص التسجيل والتعليمات الفنية.
                </div>
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-brand-text">
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-brand-text text-xs font-bold flex items-center justify-center">5</span>
              <span>لوحة التحكم المتقدمة للإدارة (Admin Dashboard & CMS)</span>
            </h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-text shrink-0 mt-1" />
                <div>
                  <strong className="text-slate-900">التحكم الكامل في إحصائيات وأرقام الأصوات:</strong> إضافة نافذة تعديل مرنة تتيح للإدارة تغيير عدد الحجوزات (Bookings Count)، وسنوات الخبرة، وأعداد المستخدمين، والتسعير، ونمط الأداء لأي صوت فورياً.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-text shrink-0 mt-1" />
                <div>
                  <strong className="text-slate-900">المزامنة اللحظية الفورية:</strong> أي تعديل يتم إجراؤه في لوحة الإدارة ينعكس فوراً في الواجهة العامة للعملاء ومكتبة الأصوات والملفات التعريفية دون الحاجة لإعادة تشغيل السيرفر.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-text shrink-0 mt-1" />
                <div>
                  <strong className="text-slate-900">إدارة ومتابعة طلبات التسجيل البشري:</strong> نظام شامل لمعالجة الطلبات، تسليم التسجيلات النهائية بصيغة الاستوديو عالية النقاء (48kHz WAV / MP3)، وتتبع حالة كل حجز.
                </div>
              </li>
            </ul>
          </div>

          {/* Section 6 Comparison Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-brand-text">
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-brand-text text-xs font-bold flex items-center justify-center">6</span>
              <span>جدول مقارنة التطويرات والمزايا المنفذة</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-brand text-white">
                    <th className="p-2.5 rounded-tr-xl">المجال / القسم</th>
                    <th className="p-2.5">الحالة السابقة</th>
                    <th className="p-2.5 rounded-tl-xl">التطوير المنجز الحالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border border-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">الهوية والعلامة</td>
                    <td className="p-2.5 text-slate-500">مسميات إنجليزية متنوعة</td>
                    <td className="p-2.5 font-bold text-emerald-700">اعتماد «قيمة فويس» في كامل المنظومة</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">مكتبة الأصوات</td>
                    <td className="p-2.5 text-slate-500">بطاقات متعددة الأسطر تشغل مساحة كبيرة</td>
                    <td className="p-2.5 font-bold text-emerald-700">تصميم خطي مدمج (سطر واحد) يعرض أقصى عدد من المعلقين</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">الأصوات البشرية</td>
                    <td className="p-2.5 text-slate-500">غياب مؤشر كمي لحجم الحجوزات</td>
                    <td className="p-2.5 font-bold text-emerald-700">أيقونة وبادج تفاعلي لعدد الحجوزات المكتملة بكل صوت</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">لوحة تحكم الإدارة</td>
                    <td className="p-2.5 text-slate-500">أرقام ثابتة في الكود فقط</td>
                    <td className="p-2.5 font-bold text-emerald-700">إمكانية تعديل أرقام الحجوزات والإحصائيات والأسعار لحظياً</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">المساعد الذكي</td>
                    <td className="p-2.5 text-slate-500">البدء في وضع الدردشة النصية</td>
                    <td className="p-2.5 font-bold text-emerald-700">البدء تلقائياً في وضع الصوت التفاعلي المباشر (Voice Mode)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Callout */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="text-xs text-orange-950 font-medium">
              💡 يمكنك تحميل هذا التقرير الآن والاحتفاظ به كملف وورد رسمي بصيغة .doc أو .docx لتقديمه في الاجتماعات أو طباعته كـ PDF.
            </div>
            <button
              onClick={downloadWordDoc}
              className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف Word الآن</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
