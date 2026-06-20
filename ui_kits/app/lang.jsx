/* Rattibha app — bilingual (EN / AR) layer.
   tr('English string') → Arabic when window.__lang === 'ar', else English.
   Also Arabic labels for cities, categories, planner names/types. */

const AR = {
  // Discover
  'Good evening 👋': 'مساء الخير 👋',
  'All Saudi Arabia': 'كل السعودية',
  'Plan your perfect celebration': 'نظّم احتفالك المثالي',
  'Post one request — planners come to you': 'اطلب مرة واحدة — المنظّمون يصلونك',
  'Post a request': 'انشر طلبك',
  'Search planners, venues…': 'ابحث عن منظّمين، قاعات…',
  'Featured planners': 'منظّمون مميّزون',
  'See all': 'عرض الكل',
  'Top rated near you': 'الأعلى تقييماً قربك',
  'Filters': 'تصفية',
  // bottom nav
  'Discover': 'استكشف',
  'Requests': 'طلباتي',
  'Bookings': 'حجوزاتي',
  'Messages': 'الرسائل',
  'Profile': 'حسابي',
  // city sheet
  'Choose your city': 'اختر مدينتك',
  'Search cities in Saudi Arabia…': 'ابحث عن مدينة في السعودية…',
  'City': 'المدينة',
  'Event date': 'تاريخ المناسبة',
  'Budget range': 'نطاق الميزانية',
  'Describe your vision': 'صِف تصوّرك',
  'What are you planning?': 'ماذا تخطّط؟',
  'Post to planners': 'انشر للمنظّمين',
  'Best match': 'الأنسب لك',
  'Lowest price': 'الأقل سعراً',
  'Top rated': 'الأعلى تقييماً',
  'Their quote': 'عرضهم',
  'Chat': 'محادثة',
  'View offer': 'عرض التفاصيل',
  'More planners may still respond': 'قد يردّ منظّمون آخرون',
  // misc
  'Premium': 'مميّز',
  'Verified': 'موثّق',

  // planner detail
  'Services': 'الخدمات',
  'Packages': 'الباقات',
  'Reviews': 'التقييمات',
  'Request to book': 'اطلب الحجز',
  'from': 'من',
  // post request
  'Planners send you quotes': 'المنظّمون يرسلون لك عروضهم',
  'What are you planning?': 'ماذا تخطّط؟',
  'Event date': 'تاريخ المناسبة',
  'Budget range': 'نطاق الميزانية',
  'Describe your vision': 'صِف تصوّرك',
  'Post to planners': 'انشر للمنظّمين',
  // proposals
  'Offers for your event': 'عروض لمناسبتك',
  'Best match': 'الأنسب لك',
  'Lowest price': 'الأقل سعراً',
  'Top rated': 'الأعلى تقييماً',
  'Their quote': 'عرضهم',
  'Chat': 'محادثة',
  'View offer': 'عرض التفاصيل',
  'More planners may still respond': 'قد يردّ منظّمون آخرون',
  // requests tab
  'My requests': 'طلباتي',
  'All': 'الكل',
  'Open': 'مفتوح',
  'Booked': 'محجوز',
  'Post a new request': 'انشر طلباً جديداً',
  // bookings
  'My bookings': 'حجوزاتي',
  'Confirmed': 'مؤكّد',
  'Pending': 'قيد الانتظار',
  // profile
  'Saved planners': 'المحفوظون',
  'Payment methods': 'طرق الدفع',
  'Settings': 'الإعدادات',
  'Help & support': 'المساعدة والدعم',
  'Sign out': 'تسجيل الخروج',
  'Notifications': 'الإشعارات',
  'Events planned': 'مناسبات',
  'Saved': 'محفوظ',
  'Avg rating': 'متوسط التقييم',
  // common
  'Message': 'رسالة',
  // deal lifecycle headers
  'Offer from planner': 'عرض من المنظّم',
  'Service agreement': 'اتفاقية الخدمة',
  'Checkout': 'الدفع',
  'Leave a review': 'اكتب تقييماً',
  'Booking details': 'تفاصيل الحجز',
  'Negotiate': 'تفاوض',
  'Accept offer': 'قبول العرض',
  'Sign & pay deposit': 'وقّع وادفع العربون',
  'Submit review': 'إرسال التقييم',
  'Review submitted': 'تم إرسال التقييم',
  'Thank you for sharing your experience!': 'شكراً لمشاركتك تجربتك!',
  'No saved planners yet': 'لا يوجد منظّمون محفوظون بعد',
  'Tap the heart on any planner to save them here for later.': 'اضغط على القلب لدى أي منظّم لحفظه هنا لاحقاً.',
  'Discover planners': 'اكتشف المنظّمين',
  'Custom offer': 'عرض مخصّص',
  'Valid 7 days': 'صالح ٧ أيام',
  'Total price': 'الإجمالي',
  'Payment method': 'طريقة الدفع',
  'What stood out?': 'ما الذي تميّز؟',
  'Add photos (optional)': 'أضف صوراً (اختياري)',
  'Event timeline': 'الجدول الزمني',
  'Payment': 'الدفع',
  'Card': 'بطاقة',
};

