/* DAWAT story collection: twenty original SVG artwork compositions. */
(function(root){"use strict";
const rows=[["01-ivory-magnolia","ماغنوليا عاجية","زفاف","dark"],["02-botanical-garden","حديقة نباتية","زفاف","dark"],["03-black-and-gold","أسود وذهبي","زفاف","light"],["04-emerald-foliage","أوراق زمردية","زفاف","light"],["05-ivory-marble","رخام ذهبي","تهنئة","dark"],["06-orchid-porcelain","أوركيد أبيض","عقد قران","dark"],["07-blush-cherry-blossom","أزهار الكرز","خطوبة","dark"],["08-lilac-wisteria","ويستيريا","خطوبة","dark"],["09-vintage-parchment","مخطوطة عتيقة","تهنئة","dark"],["10-art-deco-arches","أقواس آرت ديكو","زفاف","dark"],["11-mediterranean-vista","إطلالة متوسطية","زفاف","dark"],["12-desert-oasis-arch","واحة صحراوية","عقد قران","dark"],["13-antique-rose","ورد عتيق","خطوبة","dark"],["14-champagne-silk","حرير الشامبانيا","زفاف","dark"],["15-ivory-lace","دانتيل عاجي","عقد قران","dark"],["16-watercolour-lilies","زنابق مائية","مولود","dark"],["17-botanical-line","إطار نباتي","تهنئة","dark"],["18-lilac-bow","فيونكة ليلكية","عيد ميلاد","dark"],["19-academic-green","تخرج زمردي","تخرج","light"],["20-moon-and-stars","قمر ونجوم","مولود","dark"]];
const list=rows.map(function(a){
 return Object.freeze({id:a[0],name:a[1],kind:a[2],tone:a[3],src:"assets/story-art/"+a[0]+".svg",photo:"assets/story-photos/"+a[0]+".png",format:"image/svg+xml",width:1080,height:1920});
});
root.DAWAT_STORIES=Object.freeze(list);
})(typeof window!=="undefined"?window:globalThis);
