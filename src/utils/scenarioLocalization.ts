import { Language, RoleId, Scenario, RoleAffiliation } from '../types/mafia';
import { ROLE_DEFINITIONS } from './scenarios';

export interface LocalizedScenarioData {
  name: string;
  description: string;
  tag?: string;
  difficulty?: string;
}

/**
 * Idiomatic, authentic native translations for all 17 default scenarios in 4 languages
 */
export const LOCALIZED_PRESETS: Record<string, Record<Language, LocalizedScenarioData>> = {
  'classic-10': {
    fa: {
      name: 'کلاسیک شب‌های مافیا (۱۰ نفره)',
      description: '۳ مافیا (پدرخوانده، دکتر لکتر، مافیا ساده) + ۷ شهروند (دکتر، کارآگاه، اسنایپر، زره‌پوش، ۳ شهروند ساده)',
      tag: 'محبوب‌ترین',
      difficulty: 'ساده'
    },
    en: {
      name: 'Classic Mafia Nights (10 Players)',
      description: '3 Mafia (Godfather, Dr. Lecter, Simple Mafia) + 7 Citizens (Doctor, Detective, Sniper, Armored, 3 Simple Citizens)',
      tag: 'Most Popular',
      difficulty: 'Easy'
    },
    ar: {
      name: 'ليالي المافيا الكلاسيكية (10 لاعبين)',
      description: '3 مافيا (العراب، دكتور ليكتر، مافيا بسيط) + 7 مواطنين (الطبيب، المحقق، القناص، المدرع، 3 مواطنين بسطاء)',
      tag: 'الأكثر شعبية',
      difficulty: 'سهل'
    },
    tr: {
      name: 'Klasik Mafya Geceleri (10 Oyunculu)',
      description: '3 Mafya (Godfather, Dr. Lecter, Basit Mafya) + 7 Köylü (Doktor, Dedektif, Keskin Nişancı, Zırhlı, 3 Sade Köylü)',
      tag: 'En Popüler',
      difficulty: 'Kolay'
    }
  },
  'godfather-11': {
    fa: {
      name: 'پدرخوانده و نوستراداموس (۱۱ نفره)',
      description: '۳ مافیا (پدرخوانده، ساول‌گودمن، ماتادور) + ۱ مستقل (نوستراداموس) + ۷ شهروند (دکتر واتسون، لئون حرفه‌ای، همشهری کین، کنستانتین، ۳ شهروند ساده)',
      tag: 'تلویزیونی',
      difficulty: 'متوسط'
    },
    en: {
      name: 'The Godfather & Nostradamus (11 Players)',
      description: '3 Mafia (Godfather, Saul Goodman, Matador) + 1 Independent (Nostradamus) + 7 Citizens (Dr. Watson, Leon/Sniper, Citizen Kane, Constantine, 3 Simple Citizens)',
      tag: 'Showcase',
      difficulty: 'Medium'
    },
    ar: {
      name: 'العراب ونوستراداموس (11 لاعباً)',
      description: '3 مافيا (العراب، سول غودمان، ماتادور) + 1 مستقل (نوستراداموس) + 7 مواطنين (دكتور واطسون، قناص محترف، المواطن كين، قسطنطين، 3 مواطنين بسطاء)',
      tag: 'تلفزيوني',
      difficulty: 'متوسط'
    },
    tr: {
      name: 'Godfather ve Nostradamus (11 Oyunculu)',
      description: '3 Mafya (Godfather, Saul Goodman, Matador) + 1 Bağımsız (Nostradamus) + 7 Köylü (Dr. Watson, Keskin Nişancı, Yurttaş Kane, Konstantin, 3 Sade Köylü)',
      tag: 'Televizyon Modu',
      difficulty: 'Orta'
    }
  },
  'zodiac-12': {
    fa: {
      name: 'شب‌های مافیا زودیاک (۱۲ نفره)',
      description: '۳ مافیا (آل کاپون، بمب‌گذار، شعبده‌باز) + ۱ مستقل (زودیاک) + ۸ شهروند (دکتر، کارآگاه، تفنگدار، محافظ، دانشمند، ۳ شهروند ساده)',
      tag: 'هیجانی',
      difficulty: 'متوسط'
    },
    en: {
      name: 'Zodiac Mafia Nights (12 Players)',
      description: '3 Mafia (Al Capone, Bomber/Terrorist, Magician) + 1 Independent (Zodiac Killer) + 8 Citizens (Doctor, Detective, Gunner, Guard, Scientist, 3 Simple Citizens)',
      tag: 'High Thrill',
      difficulty: 'Medium'
    },
    ar: {
      name: 'ليالي مافيا زودياك (12 لاعباً)',
      description: '3 مافيا (آل كابوني، المفجر، الساحر) + 1 مستقل (قاتل زودياك) + 8 مواطنين (الطبيب، المحقق، المسلح، الحارس، العالم، 3 مواطنين بسطاء)',
      tag: 'إثارة وتشويق',
      difficulty: 'متوسط'
    },
    tr: {
      name: 'Zodyak Mafya Geceleri (12 Oyunculu)',
      description: '3 Mafya (Al Capone, Terörist/Bombacı, İllüzyonist) + 1 Bağımsız (Zodyak Katili) + 8 Köylü (Doktor, Dedektif, Silahşor, Muhafız, Bilim İnsanı, 3 Sade Köylü)',
      tag: 'Yüksek Heyecan',
      difficulty: 'Orta'
    }
  },
  'bazpors-10': {
    fa: {
      name: 'بازپرس و دادگاه شهر (۱۰ نفره)',
      description: '۳ مافیا (پدرخوانده، شاه‌کش، مافیا ساده) + ۷ شهروند (بازپرس، دکتر، کارآگاه، اسنایپر، شهردار، ۲ شهروند ساده)',
      tag: 'حرفه‌ای',
      difficulty: 'متوسط'
    },
    en: {
      name: 'Inquisitor & The City Court (10 Players)',
      description: '3 Mafia (Godfather, King-Slayer, Simple Mafia) + 7 Citizens (Inquisitor, Doctor, Detective, Sniper, Mayor, 2 Simple Citizens)',
      tag: 'Competitive',
      difficulty: 'Medium'
    },
    ar: {
      name: 'المحقق والمحكمة العليا (10 لاعبين)',
      description: '3 مافيا (العراب، قاتل الملك، مافيا بسيط) + 7 مواطنين (المحقق القضائي، الطبيب، المحقق، القناص، العمدة، 2 مواطنين بسطاء)',
      tag: 'تنافسي',
      difficulty: 'متوسط'
    },
    tr: {
      name: 'Sorguç ve Şehir Mahkemesi (10 Oyunculu)',
      description: '3 Mafya (Godfather, Kral Katili, Basit Mafya) + 7 Köylü (Sorguç/Engizisyon, Doktor, Dedektif, Keskin Nişancı, Belediye Başkanı, 2 Sade Köylü)',
      tag: 'Profesyonel',
      difficulty: 'Orta'
    }
  },
  'tekavar-12': {
    fa: {
      name: 'تکاور و ناتو (۱۲ نفره)',
      description: '۴ مافیا (رئیس مافیا، ناتو، گروگانگیر، مافیا ساده) + ۸ شهروند (تکاور، تفنگدار، نگهبان، پزشک، کارآگاه، ۳ شهروند ساده)',
      tag: 'تاکتیکی',
      difficulty: 'متوسط'
    },
    en: {
      name: 'Ranger & NATO Strike (12 Players)',
      description: '4 Mafia (Godfather, NATO Assassin, Hostage Taker, Simple Mafia) + 8 Citizens (Ranger, Gunner, Guard, Doctor, Detective, 3 Simple Citizens)',
      tag: 'Tactical Ops',
      difficulty: 'Medium'
    },
    ar: {
      name: 'المغاوير وعملية الناتو (12 لاعباً)',
      description: '4 مافيا (العراب، ناتو، محتجز الرهائن، مافيا بسيط) + 8 مواطنين (المغوار، المسلح، الحارس، الطبيب، المحقق، 3 مواطنين بسطاء)',
      tag: 'تكتيكي',
      difficulty: 'متوسط'
    },
    tr: {
      name: 'Komando ve NATO Operasyonu (12 Oyunculu)',
      description: '4 Mafya (Godfather, NATO Suikastçısı, Rehineci, Basit Mafya) + 8 Köylü (Komando/Ranger, Silahşor, Muhafız, Doktor, Dedektif, 3 Sade Köylü)',
      tag: 'Taktiksel',
      difficulty: 'Orta'
    }
  },
  'tnt-11': {
    fa: {
      name: 'تی‌ان‌تی و بمب‌گذار (۱۱ نفره)',
      description: '۳ مافیا (پدرخوانده، تروریست بمب‌گذار، معشوقه) + ۸ شهروند (دکتر، کارآگاه، تک‌تیرانداز، قاضی، فدایی، ۳ شهروند ساده)',
      tag: 'انفجاری',
      difficulty: 'متوسط'
    },
    en: {
      name: 'TNT & The Bomber (11 Players)',
      description: '3 Mafia (Godfather, Terrorist Bomber, Sweetheart) + 8 Citizens (Doctor, Detective, Sniper, Judge, Sacrifice, 3 Simple Citizens)',
      tag: 'High Explosive',
      difficulty: 'Medium'
    },
    ar: {
      name: 'تي إن تي والمفجر (11 لاعباً)',
      description: '3 مافيا (العراب، الإرهابي المفجر، العشيقة) + 8 مواطنين (الطبيب، المحقق، القناص، القاضي، الفدائي، 3 مواطنين بسطاء)',
      tag: 'متفجر',
      difficulty: 'متوسط'
    },
    tr: {
      name: 'TNT ve Bombacı (11 Oyunculu)',
      description: '3 Mafya (Godfather, Bombacı Terörist, Sevgili) + 8 Köylü (Doktor, Dedektif, Keskin Nişancı, Yargıç, Fedai, 3 Sade Köylü)',
      tag: 'Patlayıcı',
      difficulty: 'Orta'
    }
  },
  'arteshe-seri-11': {
    fa: {
      name: 'ارتش سری و گشتاپو (۱۱ نفره)',
      description: '۳ مافیا (گشتاپو، سرهنگ، جاسوس) + ۸ شهروند (نجات‌دهنده، فرمانده، تکاور، کشیش، ۴ شهروند مبارز)',
      tag: 'معمایی',
      difficulty: 'سنگین'
    },
    en: {
      name: 'Secret Army & Gestapo (11 Players)',
      description: '3 Mafia (Gestapo, Colonel, Spy) + 8 Citizens (Rescuer/Doctor, Commander, Ranger, Priest, 4 Resistance Citizens)',
      tag: 'Espionage',
      difficulty: 'Hard'
    },
    ar: {
      name: 'الجيش السري والغستابو (11 لاعباً)',
      description: '3 مافيا (الغستابو، العقيد، الجاسوس) + 8 مواطنين (المنقذ، القائد، المغوار، الكاهن، 4 مواطنين مقاومين)',
      tag: 'استخباراتي',
      difficulty: 'صعب'
    },
    tr: {
      name: 'Gizli Ordu ve Gestapo (11 Oyunculu)',
      description: '3 Mafya (Gestapo, Albay, Casus) + 8 Köylü (Kurtarıcı/Doktor, Komutan, Komando, Rahip, 4 Direnişçi Köylü)',
      tag: 'Casusluk',
      difficulty: 'Zor'
    }
  },
  'constantine-12': {
    fa: {
      name: 'کنستانتین و واکسیناتور (۱۲ نفره)',
      description: '۴ مافیا (پدرخوانده، دکتر لکتر، سم‌ساز، مافیا) + ۸ شهروند (کنستانتین، دانشمند، دکتر، کارآگاه، اسنایپر، ۳ شهروند)',
      tag: 'احیا و نجات',
      difficulty: 'متوسط'
    },
    en: {
      name: 'Constantine & The Vaccinator (12 Players)',
      description: '4 Mafia (Godfather, Dr. Lecter, Poisoner, Simple Mafia) + 8 Citizens (Constantine/Reviver, Scientist, Doctor, Detective, Sniper, 3 Simple Citizens)',
      tag: 'Resurrection',
      difficulty: 'Medium'
    },
    ar: {
      name: 'قسطنطين واللقاح المضاد (12 لاعباً)',
      description: '4 مافيا (العراب، دكتور ليكتر، مسمم، مافيا بسيط) + 8 مواطنين (قسطنطين المعيد للحياة، العالم، الطبيب، المحقق، القناص، 3 مواطنين)',
      tag: 'إنعاش وشفاء',
      difficulty: 'متوسط'
    },
    tr: {
      name: 'Konstantin ve Aşıcı (12 Oyunculu)',
      description: '4 Mafya (Godfather, Dr. Lecter, Zehirci, Basit Mafya) + 8 Köylü (Konstantin/Diriltici, Bilim İnsanı, Doktor, Dedektif, Keskin Nişancı, 3 Sade Köylü)',
      tag: 'Diriliş ve Şifa',
      difficulty: 'Orta'
    }
  },
  'negotiation-10': {
    fa: {
      name: 'مذاکره و خبرنگار (۱۰ نفره)',
      description: '۳ مافیا (رئیس مافیا، مذاکره‌کننده، مافیا ساده) + ۷ شهروند (خبرنگار، پزشک، کارآگاه، اسنایپر، زره‌پوش، ۲ شهروند ساده)',
      tag: 'کلاسیک پیشرفته',
      difficulty: 'متوسط'
    },
    en: {
      name: 'Negotiation & The Journalist (10 Players)',
      description: '3 Mafia (Godfather, Negotiator, Simple Mafia) + 7 Citizens (Journalist, Doctor, Detective, Sniper, Armored, 2 Simple Citizens)',
      tag: 'Advanced Classic',
      difficulty: 'Medium'
    },
    ar: {
      name: 'المفاوضة والصحفي (10 لاعبين)',
      description: '3 مافيا (العراب، المفاوض، مافيا بسيط) + 7 مواطنين (الصحفي، الطبيب، المحقق، القناص، المدرع، 2 مواطنين بسطاء)',
      tag: 'كلاسيكي متقدم',
      difficulty: 'متوسط'
    },
    tr: {
      name: 'Müzakere ve Gazeteci (10 Oyunculu)',
      description: '3 Mafya (Godfather, Arabulucu/Müzakereci, Basit Mafya) + 7 Köylü (Gazeteci, Doktor, Dedektif, Keskin Nişancı, Zırhlı, 2 Sade Köylü)',
      tag: 'Gelişmiş Klasik',
      difficulty: 'Orta'
    }
  },
  'dentist-12': {
    fa: {
      name: 'دنتیست و محافظ (۱۲ نفره)',
      description: '۳ مافیا (گادفادر، چرچیل، دکستر) + ۱ مستقل (دنتیست) + ۸ شهروند (پزشک، کارآگاه، اسنایپر، محافظ، اسلحه‌ساز، ۳ شهروند)',
      tag: 'سه سایده',
      difficulty: 'سنگین'
    },
    en: {
      name: 'The Dentist & The Guard (12 Players)',
      description: '3 Mafia (Godfather, Churchill, Dexter) + 1 Independent (Dentist/Muter) + 8 Citizens (Doctor, Detective, Sniper, Guard, Gunsmith, 3 Simple Citizens)',
      tag: 'Tri-Faction',
      difficulty: 'Hard'
    },
    ar: {
      name: 'طبيب الأسنان والحارس (12 لاعباً)',
      description: '3 مافيا (العراب، تشرشل، ديكستر) + 1 مستقل (طبيب الأسنان) + 8 مواطنين (الطبيب، المحقق، القناص، الحارس، صانع السلاح، 3 مواطنين)',
      tag: 'ثلاثي الأطراف',
      difficulty: 'صعب'
    },
    tr: {
      name: 'Diş Hekimi ve Muhafız (12 Oyunculu)',
      description: '3 Mafya (Godfather, Churchill, Dexter) + 1 Bağımsız (Dişçi) + 8 Köylü (Doktor, Dedektif, Keskin Nişancı, Muhafız, Silah Ustası, 3 Sade Köylü)',
      tag: 'Üç Taraflı',
      difficulty: 'Zor'
    }
  },
  'motekhasses-12': {
    fa: {
      name: 'متخصص و لابی‌من (۱۲ نفره)',
      description: '۴ مافیا (گادفادر، لابی‌من، جادوگر، مافیا) + ۸ شهروند (متخصص، رنجر، شوالیه، بازپرس، ۴ شهروند ساده)',
      tag: 'استراتژیک',
      difficulty: 'سنگین'
    },
    en: {
      name: 'Specialist & The Lobbyist (12 Players)',
      description: '4 Mafia (Godfather, Lobbyist, Magician, Simple Mafia) + 8 Citizens (Specialist/Doctor, Ranger, Knight, Inquisitor, 4 Simple Citizens)',
      tag: 'Strategic Mind',
      difficulty: 'Hard'
    },
    ar: {
      name: 'المختص وجماعة الضغط (12 لاعباً)',
      description: '4 مافيا (العراب، اللوبيست، الساحر، مافيا بسيط) + 8 مواطنين (المختص، المغوار، الفارس، المحقق القضائي، 4 مواطنين بسطاء)',
      tag: 'استراتيجي',
      difficulty: 'صعب'
    },
    tr: {
      name: 'Uzman ve Lobici (12 Oyunculu)',
      description: '4 Mafya (Godfather, Lobici, Büyücü, Basit Mafya) + 8 Köylü (Uzman/Doktor, Komando, Şövalye, Sorguç, 4 Sade Köylü)',
      tag: 'Stratejik',
      difficulty: 'Zor'
    }
  },
  'saqi-12': {
    fa: {
      name: 'ساقی و رویین‌تن (۱۲ نفره)',
      description: '۴ مافیا (پدرخوانده، ناتاشا، تروریست، گنگستر) + ۸ شهروند (ساقی، کشیش، قاضی، فدایی، رویین‌تن، تفنگدار، ۲ شهروند ساده)',
      tag: 'هیجان بالا',
      difficulty: 'متوسط'
    },
    en: {
      name: 'The Bartender & The Invincible (12 Players)',
      description: '4 Mafia (Godfather, Natasha, Terrorist, Gangster) + 8 Citizens (Bartender, Priest, Judge, Sacrifice, Armored/Invincible, Gunner, 2 Simple Citizens)',
      tag: 'High Octane',
      difficulty: 'Medium'
    },
    ar: {
      name: 'الساقي والمدرع المنيع (12 لاعباً)',
      description: '4 مافيا (العراب، ناتاشا، الإرهابي، العصابي) + 8 مواطنين (الساقي، الكاهن، القاضي، الفدائي، المنيع، المسلح، 2 مواطنين بسطاء)',
      tag: 'إثارة فائقة',
      difficulty: 'متوسط'
    },
    tr: {
      name: 'Barmen ve Yenilmez (12 Oyunculu)',
      description: '4 Mafya (Godfather, Nataşa, Terörist, Gangster) + 8 Köylü (Barmen/Saki, Rahip, Yargıç, Fedai, Zırhlı/Yenilmez, Silahşor, 2 Sade Köylü)',
      tag: 'Yüksek Tempolu',
      difficulty: 'Orta'
    }
  },
  'scam-12': {
    fa: {
      name: 'اسکام و کلیم آزاد (۱۲ نفره)',
      description: '۳ مافیا (رئیس، خرابکار، مافیا) + ۹ شهروند (اسنایپر بی‌رحم، تفنگدار، پزشک، کارآگاه، ۵ شهروند ساده با حق ادعای نقش)',
      tag: 'کلیم آزاد',
      difficulty: 'سنگین'
    },
    en: {
      name: 'Open Claim & Bluff Blitz (12 Players)',
      description: '3 Mafia (Boss, Saboteur, Simple Mafia) + 9 Citizens (Ruthless Sniper, Gunner, Doctor, Detective, 5 Simple Citizens with open claim rights)',
      tag: 'Open Claim',
      difficulty: 'Hard'
    },
    ar: {
      name: 'الادعاء الحر والخداع المفتوح (12 لاعباً)',
      description: '3 مافيا (الزعيم، المخرب، مافيا بسيط) + 9 مواطنين (القناص القاتل، المسلح، الطبيب، المحقق، 5 مواطنين بسطاء مع حق الادعاء بالأدوار)',
      tag: 'ادعاء مفتوح',
      difficulty: 'صعب'
    },
    tr: {
      name: 'Açık Rol İddiası ve Blöf (12 Oyunculu)',
      description: '3 Mafya (Lider, Sabotajcı, Basit Mafya) + 9 Köylü (Acımasız Keskin Nişancı, Silahşor, Doktor, Dedektif, 5 Açık Rol İddia Edebilen Sade Köylü)',
      tag: 'Serbest İddia',
      difficulty: 'Zor'
    }
  },
  'gorgan-14': {
    fa: {
      name: 'گرگینه و پیشگو (۱۴ نفره)',
      description: '۴ مافیا (پدرخوانده، لکتر، ماتادور، مافیا) + ۱ مستقل (گرگینه) + ۹ شهروند (پیشگو، شکارچی، دکتر، کارآگاه، اسنایپر، شهردار، ۳ شهروند)',
      tag: 'فانتزی و تاریک',
      difficulty: 'متوسط'
    },
    en: {
      name: 'The Werewolf & The Seer (14 Players)',
      description: '4 Mafia (Godfather, Dr. Lecter, Matador, Simple Mafia) + 1 Independent (Werewolf) + 9 Citizens (Seer/Nostradamus, Hunter, Doctor, Detective, Sniper, Mayor, 3 Simple Citizens)',
      tag: 'Dark Fantasy',
      difficulty: 'Medium'
    },
    ar: {
      name: 'المستذئب والعراف (14 لاعباً)',
      description: '4 مافيا (العراب، ليكتر، ماتادور، مافيا) + 1 مستقل (المستذئب) + 9 مواطنين (العراف، الصياد، الطبيب، المحقق، القناص، العمدة، 3 مواطنين)',
      tag: 'فانتازيا مظلمة',
      difficulty: 'متوسط'
    },
    tr: {
      name: 'Kurtadam ve Kahin (14 Oyunculu)',
      description: '4 Mafya (Godfather, Dr. Lecter, Matador, Basit Mafya) + 1 Bağımsız (Kurtadam) + 9 Köylü (Kahin, Avcı, Doktor, Dedektif, Keskin Nişancı, Belediye Başkanı, 3 Sade Köylü)',
      tag: 'Karanlık Fantezi',
      difficulty: 'Orta'
    }
  },
  'roosi-16': {
    fa: {
      name: 'مافیا روسی و فینال (۱۶ نفره)',
      description: '۵ مافیا (پدرخوانده، لکتر، ناتاشا، ساول، تروریست) + ۱۱ شهروند (دکتر، کارآگاه، تک‌تیرانداز، جان‌سخت، شهردار، روانشناس، تفنگدار، ۴ شهروند ساده)',
      tag: 'فینال و حرفه‌ای',
      difficulty: 'سنگین'
    },
    en: {
      name: 'Russian Mafia Grand Championship (16 Players)',
      description: '5 Mafia (Godfather, Dr. Lecter, Natasha, Saul Goodman, Terrorist) + 11 Citizens (Doctor, Detective, Sniper, Die Hard, Mayor, Psychologist, Gunner, 4 Simple Citizens)',
      tag: 'Grand Final',
      difficulty: 'Hard'
    },
    ar: {
      name: 'المافيا الروسية والنهائي الكبير (16 لاعباً)',
      description: '5 مافيا (العراب، ليكتر، ناتاشا، سول غودمان، الإرهابي) + 11 مواطناً (الطبيب، المحقق، القناص، العنيد، العمدة، الطبيب النفسي، المسلح، 4 مواطنين بسطاء)',
      tag: 'النهائي الكلاسيكي',
      difficulty: 'صعب'
    },
    tr: {
      name: 'Rus Mafyası Büyük Finali (16 Oyunculu)',
      description: '5 Mafya (Godfather, Dr. Lecter, Nataşa, Saul Goodman, Terörist) + 11 Köylü (Doktor, Dedektif, Keskin Nişancı, Zor Ölüm, Belediye Başkanı, Psikolog, Silahşor, 4 Sade Köylü)',
      tag: 'Büyük Şampiyona',
      difficulty: 'Zor'
    }
  },
  'tournament-18': {
    fa: {
      name: 'تورنمنت بزرگ ۱۸ نفره (۱۸ نفره)',
      description: '۵ مافیا + ۱ مستقل (جوکر) + ۱۲ شهروند (دکتر، کارآگاه، اسنایپر، زره‌پوش، جان‌سخت، شهردار، روانپزشک، ۵ شهروند ساده)',
      tag: 'تورنمنت رسمی',
      difficulty: 'سنگین'
    },
    en: {
      name: 'Official Tournament League (18 Players)',
      description: '5 Mafia + 1 Independent (Joker) + 12 Citizens (Doctor, Detective, Sniper, Armored, Die Hard, Mayor, Psychologist, 5 Simple Citizens)',
      tag: 'Tournament Official',
      difficulty: 'Hard'
    },
    ar: {
      name: 'بطولة الدوري الرسمي (18 لاعباً)',
      description: '5 مافيا + 1 مستقل (الجوكر) + 12 مواطناً (الطبيب، المحقق، القناص، المدرع، العنيد، العمدة، الطبيب النفسي، 5 مواطنين بسطاء)',
      tag: 'بطولة رسمية',
      difficulty: 'صعب'
    },
    tr: {
      name: 'Büyük Turnuva Ligi (18 Oyunculu)',
      description: '5 Mafya + 1 Bağımsız (Joker) + 12 Köylü (Doktor, Dedektif, Keskin Nişancı, Zırhlı, Zor Ölüm, Belediye Başkanı, Psikolog, 5 Sade Köylü)',
      tag: 'Resmi Turnuva',
      difficulty: 'Zor'
    }
  },
  'quick-compact-6': {
    fa: {
      name: 'دوئل و مسابقه سریع (۶ نفره)',
      description: '۲ مافیا (پدرخوانده، مافیا ساده) + ۴ شهروند (دکتر، کارآگاه، ۲ شهروند ساده)',
      tag: 'سریع و جمع‌وجور',
      difficulty: 'ساده'
    },
    en: {
      name: 'Quick Blitz Duel (6 Players)',
      description: '2 Mafia (Godfather, Simple Mafia) + 4 Citizens (Doctor, Detective, 2 Simple Citizens)',
      tag: 'Fast & Compact',
      difficulty: 'Easy'
    },
    ar: {
      name: 'المبارزة الخاطفة السريعة (6 لاعبين)',
      description: '2 مافيا (العراب، مافيا بسيط) + 4 مواطنين (الطبيب، المحقق، 2 مواطنين بسطاء)',
      tag: 'سريع ومدمج',
      difficulty: 'سهل'
    },
    tr: {
      name: 'Hızlı Düello Maçı (6 Oyunculu)',
      description: '2 Mafya (Godfather, Basit Mafya) + 4 Köylü (Doktor, Dedektif, 2 Sade Köylü)',
      tag: 'Hızlı ve Pratik',
      difficulty: 'Kolay'
    }
  },
  'chaos-joker-10': {
    fa: {
      name: 'آشوب جوکر و تروریست (۱۰ نفره)',
      description: '۳ مافیا (پدرخوانده، تروریست، لکتر) + ۶ شهروند (دکتر، کارآگاه، شهردار، اسنایپر، ۲ شهروند) + ۱ مستقل (جوکر)',
      tag: 'هرج‌ومرج',
      difficulty: 'متوسط'
    },
    en: {
      name: 'Joker Chaos & Terror (10 Players)',
      description: '3 Mafia (Godfather, Terrorist, Dr. Lecter) + 6 Citizens (Doctor, Detective, Mayor, Sniper, 2 Simple Citizens) + 1 Independent (Joker)',
      tag: 'Chaos & Anarchy',
      difficulty: 'Medium'
    },
    ar: {
      name: 'فوضى الجوكر والإرهابي (10 لاعبين)',
      description: '3 مافيا (العراب، الإرهابي، ليكتر) + 6 مواطنين (الطبيب، المحقق، العمدة، القناص، 2 مواطنين) + 1 مستقل (الجوكر)',
      tag: 'فوضى مطلقة',
      difficulty: 'متوسط'
    },
    tr: {
      name: 'Joker Kaosu ve Terör (10 Oyunculu)',
      description: '3 Mafya (Godfather, Terörist, Dr. Lecter) + 6 Köylü (Doktor, Dedektif, Belediye Başkanı, Keskin Nişancı, 2 Sade Köylü) + 1 Bağımsız (Joker)',
      tag: 'Kaos ve Anarşi',
      difficulty: 'Orta'
    }
  }
};

