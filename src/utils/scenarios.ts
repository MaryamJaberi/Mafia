import { RoleDefinition, RoleId, Scenario, RoleBundle, DeckRoleItem, ScenarioValidationResult } from '../types/mafia';

export const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
  GODFATHER: {
    id: 'GODFATHER',
    nameKey: 'role_GODFATHER',
    affiliation: 'MAFIA',
    descriptionKey: 'پدرخوانده (گادفادر) رئیس تیم مافیا؛ استعلام منفی (شهروند)، تصمیم‌گیرنده شلیک شب و دارای جلیقه یا حس ششم. (توجه: گادفادر نقش یکی از بازیکنان در ساید مافیاست و با گرداننده/داور بازی فرق دارد).',
    nightPriority: 1,
    hasInquiryImmunity: true,
    hasNightShield: true,
    iconName: 'Crown',
    teamColor: 'text-rose-500 bg-rose-950/60 border-rose-500/50',
    recommendedBundleName: 'پای ثابت تمامی سناریوها (رهبر مافیا)',
    acts: [
      {
        phase: 'NIGHT',
        title: 'شلیک شبانه یا حس ششم',
        description: 'در فاز بیداری مافیا، تصمیم نهایی تیر با نشان دادن انگشت پدرخوانده تعیین می‌شود یا حس ششم می‌زند.',
        priorityOrder: 1
      },
      {
        phase: 'PASSIVE',
        title: 'مصونیت استعلام',
        description: 'در صورتی که کارآگاه در شب استعلام پدرخوانده را بگیرد، پاسخ گرداننده همیشه منفی (شهروند) است.'
      }
    ],
    exceptions: [
      'گادفادر (پدرخوانده) نقش بازیکن عضو مافیاست، در حالی که گرداننده (راوی) مدیر و داور بی‌طرف بازی است.',
      'استعلام برای کارآگاه منفی است، اما با شات لئون/اسنایپر یا تیر دوم حذف می‌شود.',
      'در صورت مرگ پدرخوانده، یار ارشد مافیا سرپرستی شلیک شب را بر عهده می‌گیرد.'
    ],
    matchups: [
      {
        targetRoleId: 'DETECTIVE',
        targetRoleName: 'کارآگاه',
        effect: 'استعلام کارآگاه را خنثی کرده و پاسخ منفی (شهروند) تولید می‌کند.',
        interactionType: 'NEGATIVE'
      },
      {
        targetRoleId: 'SNIPER',
        targetRoleName: 'تک‌تیرانداز',
        effect: 'در صورت شلیک اسنایپر یا لئون، زره او افتاده یا کشته می‌شود.',
        interactionType: 'LETHAL'
      },
      {
        targetRoleId: 'ARMORED',
        targetRoleName: 'زره‌پوش',
        effect: 'اولین شلیک مافیا به زره‌پوش بی‌اثر است و فقط زره او می‌افتد.',
        interactionType: 'NEUTRAL'
      }
    ]
  },

  MAFIA_SIMPLE: {
    id: 'MAFIA_SIMPLE',
    nameKey: 'role_MAFIA_SIMPLE',
    affiliation: 'MAFIA',
    descriptionKey: 'یار مافیا؛ در شب همراه با تیم مافیا بیدار شده و در مشورت و شلیک شرکت می‌کند.',
    nightPriority: 1,
    hasInquiryImmunity: false,
    iconName: 'Skull',
    teamColor: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
    counterpartRoleId: 'CITIZEN_SIMPLE',
    counterpartRoleName: 'شهروند ساده',
    recommendedBundleName: 'ستون‌های پایه شهر و تیم',
    acts: [
      {
        phase: 'NIGHT',
        title: 'مشورت شبانه مافیا',
        description: 'همراه با سایر اعضا بیدار شده و به توافق درباره انتخاب هدف شلیک شب کمک می‌کند.',
        priorityOrder: 1
      },
      {
        phase: 'DAY',
        title: 'گمراه‌سازی و اتهام‌زنی',
        description: 'تلاش برای هدایت آرا و اتهام‌ها به سمت شهروندان بدون لو رفتن هویت تیمی.'
      }
    ],
    exceptions: [
      'استعلام مافیای ساده برای کارآگاه مثبت (مافیا) است.',
      'فاقد زره شبانه یا نجات اختصاصی است.'
    ],
    matchups: [
      {
        targetRoleId: 'DETECTIVE',
        targetRoleName: 'کارآگاه',
        effect: 'استعلام او مثبت (مافیا) اعلام می‌شود و در صورت لو رفتن در خطر است.',
        interactionType: 'NEGATIVE'
      },
      {
        targetRoleId: 'SNIPER',
        targetRoleName: 'تک‌تیرانداز',
        effect: 'با شلیک درست اسنایپر در شب از بازی حذف می‌شود.',
        interactionType: 'LETHAL'
      }
    ]
  },

  DOCTOR_LECTER: {
    id: 'DOCTOR_LECTER',
    nameKey: 'role_DOCTOR_LECTER',
    affiliation: 'MAFIA',
    descriptionKey: 'پزشک مافیا؛ هر شب یک عضو مافیا را از شلیک تک‌تیرانداز نجات می‌دهد و خود را نیز یک‌بار نجات می‌دهد.',
    nightPriority: 2,
    hasInquiryImmunity: false,
    iconName: 'Syringe',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40',
    counterpartRoleId: 'SNIPER',
    counterpartRoleName: 'تک‌تیرانداز شهر',
    recommendedBundleName: 'شلیک شب و نجات مافیا (لکتر ⚔️ اسنایپر)',
    acts: [
      {
        phase: 'NIGHT',
        title: 'نجات پزشکی مافیا',
        description: 'یکی از یاران مافیا را انتخاب می‌کند تا از شلیک احتمالی اسنایپر در امان بماند.',
        priorityOrder: 2
      }
    ],
    exceptions: [
      'خودش را در طول بازی معمولاً فقط یک‌بار می‌تواند سیو کند.',
      'استعلام او برای کارآگاه مثبت (مافیا) است.'
    ],
    matchups: [
      {
        targetRoleId: 'SNIPER',
        targetRoleName: 'تک‌تیرانداز',
        effect: 'در صورت نجات هدف اسنایپر، تیر تک‌تیرانداز شهر بی‌اثر می‌شود.',
        interactionType: 'POSITIVE'
      },
      {
        targetRoleId: 'DOCTOR',
        targetRoleName: 'دکتر شهر',
        effect: 'تقابل درمان مافیایی و نجات شهروندی در برابر تلفات شب.',
        interactionType: 'NEUTRAL'
      }
    ]
  },

  MATADOR: {
    id: 'MATADOR',
    nameKey: 'role_MATADOR',
    affiliation: 'MAFIA',
    descriptionKey: 'ماتادور (خنثی‌کننده و بلاکر مافیا)؛ هر شب می‌تواند به جای شات، توانایی و قابلیت شب یک شهروند را بلاک کند.',
    nightPriority: 2,
    hasInquiryImmunity: false,
    iconName: 'ShieldAlert',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40',
    counterpartRoleId: 'SNIPER',
    counterpartRoleName: 'تک‌تیرانداز شهر',
    recommendedBundleName: 'شلیک شب و خنثی‌سازی (ماتادور ⚔️ اسنایپر)',
    acts: [
      {
        phase: 'NIGHT',
        title: 'بلاک کردن قابلیت شهروند',
        description: 'به جای شلیک، اکشن شب یک بازیکن (دکتر، کارآگاه، اسنایپر، کنستانتین) را مسدود می‌کند.',
        priorityOrder: 2
      }
    ],
    exceptions: ['بلاک روی شهروند ساده بی‌اثر است چون قابلیتی ندارد.'],
    matchups: [
      {
        targetRoleId: 'DOCTOR',
        targetRoleName: 'دکتر شهر',
        effect: 'بلاک دکتر باعث می‌شود نجات شب کار نکند.',
        interactionType: 'NEGATIVE'
      },
      {
        targetRoleId: 'SNIPER',
        targetRoleName: 'اسنایپر / لئون',
        effect: 'شلیک لئون در آن شب انجام نمی‌شود.',
        interactionType: 'NEGATIVE'
      }
    ]
  },

  SAUL_GOODMAN: {
    id: 'SAUL_GOODMAN',
    nameKey: 'role_SAUL_GOODMAN',
    affiliation: 'MAFIA',
    descriptionKey: 'ساول گودمن (وکیل و خریدار مافیا)؛ پس از خروج یک مافیا می‌تواند یک شهروند ساده را خریده و مافیا کند.',
    nightPriority: 3,
    hasInquiryImmunity: false,
    iconName: 'Briefcase',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40',
    counterpartRoleId: 'CITIZEN_KANE',
    counterpartRoleName: 'همشهری کین',
    recommendedBundleName: 'خریداری و افشاگری',
    acts: [
      {
        phase: 'NIGHT',
        title: 'خریداری شهروند ساده',
        description: 'به جای شات مافیا، به یک شهروند ساده پیشنهاد می‌دهد تا به تیم مافیا بپیوندد.',
        priorityOrder: 3
      }
    ],
    exceptions: ['تنها شهروند ساده قابل خریداری است؛ هدف نقش‌دار خریداری نمی‌شود.'],
    matchups: [
      {
        targetRoleId: 'CITIZEN_SIMPLE',
        targetRoleName: 'شهروند ساده',
        effect: 'تبدیل شهروند به مافیای جدید.',
        interactionType: 'POSITIVE'
      }
    ]
  },

  NATASHA: {
    id: 'NATASHA',
    nameKey: 'role_NATASHA',
    affiliation: 'MAFIA',
    descriptionKey: 'ناتاشا (سایلنسر)؛ هر شب یک بازیکن را لال و سایلنت می‌کند تا فردا نتواند صحبت یا دفاع کند.',
    nightPriority: 3,
    hasInquiryImmunity: false,
    iconName: 'VolumeX',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40',
    counterpartRoleId: 'PSYCHOLOGIST',
    counterpartRoleName: 'روانشناس',
    recommendedBundleName: 'روان‌درمانی و سکوت مطلق',
    acts: [
      {
        phase: 'NIGHT',
        title: 'سکوت‌دهی (سایلنت)',
        description: 'بازیکن انتخابی در طول روز بعد حق صحبت کردن، چلنج و دفاعیه ندارد.',
        priorityOrder: 3
      }
    ],
    exceptions: ['دو شب پیاپی نمی‌تواند یک نفر را سایلنت کند.', 'استعلام او برای کارآگاه مثبت است.'],
    matchups: [
      {
        targetRoleId: 'PSYCHOLOGIST',
        targetRoleName: 'روانشناس',
        effect: 'روانشناس در روز می‌تواند سکوت او را درمان کند یا استعلام بگذارد.',
        interactionType: 'NEUTRAL'
      }
    ]
  },

  TERRORIST: {
    id: 'TERRORIST',
    nameKey: 'role_TERRORIST',
    affiliation: 'MAFIA',
    descriptionKey: 'تروریست (انتحاری)؛ در صورت اعدام در رای‌گیری روز، می‌تواند یک نفر را همراه خود منفجر کرده و به گور ببرد.',
    nightPriority: 1,
    hasInquiryImmunity: false,
    iconName: 'Bomb',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40',
    counterpartRoleId: 'SACRIFICE',
    counterpartRoleName: 'فدایی شهر',
    recommendedBundleName: 'انفجار انتحاری و فداکاری (تروریست ⚔️ فدایی)',
    acts: [
      {
        phase: 'DAY',
        title: 'انفجار انتحاری در دفاعیه',
        description: 'هنگام خروج با رأی روز، انگشت خود را به سمت یک نفر نشانه رفته و او را بلافاصله حذف می‌کند.'
      }
    ],
    exceptions: ['اگر در شب توسط اسنایپر یا تیر کشته شود، فرصت انفجار نخواهد داشت.'],
    matchups: [
      {
        targetRoleId: 'SACRIFICE',
        targetRoleName: 'فدایی',
        effect: 'فدایی می‌تواند خود را فدا کند تا فرد هدف تروریست زنده بماند.',
        interactionType: 'NEGATIVE'
      },
      {
        targetRoleId: 'SNIPER',
        targetRoleName: 'تک‌تیرانداز',
        effect: 'اگر اسنایپر او را در شب بزند ترور خنثی می‌شود.',
        interactionType: 'NEGATIVE'
      }
    ]
  },

  SHAH_KOSH: {
    id: 'SHAH_KOSH',
    nameKey: 'role_SHAH_KOSH',
    affiliation: 'MAFIA',
    descriptionKey: 'شاه‌کش (اسسین)؛ می‌تواند در شب نقش یک شهروند کلیدی را حدس بزند و او را بی‌درنگ ترور کند.',
    nightPriority: 2,
    hasInquiryImmunity: false,
    iconName: 'Crosshair',
    teamColor: 'text-rose-600 bg-rose-950/60 border-rose-500/50',
    counterpartRoleId: 'ARMORED',
    counterpartRoleName: 'زره‌پوش شهر',
    recommendedBundleName: 'تیر زره‌شکاف و زره فولادی (شاه‌کش ⚔️ زره‌پوش)',
    acts: [
      {
        phase: 'NIGHT',
        title: 'حدس نقش و شات شاه‌کش',
        description: 'نقش یک بازیکن را به گرداننده اعلام می‌کند؛ اگر درست باشد آن فرد بدون نجات می‌میرد.',
        priorityOrder: 2
      }
    ]
  },

  NEGOTIATOR: {
    id: 'NEGOTIATOR',
    nameKey: 'role_NEGOTIATOR',
    affiliation: 'MAFIA',
    descriptionKey: 'مذاکره‌کننده مافیا؛ پس از حذف یاران می‌تواند با یک شهروند ساده یا زره‌پوش بی‌زره مذاکره کند.',
    nightPriority: 3,
    hasInquiryImmunity: false,
    iconName: 'Handshake',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40',
    counterpartRoleId: 'JOURNALIST',
    counterpartRoleName: 'خبرنگار',
    recommendedBundleName: 'مذاکره و کشف هویت',
    acts: [
      {
        phase: 'NIGHT',
        title: 'مذاکره مافیایی',
        description: 'در شبی که مذاکره می‌کند شات مافیا سوزانده شده و شهروند ساده به مافیا اضافه می‌شود.',
        priorityOrder: 3
      }
    ]
  },

  NATO: {
    id: 'NATO',
    nameKey: 'role_NATO',
    affiliation: 'MAFIA',
    descriptionKey: 'ناتو؛ در شب می‌تواند نقش دقیق یکی از شهروندان را حدس بزند. در صورت درستی، هدف فوراً از بازی حذف می‌شود.',
    nightPriority: 2,
    hasInquiryImmunity: false,
    iconName: 'Target',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40',
    counterpartRoleId: 'RANGER',
    counterpartRoleName: 'تکاور',
    recommendedBundleName: 'تکاور و ناتو'
  },

  HOSTAGE_TAKER: {
    id: 'HOSTAGE_TAKER',
    nameKey: 'role_HOSTAGE_TAKER',
    affiliation: 'MAFIA',
    descriptionKey: 'گروگان‌گیر مافیا؛ هر شب یکی از شهروندان را به گروگان می‌گیرد تا قابلیت او کار نکند.',
    nightPriority: 2,
    hasInquiryImmunity: false,
    iconName: 'Lock',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40',
    counterpartRoleId: 'GUARD',
    counterpartRoleName: 'نگهبان'
  },

  SWEETHEART: {
    id: 'SWEETHEART',
    nameKey: 'role_SWEETHEART',
    affiliation: 'MAFIA',
    descriptionKey: 'معشوقه (لیدی مافیا)؛ با مرگ او مافیا خشمگین شده و شب بعد ۲ شات به دست می‌آورد.',
    nightPriority: 1,
    hasInquiryImmunity: false,
    iconName: 'HeartCrack',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40'
  },

  POISONER: {
    id: 'POISONER',
    nameKey: 'role_POISONER',
    affiliation: 'MAFIA',
    descriptionKey: 'سم‌ساز؛ به یک بازیکن سم می‌دهد که نه همان شب بلکه شب بعد اثر می‌کند.',
    nightPriority: 3,
    hasInquiryImmunity: false,
    iconName: 'FlaskConical',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40'
  },

  HACKER: {
    id: 'HACKER',
    nameKey: 'role_HACKER',
    affiliation: 'MAFIA',
    descriptionKey: 'هکر مافیا؛ لیست ۳ نفره به گاد می‌دهد تا بداند آیا نقش خطرناک در میان آن‌ها وجود دارد یا خیر.',
    nightPriority: 3,
    hasInquiryImmunity: false,
    iconName: 'Terminal',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40'
  },

  CHURCHILL: {
    id: 'CHURCHILL',
    nameKey: 'role_CHURCHILL',
    affiliation: 'MAFIA',
    descriptionKey: 'چرچیل؛ سیاستمدار مافیا که پس از خروج یک مافیا قابلیت مذاکره یا نفوذ سیاسی پیدا می‌کند.',
    nightPriority: 3,
    hasInquiryImmunity: false,
    iconName: 'UserCheck',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40'
  },

  DEXTER: {
    id: 'DEXTER',
    nameKey: 'role_DEXTER',
    affiliation: 'MAFIA',
    descriptionKey: 'دکستر؛ بلاکر قوی سناریوی دنتیست که هر شب توانایی یک بازیکن را دیفیوز و خنثی می‌کند.',
    nightPriority: 2,
    hasInquiryImmunity: false,
    iconName: 'ZapOff',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40'
  },

  LOBBYIST: {
    id: 'LOBBYIST',
    nameKey: 'role_LOBBYIST',
    affiliation: 'MAFIA',
    descriptionKey: 'لابی‌من؛ در طول روز یا شب با هدایت آرا و نفوذ سیاسی، روی اعلامیه‌های شهر دستکاری می‌کند.',
    nightPriority: 3,
    hasInquiryImmunity: false,
    iconName: 'Scale',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40'
  },

  SPY: {
    id: 'SPY',
    nameKey: 'role_SPY',
    affiliation: 'MAFIA',
    descriptionKey: 'جاسوس؛ عضو نفوذی مافیا در میان فراماسون‌ها یا شهروندان که جلسات مخفی را لو می‌دهد.',
    nightPriority: 4,
    hasInquiryImmunity: true,
    iconName: 'EyeOff',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40'
  },

  STRONG_MAN: {
    id: 'STRONG_MAN',
    nameKey: 'role_STRONG_MAN',
    affiliation: 'MAFIA',
    descriptionKey: 'مرد قوی مافیا؛ یک تیر شلیک غیرقابل مهار دارد که حتی زره‌پوش و هدف نجات‌یافته را از پا درمی‌آورد.',
    nightPriority: 1,
    hasInquiryImmunity: false,
    iconName: 'Flame',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40'
  },

  MAFIA_GANGSTER: {
    id: 'MAFIA_GANGSTER',
    nameKey: 'role_MAFIA_GANGSTER',
    affiliation: 'MAFIA',
    descriptionKey: 'گنگستر مافیا؛ اسلحه و تجهیزات سنگین مافیا در سناریوی ساقی و درگیری‌های مسلحانه.',
    nightPriority: 2,
    hasInquiryImmunity: false,
    iconName: 'ShieldAlert',
    teamColor: 'text-rose-500 bg-rose-950/50 border-rose-500/40'
  },

  CITIZEN_SIMPLE: {
    id: 'CITIZEN_SIMPLE',
    nameKey: 'role_CITIZEN_SIMPLE',
    affiliation: 'CITIZEN',
    descriptionKey: 'شهروند ساده (رعیتی)؛ ستون وفادار شهر، بدون توانایی شب اما با قدرت تحلیل، چالش و رأی مؤثر در روز.',
    nightPriority: 0,
    iconName: 'User',
    teamColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    counterpartRoleId: 'MAFIA_SIMPLE',
    counterpartRoleName: 'مافیای ساده',
    recommendedBundleName: 'ستون‌های پایه شهر و تیم',
    acts: [
      {
        phase: 'DAY',
        title: 'استدلال، چالش و رأی‌گیری',
        description: 'با نطق‌های دقیق و تحلیل درگیری‌ها، مافیاهای پنهان را کشف و در دفاعیه رأی خروج می‌دهد.'
      }
    ],
    exceptions: ['اکت شبانه ندارد اما نقشی حیاتی در رأی‌گیری‌ها و وزن شهر ایفا می‌کند.'],
    matchups: [
      {
        targetRoleId: 'MAFIA_SIMPLE',
        targetRoleName: 'مافیای ساده',
        effect: 'تقابل کلامی در روز برای اثبات شهروندی.',
        interactionType: 'NEUTRAL'
      }
    ]
  },

  DOCTOR: {
    id: 'DOCTOR',
    nameKey: 'role_DOCTOR',
    affiliation: 'CITIZEN',
    descriptionKey: 'دکتر شهر (پزشک)؛ هر شب یک نفر را از شلیک مرگبار مافیا نجات می‌دهد و خود را نیز محدود نجات می‌دهد.',
    nightPriority: 3,
    iconName: 'HeartPulse',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    recommendedBundleName: 'پای ثابت تمامی سناریوها (ناجی شهر)',
    acts: [
      {
        phase: 'NIGHT',
        title: 'نجات شهروندان (سیو شب)',
        description: 'یک بازیکن را نشان می‌دهد؛ اگر همان شب مافیا به او شلیک کرده باشد، زنده می‌ماند.',
        priorityOrder: 3
      }
    ],
    exceptions: ['معمولاً خود را در طول بازی ۱ یا ۲ بار می‌تواند نجات دهد.'],
    matchups: [
      {
        targetRoleId: 'GODFATHER',
        targetRoleName: 'پدرخوانده',
        effect: 'سیو موفق دکتر، شات شب پدرخوانده را بی‌اثر می‌کند.',
        interactionType: 'POSITIVE'
      },
      {
        targetRoleId: 'SNIPER',
        targetRoleName: 'تک‌تیرانداز',
        effect: 'اگر اسنایپر اشتباهی به شهروند شلیک کند و دکتر او را سیو کند، فایربک رخ نمی‌دهد.',
        interactionType: 'POSITIVE'
      }
    ]
  },

  DOCTOR_WATSON: {
    id: 'DOCTOR_WATSON',
    nameKey: 'role_DOCTOR_WATSON',
    affiliation: 'CITIZEN',
    descriptionKey: 'دکتر واتسون؛ پزشک اختصاصی سناریوی پدرخوانده که شلیک‌های معمولی و لئون را نجات می‌دهد اما حس ششم را نه.',
    nightPriority: 3,
    iconName: 'Stethoscope',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'ZODIAC',
    counterpartRoleName: 'زودیاک',
    recommendedBundleName: 'پزشکی و نجات هوشمند'
  },

  DETECTIVE: {
    id: 'DETECTIVE',
    nameKey: 'role_DETECTIVE',
    affiliation: 'CITIZEN',
    descriptionKey: 'کارآگاه شهر؛ هر شب استعلام هویت یک بازیکن را از گرداننده می‌گیرد (مافیا = مثبت، شهروند = منفی).',
    nightPriority: 4,
    iconName: 'Search',
    teamColor: 'text-sky-400 bg-sky-950/50 border-sky-500/40',
    recommendedBundleName: 'پای ثابت تمامی سناریوها (کاشف هویت)',
    acts: [
      {
        phase: 'NIGHT',
        title: 'استعلام شبانه',
        description: 'به یک بازیکن اشاره می‌کند؛ گرداننده با تکان دادن سر یا لایک/دیس‌لایک ساید او را می‌گوید.',
        priorityOrder: 4
      }
    ],
    exceptions: ['استعلام پدرخوانده همیشه منفی (شهروند) است.'],
    matchups: [
      {
        targetRoleId: 'GODFATHER',
        targetRoleName: 'پدرخوانده',
        effect: 'استعلام پدرخوانده جواب منفی می‌دهد و فریبنده است.',
        interactionType: 'NEGATIVE'
      },
      {
        targetRoleId: 'MAFIA_SIMPLE',
        targetRoleName: 'مافیای ساده',
        effect: 'استعلام مثبت شده و هویت مافیا برای کارآگاه آشکار می‌شود.',
        interactionType: 'POSITIVE'
      }
    ]
  },

  SNIPER: {
    id: 'SNIPER',
    nameKey: 'role_SNIPER',
    affiliation: 'CITIZEN',
    descriptionKey: 'تک‌تیرانداز (اسنایپر / لئون حرفه‌ای)؛ شلیک شبانه به مافیا. در صورت شلیک به شهروند، خودش کشته می‌شود (فایربک).',
    nightPriority: 2,
    iconName: 'Crosshair',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'MATADOR',
    counterpartRoleName: 'ماتادور مافیا',
    recommendedBundleName: 'شلیک شب و خنثی‌سازی (اسنایپر ⚔️ ماتادور)',
    acts: [
      {
        phase: 'NIGHT',
        title: 'شلیک تک‌تیرانداز',
        description: 'یک بازیکن را نشانه می‌رود؛ اگر مافیا باشد کشته می‌شود، اگر شهروند باشد خود اسنایپر می‌میرد.',
        priorityOrder: 2
      }
    ],
    exceptions: ['تعداد تیرهای او در طول بازی محدود (معمولاً ۲ تیر) است.'],
    matchups: [
      {
        targetRoleId: 'MATADOR',
        targetRoleName: 'ماتادور',
        effect: 'ماتادور می‌تواند تیر شب اسنایپر را بسوزاند و مسدود کند.',
        interactionType: 'NEGATIVE'
      },
      {
        targetRoleId: 'DOCTOR_LECTER',
        targetRoleName: 'دکتر لکتر',
        effect: 'اگر لکتر هدف را سیو کرده باشد تیر اسنایپر بی‌اثر می‌شود.',
        interactionType: 'NEGATIVE'
      },
      {
        targetRoleId: 'CITIZEN_SIMPLE',
        targetRoleName: 'شهروند ساده',
        effect: 'شلیک به شهروند منجر به مرگ اسنایپر بر اثر عذاب وجدان می‌شود.',
        interactionType: 'LETHAL'
      }
    ]
  },

  ARMORED: {
    id: 'ARMORED',
    nameKey: 'role_ARMORED',
    affiliation: 'CITIZEN',
    descriptionKey: 'شهروند زره‌پوش (رویین‌تن)؛ دارای زره محافظ در برابر اولین شلیک شب و یک‌بار نجات از رای‌گیری روز.',
    nightPriority: 0,
    hasNightShield: true,
    iconName: 'Shield',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'SHAH_KOSH',
    counterpartRoleName: 'شاه‌کش مافیا',
    recommendedBundleName: 'زره فولادی و تیر زره‌شکاف (زره‌پوش ⚔️ شاه‌کش)',
    acts: [
      {
        phase: 'PASSIVE',
        title: 'زره محافظ',
        description: 'اولین شلیک شب مافیا زره او را می‌اندازد اما زنده می‌ماند.'
      }
    ]
  },

  MAYOR: {
    id: 'MAYOR',
    nameKey: 'role_MAYOR',
    affiliation: 'CITIZEN',
    descriptionKey: 'شهردار؛ یک‌بار در طول بازی می‌تواند رأی‌گیری دفاعیه روز را وتو و ملغی اعلام کند یا رأی مستقیم بدهد.',
    nightPriority: 0,
    iconName: 'Landmark',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'JUDGE',
    counterpartRoleName: 'قاضی دادگاه',
    recommendedBundleName: 'وتوی دفاعیه و حکم دادگاه (شهردار ⚔️ قاضی)',
    acts: [
      {
        phase: 'DAY',
        title: 'حق وتوی شهردار',
        description: 'در انتهای دفاعیه، کارت وتوی خود را اعلام می‌کند تا خروج ملغی شود.'
      }
    ]
  },

  PSYCHOLOGIST: {
    id: 'PSYCHOLOGIST',
    nameKey: 'role_PSYCHOLOGIST',
    affiliation: 'CITIZEN',
    descriptionKey: 'روانشناس (روانپزشک)؛ درمان‌کننده سکوت و سایلنت ناتاشا، یا استعلام‌گیرنده کلامی در طول روز.',
    nightPriority: 3,
    iconName: 'Brain',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'NATASHA',
    counterpartRoleName: 'ناتاشا (سایلنسر)',
    recommendedBundleName: 'سکوت کلامی و روان‌درمانی (روانشناس ⚔️ ناتاشا)'
  },

  DIE_HARD: {
    id: 'DIE_HARD',
    nameKey: 'role_DIE_HARD',
    affiliation: 'CITIZEN',
    descriptionKey: 'جان‌سخت؛ ۲ جان در برابر شلیک شب مافیا دارد و در شب می‌تواند استعلام گورستان و نقش‌های خارج شده را بگیرد.',
    nightPriority: 4,
    hasNightShield: true,
    iconName: 'ShieldCheck',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'SHAH_KOSH',
    counterpartRoleName: 'شاه‌کش مافیا',
    recommendedBundleName: 'استعلام گورستان و ترور شاه‌کش'
  },

  GUNNER: {
    id: 'GUNNER',
    nameKey: 'role_GUNNER',
    affiliation: 'CITIZEN',
    descriptionKey: 'تفنگدار؛ دارای تفنگ‌های جنگی و مشقی که در شب به شهروندان اهدا می‌کند تا در روز شلیک کنند.',
    nightPriority: 3,
    iconName: 'Crosshair',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'GUNSMITH',
    counterpartRoleName: 'اسلحه‌ساز مافیا',
    recommendedBundleName: 'توزیع اسلحه و تجهیز (تفنگدار ⚔️ اسلحه‌ساز)'
  },

  RANGER: {
    id: 'RANGER',
    nameKey: 'role_RANGER',
    affiliation: 'CITIZEN',
    descriptionKey: 'تکاور (رنجر)؛ اگر در شب هدف شلیک مافیا قرار گیرد، بیدار شده و می‌تواند به یکی از مافیاها تیراندازی کند.',
    nightPriority: 2,
    iconName: 'Award',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'NATO',
    counterpartRoleName: 'ناتو مافیا',
    recommendedBundleName: 'پاتک شب و حدس نقش (تکاور ⚔️ ناتو)'
  },

  INQUISITOR: {
    id: 'INQUISITOR',
    nameKey: 'role_INQUISITOR',
    affiliation: 'CITIZEN',
    descriptionKey: 'بازپرس؛ می‌تواند در شب هویت و گناهکار بودن بازیکنان را در دادگاه بازجویی کند.',
    nightPriority: 4,
    iconName: 'Scale',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'SHAH_KOSH',
    counterpartRoleName: 'شاه‌کش مافیا',
    recommendedBundleName: 'بازجویی دادگاه و ترور شاه‌کش'
  },

  CONSTANTINE: {
    id: 'CONSTANTINE',
    nameKey: 'role_CONSTANTINE',
    affiliation: 'CITIZEN',
    descriptionKey: 'کنستانتین (احیاگر شهر)؛ یک‌بار در بازی می‌تواند یکی از اخراج‌شدگان لورفته‌نبوده را به بازی برگرداند.',
    nightPriority: 5,
    iconName: 'Sparkles',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'NOSTRADAMUS',
    counterpartRoleName: 'نوستراداموس (پیشگو)',
    recommendedBundleName: 'احیای مردگان و پیشگویی (کنستانتین ⚔️ نوستراداموس)'
  },

  PRIEST: {
    id: 'PRIEST',
    nameKey: 'role_PRIEST',
    affiliation: 'CITIZEN',
    descriptionKey: 'کشیش؛ پاکسازی‌کننده اثرات ساقی، ناتاشا و سم، و بازگرداننده تقدس و سلامت بازیکنان.',
    nightPriority: 3,
    iconName: 'BookOpen',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
  },

  JUDGE: {
    id: 'JUDGE',
    nameKey: 'role_JUDGE',
    affiliation: 'CITIZEN',
    descriptionKey: 'قاضی دادگاه؛ در فاز رای‌گیری روز می‌تواند حکم مستقیم اخراج یا تبرئه نهایی یک متهم را صادر کند.',
    nightPriority: 0,
    iconName: 'Gavel',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'MAYOR',
    counterpartRoleName: 'شهردار شهر',
    recommendedBundleName: 'حکم دادگاه و وتو (قاضی ⚔️ شهردار)'
  },

  SACRIFICE: {
    id: 'SACRIFICE',
    nameKey: 'role_SACRIFICE',
    affiliation: 'CITIZEN',
    descriptionKey: 'فدایی؛ در روز می‌تواند خود را فدای یک شهروند در آستانه اعدام کند و به جای او خارج شود.',
    nightPriority: 0,
    iconName: 'HeartHandshake',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'TERRORIST',
    counterpartRoleName: 'تروریست مافیا',
    recommendedBundleName: 'سپر انسانی و انتحار (فدایی ⚔️ تروریست)'
  },

  CITIZEN_KANE: {
    id: 'CITIZEN_KANE',
    nameKey: 'role_CITIZEN_KANE',
    affiliation: 'CITIZEN',
    descriptionKey: 'همشهری کین؛ یک‌بار در کل بازی یک نفر را تحقیق می‌کند. اگر مافیا باشد صبح لو می‌رود و کین شب بعد می‌میرد.',
    nightPriority: 4,
    iconName: 'Newspaper',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'JOKER',
    counterpartRoleName: 'جوکر (مستقل)',
    recommendedBundleName: 'افشای مافیا و فریب اعدام (همشهری کین ⚔️ جوکر)'
  },

  GUARD: {
    id: 'GUARD',
    nameKey: 'role_GUARD',
    affiliation: 'CITIZEN',
    descriptionKey: 'نگهبان / محافظ؛ هر شب از یک بازیکن در برابر ترور، دزدی یا بلاک شدن محافظت کامل به عمل می‌آورد.',
    nightPriority: 2,
    iconName: 'ShieldAlert',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'ZODIAC',
    counterpartRoleName: 'زودیاک (قاتل شبگرد)',
    recommendedBundleName: 'محافظت شب و قاتل شبگرد (گارد ⚔️ زودیاک)'
  },

  JOURNALIST: {
    id: 'JOURNALIST',
    nameKey: 'role_JOURNALIST',
    affiliation: 'CITIZEN',
    descriptionKey: 'خبرنگار؛ بعد از وقوع مذاکره، یک‌بار استعلام می‌گیرد تا بفهمد کدام شهروند با مافیا مذاکره شده است.',
    nightPriority: 4,
    iconName: 'FileText',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'NEGOTIATOR',
    counterpartRoleName: 'مذاکره‌کننده مافیا',
    recommendedBundleName: 'کشف هویت و مذاکره (خبرنگار ⚔️ مذاکره‌کننده)'
  },

  GUNSMITH: {
    id: 'GUNSMITH',
    nameKey: 'role_GUNSMITH',
    affiliation: 'CITIZEN',
    descriptionKey: 'گان‌اسمیت (اسلحه‌ساز)؛ هر شب می‌تواند به یک بازیکن تفنگ جنگی بدهد تا در روز شلیک کند.',
    nightPriority: 3,
    iconName: 'Wrench',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'GUNNER',
    counterpartRoleName: 'تفنگدار شهر',
    recommendedBundleName: 'ساخت و شلیک اسلحه (اسلحه‌ساز ⚔️ تفنگدار)'
  },

  SCIENTIST: {
    id: 'SCIENTIST',
    nameKey: 'role_SCIENTIST',
    affiliation: 'CITIZEN',
    descriptionKey: 'دانشمند شهر؛ ساخت واکسن و پادزهر در برابر سموم و شات‌های بیولوژیکی مافیا.',
    nightPriority: 3,
    iconName: 'Microscope',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'DENTIST',
    counterpartRoleName: 'دنتیست (مستقل)',
    recommendedBundleName: 'مهندسی بیولوژیک و دنتیست'
  },

  GRAVEDIGGER: {
    id: 'GRAVEDIGGER',
    nameKey: 'role_GRAVEDIGGER',
    affiliation: 'CITIZEN',
    descriptionKey: 'گورکن؛ نبش قبر و اعلام نقش‌ها و ساید بازیکنان خارج شده از بازی برای روشن شدن شهر.',
    nightPriority: 4,
    iconName: 'Archive',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
  },

  BRIDESMAID: {
    id: 'BRIDESMAID',
    nameKey: 'role_BRIDESMAID',
    affiliation: 'CITIZEN',
    descriptionKey: 'ساقدوش؛ محافظت اختصاصی از عروس/نقش کلیدی و لینک شدن با شهروندان امن.',
    nightPriority: 2,
    iconName: 'Users',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
  },

  KNIGHT: {
    id: 'KNIGHT',
    nameKey: 'role_KNIGHT',
    affiliation: 'CITIZEN',
    descriptionKey: 'شوالیه؛ دارای شیلد دفاعی سنگین در برابر شات‌های پیاپی مافیا در سناریوی متخصص.',
    nightPriority: 1,
    iconName: 'Shield',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
  },

  HERO: {
    id: 'HERO',
    nameKey: 'role_HERO',
    affiliation: 'CITIZEN',
    descriptionKey: 'قهرمان؛ هر دو شب یک‌بار یک بازیکن را به مدت ۲۴ ساعت کاملاً در برابر هر خطری بیمه می‌کند.',
    nightPriority: 2,
    iconName: 'Flame',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
  },

  COWBOY: {
    id: 'COWBOY',
    nameKey: 'role_COWBOY',
    affiliation: 'CITIZEN',
    descriptionKey: 'کابوی؛ قبل از رای‌گیری می‌تواند اعلام حضور کند و متهمان را مورد دوئل قرار دهد.',
    nightPriority: 0,
    iconName: 'Compass',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
  },

  FREEMASON: {
    id: 'FREEMASON',
    nameKey: 'role_FREEMASON',
    affiliation: 'CITIZEN',
    descriptionKey: 'فراماسون؛ هر شب یک بازیکن را به تیم ماسونی بیدار می‌کند تا شهروندان همدیگر را بشناسند.',
    nightPriority: 4,
    iconName: 'Eye',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
  },

  BARTENDER: {
    id: 'BARTENDER',
    nameKey: 'role_BARTENDER',
    affiliation: 'CITIZEN',
    descriptionKey: 'ساقی (ساغی / کافه‌چی)؛ هر شب به یک نفر نوشیدنی می‌دهد؛ اگر به مافیا بدهد شات او مست و بی‌اثر می‌شود.',
    nightPriority: 2,
    iconName: 'Wine',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'PSYCHOLOGIST',
    counterpartRoleName: 'روانشناس شهر',
    recommendedBundleName: 'مستی و روان‌درمانی (ساقی ⚔️ روانشناس)'
  },

  THIEF: {
    id: 'THIEF',
    nameKey: 'role_THIEF',
    affiliation: 'CITIZEN',
    descriptionKey: 'دست‌کج (دزد)؛ شبانه قابلیت یا کارت یکی از بازیکنان را برای یک شب می‌دزدد و خودش استفاده می‌کند.',
    nightPriority: 2,
    iconName: 'Scissors',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
    counterpartRoleId: 'GUNNER',
    counterpartRoleName: 'تفنگدار شهر',
    recommendedBundleName: 'سرقت اسلحه و تیراندازی'
  },

  HUNTER: {
    id: 'HUNTER',
    nameKey: 'role_HUNTER',
    affiliation: 'CITIZEN',
    descriptionKey: 'شکارچی؛ هنگام مرگ (در شب یا روز) آخرین تیر خود را شلیک کرده و یک نفر را همراه خود می‌کشد.',
    nightPriority: 2,
    iconName: 'Crosshair',
    teamColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
  },

  JOKER: {
    id: 'JOKER',
    nameKey: 'role_JOKER',
    affiliation: 'INDEPENDENT',
    descriptionKey: 'جوکر (مستقل)؛ هدف او اعدام شدن در رأی‌گیری روز توسط شهر است. با اعدام شدن پیروز تکی بازی می‌شود.',
    nightPriority: 0,
    iconName: 'Smile',
    teamColor: 'text-amber-400 bg-amber-950/50 border-amber-500/40',
    counterpartRoleId: 'CITIZEN_KANE',
    counterpartRoleName: 'همشهری کین',
    recommendedBundleName: 'افشای مافیا و فریب اعدام (جوکر ⚔️ همشهری کین)',
    acts: [
      {
        phase: 'DAY',
        title: 'تلاش برای اعدام در روز',
        description: 'با رفتارهای مشکوک و فریب شهر، سعی می‌کند بیشترین رأی خروج را به خود اختصاص دهد.'
      }
    ]
  },

  NOSTRADAMUS: {
    id: 'NOSTRADAMUS',
    nameKey: 'role_NOSTRADAMUS',
    affiliation: 'INDEPENDENT',
    descriptionKey: 'نوستراداموس (پیشگو / مستقل)؛ شب معارفه ۳ نفر را استعلام می‌گیرد؛ بسته به تعداد مافیاها ساید خود را انتخاب می‌کند.',
    nightPriority: 1,
    hasNightShield: true,
    iconName: 'Sparkles',
    teamColor: 'text-amber-400 bg-amber-950/50 border-amber-500/40',
    counterpartRoleId: 'CONSTANTINE',
    counterpartRoleName: 'کنستانتین (احیاگر)',
    recommendedBundleName: 'پیشگویی و احیای مردگان (نوستراداموس ⚔️ کنستانتین)'
  },

  ZODIAC: {
    id: 'ZODIAC',
    nameKey: 'role_ZODIAC',
    affiliation: 'INDEPENDENT',
    descriptionKey: 'زودیاک (قاتل زنجیره‌ای / مستقل)؛ شب‌های زوج شلیک مرگبار دارد و دارای زره در برابر تیر اول است. به تنهایی بازی می‌کند.',
    nightPriority: 2,
    hasNightShield: true,
    iconName: 'Skull',
    teamColor: 'text-amber-400 bg-amber-950/50 border-amber-500/40',
    counterpartRoleId: 'GUARD',
    counterpartRoleName: 'محافظ شهر',
    recommendedBundleName: 'قاتل شبگرد و محافظ شهر (زودیاک ⚔️ گارد)'
  },

  WEREWOLF: {
    id: 'WEREWOLF',
    nameKey: 'role_WEREWOLF',
    affiliation: 'INDEPENDENT',
    descriptionKey: 'گرگینه (مستقل)؛ شب‌های ماه کامل بیدار شده و به تنهایی قربانی می‌گیرد و استعلام او منفی است.',
    nightPriority: 2,
    iconName: 'Moon',
    teamColor: 'text-amber-400 bg-amber-950/50 border-amber-500/40'
  },

  JACK_SPARROW: {
    id: 'JACK_SPARROW',
    nameKey: 'role_JACK_SPARROW',
    affiliation: 'INDEPENDENT',
    descriptionKey: 'جک اسپارو (دزد دریایی / مستقل)؛ هر شب می‌تواند به کشتی یک بازیکن رفته و طلسم یا کارت او را برباید.',
    nightPriority: 3,
    iconName: 'Compass',
    teamColor: 'text-amber-400 bg-amber-950/50 border-amber-500/40'
  },

  DENTIST: {
    id: 'DENTIST',
    nameKey: 'role_DENTIST',
    affiliation: 'INDEPENDENT',
    descriptionKey: 'دنتیست (مستقل)؛ شب‌های فرد یک شهروند و شب‌های زوج یک مافیا معرفی می‌کند تا به شرط برد برسد.',
    nightPriority: 2,
    hasNightShield: true,
    iconName: 'Activity',
    teamColor: 'text-amber-400 bg-amber-950/50 border-amber-500/40',
    counterpartRoleId: 'SCIENTIST',
    counterpartRoleName: 'دانشمند / متخصص',
    recommendedBundleName: 'دنتیست و مهندسی بیولوژیک'
  },

  CUSTOM: {
    id: 'CUSTOM',
    nameKey: 'role_CUSTOM',
    affiliation: 'CITIZEN',
    descriptionKey: 'نقش سفارشی با توانایی‌ها و قوانین تعریف‌شده توسط گرداننده بازی.',
    nightPriority: 8,
    iconName: 'HelpCircle',
    teamColor: 'text-zinc-300 bg-zinc-900 border-zinc-700',
    acts: [],
    exceptions: ['قوانین این نقش به صورت شفاهی توسط گرداننده تعیین می‌شود.']
  }
};

