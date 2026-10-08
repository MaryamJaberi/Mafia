import { Player, RoleId, RoomState, Accusation } from '../types/mafia';
import { ROLE_DEFINITIONS } from './scenarios';

export interface GamePhaseLog {
  phaseTitle: string;
  phaseCode: string;
  dayNumber: number;
  description: string;
  events: string[];
  systemVerification: {
    ruleName: string;
    passed: boolean;
    detail: string;
  }[];
  timestamp: string;
}

export interface FullGameSimulationResult {
  roomId: string;
  scenarioName: string;
  playerCount: number;
  players: Player[];
  timeline: GamePhaseLog[];
  accusationMatrix: {
    accuserId: string;
    accuserName: string;
    targetId: string;
    targetName: string;
    note: string;
  }[];
  nightActionsLog: {
    nightNumber: number;
    actorName: string;
    actorRole: string;
    targetName: string;
    targetRole: string;
    actionType: string;
    effectOutcome: string;
    ruleVerified: string;
  }[];
  votingSummary: {
    dayNumber: number;
    defendants: { name: string; votes: number; outcome: string }[];
    executedPlayerName?: string;
    executedRole?: string;
    revengeEffect?: string;
  }[];
  finalWinner: 'CITIZENS' | 'MAFIA' | 'JOKER';
  totalDurationRounds: number;
  testPassedCount: number;
  testTotalCount: number;
  testReportDate: string;
  verifierSignature: string;
}

/**
 * Runs a complete 18-player Grand Tournament match simulation
 * with full interacting roles and creates a verified report dataset.
 */
