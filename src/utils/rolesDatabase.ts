import { RoleDefinition, RoleId, RoleAffiliation, RoleActDetail, Language } from '../types/mafia';
import { ROLE_DEFINITIONS } from './scenarios';

export interface RoleLocalizedContent {
  name: string;
  affiliationLabel: string;
  description: string;
  acts: RoleActDetail[];
  exceptions: string[];
  counterpartRoleName?: string;
  recommendedBundleName?: string;
}

export const COMPLETE_ROLES_DATABASE: Record<string, Record<'fa' | 'en', RoleLocalizedContent>> = {
  GODFATHER: {
    fa: {
      name: 'پدرخوانده (گادفادر)',
      affiliationLabel: 'تیم مافیا',
      description: 'رهبر و تصمیم‌گیرنده نهایی شلیک شب تیم مافیا. دارای جلیقه ضدگلوله (زره شبانه) در برابر شلیک اول اسنایپر و استعلام کارآگاه برای او همیشه منفی (شهروند) است. (توجه: گادفادر نقش یکی از بازیکنان در ساید مافیاست و با گرداننده/داور بازی فرق دارد).',
      acts: [
        {
          phase: 'NIGHT',
          title: 'شلیک شبانه مافیا',
          description: 'در فاز بیداری شبانه مافیا با مشورت یاران شلیک اصلی مافیا را تعیین و با انگشت تایید می‌کند.',
          priorityOrder: 1
        },
        {
          phase: 'PASSIVE',
          title: 'مصونیت در برابر استعلام کارآگاه',
          description: 'هنگام استعلام کارآگاه در فاز شب، گرداننده هویت او را به صورت منفی (شهروند) نشان می‌دهد.'
        },
        {
          phase: 'PASSIVE',
          title: 'جلیقه ضدگلوله (زره شب)',
          description: 'اولین تیر مرگبار شب از سوی اسنایپر یا نقش‌های مستقل فقط جلیقه او را می‌اندازد و او کشته نمی‌شود.'
        }
      ],
      exceptions: [
        'گادفادر نقش بازیکن عضو مافیاست، در حالی که گرداننده (راوی) مدیر و داور بی‌طرف بازی است.',
        'استعلام برای کارآگاه منفی است، اما با شات لئون/اسنایپر با تیر دوم یا اعدام در دادگاه روز حذف می‌شود.',
        'در صورت مرگ پدرخوانده، یار ارشد مافیا سرپرستی شلیک شب را بر عهده می‌گیرد.'
      ],
      counterpartRoleName: 'کارآگاه و اسنایپر شهر',
      recommendedBundleName: 'پای ثابت تمامی سناریوها (رهبر مافیا)'
    },
    en: {
      name: 'The Godfather (Don)',
      affiliationLabel: 'Mafia Team',
      description: 'Supreme leader and shot-caller of the Mafia syndicate. Holds inquiry immunity against the Detective, survives the first lethal night attack thanks to a bulletproof vest, and directs the night execution. (Note: The Godfather is a player role, distinct from the neutral God/Moderator).',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Night Mafia Execution',
          description: 'Wakes with fellow syndicate members to designate and confirm the nightly elimination target.',
          priorityOrder: 1
        },
        {
          phase: 'PASSIVE',
          title: 'Detective Inquiry Immunity',
          description: 'When inspected by the Detective at night, the Moderator falsely reports a negative (Citizen) result.'
        },
        {
          phase: 'PASSIVE',
          title: 'Ballistic Bulletproof Vest',
          description: 'The first lethal night attack from a Sniper or Independent role merely shatters the vest without killing him.'
        }
      ],
      exceptions: [
        'The Godfather is a Mafia player, not the neutral game Moderator/God.',
        'Immunity applies only to Detective inquiry; a secondary shot or daytime trial execution will eliminate him.',
        'If the Godfather is eliminated, night kill authority passes down to the highest-ranking surviving mafia member.'
      ],
      counterpartRoleName: 'Detective & Sniper',
      recommendedBundleName: 'Core Mafia Foundation'
    }
  },

  MAFIA_SIMPLE: {
    fa: {
      name: 'مافیای ساده',
      affiliationLabel: 'تیم مافیا',
      description: 'عضو اصلی و پیاده‌نظام جبهه مافیا. شب‌ها با کل اعضای مافیا بیدار شده و در تصمیم‌گیری برای انتخاب قربانی شلیک شب مشارکت می‌کند. روزها در نقش شهروند موجه استدلال می‌آورد.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'مشورت و شلیک شب',
          description: 'در فاز شب همراه با سایر مافیاها بیدار شده و در رایزنی شلیک تیم شرکت می‌کند.',
          priorityOrder: 1
        },
        {
          phase: 'DAY',
          title: 'گمراه‌سازی و بازی ذهنی',
          description: 'تلاش برای هدایت افکار عمومی شهر به سمت شهروندان بی‌گناه بدون فاش شدن هویت تیمی.'
        }
      ],
      exceptions: [
        'استعلام مافیای ساده برای کارآگاه همیشه مثبت (مافیا) است.',
        'فاقد زره شبانه یا نجات اختصاصی است و با شلیک درست اسنایپر کشته می‌شود.'
      ],
      counterpartRoleName: 'شهروند ساده',
      recommendedBundleName: 'ستون‌های پایه شهر و تیم'
    },
    en: {
      name: 'Simple Mafia',
      affiliationLabel: 'Mafia Team',
      description: 'Core foot soldier of the Mafia faction. Wakes at night with all syndicate members to vote on the night kill and orchestrates daylight deception to mislead citizens.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Night Consultation & Kill',
          description: 'Wakes with the mafia team to deliberate and execute the nightly assassination target.',
          priorityOrder: 1
        },
        {
          phase: 'DAY',
          title: 'Deception & Counter-Accusation',
          description: 'Acts as an innocent citizen during the day, nudging public suspicion toward genuine citizens.'
        }
      ],
      exceptions: [
        'Shows positive (Mafia) on Detective inquiry.',
        'Has no night shield or special resistance; vulnerable to direct Sniper shots.'
      ],
      counterpartRoleName: 'Simple Citizen',
      recommendedBundleName: 'Base Syndicate Operative'
    }
  },

  DOCTOR_LECTER: {
    fa: {
      name: 'دکتر لکتر (پزشک مافیا)',
      affiliationLabel: 'تیم مافیا',
      description: 'پزشک جراح جبهه مافیا. هر شب پس از خوابیدن مافیا بیدار می‌شود و می‌تواند یکی از یاران مافیا را از شلیک تک‌تیرانداز نجات دهد. خود را نیز یک‌بار در طول بازی می‌تواند نجات دهد.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'جراحی و نجات مافیا',
          description: 'یک عضو مافیا را انتخاب می‌کند تا از شلیک احتمالی اسنایپر در امان بماند.',
          priorityOrder: 2
        }
      ],
      exceptions: [
        'استعلام دکتر لکتر برای کارآگاه مثبت (مافیا) است.',
        'حق نجات خود را تنها یک بار در کل مسابقه دارد.'
      ],
      counterpartRoleName: 'تک‌تیرانداز و دکتر شهر',
      recommendedBundleName: 'شلیک شب و نجات مافیا (لکتر ⚔️ اسنایپر)'
    },
    en: {
      name: 'Doctor Lecter',
      affiliationLabel: 'Mafia Team',
      description: 'The corrupt surgeon of the Mafia syndicate. Wakes independently at night to protect a fellow mafia member against Sniper/Vigilante shots. Can heal himself once per game.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Syndicate Medical Protection',
          description: 'Designates one Mafia member to protect against nocturnal citizen sniper attacks.',
          priorityOrder: 2
        }
      ],
      exceptions: [
        'Inspects as positive (Mafia) by the Detective.',
        'Self-protection is strictly limited to once per game.'
      ],
      counterpartRoleName: 'Town Doctor & Sniper',
      recommendedBundleName: 'Mafia Medical Preservation'
    }
  },

  NATASHA: {
    fa: {
      name: 'ناتاشا (سایلنسر)',
      affiliationLabel: 'تیم مافیا',
      description: 'سایلنسر و قطع‌کننده کلام شهر. هر شب یک بازیکن را سایلنت (لال) می‌کند. بازیکن سایلنت‌شده در تمام طول روز بعد حق صحبت، دفاع و رأی دادن ندارد.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'سایلنت کردن بازیکن',
          description: 'یک نفر را با اشاره انتخاب می‌کند تا در روز بعد به طور کامل سکوت اجباری بگیرد.',
          priorityOrder: 3
        }
      ],
      exceptions: [
        'نمی‌تواند یک بازیکن را در دو شب متوالی سایلنت کند.',
        'روانشناس شهر می‌تواند اثر سایلنت او را با روان‌درمانی باطل کند.'
      ],
      counterpartRoleName: 'روانشناس شهر',
      recommendedBundleName: 'کنترل گفتمان و سکوت اجباری'
    },
    en: {
      name: 'Natasha (Silencer)',
      affiliationLabel: 'Mafia Team',
      description: 'The speech-suppressing agent of the Mafia. Mutes one targeted player each night. The silenced player is forbidden from speaking, defending, or voting during the following day.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Enforced Silence',
          description: 'Chooses one player who is strictly silenced throughout the next day cycle.',
          priorityOrder: 3
        }
      ],
      exceptions: [
        'Cannot target the same player on two consecutive nights.',
        'The Town Psychologist can counteract the silence by therapeutic session.'
      ],
      counterpartRoleName: 'Town Psychologist',
      recommendedBundleName: 'Speech Control & Disruption'
    }
  },

  TERRORIST: {
    fa: {
      name: 'تروریست (انتحاری)',
      affiliationLabel: 'تیم مافیا',
      description: 'عضو انتحاری مافیا. هر زمان که در دادگاه روز با رای شهروندان به اعدام محکوم شود، می‌تواند یک بازیکن دیگر را به عنوان انتحاری انتخاب کند و همراه خود حذف کند.',
      acts: [
        {
          phase: 'DAY',
          title: 'انفجار انتحاری در دادگاه',
          description: 'هنگام خروج با رأی‌گیری روز، یک بازیکن را انتخاب و بلافاصله همراه خود به گور می‌برد.'
        }
      ],
      exceptions: [
        'اگر در شب توسط اسنایپر کشته شود، فرصت عملیات انتحاری روز را نخواهد داشت.',
        'تروریست زره‌پوش را در صورت داشتن زره فقط بی‌زره می‌کند.'
      ],
      counterpartRoleName: 'فدایی و قاضی',
      recommendedBundleName: 'حذف متقابل و ریسک بالا'
    },
    en: {
      name: 'The Terrorist',
      affiliationLabel: 'Mafia Team',
      description: 'The suicide bomber of the Mafia. When sentenced to daytime trial execution, can detonate and eliminate any chosen player along with himself.',
      acts: [
        {
          phase: 'DAY',
          title: 'Daylight Suicide Detonation',
          description: 'Upon execution by vote, triggers an explosive strike taking one selected player down with him.'
        }
      ],
      exceptions: [
        'If killed at night by the Sniper, cannot activate the daytime explosion.',
        'Striking an Armored citizen only destroys their armor.'
      ],
      counterpartRoleName: 'Sacrifice & Judge',
      recommendedBundleName: 'Mutual Destruction Operative'
    }
  },

  MATADOR: {
    fa: {
      name: 'ماتادور',
      affiliationLabel: 'تیم مافیا',
      description: 'خنثی‌کننده قابلیت‌های شبانه شهروندان. در فاز شب قابلیت یک بازیکن را مسدود می‌کند؛ اگر آن بازیکن اسنایپر، دکتر یا کارآگاه باشد، توانایی‌اش در آن شب سوزانده می‌شود.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'مسدودسازی اکت شبانه',
          description: 'یک بازیکن را انتخاب می‌کند تا نقش و توانایی او در آن شب از کار بیفتد.',
          priorityOrder: 2
        }
      ],
      exceptions: [
        'نمی‌تواند دو شب پیاپی یک بازیکن ثابت را بلاک کند.'
      ],
      counterpartRoleName: 'تک‌تیرانداز و کارآگاه',
      recommendedBundleName: 'بلاک و جنگ اطلاعاتی'
    },
    en: {
      name: 'The Matador',
      affiliationLabel: 'Mafia Team',
      description: 'The ultimate role blocker of the Mafia. Nullifies the nocturnal ability of any selected player, preventing their action (doctor save, sniper shot, detective inquiry) from taking effect.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Role Block Action',
          description: 'Selects a player to neutralize their night action for the current night cycle.',
          priorityOrder: 2
        }
      ],
      exceptions: [
        'Cannot target the same player on two consecutive nights.'
      ],
      counterpartRoleName: 'Sniper & Detective',
      recommendedBundleName: 'Nocturnal Disruption'
    }
  },

  SAUL_GOODMAN: {
    fa: {
      name: 'ساول گودمن (وکیل مافیا)',
      affiliationLabel: 'تیم مافیا',
      description: 'وکیل مدافع تبهکاران. یک‌بار در طول بازی می‌تواند در شب یک شهروند ساده را فریب داده و او را به عنوان عضو جدید به خانواده مافیا ملحق سازد.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'خرید و جذب شهروند',
          description: 'یک بار در بازی، به یک شهروند ساده پیشنهاد داده و او را به تیم مافیا منتقل می‌کند.',
          priorityOrder: 3
        }
      ],
      exceptions: [
        'تنها شهروند ساده قابل جذب است؛ در صورت انتخاب نقش‌های دارای توانایی، جذب شکست می‌خورد.'
      ],
      counterpartRoleName: 'همشهری کین و شهردار',
      recommendedBundleName: 'جذب نیرو و مذاکره مافیایی'
    },
    en: {
      name: 'Saul Goodman',
      affiliationLabel: 'Mafia Team',
      description: 'Corrupt defense attorney. Once per game at night, can bribe and convert a Simple Citizen into a full-fledged member of the Mafia syndicate.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Recruitment & Bribery',
          description: 'Once per match, converts an ordinary citizen into joining the Mafia family.',
          priorityOrder: 3
        }
      ],
      exceptions: [
        'Only Simple Citizens can be converted; targeting power roles results in failure.'
      ],
      counterpartRoleName: 'Citizen Kane & Mayor',
      recommendedBundleName: 'Mafia Legal Recruitment'
    }
  },

  SHAH_KOSH: {
    fa: {
      name: 'شاه‌کش',
      affiliationLabel: 'تیم مافیا',
      description: 'تک‌تیرانداز ترور دقیق مافیا. شب‌ها بیدار می‌شود و حدس می‌زند فلان بازیکن چه نقشی دارد؛ اگر حدس او درست باشد، آن بازیکن با دور زدن تمام محافظت‌های دکتر کشته می‌شود.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'ترور دقیق بر اساس حدس نقش',
          description: 'نام بازیکن و نقش ادعایی او را اعلام می‌کند؛ در صورت تطابق، قربانی بدون شانس نجات حذف می‌شود.',
          priorityOrder: 2
        }
      ],
      exceptions: [
        'تعداد فرصت‌های ترور شاه‌کش محدود است (معمولاً ۲ بار در کل بازی).'
      ],
      counterpartRoleName: 'نوستراداموس و بازپرس',
      recommendedBundleName: 'حدس نقش مرگبار'
    },
    en: {
      name: 'King-Slayer',
      affiliationLabel: 'Mafia Team',
      description: 'Lethal precision assassin. Guesses a target player\'s exact secret role at night. If correct, the victim is instantly eliminated, piercing through all doctor saves and shields.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Precision Role Assassination',
          description: 'Declares target and suspected role; if correct, eliminates the victim bypassing all protection.',
          priorityOrder: 2
        }
      ],
      exceptions: [
        'Limited to 2 assassination attempts per game.'
      ],
      counterpartRoleName: 'Inquisitor & Nostradamus',
      recommendedBundleName: 'Lethal Role Guessing'
    }
  },

  // Core Citizens
  CITIZEN_SIMPLE: {
    fa: {
      name: 'شهروند ساده',
      affiliationLabel: 'شهروندان',
      description: 'ستون فقرات و نیروی تصمیم‌گیرنده شهر. گرچه عمل شبانه مستقلی ندارد، اما با رصد گفتار، تناقض‌یابی در اتهامات و آرا در دادگاه‌های روز، نقاب از چهره مافیا برمی‌دارد.',
      acts: [
        {
          phase: 'DAY',
          title: 'تحلیل، استدلال و رای‌گیری',
          description: 'با پیگیری صحبت‌ها و رفتارهای بازیکنان به شناسایی مافیا پرداخته و در روز رای می‌دهد.'
        }
      ],
      exceptions: [
        'استعلام شهروند ساده برای کارآگاه همیشه منفی (شهروند) است.'
      ],
      counterpartRoleName: 'مافیای ساده',
      recommendedBundleName: 'ستون‌های پایه شهر و تیم'
    },
    en: {
      name: 'Simple Citizen',
      affiliationLabel: 'Citizens',
      description: 'The true backbone of the Town. Possesses no special night actions, but wields deductive logic, behavioral analysis, and decisive daytime votes to unmask the syndicate.',
      acts: [
        {
          phase: 'DAY',
          title: 'Deduction & Daytime Voting',
          description: 'Scrutinizes testimony, uncovers contradictions, and casts votes to eliminate suspects.'
        }
      ],
      exceptions: [
        'Shows negative (Innocent) on Detective inquiry.'
      ],
      counterpartRoleName: 'Simple Mafia',
      recommendedBundleName: 'Core Citizen Foundation'
    }
  },

  DOCTOR: {
    fa: {
      name: 'دکتر شهر (پزشک)',
      affiliationLabel: 'شهروندان',
      description: 'پزشک فداکار و ضامن بقای شهروندان. هر شب بیدار می‌شود و یک بازیکن را انتخاب می‌کند تا از گزند شلیک مرگبار مافیا نجات یابد. خود را نیز یک‌بار می‌تواند نجات دهد.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'درمان و نجات شبانه',
          description: 'یک بازیکن را برای نجات از شلیک شبانه انتخاب می‌کند.',
          priorityOrder: 3
        }
      ],
      exceptions: [
        'حق نجات جان خود را تنها ۱ بار در کل مسابقه دارد.',
        'نمی‌تواند فردی را از شلیک انتحاری تروریست در روز نجات دهد.'
      ],
      counterpartRoleName: 'پدرخوانده و دکتر لکتر',
      recommendedBundleName: 'پای ثابت تمامی سناریوها (نجات شهر)'
    },
    en: {
      name: 'The Doctor',
      affiliationLabel: 'Citizens',
      description: 'The dedicated guardian of life in town. Wakes each night to protect one player from the Mafia\'s lethal shot. Holds exactly one self-save allowance across the match.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Medical Save & Healing',
          description: 'Designates one player to immunize against the Mafia\'s nightly execution.',
          priorityOrder: 3
        }
      ],
      exceptions: [
        'May only heal himself once throughout the entire match.',
        'Cannot rescue victims of daytime terrorist detonations.'
      ],
      counterpartRoleName: 'Godfather & Doctor Lecter',
      recommendedBundleName: 'Essential Town Preservation'
    }
  },

  DETECTIVE: {
    fa: {
      name: 'کارآگاه شهر',
      affiliationLabel: 'شهروندان',
      description: 'چشم بیدار و بازوی اطلاعاتی شهر. هر شب استعلام وابستگی یک بازیکن را از گرداننده می‌گیرد (مافیا = مثبت، شهروند = منفی). استعلام پدرخوانده منفی است.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'استعلام هویت شبانه',
          description: 'به یک بازیکن اشاره می‌کند؛ گرداننده وضعیت مافیا (مثبت) یا شهروند (منفی) را اعلام می‌کند.',
          priorityOrder: 4
        }
      ],
      exceptions: [
        'استعلام پدرخوانده (گادفادر) فریبنده و همیشه منفی (شهروند) است.',
        'استعلام نقش‌های مستقل بسته به قوانین سناریو منفی یا خاص است.'
      ],
      counterpartRoleName: 'پدرخوانده مافیا',
      recommendedBundleName: 'پای ثابت تمامی سناریوها (کاشف هویت)'
    },
    en: {
      name: 'The Detective',
      affiliationLabel: 'Citizens',
      description: 'The town\'s premier investigator. Inspects one player each night to uncover their true faction (Positive = Mafia, Negative = Citizen). Note: The Godfather registers as negative.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Faction Inquiry',
          description: 'Points to a player at night; the Moderator reveals whether the suspect is Mafia or Citizen.',
          priorityOrder: 4
        }
      ],
      exceptions: [
        'The Godfather registers as negative (Innocent Citizen) to inquiries.',
        'Independent roles register according to specific scenario rules.'
      ],
      counterpartRoleName: 'The Godfather',
      recommendedBundleName: 'Essential Faction Investigator'
    }
  },

  SNIPER: {
    fa: {
      name: 'تک‌تیرانداز (اسنایپر / لئون)',
      affiliationLabel: 'شهروندان',
      description: 'اسلحه مسلح شهر در دل تاریکی شب. هر شب می‌تواند به یک مظنون شلیک کند؛ اگر هدف مافیا باشد کشته می‌شود، اما در صورت شلیک اشتباه به شهروند، خود تک‌تیرانداز فایربک خورده و می‌میرد.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'شلیک شبانه تک‌تیرانداز',
          description: 'یک بازیکن را نشانه می‌گیرد؛ شلیک به مافیا پیروزی و شلیک به شهروند مرگ خود اوست.',
          priorityOrder: 2
        }
      ],
      exceptions: [
        'تعداد گلوله‌های او در طول بازی معمولاً ۲ تیر است.',
        'در صورت شلیک به شهروند زره‌پوش، زره زره‌پوش می‌افتد و خود اسنایپر می‌میرد.'
      ],
      counterpartRoleName: 'ماتادور و دکتر لکتر',
      recommendedBundleName: 'شلیک شب و خنثی‌سازی (اسنایپر ⚔️ ماتادور)'
    },
    en: {
      name: 'The Sniper (Leon)',
      affiliationLabel: 'Citizens',
      description: 'The town\'s lethal vigilance. Takes nocturnal shots at suspected syndicate members. Hitting a Mafia eliminates them; hitting an innocent citizen causes fatal remorse (fireback), eliminating the Sniper.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Vigilante Night Shot',
          description: 'Targets a player at night. Eliminates Mafia targets, but commits suicide if striking an innocent.',
          priorityOrder: 2
        }
      ],
      exceptions: [
        'Ammunition is capped at 2 bullets per match.',
        'Shooting the Armored citizen shatters the armor while still causing fatal fireback to the Sniper.'
      ],
      counterpartRoleName: 'Matador & Doctor Lecter',
      recommendedBundleName: 'Lethal Town Counter-Offensive'
    }
  },

  ARMORED: {
    fa: {
      name: 'شهروند زره‌پوش',
      affiliationLabel: 'شهروندان',
      description: 'شهروند سرسخت با جلیقه مقاوم. اولین شلیک شبانه مافیا یا اولین خروج با رأی دادگاه روز فقط زره او را از بین می‌برد و او در بازی باقی می‌ماند و شهروندی‌اش اثبات می‌شود.',
      acts: [
        {
          phase: 'PASSIVE',
          title: 'زره فولادی دفاعی',
          description: 'اولین ضربه مرگبار شب یا روز را جذب کرده و زره‌اش می‌افتد.'
        }
      ],
      exceptions: [
        'پس از افتادن زره، مانند یک شهروند ساده در برابر شلیک‌ها آسیب‌پذیر است.'
      ],
      counterpartRoleName: 'تروریست و مرد قوی',
      recommendedBundleName: 'مقاومت و اثبات شهروندی'
    },
    en: {
      name: 'The Armored Citizen',
      affiliationLabel: 'Citizens',
      description: 'Heavily protected citizen warrior. Survives the first lethal night attack or daylight trial execution by shattering their protective armor, publicly demonstrating their citizenship.',
      acts: [
        {
          phase: 'PASSIVE',
          title: 'Ballistic Armor Plating',
          description: 'Absorbs the first lethal night shot or daytime verdict, shedding the armor instead of dying.'
        }
      ],
      exceptions: [
        'After the armor breaks, reverts to ordinary vulnerability like a Simple Citizen.'
      ],
      counterpartRoleName: 'Terrorist & Strongman',
      recommendedBundleName: 'Armor Defense & Verification'
    }
  },

  MAYOR: {
    fa: {
      name: 'شهردار',
      affiliationLabel: 'شهروندان',
      description: 'مدیر ارشد و دارای حق وتو در شهر. می‌تواند رأی نهایی خروج یک بازیکن از دادگاه روز را وتو و لغو کند یا در برخی سناریوها رأی او وزن دوبرابر دارد.',
      acts: [
        {
          phase: 'DAY',
          title: 'وتوی حکم دادگاه یا رای دوبرابر',
          description: 'می‌تواند حکم اعدام روز را وتو کرده و مانع خروج متهم شود.'
        }
      ],
      exceptions: [
        'حق وتوی شهردار در طول مسابقه ۱ بار قابل استفاده است.'
      ],
      counterpartRoleName: 'چرچیل و قاضی',
      recommendedBundleName: 'حاکمیت مدنی و لغو احکام'
    },
    en: {
      name: 'The Mayor',
      affiliationLabel: 'Citizens',
      description: 'Chief municipal magistrate. Possesses the extraordinary authority to veto a daytime execution verdict or exert double-weighted voting power in trials.',
      acts: [
        {
          phase: 'DAY',
          title: 'Executive Veto / Double Vote',
          description: 'Can nullify a daytime execution verdict once per game, sparing the condemned player.'
        }
      ],
      exceptions: [
        'Veto power can only be exercised once during the entire match.'
      ],
      counterpartRoleName: 'Churchill & Judge',
      recommendedBundleName: 'Civic Veto & Judicial Authority'
    }
  },

  PSYCHOLOGIST: {
    fa: {
      name: 'روانشناس (روان‌پزشک)',
      affiliationLabel: 'شهروندان',
      description: 'درمانگر روان و کلام شهروندان. در فاز شب بازیکنی را که توسط ناتاشا سایلنت شده روان‌درمانی می‌کند و قدرت تکلم و مشارکت او را بازمی‌گرداند.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'روان‌درمانی و رفع سایلنت',
          description: 'یک بازیکن را مداوا می‌کند؛ اگر سایلنت باشد قفل کلام او باز می‌شود.',
          priorityOrder: 4
        }
      ],
      exceptions: [
        'نمی‌تواند در دو شب متوالی یک بازیکن را درمان کند.'
      ],
      counterpartRoleName: 'ناتاشا (سایلنسر)',
      recommendedBundleName: 'درمان و رهایی از سکوت'
    },
    en: {
      name: 'The Psychologist',
      affiliationLabel: 'Citizens',
      description: 'Mental rehabilitation specialist. Wakes at night to treat a citizen silenced by Natasha, lifting the silencing effect and restoring full speech rights.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Speech Rehabilitation',
          description: 'Selects a target to cure silence and psychological manipulation.',
          priorityOrder: 4
        }
      ],
      exceptions: [
        'Cannot treat the same player on consecutive nights.'
      ],
      counterpartRoleName: 'Natasha (Silencer)',
      recommendedBundleName: 'Psychological Restoration'
    }
  },

  DIE_HARD: {
    fa: {
      name: 'جان‌سخت',
      affiliationLabel: 'شهروندان',
      description: 'شهروند پولادین با دو مزیت بزرگ: دارای زره شبانه است که شلیک اول را بی‌اثر می‌کند، و تا ۲ بار می‌تواند در فاز شب استعلام وضعیت بازیکنان خارج‌شده از بازی را بگیرد.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'استعلام وضعیت کشته‌ها',
          description: 'در فاز شب درخواست استعلام می‌کند و گرداننده نقش‌های خارج‌شده را اعلام می‌کند.',
          priorityOrder: 5
        },
        {
          phase: 'PASSIVE',
          title: 'زره شبانه جان‌سخت',
          description: 'تیر اول شلیک مافیا فقط زره او را می‌اندازد و او کشته نمی‌شود.'
        }
      ],
      exceptions: [
        'حداکثر ۲ بار می‌تواند استعلام وضعیت بگیرد.'
      ],
      counterpartRoleName: 'پدرخوانده و ناتو',
      recommendedBundleName: 'اطلاعات گورستان و مقاومت'
    },
    en: {
      name: 'Die Hard',
      affiliationLabel: 'Citizens',
      description: 'Unyielding survivor equipped with night armor surviving the first hit. Can also request up to 2 comprehensive night cemetery inquiries to learn the roles of fallen players.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Fallen Player Inquiry',
          description: 'Requests a night tally from the Moderator revealing the roles of eliminated players.',
          priorityOrder: 5
        },
        {
          phase: 'PASSIVE',
          title: 'Survivor Armor',
          description: 'Absorbs the first lethal night strike, losing armor instead of dying.'
        }
      ],
      exceptions: [
        'Capped at exactly 2 cemetery inquiries per match.'
      ],
      counterpartRoleName: 'The Godfather & NATO',
      recommendedBundleName: 'Cemetery Intel & Armor'
    }
  },

  GUNNER: {
    fa: {
      name: 'تفنگدار',
      affiliationLabel: 'شهروندان',
      description: 'متولی سلاح‌های شهر. در فاز روز به بازیکنان تیر جنگی یا مشقی می‌دهد تا در دادگاه به سمت مظنونین شلیک کنند و حقیقت را آشکار سازند.',
      acts: [
        {
          phase: 'DAY',
          title: 'اهدای سلاح در روز',
          description: 'به یک بازیکن اسلحه می‌دهد تا در صحن علنی شهر شلیک کند.'
        }
      ],
      exceptions: [
        'تعداد تیرهای جنگی محدود (معمولاً ۱ تیر جنگی و ۱ مشقی) است.'
      ],
      counterpartRoleName: 'اسلحه‌ساز و تروریست',
      recommendedBundleName: 'شلیک علنی و دوئل روز'
    },
    en: {
      name: 'The Gunner',
      affiliationLabel: 'Citizens',
      description: 'Master of arms for the town. Delivers live and blank ammunition to citizens during daylight, enabling direct public confrontations and shootouts.',
      acts: [
        {
          phase: 'DAY',
          title: 'Daylight Firearm Distribution',
          description: 'Provides a firearm with live or blank round to a player for immediate daytime shooting.'
        }
      ],
      exceptions: [
        'Carries strictly limited live ammunition (usually 1 live, 1 blank).'
      ],
      counterpartRoleName: 'Gunsmith & Terrorist',
      recommendedBundleName: 'Daylight Tactical Shootout'
    }
  },

  RANGER: {
    fa: {
      name: 'تکاور',
      affiliationLabel: 'شهروندان',
      description: 'کماندوی واکنش سریع شهر. اگر مافیا در شب به او شلیک کند، او همزمان مهاجم را هدف قرار داده و شلیک متقابل می‌کند و تیرانداز را همراه خود می‌کشد.',
      acts: [
        {
          phase: 'PASSIVE',
          title: 'شلیک متقابل در لحظه مرگ',
          description: 'در صورت مورد هدف قرار گرفتن در شب، مهاجم مافیا را نیز با خود به هلاکت می‌رساند.'
        }
      ],
      exceptions: [
        'اگر توسط تروریست یا رأی روز کشته شود، تیر متقابل فعال نمی‌گردد.'
      ],
      counterpartRoleName: 'ناتو و رئیس مافیا',
      recommendedBundleName: 'کماندو و ضدحمله شبانه'
    },
    en: {
      name: 'The Ranger',
      affiliationLabel: 'Citizens',
      description: 'Elite commando prepared for counter-ambush. If targeted by the Mafia\'s night kill, fires an instantaneous retaliatory round, taking the shooter down with him.',
      acts: [
        {
          phase: 'PASSIVE',
          title: 'Lethal Counter-Ambush',
          description: 'Eliminates the attacking mafia operative simultaneously if struck by a night hit.'
        }
      ],
      exceptions: [
        'Retaliation triggers only on night attacks, not daytime voting executions.'
      ],
      counterpartRoleName: 'NATO & Mafia Don',
      recommendedBundleName: 'Commando Retaliation'
    }
  },

  INQUISITOR: {
    fa: {
      name: 'بازپرس',
      affiliationLabel: 'شهروندان',
      description: 'قاضی تحقیق و بازپرس ویژه. در طول روز می‌تواند بازجویی رسمی انجام داده و اگر جرم فردی مسجل شود، او را مستقیماً از روند بازی خارج کند.',
      acts: [
        {
          phase: 'DAY',
          title: 'احضار به بازجویی و بازداشت',
          description: 'مظنونین را برای بازپرسی احضار کرده و پرونده قضایی آن‌ها را باز می‌کند.'
        }
      ],
      exceptions: [
        'در صورت بازداشت اشتباه شهروند بی‌گناه، صلاحیت قضایی خود را از دست می‌دهد.'
      ],
      counterpartRoleName: 'شاه‌کش و چرچیل',
      recommendedBundleName: 'عدالت قضایی و بازجویی'
    },
    en: {
      name: 'The Inquisitor',
      affiliationLabel: 'Citizens',
      description: 'Chief judicial investigator. Summons suspects to formal interrogation during trials, able to detain proven syndicate criminals directly from the board.',
      acts: [
        {
          phase: 'DAY',
          title: 'Judicial Summon & Detention',
          description: 'Forces suspects into trial interrogation and issues direct arrests.'
        }
      ],
      exceptions: [
        'Wrongfully detaining an innocent citizen strips him of judicial authority.'
      ],
      counterpartRoleName: 'King-Slayer & Churchill',
      recommendedBundleName: 'Judicial Prosecution'
    }
  },

  CONSTANTINE: {
    fa: {
      name: 'کنستانتین',
      affiliationLabel: 'شهروندان',
      description: 'احیاگر و ناجی ماورایی. یک‌بار در طول بازی می‌تواند در فاز شب یکی از شهروندان کشته‌شده را به زندگی بازگرداند تا به کمک شهر بشتابد.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'احیای شهروند کشته‌شده',
          description: 'یکی از اموات شهر را انتخاب کرده و او را زنده به مسابقه برمی‌گرداند.',
          priorityOrder: 1
        }
      ],
      exceptions: [
        'تنها ۱ بار در طول بازی قابل استفاده است.',
        'نمی‌تواند عضو مافیا را زنده کند؛ در صورت انتخاب مافیا، احیا ناکام می‌ماند.'
      ],
      counterpartRoleName: 'پدرخوانده و سم‌ساز',
      recommendedBundleName: 'معجزه بقا و احیای اموات'
    },
    en: {
      name: 'Constantine',
      affiliationLabel: 'Citizens',
      description: 'Mystic reviver of the fallen. Once per game at night, can resurrect one eliminated citizen back from the dead to rejoin the town\'s struggle.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Resurrection of the Dead',
          description: 'Restores one eliminated citizen back to life and full participation.',
          priorityOrder: 1
        }
      ],
      exceptions: [
        'Usable strictly once per match.',
        'Cannot resurrect Mafia members; targeting a mafia fails the resurrection.'
      ],
      counterpartRoleName: 'Godfather & Poisoner',
      recommendedBundleName: 'Miraculous Resurrection'
    }
  },

  // Independent Roles
  JOKER: {
    fa: {
      name: 'جوکر (نقش مستقل)',
      affiliationLabel: 'مستقل',
      description: 'نماد هرج‌ومرج و شیدایی. تنها شرط پیروزی جوکر این است که در فاز روز با رأی دادگاه شهروندان اعدام شود! اگر شهروندان به او رأی خروج دهند، او به تنهایی فاتح کل بازی می‌شود.',
      acts: [
        {
          phase: 'DAY',
          title: 'تحریک آرا و جلب سوءظن',
          description: 'طوری بازی می‌کند که مظنون به مافیا به نظر برسد تا در دادگاه شهر به خروج او رای دهند.'
        }
      ],
      exceptions: [
        'اگر در شب توسط مافیا یا اسنایپر کشته شود، بازنده است.',
        'پیروزی او مسابقه را بلافاصله با برد جوکر به پایان می‌رساند.'
      ],
      counterpartRoleName: 'کارآگاه و شهروندان',
      recommendedBundleName: 'هرج‌ومرج مطلق و روان‌پریشی'
    },
    en: {
      name: 'The Joker (Independent)',
      affiliationLabel: 'Independent',
      description: 'Avatar of pure anarchy. His exclusive victory condition is getting executed by the Town\'s daylight trial vote! If hanged by public vote, he wins the entire game solo.',
      acts: [
        {
          phase: 'DAY',
          title: 'Provocation & Suspicion Baiting',
          description: 'Feigns suspicious mafia behavior to bait citizens into condemning him to execution.'
        }
      ],
      exceptions: [
        'Loses if eliminated at night by Mafia or Sniper.',
        'His execution immediately concludes the match with a solo Joker victory.'
      ],
      counterpartRoleName: 'Detective & Citizens',
      recommendedBundleName: 'Chaos & Psychological Bait'
    }
  },

  NOSTRADAMUS: {
    fa: {
      name: 'نوستراداموس (پیشگو / مستقل)',
      affiliationLabel: 'مستقل',
      description: 'پیشگوی مستقل سرنوشت شهر. در شب اول تعداد مافیاها را حدس می‌زند و در شب سوم پیش‌بینی می‌کند کدام جبهه پیروز می‌شود؛ او به همان جبهه پیوسته و در صورت پیروزی آن‌ها، برنده می‌شود.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'پیش‌بینی پیروزی و انتخاب ساید',
          description: 'در شب سوم ساید برنده (مافیا یا شهروند) را پیش‌بینی و به آنها ملحق می‌شود.',
          priorityOrder: 3
        }
      ],
      exceptions: [
        'تا پیش از شب سوم به عنوان مستقل بازی می‌کند.'
      ],
      counterpartRoleName: 'پدرخوانده و کارآگاه',
      recommendedBundleName: 'پیشگویی و تغییر سرنوشت'
    },
    en: {
      name: 'Nostradamus (Independent)',
      affiliationLabel: 'Independent',
      description: 'Astrological seer predicting the war\'s outcome. Inspects mafia counts on Night 1 and formally forecasts the winning faction on Night 3, joining that side to share their victory.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Faction Destiny Alignment',
          description: 'Forecasts which faction (Mafia or Citizen) will prevail and formally joins them.',
          priorityOrder: 3
        }
      ],
      exceptions: [
        'Operates as fully independent until Night 3 alignment.'
      ],
      counterpartRoleName: 'Godfather & Detective',
      recommendedBundleName: 'Prophecy & Faction Alignment'
    }
  },

  ZODIAC: {
    fa: {
      name: 'قاتل زنجیره‌ای زودیاک (مستقل)',
      affiliationLabel: 'مستقل',
      description: 'قاتل خونسرد و بی‌رحم شب‌های تاریک. شب‌های زوج به تنهایی شلیک می‌کند، دارای جلیقه ضدگلوله است و برای پیروزی باید هم اعضای مافیا و هم شهروندان را از سر راه بردارد.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'شلیک زنجیره‌ای شب‌های زوج',
          description: 'در شب‌های زوج بیدار شده و به تنهایی قربانی خود را از بین مافیا یا شهروندان هدف قرار می‌دهد.',
          priorityOrder: 1
        },
        {
          phase: 'PASSIVE',
          title: 'جلیقه ضدگلوله زودیاک',
          description: 'اولین شلیک مرگبار شب به او بی‌اثر بوده و جلیقه‌اش می‌افتد.'
        }
      ],
      exceptions: [
        'تنها در صورت حذف تمام مافیاها و شهروندان به پیروزی انفرادی می‌رسد.'
      ],
      counterpartRoleName: 'دکتر واتسون و اسنایپر',
      recommendedBundleName: 'ترور انفرادی و بقای مطلق'
    },
    en: {
      name: 'The Zodiac Killer (Independent)',
      affiliationLabel: 'Independent',
      description: 'Notorious solo serial killer. Strikes exclusively on even nights with lethal attacks and wears protective body armor. Wins only by eradicating both Mafia and Citizens.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Even-Night Serial Murder',
          description: 'Wakes on even-numbered nights to execute any chosen player from either faction.',
          priorityOrder: 1
        },
        {
          phase: 'PASSIVE',
          title: 'Kevlar Body Armor',
          description: 'Survives the first nocturnal lethal hit by shedding the vest.'
        }
      ],
      exceptions: [
        'Wins solely if he is the last survivor standing over all factions.'
      ],
      counterpartRoleName: 'Dr. Watson & Sniper',
      recommendedBundleName: 'Solo Serial Elimination'
    }
  },

  WEREWOLF: {
    fa: {
      name: 'گرگینه (مستقل)',
      affiliationLabel: 'مستقل',
      description: 'هیولای وحشی شب. شب‌ها تبدیل به گرگ شده و به طعمه‌های خود حمله می‌کند. در برابر شلیک‌های معمولی مصونیت دارد و با کشتار مداوم به دنبال تسلط بر کل شهر است.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'حمله شبانه گرگینه',
          description: 'به یک قربانی حمله کرده و او را می‌درد.',
          priorityOrder: 1
        }
      ],
      exceptions: [
        'تنها با نقره یا شلیک‌های ویژه از پای درمی‌آید.'
      ],
      counterpartRoleName: 'شکارچی و پیشگو',
      recommendedBundleName: 'وحشت فانتزی و ماه کامل'
    },
    en: {
      name: 'The Werewolf (Independent)',
      affiliationLabel: 'Independent',
      description: 'Savage beast of the full moon. Transforms each night to hunt down prey across both sides. Possesses natural nocturnal resilience against ordinary attacks.',
      acts: [
        {
          phase: 'NIGHT',
          title: 'Nocturnal Lycanthropic Maul',
          description: 'Attacks and mauls a designated victim during the night.',
          priorityOrder: 1
        }
      ],
      exceptions: [
        'Vulnerable primarily to specialized silver ammunition or daylight hanging.'
      ],
      counterpartRoleName: 'Hunter & Seer',
      recommendedBundleName: 'Dark Fantasy Lycanthropy'
    }
  },

  CUSTOM: {
    fa: {
      name: 'نقش سفارشی (گرداننده)',
      affiliationLabel: 'سفارشی',
      description: 'نقش دست‌ساز و سفارشی با قابلیت‌ها، نام و شرایط پیروزی تعریف‌شده توسط گرداننده مسابقه.',
      acts: [
        {
          phase: 'PASSIVE',
          title: 'دستورالعمل اختصاصی',
          description: 'طبق هماهنگی اولیه با گرداننده در بازی عمل می‌کند.'
        }
      ],
      exceptions: [
        'قوانین این نقش قبل از تقسیم کارت‌ها توسط گرداننده اعلام می‌شود.'
      ],
      counterpartRoleName: 'طبق توافق میز',
      recommendedBundleName: 'شخصی‌سازی نامحدود'
    },
    en: {
      name: 'Custom Moderator Role',
      affiliationLabel: 'Custom',
      description: 'Handcrafted custom role with custom abilities, faction, and win conditions curated by the Moderator.',
      acts: [
        {
          phase: 'PASSIVE',
          title: 'Custom Protocol',
          description: 'Operates per initial briefing and parameters agreed with the Moderator.'
        }
      ],
      exceptions: [
        'Special house rules govern this role as briefed before card distribution.'
      ],
      counterpartRoleName: 'Per Table Agreement',
      recommendedBundleName: 'Unlimited Customization'
    }
  }
};

