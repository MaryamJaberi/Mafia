import React, { useMemo, useState } from 'react';
import { 
  Network, Target, Info, RefreshCw, Zap, 
  ArrowUpRight, Filter, Eye, UserCheck 
} from 'lucide-react';
import { Accusation, Player, Language } from '../../types/mafia';
import { buildAccusationMatrix } from '../../utils/accusationAnalytics';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface AccusationGraphViewProps {
  players: Player[];
  accusations: Accusation[];
  onAddAccusation: (accuserId: string, targetId: string) => void;
  language: Language;
}

export const AccusationGraphView: React.FC<AccusationGraphViewProps> = ({
  players,
  accusations,
  onAddAccusation,
  language
}) => {
  const t = translations[language];
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectStartId, setConnectStartId] = useState<string | null>(null);
  const [dayFilter, setDayFilter] = useState<number>(0);

  const matrixData = buildAccusationMatrix(players, accusations, dayFilter);

  // Layout calculations: Circular distribution of player nodes
  const size = 640;
  const center = size / 2;
  const radius = 220;

  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number; angle: number }>();
    const total = players.length || 1;
    players.forEach((p, i) => {
      const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      map.set(p.id, { x, y, angle });
    });
    return map;
  }, [players, center, radius]);

  // Edges list
  const edges = useMemo(() => {
    const list: {
      accuserId: string;
      targetId: string;
      count: number;
      accuser: Player;
      target: Player;
      from: { x: number; y: number };
      to: { x: number; y: number };
    }[] = [];

    players.forEach(accuser => {
      players.forEach(target => {
        if (accuser.id === target.id) return;
        const count = matrixData.matrix[accuser.id]?.[target.id] || 0;
        if (count > 0) {
          const from = nodePositions.get(accuser.id);
          const to = nodePositions.get(target.id);
          if (from && to) {
            list.push({
              accuserId: accuser.id,
              targetId: target.id,
              count,
              accuser,
              target,
              from,
              to
            });
          }
        }
      });
    });

    return list;
  }, [players, matrixData.matrix, nodePositions]);

  const handleNodeClick = (playerId: string) => {
    if (connectStartId) {
      if (connectStartId !== playerId) {
        soundEngine.playAccuse();
        onAddAccusation(connectStartId, playerId);
      }
      setConnectStartId(null);
    } else {
      setSelectedNodeId(prev => (prev === playerId ? null : playerId));
      soundEngine.playTick();
    }
  };

  const selectedPlayer = players.find(p => p.id === selectedNodeId);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Interactive Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f0f12] p-4 rounded-3xl border border-white/10 backdrop-blur-md">
        <div>
          <h3 className="font-bold text-[#e2e2e7] text-base flex items-center gap-2">
            <Network className="w-5 h-5 text-amber-400" />
            <span>{t.accusationGraph}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            نمایش روابط مستقیم اتهام با فلش‌های جهت‌دار قرمز (ضخامت فلش نشان‌دهنده تعداد اتهام است).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {connectStartId ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
              <span>روی بازیکن دوم کلیک کنید تا اتهام ثبت شود</span>
              <button 
                onClick={() => setConnectStartId(null)}
                className="px-2 py-0.5 bg-white/10 text-slate-200 rounded-lg text-[11px]"
              >
                لغو
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (selectedNodeId) {
                  setConnectStartId(selectedNodeId);
                } else if (players.length > 0) {
                  setConnectStartId(players[0].id);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-md transition-all cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>ترسیم اتهام جدید</span>
            </button>
          )}

          <button
            onClick={() => setSelectedNodeId(null)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition-colors"
          >
            پاکسازی انتخاب
          </button>
        </div>
      </div>

      {/* Main Visual SVG Graph & Inspector Sidepanel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SVG Network Graph Canvas */}
        <div className="lg:col-span-8 bg-[#0a0a0c] border border-white/10 rounded-3xl p-4 sm:p-6 flex items-center justify-center relative overflow-hidden shadow-2xl">
          
          {/* Legend Overlay */}
          <div className="absolute top-4 right-4 bg-[#0f0f12]/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-[11px] text-slate-300 space-y-1 z-10">
            <div className="font-bold text-slate-400 mb-1">راهنمای ضخامت فلش‌ها:</div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-rose-500 inline-block rounded" />
              <span>۱ اتهام (نازک)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-1 bg-rose-500 inline-block rounded" />
              <span>۳ اتهام (متوسط)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-2 bg-rose-500 inline-block rounded shadow-sm shadow-rose-500" />
              <span>۷+ اتهام (ضخیم و کانون نبرد)</span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[560px] aspect-square select-none"
          >
            <defs>
              {/* Directed Red Arrow Heads */}
              <marker
                id="arrow-red-thin"
                viewBox="0 0 10 10"
                refX="28"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>

              <marker
                id="arrow-red-medium"
                viewBox="0 0 10 10"
                refX="26"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#e11d48" />
              </marker>

              <marker
                id="arrow-red-thick"
                viewBox="0 0 10 10"
                refX="24"
                refY="5"
                markerWidth="10"
                markerHeight="10"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
              </marker>

              {/* Glow filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Center Ambient Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#26262b"
              strokeDasharray="4 6"
              strokeWidth="1.5"
            />

            {/* Render Directed Edges (Red Arrows) */}
            {edges.map((edge, idx) => {
              const isAccuserSelected = selectedNodeId === edge.accuserId;
              const isTargetSelected = selectedNodeId === edge.targetId;
              const isHighlighted = !selectedNodeId || isAccuserSelected || isTargetSelected;

              // Curve calculation: Quadratic bezier with subtle arch to separate dual bidirectional arrows
              const dx = edge.to.x - edge.from.x;
              const dy = edge.to.y - edge.from.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const normX = -dy / (dist || 1);
              const normY = dx / (dist || 1);
              const curvature = 24; // curve offset
              const ctrlX = (edge.from.x + edge.to.x) / 2 + normX * curvature;
              const ctrlY = (edge.from.y + edge.to.y) / 2 + normY * curvature;

              // Dynamic stroke width & opacity
              let strokeWidth = 1.8;
              let strokeColor = '#f43f5e';
              let markerId = 'url(#arrow-red-thin)';

              if (edge.count >= 7) {
                strokeWidth = 5.5;
                strokeColor = '#dc2626';
                markerId = 'url(#arrow-red-thick)';
              } else if (edge.count >= 3) {
                strokeWidth = 3.2;
                strokeColor = '#e11d48';
                markerId = 'url(#arrow-red-medium)';
              }

              const pathData = `M ${edge.from.x} ${edge.from.y} Q ${ctrlX} ${ctrlY} ${edge.to.x} ${edge.to.y}`;

              return (
                <g key={idx} opacity={isHighlighted ? 1 : 0.15}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    markerEnd={markerId}
                    filter={edge.count >= 3 ? 'url(#glow)' : undefined}
                    className={isAccuserSelected ? 'animated-arrow' : undefined}
                  />

                  {/* Accusation count badge on edge midpoint */}
                  {edge.count > 1 && (
                    <g transform={`translate(${(edge.from.x + edge.to.x) / 2 + normX * (curvature * 0.7)}, ${(edge.from.y + edge.to.y) / 2 + normY * (curvature * 0.7)})`}>
                      <circle r="9" fill="#0a0a0c" stroke={strokeColor} strokeWidth="1.5" />
                      <text
                        textAnchor="middle"
                        dy="3.5"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {edge.count}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Render Player Nodes */}
            {players.map((player) => {
              const pos = nodePositions.get(player.id) || { x: center, y: center, angle: 0 };
              const isSelected = selectedNodeId === player.id;
              const isConnecting = connectStartId === player.id;
              const totalGiven = matrixData.totalGivenByPlayer[player.id] || 0;
              const totalReceived = matrixData.totalReceivedByPlayer[player.id] || 0;

              return (
                <g
                  key={player.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => handleNodeClick(player.id)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  {/* Outer ring */}
                  <circle
                    r={isSelected || isConnecting ? 28 : 24}
                    fill="#0f0f12"
                    stroke={
                      isConnecting
                        ? '#f59e0b'
                        : isSelected
                        ? '#f59e0b'
                        : totalReceived > 3
                        ? '#e11d48'
                        : '#2e2e38'
                    }
                    strokeWidth={isSelected || isConnecting ? 3 : 2}
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />

                  {/* Player Avatar */}
                  <text
                    textAnchor="middle"
                    dy="7"
                    fontSize="18"
                    className="select-none pointer-events-none"
                  >
                    {player.avatar}
                  </text>

                  {/* Badges: Total Accused count */}
                  {totalReceived > 0 && (
                    <g transform="translate(16, -16)">
                      <circle r="8" fill="#e11d48" />
                      <text
                        textAnchor="middle"
                        dy="3"
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        {totalReceived}
                      </text>
                    </g>
                  )}

                  {/* Player Name Label */}
                  <text
                    textAnchor="middle"
                    dy={isSelected ? 42 : 38}
                    fill="#e2e2e7"
                    fontSize="11"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {player.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Player Inspector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-5 shadow-xl backdrop-blur-md">
            <h4 className="font-bold text-[#e2e2e7] text-sm flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>تحلیل گره انتخاب‌شده</span>
            </h4>

            {selectedPlayer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#0a0a0c] rounded-2xl border border-white/10">
                  <span className="text-3xl p-1.5 bg-white/5 rounded-xl border border-white/10">
                    {selectedPlayer.avatar}
                  </span>
                  <div>
                    <h5 className="font-bold text-[#e2e2e7] text-base">{selectedPlayer.name}</h5>
                    <span className="text-xs text-slate-400">
                      صندلی {selectedPlayer.seatNumber || '—'} • {selectedPlayer.isAlive ? 'زنده' : 'حذف‌شده'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-400 block">اتهامات زده (خروجی)</span>
                    <span className="text-xl font-bold text-amber-400 font-mono">
                      {matrixData.totalGivenByPlayer[selectedPlayer.id] || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-400 block">اتهامات دریافتی (ورودی)</span>
                    <span className="text-xl font-bold text-rose-400 font-mono">
                      {matrixData.totalReceivedByPlayer[selectedPlayer.id] || 0}
                    </span>
                  </div>
                </div>

                {/* Targets of this player */}
                <div>
                  <h6 className="text-xs font-bold text-slate-300 mb-1.5">اهدافی که به آن‌ها اتهام زده:</h6>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {players
                      .filter(p => (matrixData.matrix[selectedPlayer.id]?.[p.id] || 0) > 0)
                      .map(target => (
                        <div key={target.id} className="flex items-center justify-between p-2 bg-[#0a0a0c] rounded-xl text-xs">
                          <span className="text-slate-200">{target.name}</span>
                          <span className="font-bold text-rose-400">
                            {matrixData.matrix[selectedPlayer.id][target.id]} بار
                          </span>
                        </div>
                      ))}
                    {players.every(p => (matrixData.matrix[selectedPlayer.id]?.[p.id] || 0) === 0) && (
                      <div className="text-xs text-slate-500 p-2">هنوز اتهامی نزده است.</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setConnectStartId(selectedPlayer.id)}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>ثبت اتهام از طرف این بازیکن</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                روی هر بازیکن در نمودار بالا کلیک کنید تا تمام فلش‌های ورودی و خروجی او تحلیل شود.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
