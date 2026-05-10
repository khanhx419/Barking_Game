import BattleLine from './BattleLine';
import DogAvatar from './DogAvatar';
import PowerBar from './PowerBar';
import SustainIndicator from './SustainIndicator';

const MAX_POWER = 300;

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

  const visualP1Power = isP1 ? myTotalPower : p1Power;
  const visualP2Power = !isP1 ? myTotalPower : p2Power;
  const p1Volume = isP1 ? myVolume : 0;
  const p2Volume = !isP1 ? myVolume : 0;

  const p1Name = isP1 ? 'YOU' : (gameState.opponentName || 'BOT');
  const p2Name = !isP1 ? 'YOU' : (gameState.opponentName || 'BOT');

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col" style={{ backgroundColor: '#F8F9FA' }}>

      {/* ===== TOP HUD ===== */}
      <div className="relative z-40 px-4 md:px-6 pt-3 pb-2 flex flex-col gap-3">

        {/* Sandbox Badge */}
        {isSandbox && (
          <div className="text-center">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{ 
                backgroundColor: 'rgba(253, 203, 110, 0.2)', 
                border: '1px solid rgba(253, 203, 110, 0.4)', 
                color: '#B8860B',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}>
              🧪 Sandbox Mode
            </span>
          </div>
        )}

        {/* Header: Names + Timer */}
        <div className="flex justify-between items-center rounded-2xl p-3 md:p-4"
          style={{ 
            backgroundColor: '#FFFFFF', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}>
          <div className="font-bold text-lg md:text-xl uppercase tracking-widest" style={{ color: '#0984E3' }}>{p1Name}</div>
          
          <div className="flex flex-col items-center">
            <h1 className="text-lg md:text-xl font-black italic tracking-tighter" style={{ color: '#B2BEC3' }}>BARKING BATTLE</h1>
            <div className="text-3xl md:text-4xl font-mono font-black tabular-nums"
              style={{ color: timeLeft <= 10 ? '#D63031' : '#2D3436' }}>
              0:{timeLeft.toString().padStart(2, '0')}
            </div>
          </div>
          
          <div className="font-bold text-lg md:text-xl uppercase tracking-widest" style={{ color: '#D63031' }}>{p2Name}</div>
        </div>

        {/* Power Bars */}
        <div className="flex justify-between items-start gap-4 md:gap-8">
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex gap-3 items-center">
              <PowerBar power={visualP1Power} maxPower={MAX_POWER} colorClass="p1" isLeft={true} />
              <div className="font-mono font-bold w-10 text-right text-sm" style={{ color: '#0984E3' }}>{Math.floor(visualP1Power)}</div>
            </div>
            <SustainIndicator sustain={isP1 ? mySustain : 1.0} alignLeft={true} />
          </div>

          <div className="w-2 md:w-4"></div>

          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex gap-3 items-center">
              <div className="font-mono font-bold w-10 text-left text-sm" style={{ color: '#D63031' }}>{Math.floor(visualP2Power)}</div>
              <PowerBar power={visualP2Power} maxPower={MAX_POWER} colorClass="p2" isLeft={false} />
            </div>
            <SustainIndicator sustain={!isP1 ? mySustain : 1.0} alignLeft={false} />
          </div>
        </div>

        {/* ===== TUG-OF-WAR BAR (top, below power bars) ===== */}
        <BattleLine position={battleLinePos} />
      </div>

      {/* ===== ARENA: Dogs ===== */}
      <div className="flex-1 relative flex items-stretch">
        {/* Left Dog */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <DogAvatar 
            scale={p1Scale} 
            isLeft={true} 
            colorTheme="blue" 
            isBarking={visualP1Power > 15}
            dogBreed={p1Dog}
            volume={p1Volume}
          />
        </div>

        {/* Center divider */}
        <div className="w-px self-stretch my-8" style={{ backgroundColor: '#DFE6E9' }} />

        {/* Right Dog */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <DogAvatar 
            scale={p2Scale} 
            isLeft={false} 
            colorTheme="red" 
            isBarking={visualP2Power > 15}
            dogBreed={p2Dog}
            volume={p2Volume}
          />
        </div>
      </div>

      {/* Floor accent */}
      <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #0984E3, #DFE6E9, #D63031)' }} />
    </div>
  );
}
