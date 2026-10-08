import { Accusation, AccusationMatrixData, AccusationPatternAnalysis, Player } from '../types/mafia';

/**
 * Builds the 2D Accusation Matrix and summary statistics.
 */
export function buildAccusationMatrix(
  players: Player[],
  accusations: Accusation[],
  filterDay?: number
): AccusationMatrixData {
  const filtered = typeof filterDay === 'number' && filterDay > 0
    ? accusations.filter(a => a.dayNumber === filterDay)
    : accusations;

  const matrix: Record<string, Record<string, number>> = {};
  const totalGivenByPlayer: Record<string, number> = {};
  const totalReceivedByPlayer: Record<string, number> = {};

  // Initialize matrix
  players.forEach(p => {
    matrix[p.id] = {};
    totalGivenByPlayer[p.id] = 0;
    totalReceivedByPlayer[p.id] = 0;
    players.forEach(target => {
      matrix[p.id][target.id] = 0;
    });
  });

  // Populate accusations
  filtered.forEach(acc => {
    if (matrix[acc.accuserId] && matrix[acc.accuserId][acc.targetId] !== undefined) {
      matrix[acc.accuserId][acc.targetId] += 1;
      totalGivenByPlayer[acc.accuserId] = (totalGivenByPlayer[acc.accuserId] || 0) + 1;
      totalReceivedByPlayer[acc.targetId] = (totalReceivedByPlayer[acc.targetId] || 0) + 1;
    }
  });

  // Find mutual accusations
  const mutualAccusations: AccusationMatrixData['mutualAccusations'] = [];
  const checkedPairs = new Set<string>();

  players.forEach(p1 => {
    players.forEach(p2 => {
      if (p1.id === p2.id) return;
      const pairKey = [p1.id, p2.id].sort().join(':');
      if (checkedPairs.has(pairKey)) return;
      checkedPairs.add(pairKey);

      const count1to2 = matrix[p1.id]?.[p2.id] || 0;
      const count2to1 = matrix[p2.id]?.[p1.id] || 0;

      if (count1to2 > 0 && count2to1 > 0) {
        mutualAccusations.push({
          playerA: p1,
          playerB: p2,
          countAtoB: count1to2,
          countBtoA: count2to1,
          total: count1to2 + count2to1
        });
      }
    });
  });

  mutualAccusations.sort((a, b) => b.total - a.total);

  // Top accuser & top target
  let mostAggressive: { player: Player; count: number } | undefined;
  let maxGiven = 0;
  players.forEach(p => {
    const given = totalGivenByPlayer[p.id] || 0;
    if (given > maxGiven) {
      maxGiven = given;
      mostAggressive = { player: p, count: given };
    }
  });

  let mostTargeted: { player: Player; count: number } | undefined;
  let maxReceived = 0;
  players.forEach(p => {
    const rec = totalReceivedByPlayer[p.id] || 0;
    if (rec > maxReceived) {
      maxReceived = rec;
      mostTargeted = { player: p, count: rec };
    }
  });

  return {
    players,
    matrix,
    totalGivenByPlayer,
    totalReceivedByPlayer,
    mutualAccusations,
    mostAggressiveAccuser: mostAggressive,
    mostTargetedPlayer: mostTargeted,
    totalAccusations: filtered.length
  };
}

export interface PlayerComparisonStat {
  player: Player;
  totalGiven: number;
  totalReceived: number;
  uniqueTargetsCount: number;
  uniqueAccusersCount: number;
  mostAccusedTarget?: { name: string; count: number };
  mostAccusedBy?: { name: string; count: number };
  targetsBreakdown: { targetName: string; count: number }[];
}

/**
 * Compare two or more selected players side-by-side.
 */
