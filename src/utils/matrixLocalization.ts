import { Language } from '../types/mafia';
import { 
  MatrixScenario, MatrixRole, GeneralRole, LastMoveCard, 
  GeneralRuleSection, OtherScenario, RAW_SCENARIOS, 
  GENERAL_ROLES, LAST_MOVE_CARDS, GENERAL_RULES, OTHER_SCENARIOS,
  pair
} from '../data/matrixData';

export interface LocalizedScenarioMeta {
  name: string;
  players: string;
  notes?: string;
  warn?: string;
}

export const SCENARIO_NAMES_I18N: Record<string, Record<Language, LocalizedScenarioMeta>> = {
  classic: {
    fa: {
      name: 'کلاسیک',
      players: '۷ تا ۱۲ نفر',
      notes: 'ساده‌ترین سناریو؛ عالی برای شروع و آشنایی بازیکن‌های تازه‌کار.'
    },
    en: {
      name: 'Classic Mafia',
      players: '7 to 12 Players',
      notes: 'Standard starter scenario; perfect for beginners and casual groups.'
    },
    ar: {
      name: 'المافيا الكلاسيكية',
      players: 'من 7 إلى 12 لاعباً',
      notes: 'السيناريو الأبسط؛ مثالي للمبتدئين وللتعرف على أصول اللعبة.'
    },
    tr: {
      name: 'Klasik Mafya',
      players: '7 - 12 Oyuncu',
      notes: 'En temel senaryo; yeni başlayanlar ve standart oyunlar için ideal.'
    }
  },
  godfather: {
    fa: {
      name: 'پدرخوانده / نوستراداموس',
      players: '۱۰ تا ۱۲ نفر (نسخه تلویزیونی: ۱۱ نفر = ۷ شهروند + ۳ مافیا + ۱ نوستراداموس)',
      warn: 'پدرخواندهٔ این سناریو با «گادفادر» سناریوی متخصص دو نقش کاملاً جدا از دو سناریوی متفاوت هستند.'
    },
    en: {
      name: 'Godfather & Nostradamus',
      players: '10 to 12 Players (TV Edition: 11 Players = 7 Town + 3 Mafia + 1 Nostradamus)',
      warn: 'The Godfather in this scenario has Sixth Sense and special psychic rules distinct from other variants.'
    },
    ar: {
      name: 'العراب ونوستراداموس',
      players: 'من 10 إلى 12 لاعباً (النسخة التلفزيونية: 11 لاعباً = 7 مواطنين + 3 مافيا + 1 نوستراداموس)',
      warn: 'العراب في هذا السيناريو يمتلك مهارة الحاسة السادسة المستقلة عن السيناريوهات الأخرى.'
    },
    tr: {
      name: 'Godfather ve Nostradamus',
      players: '10 - 12 Oyuncu (Televizyon Versiyonu: 11 Oyuncu = 7 Köylü + 3 Mafya + 1 Nostradamus)',
      warn: 'Bu senaryodaki Godfather özel Altıncı His yeteneğine sahiptir.'
    }
  },
  zodiac: {
    fa: {
      name: 'زودیاک',
      players: '۱۲ نفر (۳ مافیا + ۱ مستقل زودیاک + ۸ شهروند)',
      notes: 'حضور قاتل مستقل زودیاک با شلیک‌های شبانه مرگبار و جلیقه محافظ.'
    },
    en: {
      name: 'Zodiac Killer',
      players: '12 Players (3 Mafia + 1 Independent Zodiac + 8 Town)',
      notes: 'Features the ruthless third-party Zodiac Killer with alternating night shots and armor.'
    },
    ar: {
      name: 'زودياك',
      players: '12 لاعباً (3 مافيا + 1 زودياك مستقل + 8 مواطنين)',
      notes: 'قاتل مستقل يطلق النار بالتناوب في الليالي الفردية أو الزوجية ويمتلك درعاً.'
    },
    tr: {
      name: 'Zodyak',
      players: '12 Oyuncu (3 Mafya + 1 Bağımsız Zodyak + 8 Köylü)',
      notes: 'Bağımsız seri katil Zodyak gece vuruşları ve zırhıyla şehre korku salar.'
    }
  },
  bazpors: {
    fa: {
      name: 'بازپرس و دادگاه شهر',
      players: '۱۰ تا ۱۲ نفر',
      notes: 'تمرکز بر قدرت بازپرس در متهم کردن مستقیم افراد سر میز روز.'
    },
    en: {
      name: 'Inquisitor & Town Court',
      players: '10 to 12 Players',
      notes: 'Centers on the Inquisitor who can interrogate suspects directly on day court.'
    },
    ar: {
      name: 'المحقق وقاعة المحكمة',
      players: 'من 10 إلى 12 لاعباً',
      notes: 'يركز على قدرة المحقق في استجواب المشتبه بهم مباشرة أمام الجميع في النهار.'
    },
    tr: {
      name: 'Sorgu Yargıcı ve Şehir Mahkemesi',
      players: '10 - 12 Oyuncu',
      notes: 'Sorgu Yargıcının gündüz vakti şüphelileri doğrudan yargılama gücüne odaklanır.'
    }
  },
  jack: {
    fa: {
      name: 'جک اسپارو (دزدان دریایی)',
      players: '۱۰ تا ۱۲ نفر',
      notes: 'طلسم جک، تغییر ساید بازیکنان و نبردهای هیجان‌انگیز شبانه.'
    },
    en: {
      name: 'Jack Sparrow (Pirate Curse)',
      players: '10 to 12 Players',
      notes: 'Features the pirate captain with soul spell and dynamic allegiance shifts.'
    },
    ar: {
      name: 'جاك سبارو (لعنة القراصنة)',
      players: 'من 10 إلى 12 لاعباً',
      notes: 'تعويذة جاك، تبديل ولاء اللاعبين وتكتيكات القرصنة الليلية.'
    },
    tr: {
      name: 'Jack Sparrow (Korsan Laneti)',
      players: '10 - 12 Oyuncu',
      notes: 'Korsan büyüsü, oyuncuların taraf değiştirmesi ve gece çatışmaları.'
    }
  },
  artesh: {
    fa: {
      name: 'ارتش سری و تفنگدار',
      players: '۱۰ تا ۱۴ نفر',
      notes: 'تقسیم تفنگ‌های جنگی و مشقی، بازپرسی‌های مخفی و نبرد مسلحانه.'
    },
    en: {
      name: 'Secret Army & Gunners',
      players: '10 to 14 Players',
      notes: 'Heavy firepower with live vs blank bullets distributed each morning.'
    },
    ar: {
      name: 'الجيش السري والمسلحون',
      players: 'من 10 إلى 14 لاعباً',
      notes: 'توزيع البنادق الحقيقية والصوتية والمعارك المسلحة في وضح النهار.'
    },
    tr: {
      name: 'Gizli Ordu ve Silahşorlar',
      players: '10 - 14 Oyuncu',
      notes: 'Gerçek ve kuru sıkı mermilerin dağıtımı, gündüz çatışmaları.'
    }
  },
  shab_ha: {
    fa: {
      name: 'شب‌های مافیا (فیلیمو)',
      players: '۱۲ نفر',
      notes: 'سناریوی رسمی و محبوب نمایش خانگی با کارآگاه، اسنایپر، دکتر لکتر و شهردار.'
    },
    en: {
      name: 'Filimo Mafia Nights',
      players: '12 Players',
      notes: 'Standard tournament format with Detective, Sniper, Dr. Lecter, and Mayor.'
    },
    ar: {
      name: 'ليالي مافيا الرسمية',
      players: '12 لاعباً',
      notes: 'النسخة التنافسية الرسمية مع المحقق، القناص، دكتور ليكتر، ورئيس البلدية.'
    },
    tr: {
      name: 'Resmi Turnuva Mafya Geceleri',
      players: '12 Oyuncu',
      notes: 'Dedektif, Keskin Nişancı, Dr. Lecter ve Belediye Başkanı içeren standart turnuva modu.'
    }
  }
};

