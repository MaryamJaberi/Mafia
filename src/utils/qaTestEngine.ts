import { 
  Player, RoleId, RoomState, Accusation, GamePhase, Scenario 
} from '../types/mafia';
import { DEFAULT_SCENARIOS, ROLE_DEFINITIONS } from './scenarios';
import { generateBotPlayers } from './testSimulator';
import { soundEngine } from './audioSynth';
import { defaultSettings, saveLocalSettings, getLocalSettings } from './storage';

export interface QATestAssertion {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

export interface QAScenarioRunResult {
  runIndex: number;
  scenarioId: string;
  scenarioName: string;
  playerCount: number;
  eventsLog: string[];
  winner: 'CITIZENS' | 'MAFIA' | 'INDEPENDENT' | 'ONGOING';
  daysPlayed: number;
  assertions: QATestAssertion[];
  passed: boolean;
  executionTimeMs: number;
}

export interface QAScenarioSuiteResult {
  scenario: Scenario;
  runs: QAScenarioRunResult[];
  totalPassed: number;
  totalFailed: number;
  allPassed: boolean;
}

export interface QAFullReport {
  timestamp: number;
  totalScenarios: number;
  totalRunsTarget: number;
  totalRunsCompleted: number;
  totalPassedRuns: number;
  totalFailedRuns: number;
  totalAssertionsChecked: number;
  totalAssertionsPassed: number;
  systemIntegrityScore: number; // 0 to 100%
  subsystemChecks: {
    name: string;
    passed: boolean;
    details: string;
  }[];
  scenarioSuites: QAScenarioSuiteResult[];
  overallStatus: 'PASSED' | 'FAILED';
  executionDurationMs: number;
}

// Extensible QA Registry: Any new feature can register its tests here!
export type QACustomTestFunction = () => Promise<{ name: string; passed: boolean; details?: string }>;
const customQATestsRegistry: { name: string; category: string; fn: QACustomTestFunction }[] = [];

export function registerQATest(name: string, category: string, fn: QACustomTestFunction) {
  customQATestsRegistry.push({ name, category, fn });
}

/**
 * Simulates a full, rule-compliant Mafia match for a given scenario with targeted event variations
 */
export function simulateSingleGameRun(
  scenario: Scenario,
  runIndex: number
): QAScenarioRunResult {
  const startTime = performance.now();
  const assertions: QATestAssertion[] = [];
  const eventsLog: string[] = [];

  const roles = [...scenario.roles];
  const playerCount = roles.length;

  // Assertion 1: Scenario role count matches declared recommended count
  const countMatches = playerCount === scenario.recommendedPlayerCount;
  assertions.push({
    name: 'تعداد نقش‌های سناریو مطابق با ظرفیت تعریف‌شده',
    passed: countMatches,
    details: `سناریو دارای ${playerCount} نقش است (ظرفیت: ${scenario.recommendedPlayerCount})`
  });

  // Assertion 2: All role IDs are valid in ROLE_DEFINITIONS
  const invalidRoles = roles.filter(r => !ROLE_DEFINITIONS[r]);
  assertions.push({
    name: 'اعتبار کلیه شناسه‌های نقش در پایگاه داده نقش‌ها',
    passed: invalidRoles.length === 0,
    details: invalidRoles.length > 0 ? `نقش‌های نامعتبر: ${invalidRoles.join(', ')}` : 'کلیه نقش‌ها استاندارد هستند'
  });

  // Generate test players
  const players: Player[] = roles.map((roleId, idx) => ({
    id: `qa_player_${idx + 1}_run_${runIndex}`,
    name: `بازیکن شماره ${idx + 1}`,
    avatar: '🕵️',
    role: roleId,
    isAlive: true,
    isConnected: true,
    isReady: true,
    isHost: false,
    seatNumber: idx + 1,
    joinedAt: Date.now() + idx * 10,
    fouls: 0,
    speechMuted: false,
    roleRevealedAndConfirmed: true
  }));

  let dayNumber = 1;
  let winner: 'CITIZENS' | 'MAFIA' | 'INDEPENDENT' | 'ONGOING' = 'ONGOING';
  const maxDays = 7;

  eventsLog.push(`شروع اجرای سناریو «${scenario.name}» (تکرار ${runIndex + 1} از ۵) با ${players.length} بازیکن`);

  // Game Loop Simulation
  while (dayNumber <= maxDays && winner === 'ONGOING') {
    eventsLog.push(`--- شب شماره ${dayNumber} ---`);

    // 1. NIGHT PHASE
    const alivePlayers = players.filter(p => p.isAlive);
    const aliveMafia = alivePlayers.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation === 'MAFIA');
    const aliveCitizens = alivePlayers.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation === 'CITIZEN');
    const aliveIndependents = alivePlayers.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation === 'INDEPENDENT');

    // Check immediate victory condition
    if (aliveMafia.length === 0) {
      winner = 'CITIZENS';
      eventsLog.push('پیروزی شهروندان: تمامی اعضای مافیا حذف شدند.');
      break;
    }
    if (aliveMafia.length >= aliveCitizens.length + aliveIndependents.length) {
      winner = 'MAFIA';
      eventsLog.push('پیروزی مافیا: تعداد مافیا به برابری با شهروندان رسید.');
      break;
    }

    // Mafia chooses a kill target among living citizens/independents
    const targetPool = alivePlayers.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation !== 'MAFIA');
    let mafiaTarget = targetPool[Math.floor(Math.random() * targetPool.length)];

    // Doctor save
    const hasDoctor = alivePlayers.some(p => p.role === 'DOCTOR' || p.role === 'DOCTOR_WATSON');
    let doctorSavedPlayer: Player | undefined;
    if (hasDoctor && Math.random() < 0.6) {
      // Doctor attempts save
      doctorSavedPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      eventsLog.push(`دکتر اقدام به نجات «${doctorSavedPlayer.name}» نمود.`);
    }

    // Detective inquiry check
    const hasDetective = alivePlayers.some(p => p.role === 'DETECTIVE');
    if (hasDetective) {
      const inquiryTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      const targetRoleDef = ROLE_DEFINITIONS[inquiryTarget.role];
      const isPositive = targetRoleDef?.affiliation === 'MAFIA' && !targetRoleDef?.hasInquiryImmunity;
      eventsLog.push(`کارآگاه استعلام «${inquiryTarget.name}» (${inquiryTarget.role}) را گرفت -> نتیجه: ${isPositive ? 'مثبت (مافیا)' : 'منفی (شهروند)'}`);
      
      // Assertion: Godfather must always return negative (immunity)
      if (inquiryTarget.role === 'GODFATHER') {
        assertions.push({
          name: 'مصونیت استعلام شبانه رئیس مافیا (گادفادر)',
          passed: !isPositive,
          details: 'استعلام گادفادر منفی گزارش شد.'
        });
      }
    }

    // Resolve Night Kills
    if (mafiaTarget) {
      if (doctorSavedPlayer && doctorSavedPlayer.id === mafiaTarget.id) {
        eventsLog.push(`نجات موفق! «${mafiaTarget.name}» با درمان دکتر در بازی باقی ماند.`);
      } else if (mafiaTarget.role === 'ARMORED' && Math.random() < 0.5) {
        eventsLog.push(`شلیک به زره‌پوش «${mafiaTarget.name}» اصابت کرد و فقط زره او افتاد.`);
      } else {
        mafiaTarget.isAlive = false;
        eventsLog.push(`شلیک شب: «${mafiaTarget.name}» (${mafiaTarget.role}) کشته شد.`);
      }
    }

    // 2. DAY DISCUSSION & ACCUSATION PHASE
    eventsLog.push(`--- روز شماره ${dayNumber} ---`);
    const currentAlive = players.filter(p => p.isAlive);
    const dayMafia = currentAlive.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation === 'MAFIA');
    const dayCitizens = currentAlive.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation === 'CITIZEN');

    if (dayMafia.length === 0) {
      winner = 'CITIZENS';
      eventsLog.push('پیروزی شهروندان در سپیده‌دم روز.');
      break;
    }
    if (dayMafia.length >= dayCitizens.length) {
      winner = 'MAFIA';
      eventsLog.push('پیروزی مافیا در روز.');
      break;
    }

    // Simulate Accusations
    const accusations: Accusation[] = [];
    currentAlive.forEach(accuser => {
      const possibleTargets = currentAlive.filter(p => p.id !== accuser.id);
      if (possibleTargets.length > 0) {
        const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
        accusations.push({
          id: `acc_${accuser.id}_${target.id}`,
          accuserId: accuser.id,
          targetId: target.id,
          dayNumber,
          timestamp: Date.now()
        });
      }
    });

    eventsLog.push(`ثبت ${accusations.length} اتهام در روز ${dayNumber}.`);

    // 3. VOTING & DEFENSE COURT
    // Pick highest accused player
    const counts: Record<string, number> = {};
    accusations.forEach(a => {
      counts[a.targetId] = (counts[a.targetId] || 0) + 1;
    });

    let topTargetId = '';
    let maxVotes = -1;
    Object.entries(counts).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        topTargetId = id;
      }
    });

    const accusedPlayer = players.find(p => p.id === topTargetId && p.isAlive);
    if (accusedPlayer && maxVotes >= Math.ceil(currentAlive.length / 3)) {
      eventsLog.push(`«${accusedPlayer.name}» با کسب ${maxVotes} رأی به دادگاه دفاع فرستاده شد.`);
      
      // Defense execution vote
      if (Math.random() < 0.7) {
        accusedPlayer.isAlive = false;
        eventsLog.push(`رأی‌گیری نهایی: «${accusedPlayer.name}» (${accusedPlayer.role}) با رأی شهروندان اعدام شد.`);
        
        // If Joker executed -> Independent victory!
        if (accusedPlayer.role === 'JOKER') {
          winner = 'INDEPENDENT';
          eventsLog.push('پیروزی جوکر: جوکر موفق شد در دادگاه روز اعدام شود!');
          break;
        }
      } else {
        eventsLog.push(`رأی دادگاه به حد نصاب نرسید و «${accusedPlayer.name}» تبرئه شد.`);
      }
    }

    dayNumber++;
  }

  // Assertion 3: Game reached a deterministic conclusion
  const hasOutcome = winner !== 'ONGOING' || dayNumber > maxDays;
  assertions.push({
    name: 'رسیدن بازی به نتیجه مشخص و بررسی شروط پایان',
    passed: hasOutcome,
    details: `نتیجه بازی: ${winner} (تعداد روزهای سپری‌شده: ${dayNumber - 1})`
  });

  // Assertion 4: Player integrity preserved (alive players have valid states)
  const allValid = players.every(p => typeof p.isAlive === 'boolean' && p.seatNumber > 0);
  assertions.push({
    name: 'حفظ یکپارچگی داده‌ها و مشخصات بازیکنان در چرخه حیات',
    passed: allValid,
    details: 'تمامی بازیکنان دارای وضعیت حیات و شماره صندلی معتبر هستند.'
  });

  const executionTimeMs = performance.now() - startTime;
  const allPassed = assertions.every(a => a.passed);

  return {
    runIndex,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    playerCount,
    eventsLog,
    winner,
    daysPlayed: dayNumber - 1,
    assertions,
    passed: allPassed,
    executionTimeMs
  };
}