export function comparePlayers(
  selectedPlayerIds: string[],
  players: Player[],
  accusations: Accusation[]
): {
  stats: PlayerComparisonStat[];
  mutualInteractions: { playerA: string; playerB: string; aToB: number; bToA: number; total: number }[];
} {
  const playerMap = new Map(players.map(p => [p.id, p]));
  const matrixData = buildAccusationMatrix(players, accusations);

  const stats: PlayerComparisonStat[] = selectedPlayerIds
    .map(id => playerMap.get(id))
    .filter((p): p is Player => p !== undefined)
    .map(player => {
      const row = matrixData.matrix[player.id] || {};
      const targetsBreakdown: { targetName: string; count: number }[] = [];
      let uniqueTargetsCount = 0;
      let topTargetName = '';
      let topTargetCount = 0;

      Object.entries(row).forEach(([targetId, count]) => {
        if (count > 0) {
          uniqueTargetsCount++;
          const target = playerMap.get(targetId);
          const tName = target ? target.name : targetId;
          targetsBreakdown.push({ targetName: tName, count });
          if (count > topTargetCount) {
            topTargetCount = count;
            topTargetName = tName;
          }
        }
      });
      targetsBreakdown.sort((a, b) => b.count - a.count);

      // Accused by
      let uniqueAccusersCount = 0;
      let topAccuserBy = '';
      let topAccuserByCount = 0;
      players.forEach(other => {
        const c = matrixData.matrix[other.id]?.[player.id] || 0;
        if (c > 0) {
          uniqueAccusersCount++;
          if (c > topAccuserByCount) {
            topAccuserByCount = c;
            topAccuserBy = other.name;
          }
        }
      });

      return {
        player,
        totalGiven: matrixData.totalGivenByPlayer[player.id] || 0,
        totalReceived: matrixData.totalReceivedByPlayer[player.id] || 0,
        uniqueTargetsCount,
        uniqueAccusersCount,
        mostAccusedTarget: topTargetCount > 0 ? { name: topTargetName, count: topTargetCount } : undefined,
        mostAccusedBy: topAccuserByCount > 0 ? { name: topAccuserBy, count: topAccuserByCount } : undefined,
        targetsBreakdown
      };
    });

  // Mutual interactions among selected players
  const mutualInteractions: { playerA: string; playerB: string; aToB: number; bToA: number; total: number }[] = [];
  for (let i = 0; i < selectedPlayerIds.length; i++) {
    for (let j = i + 1; j < selectedPlayerIds.length; j++) {
      const idA = selectedPlayerIds[i];
      const idB = selectedPlayerIds[j];
      const pA = playerMap.get(idA);
      const pB = playerMap.get(idB);
      if (!pA || !pB) continue;

      const aToB = matrixData.matrix[idA]?.[idB] || 0;
      const bToA = matrixData.matrix[idB]?.[idA] || 0;

      if (aToB > 0 || bToA > 0) {
        mutualInteractions.push({
          playerA: pA.name,
          playerB: pB.name,
          aToB,
          bToA,
          total: aToB + bToA
        });
      }
    }
  }

  return { stats, mutualInteractions };
}

/**
 * Deterministic behavioral pattern analyzer.
 */
export function analyzeAccusationPatterns(
  players: Player[],
  accusations: Accusation[]
): AccusationPatternAnalysis {
  const playerMap = new Map(players.map(p => [p.id, p]));
  const matrixData = buildAccusationMatrix(players, accusations);

  // Mutual conflicts
  const mutualConflicts = matrixData.mutualAccusations.map(m => ({
    playerA: m.playerA.name,
    playerB: m.playerB.name,
    total: m.total,
    aToB: m.countAtoB,
    bToA: m.countBtoA
  }));

  // One-sided pressure
  const oneSidedPressure: AccusationPatternAnalysis['oneSidedPressure'] = [];
  players.forEach(p1 => {
    players.forEach(p2 => {
      if (p1.id === p2.id) return;
      const given = matrixData.matrix[p1.id]?.[p2.id] || 0;
      const received = matrixData.matrix[p2.id]?.[p1.id] || 0;
      if (given >= 2 && received === 0) {
        oneSidedPressure.push({
          accuser: p1.name,
          target: p2.name,
          count: given
        });
      }
    });
  });
  oneSidedPressure.sort((a, b) => b.count - a.count);

  // Clusters: find groups that mutually focus on each other
  const accusationClusters: AccusationPatternAnalysis['accusationClusters'] = [];
  if (mutualConflicts.length > 0) {
    const topPair = mutualConflicts[0];
    accusationClusters.push({
      label: 'نبرد مستقیم دوطرفه (Duel)',
      playerIds: [topPair.playerA, topPair.playerB],
      description: `${topPair.playerA} و ${topPair.playerB} شدیدترین تقابل دوطرفه بازی را با مجموع ${topPair.total} بار اتهام به راه انداخته‌اند.`
    });
  }

  if (matrixData.mostTargetedPlayer && matrixData.mostTargetedPlayer.count >= 3) {
    accusationClusters.push({
      label: 'کانون سوءظن عمومی شهر',
      playerIds: [matrixData.mostTargetedPlayer.player.name],
      description: `${matrixData.mostTargetedPlayer.player.name} با دریافت ${matrixData.mostTargetedPlayer.count} اتهام در صدر کانون سوءظن شهروندان قرار دارد.`
    });
  }

  // Day by day evolution
  const days = Array.from(new Set(accusations.map(a => a.dayNumber))).sort((a, b) => a - b);
  const dayByDayEvolution = days.map(day => {
    const dayAccs = accusations.filter(a => a.dayNumber === day);
    const targetCounts: Record<string, number> = {};
    dayAccs.forEach(a => {
      targetCounts[a.targetId] = (targetCounts[a.targetId] || 0) + 1;
    });
    let topTargetId = '';
    let topTargetMax = 0;
    Object.entries(targetCounts).forEach(([tid, count]) => {
      if (count > topTargetMax) {
        topTargetMax = count;
        topTargetId = tid;
      }
    });
    const topPlayer = playerMap.get(topTargetId);
    return {
      day,
      total: dayAccs.length,
      topTargetName: topPlayer ? topPlayer.name : '—'
    };
  });

  return {
    mostAggressive: matrixData.mostAggressiveAccuser
      ? { player: matrixData.mostAggressiveAccuser.player, totalGiven: matrixData.mostAggressiveAccuser.count }
      : undefined,
    mostTargeted: matrixData.mostTargetedPlayer
      ? { player: matrixData.mostTargetedPlayer.player, totalReceived: matrixData.mostTargetedPlayer.count }
      : undefined,
    mutualConflicts,
    oneSidedPressure,
    accusationClusters,
    dayByDayEvolution
  };
}