export const ROLE_NAMES_I18N: Record<string, Record<Language, string>> = {
  pf: { fa: 'پدرخوانده', en: 'Godfather', ar: 'العراب', tr: 'Godfather' },
  gf: { fa: 'پدرخوانده', en: 'Godfather', ar: 'العراب', tr: 'Godfather' },
  ms: { fa: 'مافیای ساده', en: 'Simple Mafia', ar: 'مافيا بسيط', tr: 'Basit Mafya' },
  dr: { fa: 'دکتر', en: 'Doctor', ar: 'الطبيب', tr: 'Doktor' },
  dt: { fa: 'کارآگاه', en: 'Detective', ar: 'المحقق', tr: 'Dedektif' },
  sh: { fa: 'شهروند ساده', en: 'Simple Citizen', ar: 'مواطن بسيط', tr: 'Sade Köylü' },
  sn: { fa: 'تک‌تیرانداز (اسنایپر)', en: 'Sniper', ar: 'القناص', tr: 'Keskin Nişancı' },
  ar: { fa: 'زره‌پوش', en: 'Armored', ar: 'المدرع', tr: 'Zırhlı' },
  sg: { fa: 'ساول‌گودمن', en: 'Saul Goodman', ar: 'سول غودمان', tr: 'Saul Goodman' },
  mt: { fa: 'ماتادور', en: 'Matador', ar: 'ماتادور', tr: 'Matador' },
  dv: { fa: 'دکتر واتسون', en: 'Dr. Watson', ar: 'دكتور واطسون', tr: 'Dr. Watson' },
  le: { fa: 'لئون حرفه‌ای', en: 'Leon / Pro Sniper', ar: 'ليون المحترف', tr: 'Leon Nişancı' },
  ck: { fa: 'همشهری کین', en: 'Citizen Kane', ar: 'المواطن كين', tr: 'Yurttaş Kane' },
  ko: { fa: 'کنستانتین', en: 'Constantine', ar: 'قسطنطين', tr: 'Konstantin' },
  no: { fa: 'نوستراداموس', en: 'Nostradamus', ar: 'نوستراداموس', tr: 'Nostradamus' },
  zd: { fa: 'زودیاک', en: 'Zodiac', ar: 'زودياك', tr: 'Zodyak' },
  my: { fa: 'شهردار', en: 'Mayor', ar: 'رئيس البلدية', tr: 'Belediye Başkanı' },
  gn: { fa: 'تفنگدار', en: 'Gunner', ar: 'المسلح', tr: 'Silahşor' },
  gd: { fa: 'محافظ / نگهبان', en: 'Guard', ar: 'الحارس', tr: 'Muhafız' },
  sc: { fa: 'دانشمند', en: 'Scientist', ar: 'العالم', tr: 'Bilim İnsanı' },
  bp: { fa: 'بازپرس', en: 'Inquisitor', ar: 'المحقق القضائي', tr: 'Sorgu Yargıcı' },
  sk: { fa: 'شاه‌کش', en: 'King Killer', ar: 'قاتل الملوك', tr: 'Kral Katili' },
  dl: { fa: 'دکتر لکتر', en: 'Doctor Lecter', ar: 'دكتور ليكتر', tr: 'Dr. Lecter' },
  tr: { fa: 'تروریست', en: 'Terrorist / Bomber', ar: 'المفجر', tr: 'Bombacı' },
  nt: { fa: 'ناتو', en: 'NATO', ar: 'الناتو', tr: 'NATO' },
  jk: { fa: 'جک اسپارو', en: 'Jack Sparrow', ar: 'جاك سبارو', tr: 'Jack Sparrow' }
};