// Arabic city names
const CITY_AR = {
  'All Saudi Arabia': 'كل السعودية', 'Riyadh': 'الرياض', 'Jeddah': 'جدة', 'Makkah': 'مكة المكرمة',
  'Madinah': 'المدينة المنورة', 'Dammam': 'الدمام', 'Khobar': 'الخبر', 'Dhahran': 'الظهران',
  'Taif': 'الطائف', 'Tabuk': 'تبوك', 'Abha': 'أبها', 'Al-Ahsa': 'الأحساء', 'Buraidah': 'بريدة', 'Yanbu': 'ينبع',
};

// Arabic category labels
const CAT_AR = {
  weddings: 'أعراس', birthdays: 'أعياد ميلاد', engagements: 'خطوبة', corporate: 'شركات', galas: 'حفلات كبرى',
};

// Arabic planner names + types (by id)
const PLANNER_AR = {
  lumiere: { name: 'لوميير للمناسبات', type: 'أعراس وحفلات كبرى' },
  farah:   { name: 'فرح للاحتفالات', type: 'خطوبة' },
  orbit:   { name: 'أوربت للشركات', type: 'شركات' },
  zahra:   { name: 'زهرة للحفلات', type: 'أعياد ميلاد' },
  najd:    { name: 'نجد الملكية', type: 'أعراس' },
  noor:    { name: 'نور للأعراس', type: 'أعراس' },
  saffron: { name: 'زعفران للمناسبات', type: 'أعراس وحفلات كبرى' },
  marina:  { name: 'مارينا للاحتفالات', type: 'خطوبات وحفلات كبرى' },
  rosevalley: { name: 'وادي الورد', type: 'أعراس' },
  aseer:   { name: 'مناسبات عسير', type: 'شركات وأعراس' },
  coral:   { name: 'كورال كوست', type: 'حفلات كبرى' },
  jewel:   { name: 'جوهرة لأعياد الميلاد', type: 'أعياد ميلاد' },
};

function tr(s) {
  if (typeof window !== 'undefined' && window.__lang === 'ar') return AR[s] || s;
  return s;
}
function trCity(c) { return (window.__lang === 'ar' && CITY_AR[c]) || c; }
function trCat(key, fallback) { return (window.__lang === 'ar' && CAT_AR[key]) || fallback; }
function trPlanner(p, field) { return (window.__lang === 'ar' && PLANNER_AR[p.id] && PLANNER_AR[p.id][field]) || p[field]; }
const isAR = () => typeof window !== 'undefined' && window.__lang === 'ar';

Object.assign(window, { AR, CITY_AR, CAT_AR, PLANNER_AR, tr, trCity, trCat, trPlanner, isAR });