/**
 * Smart Search Aliases Dictionary for Iranian Mafia Roles
 */
export const ROLE_SEARCH_ALIASES: Record<string, string[]> = {
  GODFATHER: ['پدرخوانده', 'دن', 'دون', 'دن کورلئونه', 'گادفادر', 'رئیس مافیا', 'حس ششم', 'جلیقه', 'gf', 'pf', 'godfather', 'don'],
  MAFIA_SIMPLE: ['مافیا', 'مافیای ساده', 'عضو مافیا', 'یار مافیا', 'ساده مافیا', 'ms', 'mafia'],
  DOCTOR_LECTER: ['دکتر لکتر', 'لکتر', 'پزشک مافیا', 'دکتر مافیا', 'سیو مافیا', 'lecter', 'dr_lecter'],
  MATADOR: ['ماتادور', 'بلاکر', 'خنثی کننده', 'بلاک', 'تروریست شب', 'matador', 'mt'],
  SAUL_GOODMAN: ['ساول', 'ساول گودمن', 'ساول‌گودمن', 'خریدار', 'وکیل', 'وکیل مافیا', 'saul', 'sg'],
  NATASHA: ['ناتاشا', 'سایلنسر', 'سکوت', 'سکوت دهنده', 'لال', 'natasha', 'ns', 'silencer'],
  TERRORIST: ['تروریست', 'انتحاری', 'ترور', 'بمب', 'terrorist', 'tr'],
  SHAH_KOSH: ['شاه کش', 'شاه‌کش', 'اسسین', 'قاتل شاه', 'shah_kosh'],
  NEGOTIATOR: ['مذاکره', 'مذاکره کننده', 'مذاکره‌کننده', 'negotiator', 'mk'],
  NATO: ['ناتو', 'حدس نقش', 'nato', 'nt'],
  HOSTAGE_TAKER: ['گروگان گیر', 'گروگان‌گیر', 'گروگان', 'hostage', 'gg'],
  SWEETHEART: ['معشوقه', 'لیدی', 'لیدی مافیا', 'sweetheart'],
  POISONER: ['سم', 'سم ساز', 'سم‌ساز', 'پویزنر', 'poisoner'],
  HACKER: ['هکر', 'نفوذی', 'hacker'],
  CHURCHILL: ['چرچیل', 'churchill', 'ch'],
  DEXTER: ['دکستر', 'دیفیوز', 'dexter', 'dx'],
  LOBBYIST: ['لابی', 'لابی من', 'لابی‌من', 'lobbyist'],
  SPY: ['جاسوس', 'spy'],
  STRONG_MAN: ['مرد قوی', 'تیر قوی', 'strong_man'],
  MAFIA_GANGSTER: ['گنگستر', 'gangster', 'gn'],
  CITIZEN_SIMPLE: ['شهروند', 'شهروند ساده', 'رعیتی', 'شهروند عادی', 'ساده', 'sh', 'citizen'],
  DOCTOR: ['دکتر', 'پزشک', 'دکتر شهر', 'سیو', 'درمان', 'dr', 'doctor', 'pz'],
  DOCTOR_WATSON: ['واتسون', 'دکتر واتسون', 'watson', 'dv'],
  DETECTIVE: ['کارآگاه', 'کاراگاه', 'استعلام', 'dt', 'detective'],
  SNIPER: ['اسنایپر', 'تک تیرانداز', 'تک‌تیرانداز', 'لئون', 'لئون حرفه‌ای', 'حرفه‌ای', 'شات', 'sniper', 'sn', 'le'],
  ARMORED: ['زره', 'زره پوش', 'زره‌پوش', 'رویین تن', 'رویین‌تن', 'armored', 'zp', 'rt'],
  MAYOR: ['شهردار', 'وتو', 'mayor', 'shd'],
  PSYCHOLOGIST: ['روانشناس', 'روانپزشک', 'روان شناس', 'psychologist', 'psy'],
  DIE_HARD: ['جان سخت', 'جان‌سخت', 'گورستان', 'استعلام گورستان', 'die_hard', 'dh'],
  GUNNER: ['تفنگدار', 'گانر', 'تفنگ جنگی', 'تفنگ مشقی', 'gunner', 'tf'],
  RANGER: ['تکاور', 'رنجر', 'تکاور شهر', 'ranger', 'tk', 'rg'],
  INQUISITOR: ['بازپرس', 'دادگاه', 'بازجویی', 'inquisitor', 'bp'],
  CONSTANTINE: ['کنستانتین', 'احیاگر', 'بازگشت', 'constantine', 'ko'],
  PRIEST: ['کشیش', 'پاکسازی', 'priest', 'ks'],
  JUDGE: ['قاضی', 'حکم', 'دادگاه', 'judge', 'qz'],
  SACRIFICE: ['فدایی', 'فداکار', 'سپر', 'sacrifice', 'fd'],
  CITIZEN_KANE: ['همشهری کین', 'کین', 'citizen_kane', 'ck'],
  GUARD: ['نگهبان', 'محافظ', 'guard', 'ng', 'mh'],
  JOURNALIST: ['خبرنگار', 'استعلام مذاکره', 'journalist', 'kh'],
  GUNSMITH: ['گان اسمیت', 'گان‌اسمیت', 'اسلحه ساز', 'gunsmith', 'gs'],
  SCIENTIST: ['دانشمند', 'واکسن', 'scientist'],
  GRAVEDIGGER: ['گورکن', 'نبش قبر', 'gravedigger'],
  BRIDESMAID: ['ساقدوش', 'bridesmaid'],
  KNIGHT: ['شوالیه', 'knight', 'kn'],
  HERO: ['قهرمان', 'بیمه', 'hero'],
  COWBOY: ['کابوی', 'cowboy'],
  FREEMASON: ['فراماسون', 'ماسون', 'freemason'],
  BARTENDER: ['ساقی', 'ساغی', 'کافه چی', 'نوشیدنی', 'bartender', 'sq'],
  THIEF: ['دست کج', 'دست‌کج', 'دزد', 'thief'],
  HUNTER: ['شکارچی', 'hunter'],
  JOKER: ['جوکر', 'اعدام', 'مستقل جوکر', 'joker', 'jk'],
  NOSTRADAMUS: ['نوستراداموس', 'پیشگو', 'پیشگویی', 'نوسترا', 'nostradamus', 'no'],
  ZODIAC: ['زودیاک', 'قاتل', 'قاتل زنجیره‌ای', 'شب‌های مافیا زودیاک', 'zodiac', 'zd'],
  WEREWOLF: ['گرگینه', 'گرگ', 'ماه کامل', 'werewolf'],
  JACK_SPARROW: ['جک اسپارو', 'دزد دریایی', 'jack_sparrow'],
  DENTIST: ['دنتیست', 'دندانپزشک', 'دیس لایک', 'dentist', 'dn']
};