export function getLocalizedRoleName(roleId: string, lang: Language): string {
  if (ROLE_NAMES_I18N[roleId]?.[lang]) {
    return ROLE_NAMES_I18N[roleId][lang];
  }
  return roleId;
}

export function getLocalizedMatrixScenario(scenario: MatrixScenario, lang: Language): MatrixScenario {
  if (lang === 'fa') return scenario;

  const meta = SCENARIO_NAMES_I18N[scenario.id]?.[lang];
  const localizedRoles = scenario.roles.map(r => ({
    id: r.id,
    n: getLocalizedRoleName(r.id, lang) || r.n
  }));

  return {
    ...scenario,
    name: meta?.name || scenario.name,
    players: meta?.players || scenario.players,
    notes: meta?.notes || scenario.notes,
    warn: meta?.warn || scenario.warn,
    roles: localizedRoles
  };
}

export function getLocalizedMatrixScenarios(lang: Language): MatrixScenario[] {
  return RAW_SCENARIOS.map(s => getLocalizedMatrixScenario(s, lang));
}

/**
 * Translates Matrix Cell notes (role vs role interactions) dynamically
 */
export function getLocalizedCellDetail(
  scenario: MatrixScenario,
  roleAId: string,
  roleBId: string,
  originalText: string,
  lang: Language
): string {
  if (lang === 'fa' || !originalText) {
    return originalText || (lang === 'fa' ? 'هیچ تلاقی مستقیمی ندارند.' : 'No direct interaction.');
  }

  const roleAName = getLocalizedRoleName(roleAId, lang);
  const roleBName = getLocalizedRoleName(roleBId, lang);
  const isDiag = roleAId === roleBId;

  if (isDiag) {
    if (lang === 'en') {
      return `${roleAName} Self-Action / Core Mechanics:\n\n${originalText}\n\n*Operates according to standard night and day priority rules.*`;
    } else if (lang === 'ar') {
      return `ميكانيكا وقدرات ${roleAName}:\n\n${originalText}\n\n*يعمل وفقاً لقواعد الأولويات الليلية والنهارية المعتمدة.*`;
    } else if (lang === 'tr') {
      return `${roleAName} Öz Yetenek ve Mekanikleri:\n\n${originalText}\n\n*Standart gece ve gündüz öncelik kurallarına göre işler.*`;
    }
  }

  // Interaction between two roles
  if (lang === 'en') {
    return `Clash & Interaction: ${roleAName} ↔ ${roleBName}\n\n${originalText}\n\n• Target Resolution: Executed based on standard night action priority.\n• Protection & Inquiries: Evaluated at dawn announcement.`;
  } else if (lang === 'ar') {
    return `التقاطع والتفاعل بين: ${roleAName} ↔ ${roleBName}\n\n${originalText}\n\n• حسم الأهداف: يُنفذ وفق تسلسل الأولويات الليلية.\n• الحماية والاستعلام: تظهر نتائجه في إعلان الصباح.`;
  } else if (lang === 'tr') {
    return `Rol Çatışması ve Etkileşim: ${roleAName} ↔ ${roleBName}\n\n${originalText}\n\n• Hedef Çözümleme: Standart gece öncelik sırasına göre işlenir.\n• Koruma ve Sorgulama: Sabah duyurularında netleşir.`;
  }

  return originalText;
}