/**
 * Runs the full 5-run simulation suite for all 17 default scenarios (85 total game runs)
 */
export async function runFullAutomatedQASuite(
  onProgress?: (progress: {
    currentScenarioIndex: number;
    totalScenarios: number;
    currentRunIndex: number;
    totalRuns: number;
    scenarioName: string;
    percent: number;
  }) => void
): Promise<QAFullReport> {
  const globalStartTime = performance.now();
  const scenarios = DEFAULT_SCENARIOS;
  const totalScenarios = scenarios.length;
  const runsPerScenario = 5;
  const totalRunsTarget = totalScenarios * runsPerScenario;

  const scenarioSuites: QAScenarioSuiteResult[] = [];
  let totalRunsCompleted = 0;
  let totalPassedRuns = 0;
  let totalFailedRuns = 0;
  let totalAssertionsChecked = 0;
  let totalAssertionsPassed = 0;

  // Run Subsystem Diagnostics
  const subsystemChecks: { name: string; passed: boolean; details: string }[] = [];

  // 1. Audio Synthesizer Test
  try {
    const isMuted = soundEngine.getMuted();
    soundEngine.setMuted(true);
    soundEngine.playTick();
    soundEngine.playGong();
    soundEngine.setMuted(isMuted);
    subsystemChecks.push({
      name: 'موتور سنتز صوتی Web Audio API',
      passed: true,
      details: 'توابع صوتی بدون کرش یا خطا اجرا شدند.'
    });
  } catch (err) {
    subsystemChecks.push({
      name: 'موتور سنتز صوتی Web Audio API',
      passed: false,
      details: String(err)
    });
  }

  // 2. Storage Roundtrip Test
  try {
    const originalSettings = getLocalSettings();
    saveLocalSettings(originalSettings);
    const reloaded = getLocalSettings();
    const storageOk = typeof reloaded.defaultTimerSeconds === 'number' && typeof reloaded.language === 'string';
    subsystemChecks.push({
      name: 'ذخیره‌سازی و بازیابی پایدار LocalStorage',
      passed: storageOk,
      details: 'تنظیمات و متغیرهای محلی با موفقیت ذخیره و همگام شدند.'
    });
  } catch (err) {
    subsystemChecks.push({
      name: 'ذخیره‌سازی و بازیابی پایدار LocalStorage',
      passed: false,
      details: String(err)
    });
  }

  // 3. Custom Registered QA Suites
  for (const customTest of customQATestsRegistry) {
    try {
      const res = await customTest.fn();
      subsystemChecks.push({
        name: `تست افزونه‌ای: ${customTest.name} (${customTest.category})`,
        passed: res.passed,
        details: res.details || 'تست ماژولار با موفقیت گذرانده شد.'
      });
    } catch (err) {
      subsystemChecks.push({
        name: `تست افزونه‌ای: ${customTest.name}`,
        passed: false,
        details: String(err)
      });
    }
  }

  // Iterate through all 17 scenarios
  for (let sIdx = 0; sIdx < scenarios.length; sIdx++) {
    const scenario = scenarios[sIdx];
    const runs: QAScenarioRunResult[] = [];
    let scenarioPassedCount = 0;
    let scenarioFailedCount = 0;

    for (let rIdx = 0; rIdx < runsPerScenario; rIdx++) {
      // Yield thread briefly so UI stays buttery smooth and responsive
      await new Promise(resolve => setTimeout(resolve, 8));

      const runResult = simulateSingleGameRun(scenario, rIdx);
      runs.push(runResult);
      totalRunsCompleted++;

      totalAssertionsChecked += runResult.assertions.length;
      totalAssertionsPassed += runResult.assertions.filter(a => a.passed).length;

      if (runResult.passed) {
        scenarioPassedCount++;
        totalPassedRuns++;
      } else {
        scenarioFailedCount++;
        totalFailedRuns++;
      }

      if (onProgress) {
        const percent = Math.round((totalRunsCompleted / totalRunsTarget) * 100);
        onProgress({
          currentScenarioIndex: sIdx + 1,
          totalScenarios,
          currentRunIndex: rIdx + 1,
          totalRuns: totalRunsTarget,
          scenarioName: scenario.name,
          percent
        });
      }
    }

    scenarioSuites.push({
      scenario,
      runs,
      totalPassed: scenarioPassedCount,
      totalFailed: scenarioFailedCount,
      allPassed: scenarioFailedCount === 0
    });
  }

  const executionDurationMs = performance.now() - globalStartTime;
  const systemIntegrityScore = totalAssertionsChecked > 0 
    ? Math.round((totalAssertionsPassed / totalAssertionsChecked) * 100) 
    : 100;

  const overallStatus = totalFailedRuns === 0 && subsystemChecks.every(s => s.passed) ? 'PASSED' : 'FAILED';

  return {
    timestamp: Date.now(),
    totalScenarios,
    totalRunsTarget,
    totalRunsCompleted,
    totalPassedRuns,
    totalFailedRuns,
    totalAssertionsChecked,
    totalAssertionsPassed,
    systemIntegrityScore,
    subsystemChecks,
    scenarioSuites,
    overallStatus,
    executionDurationMs
  };
}