/**
 * Common Mafia term mappings across all 4 languages for real-time text & rule translation
 */
export const MULTILINGUAL_DICTIONARY: Record<string, Record<Language, string>> = {
  // Roles
  'GODFATHER': { fa: 'پدرخوانده', en: 'Godfather', ar: 'العراب', tr: 'Godfather' },
  'MAFIA_SIMPLE': { fa: 'مافیای ساده', en: 'Simple Mafia', ar: 'مافيا بسيط', tr: 'Basit Mafya' },
  'DOCTOR_LECTER': { fa: 'دکتر لکتر', en: 'Doctor Lecter', ar: 'دكتور ليكتر', tr: 'Doktor Lecter' },
  'NATASHA': { fa: 'ناتاشا (سکوت‌دهنده)', en: 'Natasha (Muter)', ar: 'ناتاشا (الصامتة)', tr: 'Nataşa (Susturucu)' },
  'TERRORIST': { fa: 'تروریست', en: 'Terrorist', ar: 'إرهابي', tr: 'Terörist' },
  'MATADOR': { fa: 'ماتادور', en: 'Matador', ar: 'ماتادور', tr: 'Matador' },
  'SAUL_GOODMAN': { fa: 'ساول گودمن', en: 'Saul Goodman', ar: 'سول غودمان', tr: 'Saul Goodman' },
  'SHAH_KOSH': { fa: 'شاه‌کش', en: 'King-Slayer', ar: 'قاتل الملك', tr: 'Kral Katili' },
  'SWEETHEART': { fa: 'معشوقه', en: 'Sweetheart', ar: 'العشيقة', tr: 'Sevgili' },
  'NEGOTIATOR': { fa: 'مذاکره‌کننده', en: 'Negotiator', ar: 'المفاوض', tr: 'Müzakereci' },
  'NATO': { fa: 'ناتو', en: 'NATO Assassin', ar: 'ناتو', tr: 'NATO' },
  'HOSTAGE_TAKER': { fa: 'گروگان‌گیر', en: 'Hostage Taker', ar: 'محتجز الرهائن', tr: 'Rehineci' },
  'POISONER': { fa: 'سم‌ساز', en: 'Poisoner', ar: 'المسمم', tr: 'Zehirci' },
  'HACKER': { fa: 'هکر', en: 'Hacker', ar: 'المخترق', tr: 'Hacker' },
  'CHURCHILL': { fa: 'چرچیل', en: 'Churchill', ar: 'تشرشل', tr: 'Churchill' },
  'DEXTER': { fa: 'دکستر', en: 'Dexter', ar: 'ديكستر', tr: 'Dexter' },
  'LOBBYIST': { fa: 'لابی‌من', en: 'Lobbyist', ar: 'جماعة الضغط', tr: 'Lobici' },
  'SPY': { fa: 'جاسوس', en: 'Spy', ar: 'الجاسوس', tr: 'Casus' },
  'STRONG_MAN': { fa: 'مرد قوی', en: 'Strong Man', ar: 'الرجل القوي', tr: 'Güçlü Adam' },
  'MAFIA_GANGSTER': { fa: 'گنگستر', en: 'Gangster', ar: 'العصابي', tr: 'Gangster' },
  'CITIZEN_SIMPLE': { fa: 'شهروند ساده', en: 'Simple Citizen', ar: 'مواطن بسيط', tr: 'Sade Köylü' },
  'DOCTOR': { fa: 'دکتر شهر', en: 'Doctor', ar: 'الطبيب', tr: 'Doktor' },
  'DOCTOR_WATSON': { fa: 'دکتر واتسون', en: 'Doctor Watson', ar: 'دكتور واطسون', tr: 'Doktor Watson' },
  'DETECTIVE': { fa: 'کارآگاه', en: 'Detective', ar: 'المحقق', tr: 'Dedektif' },
  'SNIPER': { fa: 'تک‌تیرانداز (اسنایپر)', en: 'Sniper (Leon)', ar: 'القناص', tr: 'Keskin Nişancı' },
  'ARMORED': { fa: 'شهروند زره‌پوش', en: 'Armored Citizen', ar: 'المواطن المدرع', tr: 'Zırhlı Köylü' },
  'MAYOR': { fa: 'شهردار', en: 'Mayor', ar: 'العمدة', tr: 'Belediye Başkanı' },
  'PSYCHOLOGIST': { fa: 'روانشناس', en: 'Psychologist', ar: 'طبيب نفسي', tr: 'Psikolog' },
  'DIE_HARD': { fa: 'جان‌سخت', en: 'Die Hard', ar: 'العنيد', tr: 'Zor Ölüm' },
  'GUNNER': { fa: 'تفنگدار', en: 'Gunner', ar: 'المسلح', tr: 'Silahşor' },
  'RANGER': { fa: 'تکاور', en: 'Ranger', ar: 'المغوار', tr: 'Komando' },
  'INQUISITOR': { fa: 'بازپرس', en: 'Inquisitor', ar: 'المحقق القضائي', tr: 'Sorguç' },
  'CONSTANTINE': { fa: 'کنستانتین', en: 'Constantine', ar: 'قسطنطين', tr: 'Konstantin' },
  'PRIEST': { fa: 'کشیش', en: 'Priest', ar: 'الكاهن', tr: 'Rahip' },
  'JUDGE': { fa: 'قاضی', en: 'Judge', ar: 'القاضي', tr: 'Yargıç' },
  'SACRIFICE': { fa: 'فدایی', en: 'Sacrifice', ar: 'الفدائي', tr: 'Fedai' },
  'CITIZEN_KANE': { fa: 'همشهری کین', en: 'Citizen Kane', ar: 'المواطن كين', tr: 'Yurttaş Kane' },
  'GUARD': { fa: 'نگهبان و محافظ', en: 'Guard / Bodyguard', ar: 'الحارس الشخصي', tr: 'Muhafız' },
  'JOURNALIST': { fa: 'خبرنگار', en: 'Journalist', ar: 'الصحفي', tr: 'Gazeteci' },
  'GUNSMITH': { fa: 'اسلحه‌ساز', en: 'Gunsmith', ar: 'صانع الأسلحة', tr: 'Silah Ustası' },
  'SCIENTIST': { fa: 'دانشمند', en: 'Scientist', ar: 'العالم', tr: 'Bilim İnsanı' },
  'GRAVEDIGGER': { fa: 'گورکن', en: 'Gravedigger', ar: 'حفار القبور', tr: 'Mezar Kazıcı' },
  'BRIDESMAID': { fa: 'ساقدوش', en: 'Bridesmaid', ar: 'وصيفة العروس', tr: 'Nedime' },
  'KNIGHT': { fa: 'شوالیه', en: 'Knight', ar: 'الفارس', tr: 'Şövalye' },
  'HERO': { fa: 'قهرمان', en: 'Hero', ar: 'البطل', tr: 'Kahraman' },
  'COWBOY': { fa: 'کابوی', en: 'Cowboy', ar: 'رعاة البقر', tr: 'Kovboy' },
  'FREEMASON': { fa: 'فراماسون', en: 'Freemason', ar: 'الماسوني', tr: 'Farmason' },
  'BARTENDER': { fa: 'ساقی', en: 'Bartender', ar: 'الساقي', tr: 'Barmen' },
  'THIEF': { fa: 'دزد و دست‌کج', en: 'Thief', ar: 'اللص', tr: 'Hırsız' },
  'HUNTER': { fa: 'شکارچی', en: 'Hunter', ar: 'الصياد', tr: 'Avcı' },
  'JOKER': { fa: 'جوکر (مستقل)', en: 'Joker (Independent)', ar: 'الجوكر (مستقل)', tr: 'Joker (Bağımsız)' },
  'NOSTRADAMUS': { fa: 'نوستراداموس', en: 'Nostradamus', ar: 'نوستراداموس', tr: 'Nostradamus' },
  'ZODIAC': { fa: 'قاتل زنجیره‌ای زودیاک', en: 'Zodiac Killer', ar: 'قاتل زودياك المتسلسل', tr: 'Zodyak Katili' },
  'WEREWOLF': { fa: 'گرگینه', en: 'Werewolf', ar: 'المستذئب', tr: 'Kurtadam' },
  'JACK_SPARROW': { fa: 'جک اسپارو', en: 'Jack Sparrow', ar: 'جاك سبارو', tr: 'Jack Sparrow' },
  'DENTIST': { fa: 'دنتیست', en: 'Dentist', ar: 'طبيب الأسنان', tr: 'Diş Hekimi' },
  'CUSTOM': { fa: 'نقش سفارشی', en: 'Custom Role', ar: 'دور مخصص', tr: 'Özel Rol' },

  // Affiliations
  'CITIZEN': { fa: 'شهروند', en: 'Citizen', ar: 'مواطن', tr: 'Köylü' },
  'MAFIA': { fa: 'مافیا', en: 'Mafia', ar: 'مافيا', tr: 'Mafya' },
  'INDEPENDENT': { fa: 'مستقل', en: 'Independent', ar: 'مستقل', tr: 'Bağımsız' },
  'DRAW': { fa: 'مساوی', en: 'Draw', ar: 'تعادل', tr: 'Beraberlik' },

  // Difficulties
  'EASY': { fa: 'ساده', en: 'Easy', ar: 'سهل', tr: 'Kolay' },
  'MEDIUM': { fa: 'متوسط', en: 'Medium', ar: 'متوسط', tr: 'Orta' },
  'HARD': { fa: 'سنگین', en: 'Hard', ar: 'صعب', tr: 'Zor' },

  // Tags
  'POPULAR': { fa: 'محبوب‌ترین', en: 'Most Popular', ar: 'الأكثر شعبية', tr: 'En Popüler' },
  'TV': { fa: 'تلویزیونی', en: 'TV Preset', ar: 'تلفزيوني', tr: 'Televizyon Modu' },
  'THRILL': { fa: 'هیجانی', en: 'Thrilling', ar: 'إثارة وتشويق', tr: 'Yüksek Heyecan' },
  'COMPETITIVE': { fa: 'حرفه‌ای', en: 'Competitive', ar: 'تنافسي', tr: 'Profesyonel' },
  'TACTICAL': { fa: 'تاکتیکی', en: 'Tactical', ar: 'تكتيكي', tr: 'Taktiksel' },
  'EXPLOSIVE': { fa: 'انفجاری', en: 'Explosive', ar: 'متفجر', tr: 'Patlayıcı' },
  'MYSTERY': { fa: 'معمایی', en: 'Mystery', ar: 'استخباراتي', tr: 'Gizemli' },
  'RESCUE': { fa: 'احیا و نجات', en: 'Rescue & Revive', ar: 'إنعاش وشفاء', tr: 'Diriliş ve Şifa' },
  'CUSTOM_TAG': { fa: 'سفارشی', en: 'Custom', ar: 'مخصص', tr: 'Özel' }
};

