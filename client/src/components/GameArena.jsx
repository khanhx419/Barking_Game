import BattleLine from './BattleLine';
import DogAvatar from './DogAvatar';
import PowerBar from './PowerBar';
import SustainIndicator from './SustainIndicator';

const MAX_POWER = 300; // 100 max volume * 3.0 max sustain

export default function GameArena({ 
  gameState, 
  myVolume, 
  mySustain, 
  myTotalPower,
  p1Power,
  p2Power,
  battleLinePos,
  p1Scale,
  p2Scale,
  timeLeft,
  p1Dog,
  p2Dog,
  isSandbox,
}) {
  const isP1 = gameState.playerIndex === 0;

  // The local player's true visual power
  const visualP1Power = isP1 ? myTotalPower : p1Power;
  const visualP2Power = !isP1 ? myTotalPower : p2Power;

  const p1Name = isP1 ? 'YOU' : (gameState.opponentName || 'BOT');
  const p2Name = !isP1 ? 'YOU' : (gameState.opponentName || 'BOT');

  return (
    <div className="relative w-full h-screen bg-arena-900 overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
        style={{
          background: `linear-gradient(90deg, 
            rgba(59, 130, 246, ${Math.max(0, (battleLinePos - 50) / 50 * 0.3)}) 0%, 
            rgba(10, 10, 26, 0) 50%, 
            rgba(239, 68, 68, ${Math.max(0, (50 - battleLinePos) / 50 * 0.3)}) 100%)`
        }}
      />

      {/* Sandbox Badge */}
      {isSandbox && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold tracking-widest uppercase">
          🧪 Sandbox Mode
        </div>
      )}

      {/* Header & HUD */}
      <div className="relative z-40 p-4 md:p-6 flex flex-col gap-4 md:gap-6">
        <div className="flex justify-between items-center bg-black/40 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/5">
          <div className="text-p1-400 font-bold text-lg md:text-xl uppercase tracking-widest">{p1Name}</div>
          
          <div className="flex flex-col items-center">
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-white/50">BARKING BATTLE</h1>
            <div className={`text-3xl md:text-4xl font-mono font-black tabular-nums mt-0.5 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              0:{timeLeft.toString().padStart(2, '0')}
            </div>
          </div>
          
          <div className="text-p2-400 font-bold text-lg md:text-xl uppercase tracking-widest">{p2Name}</div>
        </div>

        {/* Power Bars */}
        <div className="flex justify-between items-start gap-6 md:gap-12">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              <PowerBar power={visualP1Power} maxPower={MAX_POWER} colorClass="bg-p1-500 shadow-glow-blue" isLeft={true} />
              <div className="text-p1-400 font-mono font-bold w-10 text-right text-sm">{Math.floor(visualP1Power)}</div>
            </div>
            <SustainIndicator sustain={isP1 ? mySustain : 1.0} alignLeft={true} />
          </div>

          <div className="w-4 md:w-8"></div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              <div className="text-p2-400 font-mono font-bold w-10 text-left text-sm">{Math.floor(visualP2Power)}</div>
              <PowerBar power={visualP2Power} maxPower={MAX_POWER} colorClass="bg-p2-500 shadow-glow-red" isLeft={false} />
            </div>
            <SustainIndicator sustain={!isP1 ? mySustain : 1.0} alignLeft={false} />
          </div>
        </div>
      </div>

      {/* Arena */}
      <div className="flex-1 relative mt-4 md:mt-10">
        <BattleLine position={battleLinePos} />

        <div className="absolute top-0 bottom-0 left-0 w-1/2 flex items-center justify-center p-6 md:p-10 z-30">
          <DogAvatar 
            scale={p1Scale} 
            isLeft={true} 
            colorTheme="blue" 
            isBarking={visualP1Power > 20}
            dogBreed={p1Dog}
          />
        </div>

        <div className="absolute top-0 bottom-0 right-0 w-1/2 flex items-center justify-center p-6 md:p-10 z-30">
          <DogAvatar 
            scale={p2Scale} 
            isLeft={false} 
            colorTheme="red" 
            isBarking={visualP2Power > 20}
            dogBreed={p2Dog}
          />
        </div>

        {/* Arena Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-t from-white/5 to-transparent border-t border-white/10 z-10" style={{ transform: 'perspective(500px) rotateX(60deg)', transformOrigin: 'bottom' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        </div>
      </div>
    </div>
  );
}
