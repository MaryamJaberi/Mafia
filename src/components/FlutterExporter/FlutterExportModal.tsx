import React, { useState } from 'react';
import { 
  Download, X, Copy, Check, Smartphone, 
  Code2, FileCode, Layers, Terminal, Sparkles, Folder 
} from 'lucide-react';
import { Language } from '../../types/mafia';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface FlutterExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const FlutterExportModal: React.FC<FlutterExportModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  if (!isOpen) return null;
  const t = translations[language];
  const isEn = language === 'en';

  const [activeFile, setActiveFile] = useState<string>('pubspec.yaml');
  const [copied, setCopied] = useState(false);

  const flutterFiles: Record<string, string> = {
    'pubspec.yaml': `name: mafia_host_os
description: "Professional Mafia Host OS & Real-Time Multiplayer Companion App for Flutter"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.1
  mobile_scanner: ^5.1.1
  qr_flutter: ^4.1.0
  audioplayers: ^6.0.0
  http: ^1.2.1
  intl: ^0.19.0
  google_fonts: ^6.2.1
  vibration: ^2.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/sounds/
`,

    'lib/models/mafia_models.dart': `// Mafia Host OS - Domain Models
enum GamePhase {
  LOBBY,
  DAY_DISCUSSION,
  DAY_ACCUSATION,
  DAY_DEFENSE,
  DAY_VOTING,
  DAY_LAST_WORDS,
  NIGHT,
  GAME_OVER
}

class Player {
  final String id;
  final String name;
  final String avatar;
  final String role;
  final bool isAlive;
  final bool isConnected;
  final int seatNumber;

  Player({
    required this.id,
    required this.name,
    required this.avatar,
    required this.role,
    this.isAlive = true,
    this.isConnected = true,
    this.seatNumber = 0,
  });

  factory Player.fromJson(Map<String, dynamic> json) => Player(
    id: json['id'] as String,
    name: json['name'] as String,
    avatar: json['avatar'] as String? ?? '🕵️',
    role: json['role'] as String? ?? 'CITIZEN_SIMPLE',
    isAlive: json['isAlive'] as bool? ?? true,
    isConnected: json['isConnected'] as bool? ?? true,
    seatNumber: json['seatNumber'] as int? ?? 0,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'avatar': avatar,
    'role': role,
    'isAlive': isAlive,
    'isConnected': isConnected,
    'seatNumber': seatNumber,
  };
}

class Accusation {
  final String id;
  final String accuserId;
  final String targetId;
  final int dayNumber;
  final int timestamp;

  Accusation({
    required this.id,
    required this.accuserId,
    required this.targetId,
    required this.dayNumber,
    required this.timestamp,
  });

  factory Accusation.fromJson(Map<String, dynamic> json) => Accusation(
    id: json['id'] as String,
    accuserId: json['accuserId'] as String,
    targetId: json['targetId'] as String,
    dayNumber: json['dayNumber'] as int? ?? 1,
    timestamp: json['timestamp'] as int? ?? DateTime.now().millisecondsSinceEpoch,
  );
}
`,

    'lib/widgets/matrix_network_painter.dart': `import 'dart:math';
import 'package:flutter/material.dart';
import '../models/mafia_models.dart';

class MatrixNetworkPainter extends CustomPainter {
  final List<Player> players;
  final List<Accusation> accusations;
  final String? selectedPlayerId;

  MatrixNetworkPainter({
    required this.players,
    required this.accusations,
    this.selectedPlayerId,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) * 0.38;

    final nodePositions = <String, Offset>{};
    for (int i = 0; i < players.length; i++) {
      final angle = (i / players.length) * 2 * pi - pi / 2;
      final pos = Offset(
        center.dx + radius * cos(angle),
        center.dy + radius * sin(angle),
      );
      nodePositions[players[i].id] = pos;
    }

    // Draw Directed Red Accusation Arrows
    for (final acc in accusations) {
      final from = nodePositions[acc.accuserId];
      final to = nodePositions[acc.targetId];
      if (from != null && to != null) {
        final paint = Paint()
          ..color = const Color(0xFFE11D48)
          ..strokeWidth = 2.5
          ..style = PaintingStyle.stroke;

        canvas.drawLine(from, to, paint);
      }
    }

    // Draw Player Nodes
    for (final p in players) {
      final pos = nodePositions[p.id];
      if (pos == null) continue;

      final nodePaint = Paint()
        ..color = p.id == selectedPlayerId ? Colors.cyan : const Color(0xFF1E293B)
        ..style = PaintingStyle.fill;

      canvas.drawCircle(pos, 20, nodePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
`,

    'lib/main.dart': `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'views/lobby_view.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: MafiaHostApp()));
}

class MafiaHostApp extends StatelessWidget {
  const MafiaHostApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mafia Host OS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0A0A0A),
        primaryColor: const Color(0xFFE11D48),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE11D48),
          secondary: Color(0xFFF59E0B),
          surface: Color(0xFF171717),
        ),
      ),
      home: const LobbyView(),
    );
  }
}
`
  };

  const copyCode = () => {
    navigator.clipboard.writeText(flutterFiles[activeFile] || '');
    setCopied(true);
    soundEngine.playTick();
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAllCode = () => {
    const combined = Object.entries(flutterFiles)
      .map(([name, code]) => `// ===============================\n// FILE: ${name}\n// ===============================\n\n${code}`)
      .join('\n\n\n');

    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mafia_host_os_flutter_bundle.dart';
    link.click();
    URL.revokeObjectURL(url);
    soundEngine.playGong();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-blue-500/40 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                <span>{t.exportMobile}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  Flutter 3.x / Riverpod
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                {isEn ? 'Complete components and source code of Flutter companion project for Android & iOS' : 'کامپوننت‌ها و سورس‌کد کامل پروژه فلاتر برای اندروید و iOS'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadAllCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isEn ? 'Download Flutter Bundle (.dart)' : 'دانلود باندل فلاتر (.dart)'}</span>
            </button>

            <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content: File Tree on left, Code view on right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 flex-1 overflow-hidden">
          
          {/* File Explorer */}
          <div className="md:col-span-4 bg-neutral-950 p-4 border-l border-neutral-800 space-y-2 overflow-y-auto">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              <span>{isEn ? 'Flutter Package Structure:' : 'ساختار پکیج فلاتر:'}</span>
            </div>
            {Object.keys(flutterFiles).map(fileName => (
              <button
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  activeFile === fileName
                    ? 'bg-blue-950/60 text-blue-300 border border-blue-500/40'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{fileName}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-8 bg-neutral-900/90 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-950/80 border-b border-neutral-800">
              <span className="text-xs font-mono text-neutral-300 font-bold">{activeFile}</span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.codeCopied : t.copyFlutterCode}</span>
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-blue-200 bg-neutral-950/90 flex-1 overflow-auto leading-relaxed select-text ltr">
              <code>{flutterFiles[activeFile]}</code>
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