/**
 * 17 Comprehensive Ready-made Presets with Recommended Player Counts
 */
export const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: 'classic-9',
    name: 'کلاسیک استاندارد (۹ نفره - یک‌سوم مافیا)',
    description: '۳ مافیا (پدرخوانده، دکتر لکتر، مافیا ساده) + ۶ شهروند (دکتر، کارآگاه، اسنایپر، زره‌پوش، ۲ شهروند ساده) با نسبت دقیق یک‌سوم مافیا',
    recommendedPlayerCount: 9,
    tag: 'استاندارد',
    difficulty: 'ساده',
    roles: [
      'GODFATHER',
      'DOCTOR_LECTER',
      'MAFIA_SIMPLE',
      'DOCTOR',
      'DETECTIVE',
      'SNIPER',
      'ARMORED',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'classic-10',
    name: 'کلاسیک شب‌های مافیا (۱۰ نفره)',
    description: '۳ مافیا (پدرخوانده، دکتر لکتر، مافیا ساده) + ۷ شهروند (دکتر، کارآگاه، اسنایپر، زره‌پوش، ۳ شهروند ساده)',
    recommendedPlayerCount: 10,
    tag: 'محبوب‌ترین',
    difficulty: 'ساده',
    roles: [
      'GODFATHER',
      'DOCTOR_LECTER',
      'MAFIA_SIMPLE',
      'DOCTOR',
      'DETECTIVE',
      'SNIPER',
      'ARMORED',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'godfather-11',
    name: 'پدرخوانده و نوستراداموس (۱۱ نفره)',
    description: '۳ مافیا (پدرخوانده، ساول‌گودمن، ماتادور) + ۱ مستقل (نوستراداموس) + ۷ شهروند (دکتر واتسون، لئون حرفه‌ای، همشهری کین، کنستانتین، ۳ شهروند ساده)',
    recommendedPlayerCount: 11,
    tag: 'تلویزیونی',
    difficulty: 'متوسط',
    roles: [
      'GODFATHER',
      'SAUL_GOODMAN',
      'MATADOR',
      'NOSTRADAMUS',
      'DOCTOR_WATSON',
      'SNIPER',
      'CITIZEN_KANE',
      'CONSTANTINE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'zodiac-12',
    name: 'شب‌های مافیا زودیاک (۱۲ نفره)',
    description: '۳ مافیا (آل کاپون، بمب‌گذار، شعبده‌باز) + ۱ مستقل (زودیاک) + ۸ شهروند (دکتر، کارآگاه، تفنگدار، محافظ، دانشمند، ۳ شهروند ساده)',
    recommendedPlayerCount: 12,
    tag: 'هیجانی',
    difficulty: 'متوسط',
    roles: [
      'GODFATHER',
      'TERRORIST',
      'MATADOR',
      'ZODIAC',
      'DOCTOR',
      'DETECTIVE',
      'GUNNER',
      'GUARD',
      'SCIENTIST',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'bazpors-10',
    name: 'بازپرس و دادگاه شهر (۱۰ نفره)',
    description: '۳ مافیا (پدرخوانده، شاه‌کش، مافیا ساده) + ۷ شهروند (بازپرس، دکتر، کارآگاه، اسنایپر، شهردار، ۲ شهروند ساده)',
    recommendedPlayerCount: 10,
    tag: 'حرفه‌ای',
    difficulty: 'متوسط',
    roles: [
      'GODFATHER',
      'SHAH_KOSH',
      'MAFIA_SIMPLE',
      'INQUISITOR',
      'DOCTOR',
      'DETECTIVE',
      'SNIPER',
      'MAYOR',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'tekavar-12',
    name: 'تکاور و ناتو (۱۲ نفره)',
    description: '۴ مافیا (رئیس مافیا، ناتو، گروگانگیر، مافیا ساده) + ۸ شهروند (تکاور، تفنگدار، نگهبان، پزشک، کارآگاه، ۳ شهروند ساده)',
    recommendedPlayerCount: 12,
    tag: 'تاکتیکی',
    difficulty: 'متوسط',
    roles: [
      'GODFATHER',
      'NATO',
      'HOSTAGE_TAKER',
      'MAFIA_SIMPLE',
      'RANGER',
      'GUNNER',
      'GUARD',
      'DOCTOR',
      'DETECTIVE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'tnt-11',
    name: 'تی‌ان‌تی و بمب‌گذار (۱۱ نفره)',
    description: '۳ مافیا (پدرخوانده، تروریست بمب‌گذار، معشوقه) + ۸ شهروند (دکتر، کارآگاه، تک‌تیرانداز، قاضی، فدایی، ۳ شهروند ساده)',
    recommendedPlayerCount: 11,
    tag: 'انفجاری',
    difficulty: 'متوسط',
    roles: [
      'GODFATHER',
      'TERRORIST',
      'SWEETHEART',
      'DOCTOR',
      'DETECTIVE',
      'SNIPER',
      'JUDGE',
      'SACRIFICE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'arteshe-seri-11',
    name: 'ارتش سری و گشتاپو (۱۱ نفره)',
    description: '۳ مافیا (گشتاپو، سرهنگ، جاسوس) + ۸ شهروند (نجات‌دهنده، فرمانده، تکاور، کشیش، ۴ شهروند مبارز)',
    recommendedPlayerCount: 11,
    tag: 'معمایی',
    difficulty: 'سنگین',
    roles: [
      'GODFATHER',
      'SPY',
      'MAFIA_SIMPLE',
      'DOCTOR',
      'DETECTIVE',
      'RANGER',
      'PRIEST',
      'ARMORED',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'constantine-12',
    name: 'کنستانتین و واکسیناتور (۱۲ نفره)',
    description: '۴ مافیا (پدرخوانده، دکتر لکتر، سم‌ساز، مافیا) + ۸ شهروند (کنستانتین، دانشمند، دکتر، کارآگاه، اسنایپر، ۳ شهروند)',
    recommendedPlayerCount: 12,
    tag: 'احیا و نجات',
    difficulty: 'متوسط',
    roles: [
      'GODFATHER',
      'DOCTOR_LECTER',
      'POISONER',
      'MAFIA_SIMPLE',
      'CONSTANTINE',
      'SCIENTIST',
      'DOCTOR',
      'DETECTIVE',
      'SNIPER',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'negotiation-10',
    name: 'مذاکره و خبرنگار (۱۰ نفره)',
    description: '۳ مافیا (رئیس مافیا، مذاکره‌کننده، مافیا ساده) + ۷ شهروند (خبرنگار، پزشک، کارآگاه، اسنایپر، زره‌پوش، ۲ شهروند ساده)',
    recommendedPlayerCount: 10,
    tag: 'کلاسیک پیشرفته',
    difficulty: 'متوسط',
    roles: [
      'GODFATHER',
      'NEGOTIATOR',
      'MAFIA_SIMPLE',
      'JOURNALIST',
      'DOCTOR',
      'DETECTIVE',
      'SNIPER',
      'ARMORED',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'dentist-12',
    name: 'دنتیست و محافظ (۱۲ نفره)',
    description: '۳ مافیا (گادفادر، چرچیل، دکستر) + ۱ مستقل (دنتیست) + ۸ شهروند (پزشک، کارآگاه، اسنایپر، محافظ، اسلحه‌ساز، ۳ شهروند)',
    recommendedPlayerCount: 12,
    tag: 'سه سایده',
    difficulty: 'سنگین',
    roles: [
      'GODFATHER',
      'CHURCHILL',
      'DEXTER',
      'DENTIST',
      'DOCTOR',
      'DETECTIVE',
      'SNIPER',
      'GUARD',
      'GUNSMITH',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'motekhasses-12',
    name: 'متخصص و لابی‌من (۱۲ نفره)',
    description: '۴ مافیا (گادفادر، لابی‌من، جادوگر، مافیا) + ۸ شهروند (متخصص، رنجر، شوالیه، افسر، ۴ شهروند ساده)',
    recommendedPlayerCount: 12,
    tag: 'استراتژیک',
    difficulty: 'سنگین',
    roles: [
      'GODFATHER',
      'LOBBYIST',
      'MAFIA_SIMPLE',
      'MAFIA_SIMPLE',
      'DOCTOR',
      'RANGER',
      'KNIGHT',
      'INQUISITOR',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'saqi-12',
    name: 'ساقی و رویین‌تن (۱۲ نفره)',
    description: '۴ مافیا (پدرخوانده، ناتاشا، تروریست، گنگستر) + ۸ شهروند (ساقی، کشیش، قاضی، فدایی، رویین‌تن، تفنگدار، ۲ شهروند ساده)',
    recommendedPlayerCount: 12,
    tag: 'هیجان بالا',
    difficulty: 'متوسط',
    roles: [
      'GODFATHER',
      'NATASHA',
      'TERRORIST',
      'MAFIA_GANGSTER',
      'BARTENDER',
      'PRIEST',
      'JUDGE',
      'SACRIFICE',
      'ARMORED',
      'GUNNER',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'scam-12',
    name: 'اسکام و کلیم آزاد (۱۲ نفره)',
    description: '۳ مافیا (رئیس، خرابکار، مافیا) + ۹ شهروند (اسنایپر بی‌رحم، تفنگدار، پزشک، کارآگاه، ۵ شهروند ساده با حق ادعای نقش)',
    recommendedPlayerCount: 12,
    tag: 'کلیم آزاد',
    difficulty: 'سنگین',
    roles: [
      'GODFATHER',
      'TERRORIST',
      'MAFIA_SIMPLE',
      'SNIPER',
      'GUNNER',
      'DOCTOR',
      'DETECTIVE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'gorgan-14',
    name: 'گرگینه و پیشگو (۱۴ نفره)',
    description: '۴ مافیا (پدرخوانده، لکتر، ماتادور، مافیا) + ۱ مستقل (گرگینه) + ۹ شهروند (پیشگو، شکارچی، دکتر، کارآگاه، اسنایپر، شهردار، ۳ شهروند)',
    recommendedPlayerCount: 14,
    tag: 'فانتزی و تاریک',
    difficulty: 'متوسط',
    roles: [
      'GODFATHER',
      'DOCTOR_LECTER',
      'MATADOR',
      'MAFIA_SIMPLE',
      'WEREWOLF',
      'NOSTRADAMUS',
      'HUNTER',
      'DOCTOR',
      'DETECTIVE',
      'SNIPER',
      'MAYOR',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'roosi-16',
    name: 'مافیا روسی و فینال (۱۶ نفره)',
    description: '۵ مافیا (پدرخوانده، لکتر، ناتاشا، ساول، تروریست) + ۱۱ شهروند (دکتر، کارآگاه، تک‌تیرانداز، جان‌سخت، شهردار، روانشناس، تفنگدار، ۴ شهروند ساده)',
    recommendedPlayerCount: 16,
    tag: 'فینال و حرفه‌ای',
    difficulty: 'سنگین',
    roles: [
      'GODFATHER',
      'DOCTOR_LECTER',
      'NATASHA',
      'SAUL_GOODMAN',
      'TERRORIST',
      'DOCTOR',
      'DETECTIVE',
      'SNIPER',
      'DIE_HARD',
      'MAYOR',
      'PSYCHOLOGIST',
      'GUNNER',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'tournament-18',
    name: 'تورنمنت بزرگ ۱۸ نفره (۱۸ نفره)',
    description: '۵ مافیا + ۱ مستقل (جوکر) + ۱۲ شهروند (دکتر، کارآگاه، اسنایپر، زره‌پوش، جان‌سخت، شهردار، روانپزشک، ۵ شهروند ساده)',
    recommendedPlayerCount: 18,
    tag: 'تورنمنت رسمی',
    difficulty: 'سنگین',
    roles: [
      'GODFATHER',
      'DOCTOR_LECTER',
      'NATASHA',
      'TERRORIST',
      'MAFIA_SIMPLE',
      'JOKER',
      'DOCTOR',
      'DETECTIVE',
      'SNIPER',
      'ARMORED',
      'DIE_HARD',
      'MAYOR',
      'PSYCHOLOGIST',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'quick-compact-6',
    name: 'دوئل و مسابقه سریع (۶ نفره)',
    description: '۲ مافیا (پدرخوانده، مافیا ساده) + ۴ شهروند (دکتر، کارآگاه، ۲ شهروند ساده)',
    recommendedPlayerCount: 6,
    tag: 'سریع و جمع‌وجور',
    difficulty: 'ساده',
    roles: [
      'GODFATHER',
      'MAFIA_SIMPLE',
      'DOCTOR',
      'DETECTIVE',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE'
    ]
  },
  {
    id: 'chaos-joker-10',
    name: 'آشوب جوکر و تروریست (۱۰ نفره)',
    description: '۳ مافیا (پدرخوانده، تروریست، لکتر) + ۶ شهروند (دکتر، کارآگاه، شهردار، اسنایپر، ۲ شهروند) + ۱ مستقل (جوکر)',
    recommendedPlayerCount: 10,
    tag: 'هرج‌ومرج',
    difficulty: 'متوسط',
    roles: [
      'GODFATHER',
      'DOCTOR_LECTER',
      'TERRORIST',
      'DOCTOR',
      'DETECTIVE',
      'SNIPER',
      'MAYOR',
      'CITIZEN_SIMPLE',
      'CITIZEN_SIMPLE',
      'JOKER'
    ]
  }
];

export const ROLE_BUNDLES: RoleBundle[] = [
  {
    id: 'bundle-sniper-matador',
    name: 'شلیک شب و خنثی‌سازی (اسنایپر ⚔️ ماتادور)',
    description: 'تک‌تیرانداز شهر 🎯 در برابر ماتادور مافیا 🛡️. چالش مسدودسازی شات شب و شناسایی ماتادور.',
    category: 'DUEL',
    roles: ['SNIPER', 'MATADOR'],
    tag: 'شلیک شب / خنثی‌سازی',
    icon: '🎯'
  },
  {
    id: 'bundle-terror-sacrifice',
    name: 'انفجار انتحاری و فداکاری (تروریست ⚔️ فدایی)',
    description: 'تروریست مافیا 💣 در هنگام خروج روز می‌تواند یک نفر را منفجر کند؛ فدایی 🤝 جان خود را سپر نجات می‌کند.',
    category: 'DUEL',
    roles: ['TERRORIST', 'SACRIFICE'],
    tag: 'دفاعیه و فداکاری',
    icon: '💣'
  },
  {
    id: 'bundle-armor-assassin',
    name: 'زره فولادی و تیر زره‌شکاف (زره‌پوش ⚔️ شاه‌کش)',
    description: 'زره‌پوش رویین‌تن 🛡️ با دو بار جان در برابر حدس نقش دقیق شاه‌کش (اسسین) مافیا 🏹.',
    category: 'BALANCE',
    roles: ['ARMORED', 'SHAH_KOSH'],
    tag: 'زره و حدس نقش',
    icon: '🛡️'
  },
  {
    id: 'bundle-negotiation-press',
    name: 'مذاکره مافیایی و افشاگری (مذاکره‌کننده ⚔️ خبرنگار)',
    description: 'مذاکره‌کننده مافیا 🤝 به دنبال جذب شهروند ساده؛ خبرنگار 📰 به دنبال استعلام و کشف مذاکره‌شده.',
    category: 'ADVANCED',
    roles: ['NEGOTIATOR', 'JOURNALIST'],
    tag: 'تغییر جبهه / افشاگری',
    icon: '🤝'
  },
  {
    id: 'bundle-silence-therapy',
    name: 'سکوت شبانه و روان‌درمانی (ناتاشا ⚔️ روانشناس)',
    description: 'ناتاشا (سایلنسر) 🤐 بازیکنان را در روز لال می‌کند؛ روانشناس 🧠 اثر سکوت را با درمان کلامی برطرف می‌سازد.',
    category: 'BALANCE',
    roles: ['NATASHA', 'PSYCHOLOGIST'],
    tag: 'سکوت و گفتمان',
    icon: '🧠'
  },
  {
    id: 'bundle-counterstrike-nato',
    name: 'پاتک شبانه و حدس نقش (تکاور ⚔️ ناتو)',
    description: 'ناتوی مافیا 🎯 نقش شهروندان را حدس می‌زند؛ تکاور 🎖️ در صورت تیر خوردن پاتک زده و تیراندازی می‌کند.',
    category: 'DUEL',
    roles: ['NATO', 'RANGER'],
    tag: 'تاکتیکی / شلیک متقابل',
    icon: '🎖️'
  },
  {
    id: 'bundle-law-mayor-judge',
    name: 'حکم دادگاه و حق وتو (شهردار ⚔️ قاضی)',
    description: 'شهردار 🏛️ با کارت وتوی دفاعیه در برابر حکم مستقیم قاضی دادگاه ⚖️ در رأی‌گیری روز.',
    category: 'CHAOS',
    roles: ['MAYOR', 'JUDGE'],
    tag: 'دادگاه و سیاست',
    icon: '⚖️'
  },
  {
    id: 'bundle-gun-arms-dealer',
    name: 'تجهیز و توزیع اسلحه (تفنگدار ⚔️ اسلحه‌ساز)',
    description: 'تفنگدار شهر 🔫 و اسلحه‌ساز (گان‌اسمیت) 🔧؛ توزیع تیر جنگی و مشقی بین شهروندان برای شلیک در فاز روز.',
    category: 'ADVANCED',
    roles: ['GUNNER', 'GUNSMITH'],
    tag: 'توزیع سلاح روزانه',
    icon: '🔫'
  },
  {
    id: 'bundle-prophecy-revival',
    name: 'پیشگویی و احیای مردگان (نوستراداموس ⚔️ کنستانتین)',
    description: 'نوستراداموس 🔮 ساید خود را بعد از معارفه انتخاب می‌کند؛ کنستانتین ✨ یک یار از گور برگشته را احیا می‌کند.',
    category: 'ADVANCED',
    roles: ['NOSTRADAMUS', 'CONSTANTINE'],
    tag: 'فرا-سناریویی / احیا',
    icon: '✨'
  },
  {
    id: 'bundle-zodiac-shield',
    name: 'قاتل شبگرد و حلقه محافظت (زودیاک ⚔️ محافظ/گارد)',
    description: 'زودیاک 💀 (قاتل مستقل شب‌های زوج) در برابر محافظ شهر 🛡️ که جلوی هرگونه شلیک و آسیب را می‌گیرد.',
    category: 'CHAOS',
    roles: ['ZODIAC', 'GUARD'],
    tag: 'مستقل / شلیک شب‌های زوج',
    icon: '💀'
  },
  {
    id: 'bundle-buyout-exposer',
    name: 'خریداری و افشای مافیا (ساول گودمن ⚔️ همشهری کین)',
    description: 'ساول گودمن 💼 شهروند ساده را برای مافیا می‌خرد؛ همشهری کین 🗞️ با فدا کردن خود هویت مافیا را رسوا می‌کند.',
    category: 'DUEL',
    roles: ['SAUL_GOODMAN', 'CITIZEN_KANE'],
    tag: 'جاسوسی و خرید',
    icon: '💼'
  },
  {
    id: 'bundle-joker-chaos',
    name: 'هرج‌ومرج و اعدام فریبنده (جوکر ⚔️ کابوی)',
    description: 'جوکر 🃏 تلاش می‌کند با سوءظن اعدام شود و ببرد؛ کابوی 🤠 با دوئل مستقیم او را قبل از اعدام آزمون می‌کند.',
    category: 'CHAOS',
    roles: ['JOKER', 'COWBOY'],
    tag: 'هرج‌ومرج و فریب',
    icon: '🃏'
  },
  {
    id: 'bundle-bartender-priest',
    name: 'مستی شبانه و تقدس پاکسازی (ساقی ⚔️ کشیش)',
    description: 'ساقی 🍷 شلیک شب مافیا یا توانایی شهروند را مست و باطل می‌کند؛ کشیش 📖 آلودگی‌ها و سموم را تطهیر می‌کند.',
    category: 'BALANCE',
    roles: ['BARTENDER', 'PRIEST'],
    tag: 'مستی و تطهیر',
    icon: '🍷'
  },
  {
    id: 'bundle-inquest-graveyard',
    name: 'بازجویی رسمی و نبش قبر (بازپرس ⚔️ گورکن)',
    description: 'بازپرس 🔍 در دادگاه رسمی اعتراف می‌گیرد؛ گورکن ⚰️ نقش‌های کشته‌شدگان را از گورستان آشکار می‌سازد.',
    category: 'ADVANCED',
    roles: ['INQUISITOR', 'GRAVEDIGGER'],
    tag: 'کشف هویت و دادگاه',
    icon: '⚰️'
  }
];

export const AVATAR_LIST = [
  '🕵️‍♂️', '🕵️‍♀️', '🎩', '👑', '🕶️', '🍷', '🔫', '🩺', '💉', '🛡️', 
  '🔍', '⚖️', '🎭', '🐺', '🦊', '🦉', '💼', '🃏', '💣', '✨'
];

/**
 * Local Storage Persistence for Custom Scenarios
 */
const CUSTOM_SCENARIOS_STORAGE_KEY = 'mafia_custom_scenarios_v1';

export function loadCustomScenarios(): Scenario[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SCENARIOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load custom scenarios from localStorage:', err);
    return [];
  }
}

export function saveCustomScenario(scenario: Scenario): Scenario[] {
  try {
    const existing = loadCustomScenarios();
    const index = existing.findIndex(s => s.id === scenario.id);
    let updated: Scenario[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...scenario, isCustom: true };
    } else {
      updated = [{ ...scenario, isCustom: true }, ...existing];
    }
    localStorage.setItem(CUSTOM_SCENARIOS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save custom scenario to localStorage:', err);
    return loadCustomScenarios();
  }
}

export function deleteCustomScenario(scenarioId: string): Scenario[] {
  try {
    const existing = loadCustomScenarios();
    const updated = existing.filter(s => s.id !== scenarioId);
    localStorage.setItem(CUSTOM_SCENARIOS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete custom scenario from localStorage:', err);
    return loadCustomScenarios();
  }
}

export function getAllScenarios(): Scenario[] {
  const custom = loadCustomScenarios();
  return [...custom, ...DEFAULT_SCENARIOS];
}

export function getScenarioById(id: string): Scenario | undefined {
  const all = getAllScenarios();
  return all.find(s => s.id === id) || DEFAULT_SCENARIOS[0];
}

/**
 * Roles that can have multiple copies in the same scenario.
 * All other roles are strictly UNIQUE (maximum 1 per game).
 */
export const MULTI_INSTANCE_ROLE_IDS = new Set<string>([
  'CITIZEN_SIMPLE',
  'MAFIA_SIMPLE',
  'CUSTOM'
]);

/**
 * Validates a custom or preset scenario for competitive integrity and rule compatibility.
 * Checks for duplicate unique roles, team balance, and minimum player count.
 */
export function validateScenario(
  deckOrRoles: (RoleId | DeckRoleItem)[],
  playerCount?: number
): ScenarioValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const duplicateUniqueRoles: string[] = [];

  // Normalize input into items
  const items: { roleId: RoleId; customName?: string; customAffiliation?: string }[] = deckOrRoles.map(item => {
    if (typeof item === 'string') {
      return { roleId: item };
    }
    return {
      roleId: item.roleId,
      customName: item.customName,
      customAffiliation: item.customAffiliation
    };
  });

  const total = items.length;
  let mafia = 0;
  let citizen = 0;
  let independent = 0;

  // Track occurrences of each unique role
  const roleOccurrences = new Map<string, number>();

  items.forEach(card => {
    const roleId = card.roleId;
    const def = ROLE_DEFINITIONS[roleId];
    const affiliation = card.customAffiliation || def?.affiliation || 'CITIZEN';

    if (affiliation === 'MAFIA') mafia++;
    else if (affiliation === 'INDEPENDENT') independent++;
    else citizen++;

    // Track unique role constraint
    const identityKey = card.customName ? `CUSTOM:${card.customName}` : roleId;
    const currentCount = (roleOccurrences.get(identityKey) || 0) + 1;
    roleOccurrences.set(identityKey, currentCount);

    if (currentCount > 1 && !MULTI_INSTANCE_ROLE_IDS.has(roleId)) {
      if (!duplicateUniqueRoles.includes(identityKey)) {
        duplicateUniqueRoles.push(identityKey);
      }
    }
  });

  const recommendedMafia = Math.max(1, Math.floor(total / 3));

  // 1. Minimum total players check
  if (total < 5) {
    errors.push('تعداد بازیکنان سناریو حداقل باید ۵ نفر باشد (حداقل ۵ کارت نقش).');
  }

  // 2. Duplicate unique roles check (e.g. 2 Godfathers or 2 Doctors)
  if (duplicateUniqueRoles.length > 0) {
    duplicateUniqueRoles.forEach(key => {
      const def = ROLE_DEFINITIONS[key];
      const roleName = def ? (ROLE_NAMES_FA[key] || def.nameKey || key) : key;
      errors.push(`نقش «${roleName}» منحصر‌به‌فرد است و نمی‌تواند بیش از ۱ بار در یک سناریو تکرار شود.`);
    });
  }

  // 3. Mafia presence and dominance check
  if (mafia === 0 && total >= 5) {
    errors.push('تیم مافیا نمی‌تواند خالی باشد. حداقل ۱ نقش مافیا الزامی است.');
  }

  if (mafia >= citizen && total >= 5) {
    errors.push(`تعداد اعضای مافیا (${mafia} نفر) نمی‌تواند مساوی یا بیشتر از شهروندان (${citizen} نفر) باشد، زیرا مافیا در همان روز یا شب اول اکثریت را به دست می‌آورد.`);
  }

  // 4. Advisory warnings
  if (total >= 7 && !items.some(i => i.roleId === 'GODFATHER')) {
    warnings.push('تیم مافیا فاقد رهبر (پدرخوانده / گادفادر) است؛ پیشنهاد می‌شود یک پدرخوانده اضافه کنید.');
  }

  if (total >= 7 && !items.some(i => i.roleId === 'DOCTOR' || i.roleId === 'DOCTOR_WATSON')) {
    warnings.push('تیم شهروندان فاقد نقش درمانی (پزشک/دکتر) است.');
  }

  if (total >= 7 && !items.some(i => i.roleId === 'DETECTIVE' || i.roleId === 'INQUISITOR')) {
    warnings.push('تیم شهروندان فاقد نقش استعلامی (کارآگاه/بازپرس) است.');
  }

  if (playerCount && playerCount !== total) {
    warnings.push(`تعداد صندلی‌های لابی (${playerCount} نفر) با تعداد کارت‌های سناریو (${total} کارت) تطابق ندارد.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    roleCounts: {
      total,
      mafia,
      citizen,
      independent,
      recommendedMafia
    },
    duplicateUniqueRoles
  };
}

const ROLE_NAMES_FA: Record<string, string> = {
  GODFATHER: 'پدرخوانده',
  MAFIA_SIMPLE: 'مافیای ساده',
  DOCTOR_LECTER: 'دکتر لکتر',
  NATASHA: 'ناتاشا (سایلنسر)',
  TERRORIST: 'تروریست',
  MATADOR: 'ماتادور',
  SAUL_GOODMAN: 'ساول گودمن',
  SHAH_KOSH: 'شاه‌کش',
  SWEETHEART: 'معشوقه',
  NEGOTIATOR: 'مذاکره‌کننده',
  NATO: 'ناتو',
  HOSTAGE_TAKER: 'گروگان‌گیر',
  POISONER: 'سم‌ساز',
  CITIZEN_SIMPLE: 'شهروند ساده',
  DOCTOR: 'دکتر شهر',
  DOCTOR_WATSON: 'دکتر واتسون',
  DETECTIVE: 'کارآگاه',
  SNIPER: 'تک‌تیرانداز',
  ARMORED: 'شهروند زره‌پوش',
  MAYOR: 'شهردار',
  PSYCHOLOGIST: 'روانشناس',
  DIE_HARD: 'جان‌سخت',
  GUNNER: 'تفنگدار',
  RANGER: 'تکاور',
  INQUISITOR: 'بازپرس',
  CONSTANTINE: 'کنستانتین',
  PRIEST: 'کشیش',
  JUDGE: 'قاضی',
  SACRIFICE: 'فدایی',
  CITIZEN_KANE: 'همشهری کین',
  GUARD: 'نگهبان',
  JOURNALIST: 'خبرنگار',
  JOKER: 'جوکر',
  NOSTRADAMUS: 'نوستراداموس',
  ZODIAC: 'زودیاک',
  WEREWOLF: 'گرگ‌نما'
};

/**
 * Dynamically balances a scenario's role array to match ANY target player count (including odd numbers like 7, 9, 11, 13).
 * Guarantees that the resulting deck array has EXACTLY `targetPlayerCount` roles,
 * maintains competitive Mafia/Citizen balance (~1/3 mafia ratio), and preserves key unique roles.
 */
export function balanceScenarioRoles(
  scenarioRoles: RoleId[],
  targetPlayerCount: number,
  scenarioId?: string
): RoleId[] {
  if (targetPlayerCount <= 0) return [];

  const defaultStarterDeck: RoleId[] = [
    'GODFATHER', 'DOCTOR_LECTER', 'MAFIA_SIMPLE', 'NATASHA',
    'DOCTOR', 'DETECTIVE', 'SNIPER', 'ARMORED', 'MAYOR',
    'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE'
  ];

  // If scenarioRoles is empty or undefined, use default starter deck
  let sourceRoles: RoleId[] = (scenarioRoles && scenarioRoles.length > 0)
    ? [...scenarioRoles]
    : defaultStarterDeck.slice(0, targetPlayerCount);

  // Clean duplicate unique roles first
  const seenUnique = new Set<string>();
  const sanitizedRoles: RoleId[] = sourceRoles.map(role => {
    if (!MULTI_INSTANCE_ROLE_IDS.has(role)) {
      if (seenUnique.has(role)) {
        const def = ROLE_DEFINITIONS[role];
        return def?.affiliation === 'MAFIA' ? 'MAFIA_SIMPLE' : 'CITIZEN_SIMPLE';
      }
      seenUnique.add(role);
    }
    return role;
  });

  const result: RoleId[] = [...sanitizedRoles];
  const targetMafia = Math.max(1, Math.floor(targetPlayerCount / 3));

  // 1. If result has more cards than target count, reduce
  if (result.length > targetPlayerCount) {
    while (result.length > targetPlayerCount) {
      let currentMafia = 0;
      result.forEach(r => {
        if (ROLE_DEFINITIONS[r]?.affiliation === 'MAFIA') currentMafia++;
      });

      if (currentMafia > targetMafia) {
        // Remove simple mafia first
        const simpleMafiaIdx = result.lastIndexOf('MAFIA_SIMPLE');
        if (simpleMafiaIdx >= 0) {
          result.splice(simpleMafiaIdx, 1);
          continue;
        }
        // Remove non-Godfather mafia
        const nonGfMafiaIdx = result.findIndex(r => {
          return ROLE_DEFINITIONS[r]?.affiliation === 'MAFIA' && r !== 'GODFATHER';
        });
        if (nonGfMafiaIdx >= 0) {
          result.splice(nonGfMafiaIdx, 1);
          continue;
        }
      }

      // Remove simple citizen first
      const simpleCitIdx = result.lastIndexOf('CITIZEN_SIMPLE');
      if (simpleCitIdx >= 0) {
        result.splice(simpleCitIdx, 1);
        continue;
      }

      // Remove secondary citizen that is not Doctor or Detective
      const secondaryCitIdx = result.findIndex(r => {
        return ROLE_DEFINITIONS[r]?.affiliation === 'CITIZEN' && r !== 'DOCTOR' && r !== 'DETECTIVE';
      });
      if (secondaryCitIdx >= 0) {
        result.splice(secondaryCitIdx, 1);
        continue;
      }

      result.pop();
    }
  }

  // 2. If result has fewer cards than target count, expand
  if (result.length < targetPlayerCount) {
    while (result.length < targetPlayerCount) {
      let currentMafia = 0;
      result.forEach(r => {
        if (ROLE_DEFINITIONS[r]?.affiliation === 'MAFIA') currentMafia++;
      });

      if (currentMafia < targetMafia) {
        result.push('MAFIA_SIMPLE');
      } else {
        result.push('CITIZEN_SIMPLE');
      }
    }
  }

  // 3. Final verification: ensure exact mafia ratio even if length matched initially
  let finalMafia = 0;
  result.forEach(r => {
    if (ROLE_DEFINITIONS[r]?.affiliation === 'MAFIA') finalMafia++;
  });

  // Adjust if mafia count is off target
  if (finalMafia > targetMafia) {
    for (let i = result.length - 1; i >= 0 && finalMafia > targetMafia; i--) {
      if (ROLE_DEFINITIONS[result[i]]?.affiliation === 'MAFIA' && result[i] !== 'GODFATHER') {
        result[i] = 'CITIZEN_SIMPLE';
        finalMafia--;
      }
    }
  } else if (finalMafia < targetMafia) {
    for (let i = result.length - 1; i >= 0 && finalMafia < targetMafia; i--) {
      if (result[i] === 'CITIZEN_SIMPLE') {
        result[i] = 'MAFIA_SIMPLE';
        finalMafia++;
      }
    }
  }

  // Ensure presence of 1 Godfather and 1 Doctor
  if (!result.includes('GODFATHER')) {
    const firstMafiaIdx = result.findIndex(r => ROLE_DEFINITIONS[r]?.affiliation === 'MAFIA');
    if (firstMafiaIdx >= 0) {
      result[firstMafiaIdx] = 'GODFATHER';
    } else {
      result[0] = 'GODFATHER';
    }
  }

  if (targetPlayerCount >= 6 && !result.includes('DOCTOR') && !result.includes('DOCTOR_WATSON')) {
    const citIdx = result.findIndex(r => r === 'CITIZEN_SIMPLE');
    if (citIdx >= 0) {
      result[citIdx] = 'DOCTOR';
    }
  }

  return result.slice(0, targetPlayerCount);
}