/**
 * Returns comprehensive, fully translated role data for any role in the application
 */
export function getCompleteRoleInfo(roleId: string, language: Language) {
  const baseDef = ROLE_DEFINITIONS[roleId] || ROLE_DEFINITIONS['CITIZEN_SIMPLE'];
  const langKey = language === 'fa' ? 'fa' : 'en';
  const customRole = COMPLETE_ROLES_DATABASE[roleId]?.[langKey];

  if (customRole) {
    return {
      ...baseDef,
      id: baseDef.id,
      localizedName: customRole.name,
      localizedAffiliation: customRole.affiliationLabel,
      localizedDescription: customRole.description,
      localizedActs: customRole.acts,
      localizedExceptions: customRole.exceptions,
      counterpartRoleName: customRole.counterpartRoleName || baseDef.counterpartRoleName,
      recommendedBundleName: customRole.recommendedBundleName || baseDef.recommendedBundleName
    };
  }

  // Fallback for roles not explicitly mapped
  const isEn = language === 'en';
  return {
    ...baseDef,
    id: baseDef.id,
    localizedName: isEn ? (baseDef.id.replace(/_/g, ' ')) : (baseDef.nameKey || baseDef.id),
    localizedAffiliation: isEn ? (baseDef.affiliation === 'MAFIA' ? 'Mafia' : baseDef.affiliation === 'INDEPENDENT' ? 'Independent' : 'Citizen') : (baseDef.affiliation === 'MAFIA' ? 'تیم مافیا' : baseDef.affiliation === 'INDEPENDENT' ? 'نقش مستقل' : 'تیم شهروند'),
    localizedDescription: isEn ? `Key operative fulfilling specific tactical responsibilities in the city during Day and Night phases.` : baseDef.descriptionKey,
    localizedActs: baseDef.acts || [],
    localizedExceptions: baseDef.exceptions || []
  };
}
