import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  drift: number;
  spin: number;
  shape: 'square' | 'rect' | 'circle';
}

const CONFETTI_COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FF9FF3',
  '#FECA57', '#FF6348', '#7BED9F', '#70A1FF', '#FFA502',
  '#A29BFE', '#FD79A8', '#00CEC9', '#E17055', '#6C5CE7',
];

interface ConfettiOverlayProps {
  show: boolean;
  newLevel: number;
}

const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ show, newLevel }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!show) {
      setPieces([]);
      return;
    }

    const generated: ConfettiPiece[] = [];
    for (let index = 0; index < 50; index++) {
      const shapes: ConfettiPiece['shape'][] = ['square', 'rect', 'circle'];
      generated.push({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 6,
        drift: -20 + Math.random() * 40,
        spin: 360 + Math.random() * 720,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
    setPieces(generated);
  }, [show]);

  if (!show || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Confetti pieces */}
      {pieces.map((piece) => (
        <div
          key={piece.id}
          style={{
            position: 'absolute',
            left: `${piece.left}%`,
            top: '-10px',
            width: piece.shape === 'rect' ? piece.size * 0.5 : piece.size,
            height: piece.shape === 'circle' ? piece.size : piece.size * (piece.shape === 'rect' ? 1.8 : 1),
            backgroundColor: piece.color,
            borderRadius: piece.shape === 'circle' ? '50%' : '2px',
            animation: `confettiFall ${piece.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${piece.delay}s forwards`,
            '--confetti-drift': `${piece.drift}px`,
            '--confetti-spin': `${piece.spin}deg`,
          } as React.CSSProperties}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              animation: `confettiDrift ${0.8 + Math.random() * 0.6}s ease-in-out ${piece.delay}s infinite`,
              '--confetti-drift': `${piece.drift}px`,
            } as React.CSSProperties}
          />
        </div>
      ))}

      {/* Level up banner */}
      <div
        className="absolute top-20 left-1/2 animate-level-up-banner"
        style={{ zIndex: 51 }}
      >
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-2xl px-8 py-4 shadow-2xl text-center whitespace-nowrap border-2 border-yellow-300/60">
          <div className="text-xs font-semibold text-yellow-900/80 uppercase tracking-wider">Level Up!</div>
          <div className="font-serif font-bold text-3xl text-white drop-shadow-md">
            Level {newLevel}
          </div>
          <div className="text-sm font-medium text-yellow-100/90 mt-0.5">+$25 bonus!</div>
        </div>
      </div>
    </div>
  );
};

export default ConfettiOverlay;