/**
 * Returns localized name for any role
 */
export function getLocalizedRoleName(roleId: string, language: Language): string {
  const dict = MULTILINGUAL_DICTIONARY[roleId];
  if (dict && dict[language]) {
    return dict[language];
  }
  const def = ROLE_DEFINITIONS[roleId];
  if (def) {
    return def.nameKey || roleId;
  }
  return roleId;
}

/**
 * Returns localized affiliation label
 */
export function getLocalizedAffiliation(affiliation: RoleAffiliation | string, language: Language): string {
  const aff = affiliation?.toUpperCase();
  const dict = MULTILINGUAL_DICTIONARY[aff];
  if (dict && dict[language]) {
    return dict[language];
  }
  return affiliation;
}

/**
 * Returns localized difficulty text
 */
export function getLocalizedDifficulty(diff: string | undefined, language: Language): string {
  if (!diff) return language === 'fa' ? 'متوسط' : language === 'ar' ? 'متوسط' : language === 'tr' ? 'Orta' : 'Medium';
  const clean = diff.trim().toUpperCase();
  if (clean.includes('ساده') || clean.includes('EASY') || clean.includes('سهل') || clean.includes('KOLAY')) {
    return MULTILINGUAL_DICTIONARY['EASY'][language];
  }
  if (clean.includes('سنگین') || clean.includes('HARD') || clean.includes('صعب') || clean.includes('ZOR') || clean.includes('پیشرفته')) {
    return MULTILINGUAL_DICTIONARY['HARD'][language];
  }
  return MULTILINGUAL_DICTIONARY['MEDIUM'][language];
}

