import React from 'react';

interface DiceFaceProps {
  value: number;
  isRolling?: boolean;
}

export const DiceFace: React.FC<DiceFaceProps> = ({ value, isRolling = false }) => {
  // Dot layout configurations for 1 to 6
  const pipPositions: Record<number, number[]> = {
    1: [4], // center
    2: [0, 8], // top-left, bottom-right
    3: [0, 4, 8], // diagonal
    4: [0, 2, 6, 8], // 4 corners
    5: [0, 2, 4, 6, 8], // 4 corners + center
    6: [0, 2, 3, 5, 6, 8], // 2 columns of 3
  };

  const activePips = pipPositions[value] || pipPositions[1];

  return (
    <div
      className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 p-4 sm:p-5 shadow-[0_12px_28px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-4px_8px_rgba(0,0,0,0.2)] border-2 border-stone-300/80 flex items-center justify-center transition-all duration-300 ${
        isRolling ? 'animate-bounce scale-95 rotate-12' : 'hover:scale-105'
      }`}
    >
      {/* 3x3 Grid for pips */}
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-2 sm:gap-3 p-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
          const isActive = activePips.includes(idx);
          return (
            <div key={idx} className="flex items-center justify-center">
              {isActive && (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-b from-red-600 to-red-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.6)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