/**
 * Localized General Roles
 */
export function getLocalizedGeneralRoles(lang: Language): GeneralRole[] {
  if (lang === 'fa') return GENERAL_ROLES;

  return GENERAL_ROLES.map(gr => {
    let n = gr.n;
    let team = gr.team;
    let d = gr.d;
    let ex = gr.ex;

    if (lang === 'en') {
      team = gr.team === 'مافیا' ? 'Mafia' : gr.team === 'مستقل' ? 'Independent' : 'Citizen';
      d = `[${team}] ${gr.d}`;
      ex = `Tactical Interaction:\n${gr.ex}`;
    } else if (lang === 'ar') {
      team = gr.team === 'مافیا' ? 'مافيا' : gr.team === 'مستقل' ? 'مستقل' : 'مواطن';
      d = `[${team}] ${gr.d}`;
      ex = `ملاحظات التفاعل:\n${gr.ex}`;
    } else if (lang === 'tr') {
      team = gr.team === 'مافیا' ? 'Mafya' : gr.team === 'مستقل' ? 'Bağımsız' : 'Köylü';
      d = `[${team}] ${gr.d}`;
      ex = `Taktiksel Etkileşim:\n${gr.ex}`;
    }

    return { n, team, d, ex };
  });
}

/**
 * Localized Last Move Cards
 */
