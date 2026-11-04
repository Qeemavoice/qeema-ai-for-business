import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType
} from "docx";
import * as fs from "fs";
import * as path from "path";

async function generateReport() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300, before: 200 },
            children: [
              new TextRun({
                text: "منصة قيمة فويس (QeemaVoice)",
                bold: true,
                size: 38,
                color: "FF5500",
                font: "Calibri"
              })
            ]
          }),

          // Subtitle
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "التقرير الشامل لكافة التطويرات والتحديثات المنجزة على المنصة",
                bold: true,
                size: 26,
                color: "1E293B",
                font: "Calibri"
              })
            ]
          }),

          // Metadata Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: "F8FAFC" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: "تاريخ الإصدار: ", bold: true, size: 22 }),
                          new TextRun({ text: "سبتمبر 2026", size: 22 })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: "F8FAFC" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: "المشروع: ", bold: true, size: 22 }),
                          new TextRun({ text: "منصة قيمة فويس للحلول الصوتية والذكاء الاصطناعي", size: 22 })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ spacing: { before: 300, after: 200 } }),

          // Section 1: Executive Summary
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "1. الملخص التنفيذي للمنصة والهدف من التطويرات",
                bold: true,
                size: 28,
                color: "FF5500"
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({
                text: "تُعد منصة «قيمة فويس» المنظومة الصوتية العربية المتكاملة التي تجمع بين كفاءة وتطور الذكاء الاصطناعي التوليدي من جهة، وأصالة واحترافية المعلقين الصوتيين البشريين من جهة أخرى، لخدمة الشركات والمؤسسات وصناع المحتوى. شهدت المنصة حزمة من التحديثات الجذرية والترقيات النوعية التي شملت الهوية البصرية، هندسة واجهات المستخدم، سوق المعلقين البشريين، إدارة الحجوزات، وأدوات التحكم الإداري الشامل.",
                size: 24,
                color: "334155"
              })
            ]
          }),

          // Section 2: Branding & Identity
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "2. تحديثات الهوية البصرية والمساعد الذكي",
                bold: true,
                size: 28,
                color: "FF5500"
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "تحديث العلامة التجارية الرسمية: ", bold: true, size: 24 }),
              new TextRun({ text: "اعتماد مسمى «قيمة فويس» (QeemaVoice) بدلاً من أي مسميات مؤقتة سابقة في جميع ترويسات الصفحات، وبطاقات الخدمات، والمساعد الصوتي، ووثائق النظام.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "تعيين الوضع الصوتي التفاعلي كوضع افتراضي: ", bold: true, size: 24 }),
              new TextRun({ text: "برمجة مساعد قيمة فويس الذكي ليبدأ تلقائياً وبشكل افتراضي في وضع التحدث الصوتي المباشر (Voice Mode) لتوفير تجربة فورية وسلسة للعميل.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "تجربة بصرية متميزة للشركات: ", bold: true, size: 24 }),
              new TextRun({ text: "استخدام نسق ألوان برتقالي دافئ وأسود فخم، مع خط IBM Plex Sans Arabic المحسن للقراءة وسرعة التصفح.", size: 24 })
            ]
          }),

          // Section 3: Voice Library Overhaul
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "3. إعادة تصميم وتطوير مكتبة الأصوات (Single-Line Compact Row Layout)",
                bold: true,
                size: 28,
                color: "FF5500"
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({
                text: "تمت إعادة هندسة بطاقات الأصوات في مكتبة الأصوات بالكامل للانتقال إلى «التصميم الخطي فائق الكثافة» (Single-Line Compact Layout) لتحقيق المزايا التالية:",
                size: 24,
                color: "334155"
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "عرض بيانات الصوت على سطر أفقي واحد: ", bold: true, size: 24 }),
              new TextRun({ text: "تجميع اسم المعلق، الشارة التوثيقية، علم الدولة، اللهجة، سنوات الخبرة، عدد العملاء، عدد الحجوزات، والتصنيف، وأزرار التفاعل في شريط متناسق واحد.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "مضاعفة سعة العرض بنسبة تفوق 100%: ", bold: true, size: 24 }),
              new TextRun({ text: "تقليل الارتفاع الرأسي للبطاقة بنسبة تفوق 50% مما يتيح للعميل استعراض ومقارنة أكبر عدد ممكن من المعلقين والأصوات في الشاشة الواحدة بدون إجهاد التمرير.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "أيقونة كرة الصوت الزجاجية (Glassy Voice Orb): ", bold: true, size: 24 }),
              new TextRun({ text: "تصميم عصري ثلاثي الأبعاد بلون مميز لكل صوت مع زر تشغيل ومعاينة العينات الصوتية بجودة نقية مع تدرج لوني يعكس طبقة الصوت.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "إجراءات سريعة ومباشرة: ", bold: true, size: 24 }),
              new TextRun({ text: "إتاحة الحجز الفوري أو التوليد بالذكاء الاصطناعي، إضافة الصوت للمفضلة، نسخ رابط الصوت، أو فتح الملف التعريفي الشامل بضغطة واحدة.", size: 24 })
            ]
          }),

          // Section 4: Human Voices & Bookings Count
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "4. سوق الأصوات البشرية ومؤشر عدد الحجوزات المكتملة",
                bold: true,
                size: 28,
                color: "FF5500"
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "مؤشر عدد مرات حجز الصوت (Bookings Counter): ", bold: true, size: 24 }),
              new TextRun({ text: "إضافة بادج مميز بأيقونة حقيبة الأعمال (Briefcase) يعرض عدد المشاريع وحجوزات الاستوديو المنجزة لكل معلق بشري (مثل: 142 حجز، 165 حجز).", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "بيانات واقعية وتنافسية: ", bold: true, size: 24 }),
              new TextRun({ text: "تغذية قاعدة البيانات بأرقام حقيقية ومتناسقة مع خبرة كل معلق لتعزيز ثقة أصحاب المشاريع والشركات عند اتخاذ قرار التعاقد.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "تلميحات توضيحية تفاعلية (Tooltips): ", bold: true, size: 24 }),
              new TextRun({ text: "عند تمرير المؤشر فوق أيقونة الحجز يظهر تلميح يوضح أن هذه الأرقام تمثل مشاريع تجارية وإعلامية مكتملة داخل استوديوهات معتمدة.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "الملف التعريفي الموسع (Voice Profile Drawer): ", bold: true, size: 24 }),
              new TextRun({ text: "عرض تفصيلي لسابقة الأعمال، ومعدل الاستجابة، والتراخيص التجارية وحقوق البث، مع نموذج تقديم نصوص التسجيل والتعليمات الفنية.", size: 24 })
            ]
          }),

          // Section 5: Admin Dashboard & Voice Management
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "5. لوحة التحكم المتقدمة للإدارة (Admin Dashboard & CMS)",
                bold: true,
                size: 28,
                color: "FF5500"
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "التحكم الكامل في إحصائيات وأرقام الأصوات: ", bold: true, size: 24 }),
              new TextRun({ text: "إضافة نافذة تعديل مرنة تتيح للإدارة تغيير عدد الحجوزات (Bookings Count)، وسنوات الخبرة، وأعداد المستخدمين، والتسعير، ونمط الأداء لأي صوت فورياً.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "المزامنة اللحظية الفورية: ", bold: true, size: 24 }),
              new TextRun({ text: "أي تعديل يتم إجراؤه في لوحة الإدارة ينعكس فوراً في الواجهة العامة للعملاء ومكتبة الأصوات والملفات التعريفية دون الحاجة لإعادة تشغيل السيرفر.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "إدارة ومتابعة طلبات التسجيل البشري: ", bold: true, size: 24 }),
              new TextRun({ text: "نظام شامل لمعالجة الطلبات، تسليم التسجيلات النهائية بصيغة الاستوديو عالية النقاء (48kHz WAV / MP3)، وتتبع حالة كل حجز (جديد / قيد التنفيذ / تم التسليم).", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "إدارة الشركات والأرصدة (Credit Ledger): ", bold: true, size: 24 }),
              new TextRun({ text: "شحن وسحب أرصدة توليد الأصوات للشركات والمؤسسات وتتبع العمليات المالية والتدقيق الأمني.", size: 24 })
            ]
          }),

          // Section 6: AI Core Features & Voice Studio
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "6. المحركات الصوتية والخدمات الذكية بالمنصة",
                bold: true,
                size: 28,
                color: "FF5500"
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "استوديو التوليد الصوتي (Voice Studio): ", bold: true, size: 24 }),
              new TextRun({ text: "تحويل النصوص العربية إلى تعليق صوتي فوري بمختلف اللهجات (سعودي، إماراتي، مصري، شامي، فصحى وثائقية وإعلانية) مع ضبط دقيق للسرعة والنبرة.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "استنساخ الصوت الفوري (Instant Voice Clone): ", bold: true, size: 24 }),
              new TextRun({ text: "محرك ذكي لاستنساخ نبرة وصوت المتحدثين من خلال عينة دقيقة لإنتاج بودكاست وإعلانات بصوت المتحدث الرسمي للمؤسسة.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "الصوت المؤسسي الحصري (Branded Voice): ", bold: true, size: 24 }),
              new TextRun({ text: "تطوير نماذج ذكاء اصطناعي صوتية مخصصة ومحمية حصرياً للشركات الكبرى لتوحيد الهوية الصوتية عبر كافة القنوات الرقمية.", size: 24 })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "تراخيص تجارية آمنة 100%: ", bold: true, size: 24 }),
              new TextRun({ text: "جميع الأصوات المسجلة والمولدة بالمنصة تمنح تراخيص كاملة للاستخدام الإعلاني والتجاري والبث الرقمي دون قيود.", size: 24 })
            ]
          }),

          // Section 7: Summary Table of Upgrades
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "7. جدول مقارنة التطويرات والمزايا المنفذة",
                bold: true,
                size: 28,
                color: "FF5500"
              })
            ]
          }),

          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: "FF5500" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "المجال / القسم", bold: true, color: "FFFFFF", size: 22 })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: "FF5500" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "الحالة السابقة", bold: true, color: "FFFFFF", size: 22 })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: "FF5500" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "التطوير المنجز الحالي", bold: true, color: "FFFFFF", size: 22 })]
                      })
                    ]
                  })
                ]
              }),

              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "الهوية والعلامة", bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "مسميات إنجليزية متنوعة", size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "اعتماد «قيمة فويس» في كامل النظام", bold: true, color: "15803D", size: 20 })] })]
                  })
                ]
              }),

              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "مكتبة الأصوات", bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "بطاقات متعددة الأسطر تشغل مساحة كبيرة", size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "تصميم خطي مدمج (سطر واحد) يعرض أقصى عدد من المعلقين", bold: true, color: "15803D", size: 20 })] })]
                  })
                ]
              }),

              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "الأصوات البشرية", bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "غياب مؤشر كمي لحجم الحجوزات", size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "أيقونة وبادج حقيقي لعدد الحجوزات المكتملة بكل صوت", bold: true, color: "15803D", size: 20 })] })]
                  })
                ]
              }),

              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "لوحة تحكم الإدارة", bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "أرقام ثابتة في الكود فقط", size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "إمكانية تعديل أرقام الحجوزات والإحصائيات والأسعار لحظياً", bold: true, color: "15803D", size: 20 })] })]
                  })
                ]
              }),

              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "المساعد الصوتي الذكي", bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "البدء في وضع الدردشة النصية", size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "البدء تلقائياً في وضع الصوت التفاعلي المباشر (Voice Mode)", bold: true, color: "15803D", size: 20 })] })]
                  })
                ]
              })
            ]
          }),

          // Conclusion
          new Paragraph({ spacing: { before: 300, after: 150 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, line: 360 },
            children: [
              new TextRun({
                text: "خاتمة: تضع هذه الحزمة المتكاملة من التطويرات منصة «قيمة فويس» في صدارة المنصات الصوتية العربية من حيث كفاءة تجربة المستخدم، وموثوقية المعلقين المعتمدين، ومرونة الإدارة التشغيلية للشركات.",
                bold: true,
                size: 22,
                color: "0F172A"
              })
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(process.cwd(), "public", "QeemaVoice_Developments_Report.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log("Word document generated successfully at:", outputPath);
}

generateReport().catch(console.error);