/**
 * Intelligently translates any scenario into the target language.
 * - If preset, returns authentic native translation.
 * - If custom, translates the name, description, roles, tag, and difficulty into natural native wording.
 */
export function localizeScenario(scenario: Scenario, targetLang: Language): Scenario {
  if (!scenario) return scenario;

  // 1. Check if official preset
  const preset = LOCALIZED_PRESETS[scenario.id];
  if (preset && preset[targetLang]) {
    const loc = preset[targetLang];
    return {
      ...scenario,
      name: loc.name,
      description: loc.description,
      tag: loc.tag || scenario.tag,
      difficulty: loc.difficulty || scenario.difficulty
    };
  }

  // 2. Dynamic auto-translation for custom or AI-generated scenarios
  return autoTranslateScenario(scenario, targetLang);
}

/**
 * Translates custom scenario into the target language with natural phrasing
 */
export function autoTranslateScenario(scenario: Scenario, targetLang: Language): Scenario {
  if (!scenario) return scenario;

  // Build natural description from roles if needed
  let mafiaCount = 0;
  let citizenCount = 0;
  let independentCount = 0;

  const mafiaRoles: string[] = [];
  const citizenRoles: string[] = [];
  const indRoles: string[] = [];

  scenario.roles.forEach(r => {
    const def = ROLE_DEFINITIONS[r];
    const localizedRole = getLocalizedRoleName(r, targetLang);
    if (def?.affiliation === 'MAFIA') {
      mafiaCount++;
      mafiaRoles.push(localizedRole);
    } else if (def?.affiliation === 'INDEPENDENT') {
      independentCount++;
      indRoles.push(localizedRole);
    } else {
      citizenCount++;
      citizenRoles.push(localizedRole);
    }
  });

  // Unique lists with counts for clean summaries
  const countRoles = (list: string[]) => {
    const counts: Record<string, number> = {};
    list.forEach(item => counts[item] = (counts[item] || 0) + 1);
    return Object.entries(counts).map(([name, count]) => count > 1 ? `${count} × ${name}` : name).join('، ');
  };

  const mafiaStr = countRoles(mafiaRoles);
  const citizenStr = countRoles(citizenRoles);
  const indStr = countRoles(indRoles);

  let translatedDesc = scenario.description;
  let translatedName = scenario.name;

  if (targetLang === 'fa') {
    translatedDesc = `${mafiaCount} مافیا (${mafiaStr}) + ${citizenCount} شهروند (${citizenStr})` + (indRoles.length > 0 ? ` + ${independentCount} مستقل (${indStr})` : '');
    if (!translatedName.includes('(')) {
      translatedName = `${scenario.name} (${scenario.recommendedPlayerCount || scenario.roles.length} نفره)`;
    }
  } else if (targetLang === 'en') {
    translatedDesc = `${mafiaCount} Mafia (${mafiaStr}) + ${citizenCount} Citizens (${citizenStr})` + (indRoles.length > 0 ? ` + ${independentCount} Independent (${indStr})` : '');
    if (!translatedName.includes('(')) {
      translatedName = `${scenario.name} (${scenario.recommendedPlayerCount || scenario.roles.length} Players)`;
    }
  } else if (targetLang === 'ar') {
    translatedDesc = `${mafiaCount} مافيا (${mafiaStr}) + ${citizenCount} مواطنين (${citizenStr})` + (indRoles.length > 0 ? ` + ${independentCount} مستقل (${indStr})` : '');
    if (!translatedName.includes('(')) {
      translatedName = `${scenario.name} (${scenario.recommendedPlayerCount || scenario.roles.length} لاعبين)`;
    }
  } else if (targetLang === 'tr') {
    translatedDesc = `${mafiaCount} Mafya (${mafiaStr}) + ${citizenCount} Köylü (${citizenStr})` + (indRoles.length > 0 ? ` + ${independentCount} Bağımsız (${indStr})` : '');
    if (!translatedName.includes('(')) {
      translatedName = `${scenario.name} (${scenario.recommendedPlayerCount || scenario.roles.length} Oyunculu)`;
    }
  }

  return {
    ...scenario,
    name: translatedName,
    description: translatedDesc,
    difficulty: getLocalizedDifficulty(scenario.difficulty, targetLang),
    tag: scenario.tag ? autoTranslateText(scenario.tag, targetLang) : undefined
  };
}