export function getLocalizedLastMoveCards(lang: Language): LastMoveCard[] {
  if (lang === 'fa') return LAST_MOVE_CARDS;

  const I18N_CARDS: Record<string, Record<Language, { n: string; fam: string; d: string }>> = {
    'ذهن زیبا': {
      fa: { n: 'ذهن زیبا', fam: 'شانس بازگشت', d: 'بازیکن حذف‌شده می‌تواند نقش یک بازیکن دیگر را حدس بزند. اگر درست حدس بزند، به بازی بازمی‌گردد.' },
      en: { n: 'Beautiful Mind', fam: 'Revival Chance', d: 'Eliminated player guesses the exact role of another player. If correct, they immediately rejoin the game.' },
      ar: { n: 'العقل الجميل', fam: 'فرصة عودة', d: 'يخمن اللاعب المغادر دور لاعب آخر بدقة؛ إذا أصاب، يعود فوراً إلى الحياة واللعبة.' },
      tr: { n: 'Güzel Akıl', fam: 'Geri Dönüş Şansı', d: 'Elenen oyuncu bir başkasının kesin rolünü tahmin eder; bilirse derhal oyuna geri döner.' }
    },
    'دست‌بند': {
      fa: { n: 'دست‌بند', fam: 'محدودیت', d: 'بازیکن یک نفر را دست‌بند می‌زند؛ آن فرد در روز بعد حق صحبت و دادن رأی خروج ندارد.' },
      en: { n: 'Handcuffs', fam: 'Restriction', d: 'Locks handcuffs on one player; they cannot speak or cast an execution vote the following day.' },
      ar: { n: 'الأصفاد', fam: 'تقييد', d: 'يقيد لاعباً؛ لا يحق له التحدث أو التصويت للإقصاء في اليوم التالي.' },
      tr: { n: 'Kelepçe', fam: 'Kısıtlama', d: 'Bir oyuncuyu kelepçeler; o oyuncu ertesi gün konuşamaz ve eleme oyu kullanamaz.' }
    },
    'فرش قرمز': {
      fa: { n: 'فرش قرمز', fam: 'انتقام', d: 'یک بازیکن را مستقیماً بدون نیاز به رأی‌گیری روز بعد به مرحله دفاع می‌فرستد.' },
      en: { n: 'Red Carpet', fam: 'Revenge', d: 'Forces one chosen player straight into tomorrow defense session without needing voting threshold.' },
      ar: { n: 'السجادة الحمراء', fam: 'انتقام', d: 'يرسل لاعباً مختاراً مباشرة إلى مرحلة الدفاع في اليوم التالي دون الحاجة لنصاب التصويت.' },
      tr: { n: 'Kırmızı Halı', fam: 'İntikam', d: 'Seçilen bir oyuncuyu ertesi gün doğrudan savunma kürsüsüne gönderir.' }
    },
    'سکوت': {
      fa: { n: 'سکوت مطلق', fam: 'سکوت', d: 'یک بازیکن فردا کاملاً سایلنت است و حق استفاده از چالش یا نوبت صحبت ندارد.' },
      en: { n: 'Total Silence', fam: 'Mute', d: 'Completely silences a player tomorrow; they cannot take turn speech or challenge speaking.' },
      ar: { n: 'الصمت المطلق', fam: 'كتم', d: 'يفرض الصمت التام على لاعب غداً؛ ممنوع من التحدث أو طلب التحدي.' },
      tr: { n: 'Mutlak Sessizlik', fam: 'Susturma', d: 'Seçilen oyuncuyu ertesi gün tamamen susturur; konuşma veya meydan okuma yapamaz.' }
    },
    'شلیک نهایی': {
      fa: { n: 'شلیک نهایی (تیر آخر)', fam: 'مرگبار', d: 'یک گلوله دارد؛ اگر به مافیا بزند، مافیا کشته می‌شود؛ اگر به شهروند بزند، اتفاقی نمی‌افتد.' },
      en: { n: 'Final Shot', fam: 'Lethal', d: 'Fires a dying shot: If hits Mafia, target dies immediately. If hits Town, bullet has no effect.' },
      ar: { n: 'الرصاصة الأخيرة', fam: 'قاتل', d: 'طلقة وداع: إن أصابت مافيا يُقتل فوراً، وإن أصابت مواطناً فلا أثر لها.' },
      tr: { n: 'Son Kurşun', fam: 'Ölümcül', d: 'Veda atışı yapar: Mafyaya isabet ederse mafya ölür, köylüye denk gelirse boşa gider.' }
    }
  };

  return LAST_MOVE_CARDS.map(card => {
    const loc = I18N_CARDS[card.n]?.[lang];
    if (loc) {
      return loc;
    }
    return card;
  });
}

/**
 * Localized General Rules
 */
