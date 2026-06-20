/* Rattibha marketing site — bilingual (EN / AR) layer.
   tr('English') → Arabic when window.__lang === 'ar'. Mirrors app/planner lang.jsx. */

const AR = {
  // nav
  'Browse planners': 'تصفّح المنظّمين',
  'How it works': 'كيف يعمل',
  'For planners': 'للمنظّمين',
  'About': 'من نحن',
  'Sign in': 'تسجيل الدخول',
  'Get started': 'ابدأ الآن',
  // hero
  'Trusted by 12,000+ celebrations': 'موثوق به في أكثر من ١٢٬٠٠٠ مناسبة',
  'Plan a celebration': 'خطّط لمناسبة',
  'worth': 'تستحقّ',
  'remembering': 'أن تُتذكّر',
  "Rattibha connects you with the Gulf's most trusted event planners — for weddings, engagements, birthdays and corporate galas. Compare, message and book with confidence.":
    'تربطك رتّبها بأفضل منظّمي المناسبات في المملكة — للأعراس والخطوبات وأعياد الميلاد والحفلات المؤسسية. قارن وراسل واحجز بثقة.',
  'Event': 'المناسبة',
  'City': 'المدينة',
  'Date': 'التاريخ',
  'Wedding': 'زفاف',
  'Riyadh': 'الرياض',
  'Mar 2026': 'مارس ٢٠٢٦',
  'from 8,400+ reviews': 'من أكثر من ٨٬٤٠٠ تقييم',
  'Weddings': 'أعراس',
  'Galas': 'حفلات كبرى',
  // categories
  'Birthdays': 'أعياد ميلاد',
  'Engagements': 'خطوبات',
  'Corporate': 'مؤسسات',
  '180+ planners': '+١٨٠ منظّماً',
  '120+ planners': '+١٢٠ منظّماً',
  '90+ planners': '+٩٠ منظّماً',
  '70+ planners': '+٧٠ منظّماً',
  '45+ planners': '+٤٥ منظّماً',
  // featured
  'Curated for you': 'مختارة لك',
  'Featured planners': 'منظّمون مميّزون',
  'Hand-picked, verified studios with proven track records.': 'استوديوهات مُنتقاة وموثّقة بسجلّ حافل.',
  'Browse all 500+': 'تصفّح أكثر من ٥٠٠',
  'View profile': 'عرض الملف',
  'from': 'يبدأ من',
  '★ Premium': '★ مميّز',
  // how it works
  'Simple by design': 'بساطة مدروسة',
  'Three steps to a perfect event': 'ثلاث خطوات لمناسبة مثالية',
  'From first idea to final toast, Rattibha keeps every detail coordinated.':
    'من أول فكرة إلى آخر لحظة، رتّبها تنسّق كل تفصيل.',
  // step cards
  'Tell us your vision': 'أخبرنا برؤيتك',
  'Share your event type, date, city and budget in under two minutes.':
    'شارك نوع مناسبتك وتاريخها ومدينتها وميزانيتها في أقل من دقيقتين.',
  'Get matched instantly': 'احصل على ترشيحات فوراً',
  'We surface verified planners that fit your style — compare and message directly.':
    'نعرض لك منظّمين موثّقين يناسبون ذوقك — قارن وراسل مباشرة.',
  'Book & celebrate': 'احجز واحتفل',
  'Secure your date with a protected deposit and enjoy a perfectly coordinated day.':
    'ثبّت موعدك بعربون مضمون واستمتع بيوم منسّق بإتقان.',
  // testimonials
  'Loved across the Gulf': 'محبوبة في أنحاء المملكة',
  'Celebrations, perfectly coordinated': 'مناسبات منسّقة بإتقان',
  // CTA band
  'For event planners': 'لمنظّمي المناسبات',
  'Grow your events business with Rattibha': 'نمِّ أعمالك في تنظيم المناسبات مع رتّبها',
  'Reach thousands of clients planning their next celebration. Manage bookings, payments and reviews from one beautiful dashboard.':
    'تواصل مع آلاف العملاء الذين يخطّطون لمناسبتهم القادمة. أدر الحجوزات والمدفوعات والتقييمات من لوحة تحكّم واحدة أنيقة.',
  'Become a planner': 'انضم كمنظّم',
  'Talk to sales': 'تحدّث مع المبيعات',
  // footer
  "The Gulf's marketplace for unforgettable events. Plan, celebrate, cherish.":
    'سوق المملكة للمناسبات التي لا تُنسى. خطّط، احتفل، اعتزّ.',
  'Customers': 'العملاء',
  'Planners': 'المنظّمون',
  'Company': 'الشركة',
  'Pricing': 'الأسعار',
  'Reviews': 'التقييمات',
  'Join Rattibha': 'انضم إلى رتّبها',
  'Planner dashboard': 'لوحة المنظّم',
  'Success stories': 'قصص نجاح',
  'Resources': 'موارد',
  'About us': 'من نحن',
  'Careers': 'وظائف',
  'Press': 'الصحافة',
  'Contact': 'تواصل معنا',
  '© 2026 Rattibha · رتّبها. All rights reserved.': '© ٢٠٢٦ رتّبها. جميع الحقوق محفوظة.',
  'Privacy · Terms · صُنع بحُبّ في الخليج': 'الخصوصية · الشروط · صُنع بحُبّ في الخليج',
};