/**
 * Intelligent general text translator for Mafia announcements, rules, logs, and custom titles
 */
export function autoTranslateText(text: string, targetLang: Language): string {
  if (!text || targetLang === 'fa') return text;

  // Check dictionary
  for (const [key, mapping] of Object.entries(MULTILINGUAL_DICTIONARY)) {
    if (text.toLowerCase() === key.toLowerCase() || text === mapping.fa || text === mapping.en) {
      return mapping[targetLang] || text;
    }
  }

  // Common phrases translation
  const phrases: Record<string, Record<Language, string>> = {
    'شهروندان پیروز شدند': { fa: 'شهروندان پیروز شدند', en: 'Citizens Won the Game!', ar: 'انتصر المواطنون في اللعبة!', tr: 'Köylüler Oyunu Kazandı!' },
    'مافیا پیروز شد': { fa: 'مافیا پیروز شد', en: 'Mafia Team Won the Game!', ar: 'انتصرت المافيا في اللعبة!', tr: 'Mafya Takımı Oyunu Kazandı!' },
    'پیروزی مستقل': { fa: 'پیروزی مستقل', en: 'Independent Faction Victory!', ar: 'انتصار الطرف المستقل!', tr: 'Bağımsız Taraf Kazandı!' },
    'شلیک شبانه': { fa: 'شلیک شبانه', en: 'Night Kill Action', ar: 'إطلاق النار الليلي', tr: 'Gece Atışı' },
    'نجات دکتر': { fa: 'نجات دکتر', en: 'Doctor Protection', ar: 'إنقاذ الطبيب', tr: 'Doktor Koruması' },
    'استعلام کارآگاه': { fa: 'استعلام کارآگاه', en: 'Detective Inquiry', ar: 'تحقيق المحقق', tr: 'Dedektif Sorgulaması' },
    'سکوت شبانه': { fa: 'سکوت شبانه', en: 'Night Silence/Mute', ar: 'الصمت الليلي', tr: 'Gece Susturması' },
    'حذف با رأی شهر': { fa: 'حذف با رأی شهر', en: 'Eliminated by Public Vote', ar: 'استبعاد بتصويت المدينة', tr: 'Halk Oyuyla Elendi' }
  };

  for (const [phrase, dict] of Object.entries(phrases)) {
    if (text.includes(phrase)) {
      return text.replace(new RegExp(phrase, 'g'), dict[targetLang]);
    }
  }

  return text;
}
