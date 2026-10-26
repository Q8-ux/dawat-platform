# دعوات | DAWAT — مسار Canva Pro

**الموقع:** https://q8-ux.github.io/dawat-platform/  
**مكتبة Canva Pro:** https://q8-ux.github.io/dawat-platform/#/templates  
**مسار كانفا / قاعدة GitHub:** https://q8-ux.github.io/dawat-platform/#/canva-path

## ما هو منشور

- **29 مجموعة عامة من Canva**، تحتوي بعض قوالب Pro، ويبلغ مجموع عدد القوالب المعلن عنها في تلك المجموعات **1062** (بعضها مجاني وقد تتكرر القوالب).
- **78 عنوان قالب فردي** رُصد بجواره وسم Pro على صفحات المجموعات العامة، مع رابط العودة إلى مجموعته الأصلية.
- هدف استيعاب **1000 قالب Pro حقيقي بعد التحقق من كل واحد**؛ العدد 1062 ليس 1062 قالب Pro فردياً.
- فلاتر عربية لزفاف وتخرج ومواليد وأعياد ميلاد وتهانٍ، مع روابط Canva الرسمية.
- قاعدة JSON منفصلة في `data/canva/`، ومولدات بيانات تحت `scripts/`، واختبارات آلية للنشر.
- الموقع **لا يدخل إلى Canva الخاص بالمستخدم، ولا يستورد أي مشروع سابق**، ولا ينقل صور Canva Pro أو ملفات القوالب إلى المستودع.

## ما لا يمكن نسبته إلى المشروع

وجود Canva Pro لا يمنح تلقائياً حقوق إعادة توزيع قوالب Canva Pro في مكتبة تصميم منافسة. تبقى القوالب داخل Canva، وترتبط المنصة بصفحات Canva العامة. لا توجد ألف صورة Pro فعلية مستضافة أو ألف رابط مباشر مستقل من Canva.

## المستند الفني الكامل

[CANVA_PATH.md](CANVA_PATH.md) | [PATHS.md](PATHS.md)

## أدوات التحقق

```bash
node scripts/import-canva.mjs --check
node scripts/import-canva-collections.mjs --check
node scripts/import-canva-verified.mjs --check
node --test tests/*.test.cjs
```

GitHub Pages ينشر المشروع تلقائياً بعد نجاح الاختبارات.
