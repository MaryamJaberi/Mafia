import { Language, GamePhase } from '../types/mafia';

export interface GodPhaseGuidance {
  phase: GamePhase;
  phaseTitle: string;
  badge: string;
  stepNumber: number;
  objective: string;
  whatToSay: string[];        // Exact words/announcements the God/Host speaks to players
  whatToDemand: string[];     // Exact actions the God demands from players (e.g. close eyes, point finger, etc.)
  completionCriteria: string[]; // When and how this phase ends
  specialRoleNotes?: string[]; // Important scenario interactions and exceptions
  timeRecommendation?: string;
  recommendedRules?: string[];
}

export const GOD_PHASE_SCRIPTS: Record<Language, Partial<Record<GamePhase, GodPhaseGuidance>>> = {
  fa: {
    LOBBY: {
      phase: 'LOBBY',
      phaseTitle: 'لابی انتظار و توافق قوانین میز',
      badge: 'مرحله صفر',
      stepNumber: 0,
      objective: 'تکمیل صندلی‌ها، هماهنگی قوانین میز با بازیکنان و توزیع محرمانه نقش‌ها',
      whatToSay: [
        '«به بازی مافیا خوش آمدید. لطفاً همه بازیکنان روی صندلی‌های خود مستقر شوند و تلفن‌های همراه خود را آماده نگه دارند.»',
        '«امروز سناریوی انتخابی را با قوانین رسمی میز بازی می‌کنیم. اگر سوال یا ابهامی درباره نقش‌ها دارید، همین الان قبل از پخش کارت‌ها مطرح کنید.»',
        '«نقش‌ها به صورت تصادفی و کاملاً محرمانه در گوشی شما نمایش داده می‌شود. به هیچ عنوان نقش خود را به بغل‌دستی نشان ندهید.»'
      ],
      whatToDemand: [
        'ورود تمام بازیکنان به اتاق با اسکن QR کد یا وارد کردن کد اتاق.',
        'تأیید نام و شماره صندلی هر بازیکن روی مانیتور یا گوشی.',
        'مطالعه کارت نقش و لمس دکمه «نقش را فهمیدم» توسط همه بازیکنان.'
      ],
      completionCriteria: [
        'تمام بازیکنان به لابی پیوسته باشند.',
        'نقش‌ها به صورت کامل بین صندلی‌ها پخش شده باشد.',
        'قوانین میز تأیید شده و دکمه «شروع بازی» توسط خدا فشرده شود.'
      ],
      specialRoleNotes: [
        'در سناریوهای دارای مستقل (مانند زودیاک یا جوکر)، به بازیکنان یادآوری کنید که ساید مستقل به تنهایی برنده می‌شود.',
        'در صورتی که بازیکن حضوری بدون گوشی است، نقش او را به صورت دستی روی کارت فیزیکی یا در گوشش اعلام کنید.'
      ],
      timeRecommendation: '۳ الی ۵ دقیقه برای معارفه اولیه و تست اتصال'
    },
    NIGHT: {
      phase: 'NIGHT',
      phaseTitle: 'فاز شب محرمانه و بیدارباش نقش‌ها',
      badge: 'فاز شب',
      stepNumber: 1,
      objective: 'استعلام‌گیری محرمانه، شلیک مافیا، نجات پزشک، تیر اسنایپر و اعمال قابلیت‌های ویژه',
      whatToSay: [
        '«شب فرا می‌رسد. کل شهر چشمان خود را ببندند و سرهای خود را کاملاً پایین بیندازند. هیچ صدایی، حرکتی یا لمسی مجاز نیست.»',
        '«تیم محترم مافیا چشمان خود را باز کنند. همدیگر را شناسایی کنید و با اشاره دست و سکوت کامل، شلیک امشب را با شماره صندلی مشخص کنید... مافیا چشمان خود را ببندند.»',
        '«دکتر شهر بیدار شود... نجات امشب برای چه شماره‌ای است؟... دکتر بخوابد.»',
        '«کارآگاه شهر بیدار شود... استعلام چه شماره‌ای را می‌خواهید؟... (نشان دادن لایک برای مافیا، دیس‌لایک برای شهروند)... کارآگاه بخوابد.»',
        '«تک‌تیرانداز بیدار شود... آیا شلیکی دارید؟... شماره هدف را نشان دهید... اسنایپر بخوابد.»',
        '«سایر نقش‌های شب (تفنگدار، ساقی، ناتاشا، کنستانتین و...) به نوبت بیدار شوند...»'
      ],
      whatToDemand: [
        'بسته بودن کامل چشم‌ها و خوابیدن بدون حرکت توسط تمامی شهروندان.',
        'استفاده از کد دست و شماره صندلی بدون ایجاد کمترین صدای صوتی یا تغییر زاویه سر.',
        'موزیک ملایم یا سکوت کامل در محیط بازی برای جلوگیری از شنود صدا.'
      ],
      completionCriteria: [
        'تمام نقش‌های دارای قابلیت شب بیدار شده و اکشن آن‌ها در پنل گرداننده ثبت شده باشد.',
        'محاسبه شلیک‌ها، شیلدها و کشته‌های شب در موتور شب انجام و تأیید شود.',
        'گرداننده دکمه «طلوع روز بعد» را بزند.'
      ],
      specialRoleNotes: [
        'استعلام پدرخوانده برای کارآگاه همیشه منفی (شهروندی) است، مگر با حضور ناتاشا یا قوانین اختصاصی.',
        'تیر تک‌تیرانداز به شهروند، باعث خروج خود تک‌تیرانداز از بازی می‌شود.',
        'نجات دکتر بر شلیک مافیا اولویت دارد و جان شهروند را نجات می‌دهد.'
      ],
      timeRecommendation: '۲ الی ۴ دقیقه'
    },
    DAY_DISCUSSION: {
      phase: 'DAY_DISCUSSION',
      phaseTitle: 'فاز گفتگوی روز و نطق نوبتی',
      badge: 'فاز روز',
      stepNumber: 2,
      objective: 'اعلام وقایع و کشته‌های شب، آغاز نطق‌های ترتیبی از صندلی آغازین و مدیریت چالش‌ها',
      whatToSay: [
        '«صبح بخیر شهروندان عزیز. شهر بیدار شود. در شبی که گذشت، متأسفانه بازیکن شماره [X] با شلیک شب از شهر خارج شد (یا: خوشبختانه کشته‌ای نداشتیم).»',
        '«امروز نطق‌ها به ترتیب از شماره [Y] آغاز می‌شود. هر بازیکن ۶۰ ثانیه زمان صحبت رسمی دارد. برای درخواست چالش دست خود را بالا ببرید.»',
        '«احترام به نوبت صحبت الزامی است؛ صحبت روی نوبت دیگران اخطار انضباطی به همراه دارد.»'
      ],
      whatToDemand: [
        'صحبت فقط در نوبت رسمی یا با تأیید نطق‌کننده در وقت چالش (۳۰ ثانیه).',
        'عدم استفاده از الفاظ توهین‌آمیز، سوگند یا کلمات رکیک.',
        'عدم افشای اطلاعات شبانه به صورت فکت‌های خارج از بازی.'
      ],
      completionCriteria: [
        'تمام بازیکنان زنده یک دور نوبت صحبت قانونی خود را کامل کرده باشند.',
        'چالش‌های درخواستی ارائه شده باشد.',
        'گرداننده پایان نطق‌ها را اعلام کرده و وارد فاز اتهام‌زنی شود.'
      ],
      specialRoleNotes: [
        'اگر ناتاشا بازیکنی را سایلنت کرده باشد، آن بازیکن در طول روز حق صحبت ندارد و فقط با اشاره می‌تواند تأیید یا تکذیب کند.',
        'کشته شب حق نطق وصیت ندارد مگر در سناریوهایی که کارت آخر بازی می‌شود.'
      ],
      timeRecommendation: 'حدود ۱ دقیقه به ازای هر بازیکن زنده (۱۰ الی ۱۵ دقیقه)'
    },
    DAY_ACCUSATION: {
      phase: 'DAY_ACCUSATION',
      phaseTitle: 'فاز اتهام‌زنی و ورود به دفاع',
      badge: 'فاز اتهام',
      stepNumber: 3,
      objective: 'رأی‌گیری دست‌جمعی اولیه برای تعیین کسانی که حد نصاب ورود به دفاع را کسب می‌کنند',
      whatToSay: [
        '«به فاز اتهام‌زنی وارد می‌شویم. به نوبت اسامی بازیکنان خوانده می‌شود. هر کس تمایل دارد بازیکنی به دفاع برود، دست خود را بالا می‌برد.»',
        '«برای رفتن به دفاع، نیاز به حداقل [نصف آرا یا حد نصاب سناریو] رأی وجود دارد.»',
        '«رأی‌گیری بازیکن شماره [X]... دست‌ها بالا... تعداد آرا: [Z] رأی.»'
      ],
      whatToDemand: [
        'بالا بردن واضح و بدون تردید دست‌ها در لحظه شمارش رأی.',
        'عدم پایین آوردن دست قبل از شمارش رسمی توسط گرداننده.',
        'فقط بازیکنان زنده حق رأی دارند.'
      ],
      completionCriteria: [
        'اسامی تمام بازیکنان زنده برای اتهام‌زنی خوانده شده باشد.',
        'افرادی که به حد نصاب رسیدند به لیست متهمان دادگاه دفاع اضافه شوند.',
        'انتقال به فاز دفاع.'
      ],
      specialRoleNotes: [
        'اگر هیچ بازیکنی به حد نصاب نرسد، بازی مستقیماً وارد شب بعدی می‌شود.',
        'حداکثر تعداد افراد در دفاع طبق سناریو معمولاً ۲ الی ۳ نفر است.'
      ],
      timeRecommendation: '۲ الی ۳ دقیقه'
    },
    DAY_DEFENSE: {
      phase: 'DAY_DEFENSE',
      phaseTitle: 'فاز دفاعیه متهمان',
      badge: 'فاز دفاع',
      stepNumber: 4,
      objective: 'فرصت دفاع برابر برای متهمان جهت برائت خود پیش از رأی‌گیری نهایی خروج',
      whatToSay: [
        '«وارد فاز دفاع می‌شویم. متهمان امروز به ترتیب صندلی: بازیکنان شماره [...] هستند.»',
        '«هر متهم ۴۵ ثانیه زمان دفاع اختصاصی دارد. لطفاً با استدلال و بدون توهین، به اتهامات پاسخ دهید.»',
        '«نفر اول دفاع: شماره [X]، زمان شما از الان شروع شد.»'
      ],
      whatToDemand: [
        'سکوت مطلق سایر بازیکنان در زمان دفاع متهم.',
        'پرهیز از قطع کردن کلام متهم توسط تماشاگران یا متهمان دیگر.',
        'پایان صحبت دقیقاً با اتمام زمان‌سنج (صدای بوق).'
      ],
      completionCriteria: [
        'تمام متهمان راه یافته به دفاع، نوبت دفاعیه خود را استفاده کرده باشند.',
        'گرداننده متهمان را برای رأی‌گیری نهایی خروج در پنل مرتب کند.'
      ],
      specialRoleNotes: [
        'شهردار در این فاز می‌تواند از حق وتوی خود استفاده کرده و دفاعیه یا رأی‌گیری را لغو کند.',
        'قاضی می‌تواند با حکم مستقیم، یکی از متهمان را بدون رأی‌گیری خارج کند (بسته به سناریو).'
      ],
      timeRecommendation: '۴۵ ثانیه به ازای هر متهم'
    },
    DAY_VOTING: {
      phase: 'DAY_VOTING',
      phaseTitle: 'فاز رأی‌گیری نهایی خروج (چشم‌بسته یا علنی)',
      badge: 'رأی‌گیری نهایی',
      stepNumber: 5,
      objective: 'اخذ رأی نهایی خروج از شهروندان برای اعدام متهم و تعیین وضعیت بازی',
      whatToSay: [
        '«به رأی‌گیری نهایی خروج رسیدیم. طبق قوانین، همه بازیکنان سرهای خود را روی میز بگذارند و چشمان خود را ببندند (در صورت رأی‌گیری بسته).»',
        '«رأی خروج برای شماره [X]... کسانی که موافق خروج هستند دست خود را بالا ببرند... ۳، ۲، ۱، دست‌ها بالا...»',
        '«تعداد آرا ثبت شد. دست‌ها پایین... سرها بالا.»'
      ],
      whatToDemand: [
        'در رأی‌گیری چشمان بسته: عدم باز کردن چشم یا نگاه کردن به اطراف تا پایان شمارش.',
        'هر بازیکن در رأی‌گیری نهایی فقط به یک متهم حق رأی دارد (مگر قوانین خاص).',
        'رأی‌گیری قطعی و بدون تغییر است.'
      ],
      completionCriteria: [
        'شمارش آرای تمام متهمان انجام و در جدول آرا ثبت شده باشد.',
        'در صورت تساوی آرا، از کارت شانس، قرعه مرگ یا عدم خروج استفاده شود.',
        'تعیین وضعیت خروج بازیکن یا ورود به مرحله وصیت.'
      ],
      specialRoleNotes: [
        'اگر جوکر با رأی‌گیری روز خارج شود، بلافاصله تک‌برنده بازی اعلام می‌شود!',
        'اگر فرد اعدامی تروریست باشد، می‌تواند یک نفر را همراه خود منفجر کند.'
      ],
      timeRecommendation: '۲ دقیقه'
    },
    DAY_LAST_WORDS: {
      phase: 'DAY_LAST_WORDS',
      phaseTitle: 'کارت‌های حرکت آخر و کلام پایانی',
      badge: 'وصیت و خروج',
      stepNumber: 6,
      objective: 'ایراد کلام پایانی توسط فرد خارج شده یا کشیدن کارت شانس / حرکت آخر',
      whatToSay: [
        '«بازیکن شماره [X] با رأی اکثریت شهروندان از بازی حذف شد. لطفاً صندلی خود را ترک نکنید.»',
        '«شما ۶۰ ثانیه زمان دارید تا کلام پایانی خود را بیان کنید یا از بین کارت‌های حرکت آخر یکی را برگزینید.»',
        '«پس از پایان وصیت، به جمع حذف‌شدگان بپیوندید و سکوت را رعایت فرمایید.»'
      ],
      whatToDemand: [
        'سکوت محض دیگر بازیکنان و گوش سپردن به آخرین کلام.',
        'عدم اظهار نظر یا واکنش فیزیکی به کارت‌های آشکار شده.',
        'خروج آرام و بی‌صدا از میز پس از پایان وقت.'
      ],
      completionCriteria: [
        'کلام پایانی به اتمام برسد یا اثر کارت حرکت آخر اعمال شود.',
        'اعمال وضعیت مرگ در پنل و بررسی شرایط برد و باخت شهر یا مافیا.',
        'انتقال به فاز شب بعدی.'
      ],
      specialRoleNotes: [
        'کارت‌های حرکت آخر (مانند ذهن زیبا، شلیک نهایی، مسیر سبز، سکوت بره، فرش قرمز) می‌توانند روند بازی را فوراً دگرگون کنند.',
        'اگر با خروج این بازیکن شرایط برد مافیا یا شهروند محقق شود، بازی پایان می‌پذیرد.'
      ],
      timeRecommendation: '۱ دقیقه'
    },
    GAME_OVER: {
      phase: 'GAME_OVER',
      phaseTitle: 'پایان بازی و اعلام تیم پیروز',
      badge: 'پایان مسابقه',
      stepNumber: 7,
      objective: 'اعلام پیروزی رسمی، نمایش تمام نقش‌های مخفی و ثبت گزارش در دیتابیس',
      whatToSay: [
        '«بازی با پیروزی مقتدرانه تیم [مافیا / شهروندان / مستقل] به پایان رسید! تبریک به برندگان و خداقوت به همه بازیکنان عزیز.»',
        '«اکنون تمام نقش‌ها روی مانیتور و گوشی‌های شما فاش می‌شود. گزارش کامل ماتریس اتهامات و نمودار شبکه‌ای ثبت شد.»'
      ],
      whatToDemand: [
        'تشویق متقابل و پرهیز از ناراحتی یا بحث‌های غیرورزشی.',
        'مشاهده تحلیل‌های آماری و هوش مصنوعی بازی.'
      ],
      completionCriteria: [
        'ذخیره خودکار در سوابق و تاریخچه بازی‌ها.',
        'امکان خروجی PDF یا گزارش کامل مسابقه.'
      ],
      specialRoleNotes: [
        'امکان دانلود گزارش ۱۸ نفره یا ریست بازی برای راند بعد در پنل بالا فراهم است.'
      ],
      timeRecommendation: '۳ دقیقه'
    }
  },
  en: {
    LOBBY: {
      phase: 'LOBBY',
      phaseTitle: 'Lobby & House Rules Agreement',
      badge: 'Step 0',
      stepNumber: 0,
      objective: 'Seat players, agree on house rules, and distribute secret roles',
      whatToSay: [
        '"Welcome to Mafia. Please take your seats and have your companion screens ready."',
        '"Today we play the official scenario rules. Any rule questions must be clarified right now before cards are distributed."',
        '"Roles will be dealt secretly. Keep your screen hidden from adjacent players."'
      ],
      whatToDemand: [
        'All players join via QR Code or Room Code.',
        'Confirming seat numbers and player aliases on the table.',
        'Each player views and confirms their secret role.'
      ],
      completionCriteria: [
        'All seats filled and confirmed.',
        'Deck distributed.',
        'Game started by Moderator.'
      ],
      specialRoleNotes: ['Independent roles win alone.'],
      timeRecommendation: '3-5 minutes'
    },
    NIGHT: {
      phase: 'NIGHT',
      phaseTitle: 'Confidential Night Phase',
      badge: 'Night Phase',
      stepNumber: 1,
      objective: 'Night actions: Mafia shot, Doctor save, Detective check, and abilities',
      whatToSay: [
        '"Night falls over the city. Everyone close your eyes and put your heads down. Complete silence."',
        '"Mafia wake up. Silently point to your target tonight by seat number... Mafia go to sleep."',
        '"Doctor wake up... Who do you protect?... Doctor go to sleep."',
        '"Detective wake up... Point to a suspect for inquiry... (Thumbs up for Mafia, down for Citizen)... Detective sleep."',
        '"Sniper wake up... Any shot tonight?... Sniper sleep."'
      ],
      whatToDemand: [
        'Heads down, eyes closed, no sound or suspicious movement.',
        'Use finger numbers for seat IDs in silence.'
      ],
      completionCriteria: [
        'All night roles prompted and actions recorded in the Night Engine.',
        'Deaths & saves computed and confirmed by God.'
      ],
      specialRoleNotes: [
        'Godfather inquiry is always CITIZEN unless configured otherwise.',
        'Sniper dies if shooting a fellow citizen.'
      ],
      timeRecommendation: '2-4 minutes'
    },
    DAY_DISCUSSION: {
      phase: 'DAY_DISCUSSION',
      phaseTitle: 'Day Discussion & Speeches',
      badge: 'Day Phase',
      stepNumber: 2,
      objective: 'Announce night casualties and conduct orderly speaking turns',
      whatToSay: [
        '"Good morning city. In the night that passed, player #[X] was eliminated (or: No deaths tonight)."',
        '"Speeches start clockwise from seat #[Y]. 60 seconds per player. Raise hand for challenges."'
      ],
      whatToDemand: [
        'Speak strictly on turn. Interrupting incurs a penalty.',
        '30-second challenge time limits.'
      ],
      completionCriteria: ['All living players finished their speaking turn.'],
      specialRoleNotes: ['Muted/silenced players cannot speak today.'],
      timeRecommendation: '1 minute per living player'
    },
    DAY_ACCUSATION: {
      phase: 'DAY_ACCUSATION',
      phaseTitle: 'Accusation & Nominations',
      badge: 'Accusations',
      stepNumber: 3,
      objective: 'Vote on suspects to send them to the defense court',
      whatToSay: [
        '"We enter the Accusation Phase. As names are called, raise hands to vote candidates to defense."',
        '"Nomination for player #[X]... Hands up... Total votes: [Z]."'
      ],
      whatToDemand: ['Clear hand raises until officially tallied.'],
      completionCriteria: ['All players voted on and defense suspects determined.'],
      specialRoleNotes: ['If no one meets quota, proceed directly to night.'],
      timeRecommendation: '2-3 minutes'
    },
    DAY_DEFENSE: {
      phase: 'DAY_DEFENSE',
      phaseTitle: 'Defense Court',
      badge: 'Defense',
      stepNumber: 4,
      objective: 'Equal defense time for nominated suspects before elimination vote',
      whatToSay: [
        '"Defense Phase begins. Nominees are players #[...]. 45 seconds each."',
        '"First speaker #[X], your defense time starts now."'
      ],
      whatToDemand: ['Complete silence from the audience.'],
      completionCriteria: ['All nominees delivered defense arguments.'],
      specialRoleNotes: ['Mayor may exercise veto in this phase.'],
      timeRecommendation: '45 seconds per nominee'
    },
    DAY_VOTING: {
      phase: 'DAY_VOTING',
      phaseTitle: 'Final Elimination Vote',
      badge: 'Final Vote',
      stepNumber: 5,
      objective: 'Decisive vote to eliminate a suspect from the city',
      whatToSay: [
        '"Final voting. Heads down and eyes closed (or open vote). Vote to eliminate player #[X]... Hands up 3, 2, 1..."'
      ],
      whatToDemand: ['One vote per living player.'],
      completionCriteria: ['Votes recorded and eliminated player determined.'],
      specialRoleNotes: ['If Joker is eliminated by day vote, Joker wins immediately!'],
      timeRecommendation: '2 minutes'
    },
    DAY_LAST_WORDS: {
      phase: 'DAY_LAST_WORDS',
      phaseTitle: 'Last Words & Final Move Cards',
      badge: 'Last Words',
      stepNumber: 6,
      objective: 'Eliminated player delivers final speech or draws a Last Move card',
      whatToSay: [
        '"Player #[X] has been eliminated. You have 60 seconds for your last words or draw a Last Move card."'
      ],
      whatToDemand: ['Silence from remaining players.'],
      completionCriteria: ['Speech ended, player leaves active table.'],
      specialRoleNotes: ['Check win condition immediately.'],
      timeRecommendation: '1 minute'
    },
    GAME_OVER: {
      phase: 'GAME_OVER',
      phaseTitle: 'Game Over & Victory Ceremony',
      badge: 'Game Over',
      stepNumber: 7,
      objective: 'Declare winning faction and reveal all identity cards',
      whatToSay: [
        '"Game over! Victory goes to the [Mafia / Citizens / Independent] faction! Congratulations!"'
      ],
      whatToDemand: ['Friendly sportsmanship.'],
      completionCriteria: ['Stats saved to local match history.'],
      timeRecommendation: '3 minutes'
    }
  },
  ar: {
    LOBBY: {
      phase: 'LOBBY',
      phaseTitle: 'غرفة الانتظار والاتفاق على القواعد',
      badge: 'المرحلة 0',
      stepNumber: 0,
      objective: 'تسكين اللاعبين والاتفاق على القواعد وتوزيع الأدوار السرية',
      whatToSay: [
        '«مرحباً بكم في لعبة المافيا. يرجى أخذ المقاعد وتجهيز شاشاتكم.»',
        '«سنلعب وفق القواعد المعتمدة. أي استفسار يرجى طرحه الآن قبل توزيع البطاقات.»'
      ],
      whatToDemand: ['انضمام جميع اللاعبين عبر رمز الغرفة أو الباركود.'],
      completionCriteria: ['اكتمال المقاعد وبدء المشرف للعبة.'],
      timeRecommendation: '3-5 دقائق'
    },
    NIGHT: {
      phase: 'NIGHT',
      phaseTitle: 'مرحلة الليل السرية واستعلامات الأدوار',
      badge: 'فاز الليل',
      stepNumber: 1,
      objective: 'إطلاق النار للمافيا، حماية الطبيب، وتحقيق المحقق',
      whatToSay: [
        '«يحل الليل على المدينة. الجميع يغلقون أعينهم بهدوء تام.»',
        '«تستيقظ المافيا وتحدد الهدف بالإشارة... تنام المافيا.»',
        '«يستيقظ الطبيب ويختار من يحميه... ينام الطبيب.»',
        '«يستيقظ المحقق ويسأل عن مشتبه به... ينام المحقق.»'
      ],
      whatToDemand: ['الهدوء التام وعدم إصدار أي صوت أو حركة.'],
      completionCriteria: ['تسجيل جميع إجراءات الليل في محرك الليل وتأكيد النتائج.'],
      timeRecommendation: '2-4 دقائق'
    },
    DAY_DISCUSSION: {
      phase: 'DAY_DISCUSSION',
      phaseTitle: 'نقاش النهار والكلمات الدورية',
      badge: 'فاز النهار',
      stepNumber: 2,
      objective: 'إعلان ضحايا الليل وبدء أدوار التحدث الرسمية',
      whatToSay: [
        '«صباح الخير. في الليلة الماضية استشهد اللاعب رقم [X] (أو: لا يوجد قتلى).»',
        '«تبدأ الكلمات من المقعد [Y]. دقيقة لكل متحدث.»'
      ],
      whatToDemand: ['الالتزام بالوقت وعدم مقاطعة المتحدث.'],
      completionCriteria: ['انتهاء جميع اللاعبين الأحياء من كلماتهم.'],
      timeRecommendation: 'دقيقة لكل لاعب'
    },
    DAY_ACCUSATION: {
      phase: 'DAY_ACCUSATION',
      phaseTitle: 'مرحلة توجيه الاتهامات والترشيحات',
      badge: 'الاتهامات',
      stepNumber: 3,
      objective: 'التصويت لإرسال المشتبه بهم إلى المحاكمة والدفاع',
      whatToSay: ['«نبدأ مرحلة الاتهامات. رفع الأيدي للتصويت على المتهمين للدفاع.»'],
      whatToDemand: ['رفع اليد بوضوح حتى اكتمال العد.'],
      completionCriteria: ['تحديد المتهمين الصاعدين لمحكمة الدفاع.'],
      timeRecommendation: '2-3 دقائق'
    },
    DAY_DEFENSE: {
      phase: 'DAY_DEFENSE',
      phaseTitle: 'محكمة الدفاع',
      badge: 'الدفاع',
      stepNumber: 4,
      objective: 'فرصة دفاع متساوية للمرشحين قبل التصويت النهائي للإقصاء',
      whatToSay: ['«تبدأ مرحلة الدفاع. 45 ثانية لكل متهم.»'],
      whatToDemand: ['صمت كامل من بقية اللاعبين.'],
      completionCriteria: ['انتهاء جميع المتهمين من الدفاع.'],
      timeRecommendation: '45 ثانية لكل متهم'
    },
    DAY_VOTING: {
      phase: 'DAY_VOTING',
      phaseTitle: 'التصويت النهائي للإقصاء',
      badge: 'التصويت النهائي',
      stepNumber: 5,
      objective: 'التصويت الحاسم لإقصاء لاعب من المدينة',
      whatToSay: ['«التصويت النهائي. إغلاق الأعين ورفع اليد لإقصاء اللاعب رقم [X].»'],
      whatToDemand: ['صوت واحد لكل لاعب حي.'],
      completionCriteria: ['إحصاء الأصوات وتحديد المستبعد.'],
      timeRecommendation: '2 دقيقة'
    },
    DAY_LAST_WORDS: {
      phase: 'DAY_LAST_WORDS',
      phaseTitle: 'الكلمات الأخيرة وبطاقات الحركة النهائية',
      badge: 'الوصية',
      stepNumber: 6,
      objective: 'إلقاء الكلمة الأخيرة للاعب المستبعد',
      whatToSay: ['«تم إقصاء اللاعب. لديك 60 ثانية للكلمات الأخيرة.»'],
      whatToDemand: ['إنصات تام ومغادرة الطاولة بهدوء.'],
      completionCriteria: ['انتهاء الوقت والانتقال لليل التالي.'],
      timeRecommendation: '1 دقيقة'
    },
    GAME_OVER: {
      phase: 'GAME_OVER',
      phaseTitle: 'نهاية اللعبة وإعلان الفريق الفائز',
      badge: 'نهاية اللعبة',
      stepNumber: 7,
      objective: 'إعلان الفائز وكشف جميع بطاقات الأدوار',
      whatToSay: ['«انتهت اللعبة بفوز فريق [المافيا / المواطنين / المستقل]! مبارك للجميع!»'],
      whatToDemand: ['الروح الرياضية وحفظ السجلات.'],
      completionCriteria: ['حفظ إحصائيات اللعبة في السجل.'],
      timeRecommendation: '3 دقائق'
    }
  },
  tr: {
    LOBBY: {
      phase: 'LOBBY',
      phaseTitle: 'Lobi & Masa Kuralları Anlaşması',
      badge: 'Adım 0',
      stepNumber: 0,
      objective: 'Oyuncuları oturtma, kuralları netleştirme ve rolleri dağıtma',
      whatToSay: [
        '"Mafya oyununa hoş geldiniz. Lütfen yerlerinizi alın ve cihazlarınızı hazır tutun."',
        '"Resmi senaryo kurallarıyla oynuyoruz. Sorularınızı kartlar dağıtılmadan önce sorun."'
      ],
      whatToDemand: ['Tüm oyuncuların odaya katılması ve rollerini onaylaması.'],
      completionCriteria: ['Masa doldu ve oyun başlatıldı.'],
      timeRecommendation: '3-5 dakika'
    },
    NIGHT: {
      phase: 'NIGHT',
      phaseTitle: 'Gizli Gece Evresi',
      badge: 'Gece Evresi',
      stepNumber: 1,
      objective: 'Gece aksiyonları: Mafya vuruşu, Doktor koruması, Dedektif sorgusu',
      whatToSay: [
        '"Şehre gece çöker. Herkes gözlerini kapatsın ve başını indirsin."',
        '"Mafya uyansın ve hedefini göstersin... Mafya uyusun."',
        '"Doktor uyansın ve kimi koruduğunu belirtsin... Doktor uyusun."',
        '"Dedektif uyansın ve sorgusunu yapsın... Dedektif uyusun."'
      ],
      whatToDemand: ['Mutlak sessizlik ve hareketsizlik.'],
      completionCriteria: ['Tüm gece rolleri aksiyonlarını tamamladı.'],
      timeRecommendation: '2-4 dakika'
    },
    DAY_DISCUSSION: {
      phase: 'DAY_DISCUSSION',
      phaseTitle: 'Gündüz Tartışması & Sıralı Konuşmalar',
      badge: 'Gündüz',
      stepNumber: 2,
      objective: 'Gece ölümlerini duyurma ve sırayla konuşma turu yapma',
      whatToSay: [
        '"Günaydın şehir. Geçen gece [X] numaralı oyuncu elendi (veya: Bu gece ölüm yok)."',
        '"Konuşmalar [Y] numaralı koltuktan başlıyor. Oyuncu başına 60 saniye."'
      ],
      whatToDemand: ['Sırayla konuşma kuralına uyulması.'],
      completionCriteria: ['Tüm yaşayan oyuncular konuştu.'],
      timeRecommendation: 'Kişi başı 1 dakika'
    },
    DAY_ACCUSATION: {
      phase: 'DAY_ACCUSATION',
      phaseTitle: 'Suçlama & Aday Gösterme',
      badge: 'Suçlama',
      stepNumber: 3,
      objective: 'Savunmaya gidecek şüphelileri belirleme oylaması',
      whatToSay: ['"Suçlama evresi başlıyor. Savunmaya gidecek adaylar için el kaldırın."'],
      whatToDemand: ['Sayım bitene kadar net el kaldırma.'],
      completionCriteria: ['Savunma adayları belirlendi.'],
      timeRecommendation: '2-3 dakika'
    },
    DAY_DEFENSE: {
      phase: 'DAY_DEFENSE',
      phaseTitle: 'Savunma Mahkemesi',
      badge: 'Savunma',
      stepNumber: 4,
      objective: 'Adayların eleme oylaması öncesi kendilerini savunması',
      whatToSay: ['"Savunma evresi. Her aday için 45 saniye süre başlıyor."'],
      whatToDemand: ['Diğer oyuncuların sessiz kalması.'],
      completionCriteria: ['Tüm adaylar savunmasını tamamladı.'],
      timeRecommendation: 'Aday başı 45 saniye'
    },
    DAY_VOTING: {
      phase: 'DAY_VOTING',
      phaseTitle: 'Nihai Eleme Oylaması',
      badge: 'Son Oylama',
      stepNumber: 5,
      objective: 'Şehirden elenecek oyuncuyu belirleme oylaması',
      whatToSay: ['"Nihai oylama. [X] numaralı oyuncuyu elemek için eller havaya."'],
      whatToDemand: ['Oyuncu başına tek oy.'],
      completionCriteria: ['Oylar sayıldı ve elenen oyuncu belirlendi.'],
      timeRecommendation: '2 dakika'
    },
    DAY_LAST_WORDS: {
      phase: 'DAY_LAST_WORDS',
      phaseTitle: 'Son Sözler & Hamle Kartları',
      badge: 'Vasiyet',
      stepNumber: 6,
      objective: 'Elenen oyuncunun son sözlerini söylemesi',
      whatToSay: ['"Oyuncu elendi. Son sözleriniz için 60 saniyeniz var."'],
      whatToDemand: ['Sessizce dinleme ve masadan ayrılma.'],
      completionCriteria: ['Son sözler tamamlandı.'],
      timeRecommendation: '1 dakika'
    },
    GAME_OVER: {
      phase: 'GAME_OVER',
      phaseTitle: 'Oyun Sonu & Zafer Töreni',
      badge: 'Oyun Sonu',
      stepNumber: 7,
      objective: 'Kazanan tarafı ilan etme ve rolleri açıklama',
      whatToSay: ['"Oyun bitti! Kazanan [Mafya / Köylüler / Bağımsız] takımı! Tebrikler!"'],
      whatToDemand: ['Sportmenlik.'],
      completionCriteria: ['Oyun istatistikleri kaydedildi.'],
      timeRecommendation: '3 dakika'
    }
  }
};
