import type { AppLanguage } from '@/i18n/constants';

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalPageContent {
  title: string;
  intro: string;
  sections: LegalSection[];
}

/** "Last updated" line, shared across all six pages — kept as a single
 * constant so a real update only needs changing once. */
export const LEGAL_LAST_UPDATED: Record<AppLanguage, string> = {
  en: 'Last updated: July 2026',
  ar: 'آخر تحديث: يوليو ٢٠٢٦',
};

export const PRIVACY_POLICY: Record<AppLanguage, LegalPageContent> = {
  en: {
    title: 'Privacy Policy',
    intro:
      "This Privacy Policy explains what information Ratibha collects, how we use it, and the choices you have — for both customers planning an event and planners offering their services through our marketplace.",
    sections: [
      {
        heading: 'Information we collect',
        body: 'We collect the information you provide directly: your name, contact details, and event details (type, city, date, budget) when you post a request, and the messages you exchange with planners. Planners additionally provide business details, portfolio content, and verification documents.',
      },
      {
        heading: 'How we use your information',
        body: 'We use this information to match customers with relevant planners, facilitate messaging and bookings, process deposits and payments, send booking-related notifications, and improve the matching quality of the marketplace over time.',
      },
      {
        heading: 'What we share, and with whom',
        body: "When you post a request, its details are shared with the planners you're matched with — that's how the marketplace works. We share payment information only with our payment processor to complete a transaction. We do not sell your personal data to third parties.",
      },
      {
        heading: 'Cookies',
        body: "We use a single functional cookie (rtb_lang) to remember your language preference. It contains no personal data and isn't used for tracking or advertising.",
      },
      {
        heading: 'Data retention and your rights',
        body: 'We retain account and booking data for as long as your account is active, plus a reasonable period afterward for legal and accounting purposes. You can request a copy of your data or ask us to delete your account at any time by contacting support@ratibha.com.',
      },
      {
        heading: 'Changes to this policy',
        body: "We'll update this page if our practices change, and note the date above.",
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    intro:
      'توضح سياسة الخصوصية هذه المعلومات التي تجمعها رتّبها، وكيفية استخدامها، والخيارات المتاحة لك — سواء كنت عميلاً يخطّط لمناسبة أو منظّماً يقدّم خدماته عبر منصتنا.',
    sections: [
      {
        heading: 'المعلومات التي نجمعها',
        body: 'نجمع المعلومات التي تقدّمها مباشرة: اسمك وبيانات التواصل وتفاصيل مناسبتك (النوع والمدينة والتاريخ والميزانية) عند نشر طلبك، والرسائل التي تتبادلها مع المنظّمين. يقدّم المنظّمون إضافة إلى ذلك بيانات أعمالهم ومحفظتهم ومستندات التوثيق.',
      },
      {
        heading: 'كيف نستخدم معلوماتك',
        body: 'نستخدم هذه المعلومات لمطابقة العملاء بالمنظّمين المناسبين، وتسهيل المراسلة والحجوزات، ومعالجة العرابين والمدفوعات، وإرسال إشعارات متعلقة بالحجز، وتحسين جودة المطابقة في السوق مع الوقت.',
      },
      {
        heading: 'ما نشاركه ومع من',
        body: 'عند نشر طلبك، تُشارَك تفاصيله مع المنظّمين الذين تتم مطابقتك بهم — وهذا هو أساس عمل السوق. نشارك معلومات الدفع فقط مع مزوّد خدمة الدفع لإتمام المعاملة. لا نبيع بياناتك الشخصية لأي طرف ثالث.',
      },
      {
        heading: 'ملفات تعريف الارتباط',
        body: 'نستخدم ملف تعريف ارتباط وظيفياً واحداً فقط (rtb_lang) لحفظ لغتك المفضّلة. لا يحتوي على أي بيانات شخصية ولا يُستخدم للتتبّع أو الإعلانات.',
      },
      {
        heading: 'الاحتفاظ بالبيانات وحقوقك',
        body: 'نحتفظ ببيانات حسابك وحجوزاتك طوال فترة نشاط حسابك، ولفترة معقولة بعد ذلك لأغراض قانونية ومحاسبية. يمكنك طلب نسخة من بياناتك أو حذف حسابك في أي وقت بالتواصل مع support@ratibha.com.',
      },
      {
        heading: 'التغييرات على هذه السياسة',
        body: 'سنحدّث هذه الصفحة إذا تغيّرت ممارساتنا، مع توضيح تاريخ التحديث أعلاه.',
      },
    ],
  },
};

export const TERMS_OF_SERVICE: Record<AppLanguage, LegalPageContent> = {
  en: {
    title: 'Terms of Service',
    intro:
      'These Terms govern your use of Ratibha — a marketplace connecting customers planning events with independent, verified event planners across Saudi Arabia. By creating an account, you agree to these Terms.',
    sections: [
      {
        heading: 'The legal entity behind Ratibha',
        body: 'Ratibha ("we", "us") is operated by Dakkah Information Technology Est. (مؤسسة دكة لتقنية المعلومات), a Saudi establishment registered under commercial registration / unified national number 7021679076.',
      },
      {
        heading: "What Ratibha is — and isn't",
        body: 'Ratibha is a marketplace that facilitates introductions, messaging, quoting and payment between customers and independent planners. Planners are independent businesses, not employees or agents of Ratibha — Ratibha is not itself an event planning company and does not guarantee the outcome of any event.',
      },
      {
        heading: 'Accounts',
        body: 'You must provide accurate information when creating an account and are responsible for keeping your login credentials secure. Planner accounts additionally require passing our verification process before going live.',
      },
      {
        heading: 'Bookings and payments',
        body: "When a customer accepts a planner's offer, both parties sign the resulting agreement through the platform, and a deposit is collected and held until the event is delivered. Ratibha charges planners a service fee of 15% of the total booking value; customers pay only the agreed price.",
      },
      {
        heading: 'Acceptable use',
        body: 'You agree not to use Ratibha to circumvent the platform (for example, arranging payment outside Ratibha to avoid fees), post false information, or harass other users.',
      },
      {
        heading: 'Liability',
        body: "Ratibha facilitates the connection and payment flow between customers and planners but is not a party to the event services agreement itself. Our liability is limited to the service fees we've collected on the relevant booking, to the maximum extent permitted by Saudi law.",
      },
      {
        heading: 'Termination',
        body: 'We may suspend or terminate an account that violates these Terms, including for verified customer complaints against a planner.',
      },
      {
        heading: 'Governing law',
        body: 'These Terms are governed by the laws of the Kingdom of Saudi Arabia.',
      },
    ],
  },
  ar: {
    title: 'شروط الخدمة',
    intro:
      'تحكم هذه الشروط استخدامك لرتّبها — سوق يربط العملاء الذين يخطّطون لمناسباتهم بمنظّمي مناسبات مستقلين وموثّقين في أنحاء المملكة. بإنشائك حساباً، فإنك توافق على هذه الشروط.',
    sections: [
      {
        heading: 'الكيان القانوني وراء رتّبها',
        body: 'رتّبها ("نحن") مملوكة ومُشغَّلة من قبل مؤسسة دكة لتقنية المعلومات، مؤسسة سعودية مسجّلة بالسجل التجاري / الرقم الوطني الموحد 7021679076.',
      },
      {
        heading: 'ما هي رتّبها — وما ليست عليه',
        body: 'رتّبها سوق يسهّل التعارف والمراسلة وتقديم العروض والدفع بين العملاء والمنظّمين المستقلين. المنظّمون أصحاب أعمال مستقلة، وليسوا موظفين أو وكلاء لرتّبها — رتّبها ليست شركة تنظيم مناسبات بحد ذاتها ولا تضمن نتيجة أي مناسبة.',
      },
      {
        heading: 'الحسابات',
        body: 'يجب تقديم معلومات دقيقة عند إنشاء حسابك، وأنت مسؤول عن الحفاظ على سرية بيانات دخولك. تتطلب حسابات المنظّمين إضافة إلى ذلك اجتياز عملية التوثيق قبل تفعيل الملف.',
      },
      {
        heading: 'الحجوزات والمدفوعات',
        body: 'عند قبول العميل لعرض منظّم، يوقّع الطرفان الاتفاقية الناتجة عبر المنصة، ويُجمع عربون ويُحتفظ به حتى تُسلَّم المناسبة. تفرض رتّبها على المنظّمين رسوم خدمة بنسبة ١٥٪ من قيمة الحجز الإجمالية؛ يدفع العملاء السعر المتفق عليه فقط.',
      },
      {
        heading: 'الاستخدام المقبول',
        body: 'توافق على عدم استخدام رتّبها للالتفاف حول المنصة (مثل ترتيب الدفع خارج رتّبها لتفادي الرسوم)، أو نشر معلومات غير صحيحة، أو مضايقة مستخدمين آخرين.',
      },
      {
        heading: 'المسؤولية',
        body: 'تسهّل رتّبها التواصل وتدفّق الدفع بين العملاء والمنظّمين، لكنها ليست طرفاً في اتفاقية خدمات المناسبة نفسها. تقتصر مسؤوليتنا على رسوم الخدمة التي حصّلناها على الحجز المعني، إلى أقصى حد يسمح به نظام المملكة.',
      },
      {
        heading: 'إنهاء الحساب',
        body: 'يجوز لنا تعليق أو إنهاء أي حساب يخالف هذه الشروط، بما في ذلك عند وجود شكاوى موثّقة من عملاء ضد منظّم.',
      },
      {
        heading: 'القانون الحاكم',
        body: 'تخضع هذه الشروط لأنظمة المملكة العربية السعودية.',
      },
    ],
  },
};

export const REFUND_POLICY: Record<AppLanguage, LegalPageContent> = {
  en: {
    title: 'Refund Policy',
    intro:
      'Your deposit is protected from the moment you book until your event is delivered. This page explains when and how refunds are issued.',
    sections: [
      {
        heading: 'How deposit protection works',
        body: "When you book a planner, your deposit is held securely by Ratibha rather than paid directly to the planner. It's only released to your planner after your event has taken place as agreed.",
      },
      {
        heading: "When you're entitled to a refund",
        body: "You're entitled to a full refund of your deposit if your planner cancels, fails to show up, or doesn't deliver the service substantially as agreed in your signed contract.",
      },
      {
        heading: "When a refund isn't issued",
        body: "Deposits are not refunded if the event was delivered as agreed, or if the customer cancels outside the refund windows described in our Cancellation Policy.",
      },
      {
        heading: 'How to request a refund',
        body: "Contact support@ratibha.com with your booking reference and a description of the issue. We'll review the signed contract and any messages exchanged with your planner.",
      },
      {
        heading: 'Timeline',
        body: 'Approved refunds are processed within 5–10 business days, depending on your payment method and bank.',
      },
    ],
  },
  ar: {
    title: 'سياسة الاسترداد',
    intro: 'عربونك محمي منذ لحظة الحجز وحتى تسليم مناسبتك. توضّح هذه الصفحة متى وكيف يُرَدّ المبلغ.',
    sections: [
      {
        heading: 'كيف تعمل حماية العربون',
        body: 'عند حجز منظّم، يُحتفظ بعربونك بأمان لدى رتّبها بدلاً من دفعه مباشرة للمنظّم. لا يُصرف لمنظّمك إلا بعد إقامة مناسبتك كما تم الاتفاق عليه.',
      },
      {
        heading: 'متى يحق لك الاسترداد',
        body: 'يحق لك استرداد كامل عربونك إذا ألغى منظّمك الحجز، أو لم يحضر، أو لم يقدّم الخدمة بشكل يتوافق جوهرياً مع العقد الموقّع.',
      },
      {
        heading: 'متى لا يُصرف الاسترداد',
        body: 'لا يُرَدّ العربون إذا أُقيمت المناسبة كما تم الاتفاق عليه، أو إذا ألغى العميل خارج فترات الاسترداد الموضحة في سياسة الإلغاء.',
      },
      {
        heading: 'كيف تطلب استرداداً',
        body: 'تواصل مع support@ratibha.com مع ذكر رقم حجزك ووصف المشكلة. سنراجع العقد الموقّع وأي رسائل تم تبادلها مع منظّمك.',
      },
      {
        heading: 'المدة الزمنية',
        body: 'تُعالَج المبالغ المستردة المعتمدة خلال ٥ إلى ١٠ أيام عمل، حسب وسيلة الدفع والبنك.',
      },
    ],
  },
};

export const CANCELLATION_POLICY: Record<AppLanguage, LegalPageContent> = {
  en: {
    title: 'Cancellation Policy',
    intro: "Plans change. Here's what happens if a customer or planner needs to cancel a confirmed booking.",
    sections: [
      {
        heading: 'Customer cancellations',
        body: "If you cancel 30 or more days before your event, you'll receive a full refund of your deposit minus payment processing fees. Between 7 and 29 days before your event, you'll receive a 50% refund. Cancellations within 7 days of the event are non-refundable, since your planner has already committed resources on your behalf.",
      },
      {
        heading: 'Planner cancellations',
        body: "If your planner cancels for any reason, you'll receive a full refund of your deposit, and our support team will help you find another verified planner for your date if time allows.",
      },
      {
        heading: 'Rescheduling',
        body: 'If you need to move your event to a new date, contact your planner directly through the platform — most planners will accommodate a reschedule at no extra charge if requested with reasonable notice.',
      },
      {
        heading: 'Force majeure',
        body: 'Cancellations due to events outside either party\'s control (for example, government restrictions or natural disasters) are handled case-by-case by our support team, with a preference for rescheduling over cancellation.',
      },
    ],
  },
  ar: {
    title: 'سياسة الإلغاء',
    intro: 'الخطط تتغيّر أحياناً. إليك ما يحدث إذا احتاج العميل أو المنظّم لإلغاء حجز مؤكَّد.',
    sections: [
      {
        heading: 'إلغاء العميل',
        body: 'إذا ألغيت قبل ٣٠ يوماً أو أكثر من مناسبتك، تسترد كامل عربونك مخصوماً منه رسوم معالجة الدفع. بين ٧ و٢٩ يوماً قبل المناسبة، تسترد ٥٠٪ من العربون. الإلغاء خلال ٧ أيام من المناسبة غير قابل للاسترداد، لأن منظّمك يكون قد التزم بموارد نيابة عنك.',
      },
      {
        heading: 'إلغاء المنظّم',
        body: 'إذا ألغى منظّمك لأي سبب، تسترد كامل عربونك، ويساعدك فريق الدعم في إيجاد منظّم موثّق آخر لموعدك إن سمح الوقت بذلك.',
      },
      {
        heading: 'إعادة الجدولة',
        body: 'إذا احتجت لنقل مناسبتك لتاريخ آخر، تواصل مع منظّمك مباشرة عبر المنصة — يستوعب معظم المنظّمين إعادة الجدولة دون رسوم إضافية إذا طُلبت بإشعار معقول.',
      },
      {
        heading: 'الظروف القاهرة',
        body: 'الإلغاءات الناتجة عن ظروف خارجة عن إرادة الطرفين (كالقيود الحكومية أو الكوارث الطبيعية) يتعامل معها فريق الدعم حالة بحالة، مع تفضيل إعادة الجدولة على الإلغاء.',
      },
    ],
  },
};

export const DISPUTE_RESOLUTION: Record<AppLanguage, LegalPageContent> = {
  en: {
    title: 'Dispute Resolution',
    intro:
      "Most disagreements are resolved through direct conversation — but if you and your planner can't reach an agreement, here's how Ratibha helps.",
    sections: [
      {
        heading: 'Step 1 — talk to your planner',
        body: "Most issues (timing, scope, last-minute changes) are best resolved directly with your planner through the platform's messaging.",
      },
      {
        heading: 'Step 2 — involve Ratibha support',
        body: "If you can't reach an agreement, contact support@ratibha.com with your booking reference. We'll review your signed contract, offer details, and message history to help mediate a fair outcome.",
      },
      {
        heading: 'Step 3 — formal resolution',
        body: "If mediation doesn't resolve the dispute, either party may pursue resolution through Saudi Arabia's consumer protection channels or the courts of the Kingdom, as applicable.",
      },
      {
        heading: 'What to have ready',
        body: 'Keep your signed contract, offer details, and any messages or photos related to the issue — these speed up review significantly.',
      },
    ],
  },
  ar: {
    title: 'تسوية النزاعات',
    intro: 'تُحَلّ معظم الخلافات عبر التواصل المباشر — لكن إذا لم تتوصل أنت ومنظّمك إلى اتفاق، إليك كيف تساعد رتّبها.',
    sections: [
      {
        heading: 'الخطوة الأولى — تحدّث مع منظّمك',
        body: 'معظم المشاكل (كالتوقيت أو نطاق الخدمة أو التغييرات الطارئة) يُحَلّ أفضل حل مباشرة مع منظّمك عبر مراسلة المنصة.',
      },
      {
        heading: 'الخطوة الثانية — إشراك دعم رتّبها',
        body: 'إذا لم تتوصلا لاتفاق، تواصل مع support@ratibha.com مع ذكر رقم حجزك. سنراجع عقدك الموقّع وتفاصيل العرض وسجل الرسائل للمساعدة في الوصول لحل عادل.',
      },
      {
        heading: 'الخطوة الثالثة — الحل الرسمي',
        body: 'إذا لم تُحَلّ الوساطة النزاع، يجوز لأي من الطرفين اللجوء إلى قنوات حماية المستهلك في المملكة العربية السعودية أو المحاكم المختصة، بحسب الحال.',
      },
      {
        heading: 'ما يجب تجهيزه',
        body: 'احتفظ بعقدك الموقّع وتفاصيل العرض وأي رسائل أو صور متعلقة بالمشكلة — فهذا يسرّع المراجعة بشكل كبير.',
      },
    ],
  },
};

export const PLANNER_VERIFICATION: Record<AppLanguage, LegalPageContent> = {
  en: {
    title: 'Planner Verification',
    intro: "Every planner on Ratibha is verified before their profile goes live — here's what that process checks.",
    sections: [
      {
        heading: 'Background check',
        body: "We verify the planner's identity and business registration before approving a profile.",
      },
      {
        heading: 'Portfolio review',
        body: "We review each planner's past work — photos, event types, and scale — to confirm they can deliver what their profile claims.",
      },
      {
        heading: 'Reference check',
        body: "We contact at least one past client or partner venue to confirm the planner's track record.",
      },
      {
        heading: 'Ongoing monitoring',
        body: 'After approval, we continue to monitor planner quality through verified customer reviews (left only after a completed booking) and can suspend a profile if verified complaints are upheld.',
      },
      {
        heading: 'Removal criteria',
        body: "A planner's profile can be removed for verified contract violations, repeated no-shows, or failure to deliver services substantially as agreed.",
      },
    ],
  },
  ar: {
    title: 'توثيق المنظّمين',
    intro: 'كل منظّم في رتّبها يخضع للتوثيق قبل نشر ملفه — إليك ما تتحقق منه هذه العملية.',
    sections: [
      {
        heading: 'فحص الخلفية',
        body: 'نتحقق من هوية المنظّم وسجله التجاري قبل الموافقة على ملفه.',
      },
      {
        heading: 'مراجعة المحفظة',
        body: 'نراجع أعمال كل منظّم السابقة — الصور وأنواع المناسبات وحجمها — للتأكد من قدرته على تقديم ما يدّعيه ملفه.',
      },
      {
        heading: 'فحص المراجع',
        body: 'نتواصل مع عميل سابق واحد على الأقل أو قاعة شريكة للتأكد من سجل المنظّم.',
      },
      {
        heading: 'المراقبة المستمرة',
        body: 'بعد الموافقة، نستمر بمراقبة جودة المنظّم عبر تقييمات عملاء موثّقة (لا تُترك إلا بعد حجز مكتمل)، ويمكننا تعليق الملف إذا ثبتت شكاوى موثّقة.',
      },
      {
        heading: 'معايير الإزالة',
        body: 'يمكن إزالة ملف المنظّم في حال مخالفات موثّقة للعقد، أو تكرار عدم الحضور، أو الفشل في تقديم الخدمات بما يتوافق جوهرياً مع الاتفاق.',
      },
    ],
  },
};