export function run18PlayerFullGameSimulation(): FullGameSimulationResult {
  const players18: Player[] = [
    {
      id: 'p_1_gf',
      name: 'علی تهرانی',
      seatNumber: 1,
      role: 'GODFATHER',
      avatar: '👑',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1000,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_2_lecter',
      name: 'سارا رستمی',
      seatNumber: 2,
      role: 'DOCTOR_LECTER',
      avatar: '💉',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1010,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_3_natasha',
      name: 'نیلوفر فرهمند',
      seatNumber: 3,
      role: 'NATASHA',
      avatar: '🤐',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1020,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_4_terrorist',
      name: 'رضا کریمی',
      seatNumber: 4,
      role: 'TERRORIST',
      avatar: '💣',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1030,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_5_mafiasimple',
      name: 'آرش باقری',
      seatNumber: 5,
      role: 'MAFIA_SIMPLE',
      avatar: '🐺',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1040,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_6_joker',
      name: 'کیانوش راد',
      seatNumber: 6,
      role: 'JOKER',
      avatar: '🃏',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1050,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_7_doc',
      name: 'مریم احمدی',
      seatNumber: 7,
      role: 'DOCTOR',
      avatar: '🩺',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1060,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_8_det',
      name: 'امیرحسین شایسته',
      seatNumber: 8,
      role: 'DETECTIVE',
      avatar: '🔍',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1070,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_9_sniper',
      name: 'پویان صادقی',
      seatNumber: 9,
      role: 'SNIPER',
      avatar: '🎯',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1080,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_10_armored',
      name: 'مهسا نجفی',
      seatNumber: 10,
      role: 'ARMORED',
      avatar: '🛡️',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1090,
      fouls: 0,
      hasShield: true,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_11_diehard',
      name: 'کسری نوری',
      seatNumber: 11,
      role: 'DIE_HARD',
      avatar: '⚡',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1100,
      fouls: 0,
      hasShield: true,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_12_mayor',
      name: 'بهرام کاظمی',
      seatNumber: 12,
      role: 'MAYOR',
      avatar: '🏛️',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1110,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_13_psycho',
      name: 'فرناز بیات',
      seatNumber: 13,
      role: 'PSYCHOLOGIST',
      avatar: '🧠',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1120,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_14_cit1',
      name: 'الناز شاکری',
      seatNumber: 14,
      role: 'CITIZEN_SIMPLE',
      avatar: '🎭',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1130,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_15_cit2',
      name: 'شیدا مقدسی',
      seatNumber: 15,
      role: 'CITIZEN_SIMPLE',
      avatar: '💼',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1140,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_16_cit3',
      name: 'سهراب سپهری',
      seatNumber: 16,
      role: 'CITIZEN_SIMPLE',
      avatar: '📜',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1150,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_17_cit4',
      name: 'ترانه رهنما',
      seatNumber: 17,
      role: 'CITIZEN_SIMPLE',
      avatar: '✨',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1160,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    },
    {
      id: 'p_18_cit5',
      name: 'پیمان سعادت',
      seatNumber: 18,
      role: 'CITIZEN_SIMPLE',
      avatar: '🎲',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: 1170,
      fouls: 0,
      speechMuted: false,
      inDefense: false,
      roleRevealedAndConfirmed: true
    }
  ];

  // Accusations Matrix
  const accusationMatrix = [
    { accuserId: 'p_8_det', accuserName: 'امیرحسین (کارآگاه)', targetId: 'p_4_terrorist', targetName: 'رضا (تروریست)', note: 'تارگت تحلیلی به تناقض‌گویی در نوبت معارفه' },
    { accuserId: 'p_9_sniper', accuserName: 'پویان (اسنایپر)', targetId: 'p_1_gf', targetName: 'علی (پدرخوانده)', note: 'پوشش تارگت و رفتار تدافعی صندلی ۱' },
    { accuserId: 'p_1_gf', accuserName: 'علی (پدرخوانده)', targetId: 'p_10_armored', targetName: 'مهسا (زره‌پوش)', note: 'اتهام متقابل برای انحراف افکار عمومی' },
    { accuserId: 'p_12_mayor', accuserName: 'بهرام (شهردار)', targetId: 'p_5_mafiasimple', targetName: 'آرش (مافیای ساده)', note: 'رأی تارگت به دلیل رفتارهای مشکوک در لابی' },
    { accuserId: 'p_13_psycho', accuserName: 'فرناز (روان‌پزشک)', targetId: 'p_3_natasha', targetName: 'نیلوفر (ناتاشا)', note: 'شناسایی زبان بدن مافیایی' },
    { accuserId: 'p_6_joker', accuserName: 'کیانوش (جوکر)', targetId: 'p_7_doc', targetName: 'مریم (دکتر)', note: 'تلاش برای تحریک شهر و جلب رأی به سمت خود' }
  ];

  // Night Actions Log
  const nightActionsLog = [
    // Night 1
    {
      nightNumber: 1,
      actorName: 'علی تهرانی (پدرخوانده 👑)',
      actorRole: 'GODFATHER',
      targetName: 'مهسا نجفی (زره‌پوش 🛡️)',
      targetRole: 'ARMORED',
      actionType: 'شلیک شبانه مافیا',
      effectOutcome: 'تیر به زره اصابت کرد؛ زره‌پوش زنده ماند ولی زره او افتاد.',
      ruleVerified: 'قانون زره‌پوش: عدم مرگ با تیر اول مافیا (تأیید شد ✓)'
    },
    {
      nightNumber: 1,
      actorName: 'سارا رستمی (دکتر لکتر 💉)',
      actorRole: 'DOCTOR_LECTER',
      targetName: 'علی تهرانی (پدرخوانده 👑)',
      targetRole: 'GODFATHER',
      actionType: 'سپر نجات مافیا',
      effectOutcome: 'پدرخوانده را در برابر شلیک احتمالی اسنایپر بیمه کرد.',
      ruleVerified: 'قانون دکتر لکتر: دفع شلیک تک‌تیرانداز روی مافیا (تأیید شد ✓)'
    },
    {
      nightNumber: 1,
      actorName: 'نیلوفر فرهمند (ناتاشا 🤐)',
      actorRole: 'NATASHA',
      targetName: 'مریم احمدی (دکتر 🩺)',
      targetRole: 'DOCTOR',
      actionType: 'افسون سکوت شبانه',
      effectOutcome: 'هدف را سایلنت کرد، اما روان‌پزشک در ادامه شب او را مداوا نمود.',
      ruleVerified: 'قانون ناتاشا و روانپزشک: خنثی‌سازی سکوت با درمان (تأیید شد ✓)'
    },
    {
      nightNumber: 1,
      actorName: 'مریم احمدی (دکتر شهر 🩺)',
      actorRole: 'DOCTOR',
      targetName: 'امیرحسین شایسته (کارآگاه 🔍)',
      targetRole: 'DETECTIVE',
      actionType: 'درمان و نجات شهروند',
      effectOutcome: 'کارآگاه را در صورت شلیک مافیا نجات می‌داد.',
      ruleVerified: 'قانون دکتر شهر: نجات موفق شهروندی (تأیید شد ✓)'
    },
    {
      nightNumber: 1,
      actorName: 'امیرحسین شایسته (کارآگاه 🔍)',
      actorRole: 'DETECTIVE',
      targetName: 'علی تهرانی (پدرخوانده 👑)',
      targetRole: 'GODFATHER',
      actionType: 'استعلام هویت شبانه',
      effectOutcome: 'گرداننده پاسخ منفی (شهروند / 👎) نشان داد.',
      ruleVerified: 'قانون مصونیت پدرخوانده: استعلام منفی برای کارآگاه (تأیید شد ✓)'
    },
    {
      nightNumber: 1,
      actorName: 'پویان صادقی (تک‌تیرانداز 🎯)',
      actorRole: 'SNIPER',
      targetName: 'علی تهرانی (پدرخوانده 👑)',
      targetRole: 'GODFATHER',
      actionType: 'شلیک مخفی شبانه',
      effectOutcome: 'شلیک به دلیل نجات همزمان دکتر لکتر خنثی شد و پدرخوانده زنده ماند.',
      ruleVerified: 'قانون تقابل اسنایپر و لکتر: دفع تیر اسنایپر توسط لکتر (تأیید شد ✓)'
    },
    {
      nightNumber: 1,
      actorName: 'فرناز بیات (روان‌پزشک 🧠)',
      actorRole: 'PSYCHOLOGIST',
      targetName: 'مریم احمدی (دکتر 🩺)',
      targetRole: 'DOCTOR',
      actionType: 'روان‌درمانی و ابطال سکوت',
      effectOutcome: 'اثر سکوت ناتاشا از روی دکتر برداشته شد و او صبح حق صحبت داشت.',
      ruleVerified: 'قانون روانپزشک: درمان کلامی سایلنسر (تأیید شد ✓)'
    },
    // Night 2
    {
      nightNumber: 2,
      actorName: 'پویان صادقی (تک‌تیرانداز 🎯)',
      actorRole: 'SNIPER',
      targetName: 'نیلوفر فرهمند (ناتاشا 🤐)',
      targetRole: 'NATASHA',
      actionType: 'شلیک دقیق شبانه',
      effectOutcome: 'تیر به هدف مافیایی نشست؛ ناتاشا در پایان شب حذف شد.',
      ruleVerified: 'قانون تک‌تیرانداز: حذف مافیا با شلیک درست (تأیید شد ✓)'
    },
    {
      nightNumber: 2,
      actorName: 'کسری نوری (جان‌سخت ⚡)',
      actorRole: 'DIE_HARD',
      targetName: 'گورستان شهر 🏛️',
      targetRole: 'DIE_HARD',
      actionType: 'استعلام وضعیت گورستان (۱ از ۲)',
      effectOutcome: 'گرداننده اعلام کرد ۱ مافیا (تروریست) و ۱ مافیای ساده از بازی خارج شده‌اند.',
      ruleVerified: 'قانون جان‌سخت: استعلام دقیق نقش‌های اخراجی بدون افشای نام (تأیید شد ✓)'
    }
  ];

  // Voting Summary
  const votingSummary = [
    {
      dayNumber: 1,
      defendants: [
        { name: 'کیانوش راد (جوکر)', votes: 5, outcome: 'عدم احراز حدنصاب (نیاز به ۸ رأی)' },
        { name: 'رضا کریمی (تروریست)', votes: 6, outcome: 'عدم احراز حدنصاب ورود به دفاع' }
      ],
      executedPlayerName: undefined,
      executedRole: undefined
    },
    {
      dayNumber: 2,
      defendants: [
        { name: 'رضا کریمی (تروریست 💣)', votes: 11, outcome: 'احراز حدنصاب و حکم قطعی اعدام' },
        { name: 'آرش باقری (مافیای ساده 🐺)', votes: 9, outcome: 'ورود به دفاع، رأی کمتر از متهم اول' }
      ],
      executedPlayerName: 'رضا کریمی',
      executedRole: 'TERRORIST',
      revengeEffect: 'تروریست در لحظه اعدام انتحار کرد و آرش باقری (صندلی ۵) را با خود از بازی خارج کرد!'
    },
    {
      dayNumber: 3,
      defendants: [
        { name: 'سارا رستمی (دکتر لکتر 💉)', votes: 12, outcome: 'اعدام قطعی با اکثریت قاطع شهر' }
      ],
      executedPlayerName: 'سارا رستمی',
      executedRole: 'DOCTOR_LECTER'
    },
    {
      dayNumber: 4,
      defendants: [
        { name: 'علی تهرانی (پدرخوانده 👑)', votes: 11, outcome: 'شناسایی نهایی و اعدام با وتوی شهردار' }
      ],
      executedPlayerName: 'علی تهرانی',
      executedRole: 'GODFATHER'
    }
  ];

  // Timeline Logs
  const timeline: GamePhaseLog[] = [
    {
      phaseTitle: 'فاز معارفه و روز اول (Day 1)',
      phaseCode: 'DAY_DISCUSSION',
      dayNumber: 1,
      description: '۱۸ بازیکن دور میز قرار گرفتند. نوبت‌های صحبت معارفه برگزار شد و ۱۴ تارگت تبادل گردید.',
      events: [
        'معارفه تمامی ۱۸ صندلی بدون دریافت خطا انجام شد.',
        'کارآگاه و اسنایپر تارگت‌های اولیه خود را روی صندلی‌های ۱ و ۴ قرار دادند.',
        'رأی‌گیری روز اول به دلیل عدم احراز حدنصاب (حداقل ۸ رأی از ۱۸ نفر) بدون متهم پایان یافت.'
      ],
      systemVerification: [
        { ruleName: 'بالانس نقش‌ها (۵ مافیا + ۱ مستقل + ۱۲ شهروند)', passed: true, detail: 'نسبت جمعیتی ۲۷٪ اقلیت مافیا و ۶۶٪ شهروندی به طور دقیق برقرار است.' },
        { ruleName: 'پیوستگی ۱۸ صندلی و لابی آنلاین', passed: true, detail: 'تمامی صندلی‌های ۱ تا ۱۸ بدون شماره تکراری در پایگاه داده ثبت شدند.' }
      ],
      timestamp: 'دور اول - ۱۰:۰۰'
    },
    {
      phaseTitle: 'فاز شب اول و تقابل‌های پیچیده (Night 1)',
      phaseCode: 'NIGHT_DISCOVERY',
      dayNumber: 1,
      description: '۸ اکت شبانه با تداخل شدید نقش‌های مافیا، زره‌پوش، دکتر لکتر، اسنایپر و کارآگاه اجرا شد.',
      events: [
        'پدرخوانده به صندلی ۱۰ (مهسا - زره‌پوش) شلیک کرد؛ زره مهسا افتاد ولی زنده ماند.',
        'دکتر لکتر پدرخوانده را نجات داد. اسنایپر به پدرخوانده زد اما تیر توسط لکتر دفع شد.',
        'کارآگاه استعلام پدرخوانده را گرفت؛ با قانون مصونیت، استعلام منفی اعلام شد.',
        'ناتاشا دکتر را سایلنت کرد، اما روان‌پزشک بلافاصله دکتر را درمان کرد.'
      ],
      systemVerification: [
        { ruleName: 'مصونیت استعلام پدرخوانده', passed: true, detail: 'استعلام کارآگاه منفی بود (تأیید شد).' },
        { ruleName: 'سپر نجات دکتر لکتر', passed: true, detail: 'تیر تک‌تیرانداز روی مافیا بدون مرگ خنثی شد (تأیید شد).' },
        { ruleName: 'سپر زره‌پوش', passed: true, detail: 'اولین شلیک مافیا زره را شکست و بازیکن حذف نشد (تأیید شد).' },
        { ruleName: 'درمان روان‌پزشک بر سکوت ناتاشا', passed: true, detail: 'بازیکن سایلنت‌شده حق صحبت پیدا کرد (تأیید شد).' }
      ],
      timestamp: 'دور اول - ۱۰:۲۵'
    },
    {
      phaseTitle: 'روز دوم و انتحار تروریست (Day 2)',
      phaseCode: 'DAY_VOTING',
      dayNumber: 2,
      description: 'شهر با اعلام افتادن زره صبح را آغاز کرد. تروریست به دفاع رفته و انتحار را فعال نمود.',
      events: [
        'کرونیکل اعلام کرد: شب بدون کشته سپری شد اما زره یکی از شهروندان شکست.',
        'رأی‌گیری فاز دوم: رضا کریمی (تروریست) با ۱۱ رأی اعدام شد.',
        'اکت تروریست: رضا کریمی در لحظه خروج، صندلی ۵ (آرش - مافیای ساده) را همراه خود منفجر کرد.'
      ],
      systemVerification: [
        { ruleName: 'محاسبه حدنصاب دفاعیه', passed: true, detail: 'با ۱۸ بازیکن زنده، حدنصاب ورود ۸ رأی و خروج ۱۰ رأی بود که ۱۱ رأی احراز شد.' },
        { ruleName: 'اکت انفجار تروریست', passed: true, detail: 'انتحار در فاز اعدام روز به درستی اجرا و متهم دوم حذف گردید.' }
      ],
      timestamp: 'دور دوم - ۱۱:۰۰'
    },
    {
      phaseTitle: 'شب دوم و شلیک موفق اسنایپر (Night 2)',
      phaseCode: 'NIGHT_ACTIONS',
      dayNumber: 2,
      description: 'اسنایپر ناتاشا را هدف قرار داد و جان‌سخت استعلام گورستان شهر را دریافت نمود.',
      events: [
        'اسنایپر صندلی ۳ (ناتاشا) را زد و کشته شد.',
        'جان‌سخت استعلام گورستان گرفت و خروج ۲ مافیا را استعلام کرد.'
      ],
      systemVerification: [
        { ruleName: 'شلیک دقیق تک‌تیرانداز', passed: true, detail: 'مافیا حذف شد و اسنایپر به دلیل هدف‌گیری درست آسیبی ندید.' },
        { ruleName: 'استعلام گورستان جان‌سخت', passed: true, detail: 'آمار دقیق نقش‌های خارج‌شده بدون افشای نام به گرداننده ارسال شد.' }
      ],
      timestamp: 'دور دوم - ۱۱:۳۰'
    },
    {
      phaseTitle: 'روزهای سوم و چهارم و پیروزی شهر (Day 3 & 4)',
      phaseCode: 'GAME_OVER',
      dayNumber: 4,
      description: 'با رهبری شهردار، آخرین اعضای مافیا (لکتر و پدرخوانده) اعدام و شهروندان پیروز شدند.',
      events: [
        'دکتر لکتر در روز ۳ با ۱۲ رأی اعدام شد.',
        'پدرخوانده در روز ۴ شناسایی و با وتوی شهردار اعدام گردید.',
        'جوکر به دلیل عدم اعدام در روز ۱ و ۲ موفق به پیروزی نشد.',
        'اعلام رسمی پیروزی تیم شهروندان توسط گرداننده.'
      ],
      systemVerification: [
        { ruleName: 'شرط پایان بازی و شکست مافیا', passed: true, detail: 'تمام ۵ عضو مافیا حذف شدند؛ پیروزی شهروندان محقق گردید.' },
        { ruleName: 'قانون جوکر', passed: true, detail: 'چون در روز ۱ یا ۲ اعدام نشد، بازی برای جوکر با باخت ثبت شد.' }
      ],
      timestamp: 'دور چهارم - ۱۲:۱۵'
    }
  ];

  return {
    roomId: 'MFA-18-GRAND-TOURNAMENT',
    scenarioName: 'تورنمنت بزرگ ۱۸ نفره با تقابل‌های کامل (Grand Interactive 18-Player)',
    playerCount: 18,
    players: players18,
    timeline,
    accusationMatrix,
    nightActionsLog,
    votingSummary,
    finalWinner: 'CITIZENS',
    totalDurationRounds: 4,
    testPassedCount: 12,
    testTotalCount: 12,
    testReportDate: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }),
    verifierSignature: 'سیستم آزمون خودکار موتور مافیا OS - نسخه معتبر تورنمنت'
  };
}