// per-planner Arabic names/types (matches PLANNERS in site.jsx by index)
const PLANNER_AR = {
  'Lumière Events': { name: 'لوميير', type: 'أعراس وحفلات كبرى', city: 'الرياض' },
  'Farah Celebrations': { name: 'فرح', type: 'خطوبات', city: 'الرياض' },
  'Orbit Corporate': { name: 'أوربت', type: 'مؤسسات', city: 'جدة' },
  'Zahra Parties': { name: 'زهرة', type: 'أعياد ميلاد', city: 'الدمام' },
  'Coral Coast Events': { name: 'كورال كوست', type: 'حفلات كبرى', city: 'جدة' },
  'Noor Weddings': { name: 'نور للأعراس', type: 'أعراس', city: 'مكة المكرمة' },
  'Marina Celebrations': { name: 'مارينا', type: 'خطوبات', city: 'الخبر' },
  'Saffron Events': { name: 'زعفران', type: 'أعراس وحفلات كبرى', city: 'المدينة المنورة' },
  'Rose Valley Events': { name: 'وادي الورد', type: 'أعراس', city: 'الطائف' },
};
const QUOTE_AR = {
  'Noura A.': { who: 'نورة أ.', role: 'عروس · الرياض',
    text: 'ربطتني رتّبها بمنظّمة فهمت رؤيتي فوراً. كان زفافي مثالياً بلا أدنى عناء.' },
  'Khalid M.': { who: 'خالد م.', role: 'مدير موارد بشرية · أوربت',
    text: 'حجزنا حفلنا السنوي بالكامل خلال أسبوع. فريق محترف وشفّاف وبلا أي ضغط.' },
  'Sara H.': { who: 'سارة هـ.', role: 'أمّ · الدمام',
    text: 'فاقت حفلة عيد الميلاد كل التوقعات. الحجز والدفع كانا في غاية السهولة.' },
};

function tr(s) {
  if (typeof window !== 'undefined' && window.__lang === 'ar') return AR[s] || s;
  return s;
}
function trPlanner(p, field) {
  return (window.__lang === 'ar' && PLANNER_AR[p.name] && PLANNER_AR[p.name][field]) || p[field];
}
function trQuote(q, field) {
  return (window.__lang === 'ar' && QUOTE_AR[q.who] && QUOTE_AR[q.who][field]) || q[field];
}
const isAR = () => typeof window !== 'undefined' && window.__lang === 'ar';

Object.assign(window, { AR, PLANNER_AR, QUOTE_AR, tr, trPlanner, trQuote, isAR });