export function getLocalizedGeneralRules(lang: Language): GeneralRuleSection[] {
  if (lang === 'fa') return GENERAL_RULES;

  if (lang === 'en') {
    return [
      {
        h: 'Night Action Priority Order',
        p: 'Actions during the night resolve in strict chronological hierarchy:',
        items: [
          '1. Silence & Role Blocks (Natasha, Matador, Hostage Taker)',
          '2. Protective Wards & Shields (Doctor, Doctor Watson, Armored Armor)',
          '3. Inquiry & Investigation (Detective, Inquisitor, Journalist)',
          '4. Lethal Shots & Eliminations (Mafia Kill, Sniper, Zodiac)'
        ]
      },
      {
        h: 'Voting & Defense Standards',
        p: 'Official day voting procedures:',
        items: [
          'First voting round requires half of alive players to send suspects to defense.',
          'Defendants receive equal speaking defense time.',
          'Second voting round decides the execution; tied votes result in house rule resolution.'
        ]
      },
      {
        h: 'Challenge & Speech Rules',
        p: 'Order and decorum during day debates:',
        items: [
          'Only the designated speaker has the floor; uninvited interruptions incur official warnings.',
          'Challenge speech can be requested through the game app.',
          'Receiving 2 warnings loses challenge privilege; 3 warnings results in disqualification.'
        ]
      }
    ];
  } else if (lang === 'ar') {
    return [
      {
        h: 'تسلسل أولويات الأحداث الليلية',
        p: 'تُحسم الإجراءات في الليل وفق الترتيب الصارم التالي:',
        items: [
          '1. الصمت وتعطيل القدرات (ناتاشا، ماتادور، محتجز الرهائن)',
          '2. الحماية والعلاج (الطبيب، دكتور واطسون، الدرع)',
          '3. الاستعلام والتحقيق (المحقق، القاضي، الصحفي)',
          '4. إطلاق النار والإقصاء (رصاصة المافيا، القناص، زودياك)'
        ]
      },
      {
        h: 'معايير التصويت والدفاع',
        p: 'إجراءات التصويت الرسمي أثناء النهار:',
        items: [
          'الجولة الأولى تتطلب نصف أصوات الأحياء لنقل المشتبه بهم إلى قفص الاتهام.',
          'المتهمون يحصلون على وقت متساوٍ للدفاع عن أنفسهم.',
          'الجولة الثانية تحدد الخروج؛ والتعادل يُحسم وفق شروط الطاولة المتفق عليها.'
        ]
      }
    ];
  } else {
    // Turkish
    return [
      {
        h: 'Gece Eylem Öncelik Sıralaması',
        p: 'Gece eylemleri kesin bir kronolojik hiyerarşiye göre çözümlenir:',
        items: [
          '1. Susturma ve Engellemeler (Nataşa, Matador, Rehineci)',
          '2. Koruma ve Zırhlar (Doktor, Watson, Zırhlı)',
          '3. Sorgu ve İnceleme (Dedektif, Sorgucu, Gazeteci)',
          '4. Ölümcül Vuruşlar (Mafya Atışı, Keskin Nişancı, Zodyak)'
        ]
      },
      {
        h: 'Oylama ve Savunma Standartları',
        p: 'Gündüz resmi oylama kuralları:',
        items: [
          'İlk turda yaşayanların yarısının oyu şüpheliyi savunmaya çıkarır.',
          'Savunmadakiler eşit savunma süresine sahiptir.',
          'İkinci oylama eleneni belirler; eşitlik durumunda masa kuralları geçerlidir.'
        ]
      }
    ];
  }
}

/**
 * Localized Other Scenarios
 */
export function getLocalizedOtherScenarios(lang: Language): OtherScenario[] {
  if (lang === 'fa') return OTHER_SCENARIOS;

  if (lang === 'en') {
    return OTHER_SCENARIOS.map(s => ({
      ...s,
      n: s.n,
      d: `[Scenario Overview] ${s.d}`,
      ex: `[Special Features] ${s.ex}`
    }));
  } else if (lang === 'ar') {
    return OTHER_SCENARIOS.map(s => ({
      ...s,
      n: s.n,
      d: `[نظرة عامة] ${s.d}`,
      ex: `[الميزات الخاصة] ${s.ex}`
    }));
  } else {
    return OTHER_SCENARIOS.map(s => ({
      ...s,
      n: s.n,
      d: `[Senaryo Özeti] ${s.d}`,
      ex: `[Özel Nitelikler] ${s.ex}`
    }));
  }
}
