const { CompositionStage, useComposition } = window;

const W = 1600, H = 900;
const CREAM = '#F4EFE6';
const INK_DEFAULT = '#23201C';
const ACCENTS = [
  'oklch(0.74 0.16 30)',
  'oklch(0.74 0.16 95)',
  'oklch(0.74 0.16 150)',
  'oklch(0.74 0.16 250)',
  'oklch(0.74 0.16 330)',
];

// --- bicycle geometry (side view, rolling right) ---
const R = 170;                     // wheel radius
const RX = 500, FX = 1100, WY = 620;
const BB = { x: 760, y: 620 };     // bottom bracket
const CR = 75, COG = 25, ARM = 100;
const GROUND = WY + R;
const REVS = 3;                    // wheel revolutions per loop -> seamless
const CHAIN_P = (2 * Math.PI * CR) / 26; // dash period: 26 links per loop

// chain tangent points (external tangents of cog + chainring)
const ux = -(CR - COG) / (BB.x - RX), uy = -Math.sqrt(1 - ux * ux);
const T1 = { x: RX + COG * ux, y: WY + COG * uy };
const T2 = { x: BB.x + CR * ux, y: BB.y + CR * uy };
const B1 = { x: RX + COG * ux, y: WY - COG * uy };
const B2 = { x: BB.x + CR * ux, y: BB.y - CR * uy };

const rnd = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function Wheel({ cx, cy, angle, ink }) {
  const spokes = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    spokes.push(
      <line key={i}
        x1={cx + Math.cos(a) * 18} y1={cy + Math.sin(a) * 18}
        x2={cx + Math.cos(a) * (R - 20)} y2={cy + Math.sin(a) * (R - 20)}
        stroke="#9A9385" strokeWidth="3" />
    );
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={R - 8} fill="none" stroke={ink} strokeWidth="17" />
      <circle cx={cx} cy={cy} r={R - 23} fill="none" stroke="#BCB4A5" strokeWidth="7" />
      <g transform={`rotate(${angle} ${cx} ${cy})`}>
        {spokes}
        <circle cx={cx} cy={cy - (R - 34)} r={8} fill={ACCENTS[1]} />
        <circle cx={cx} cy={cy} r={17} fill={ink} />
        <circle cx={cx} cy={cy} r={6} fill="#BCB4A5" />
      </g>
    </g>
  );
}

function Chain({ off }) {
  const p = {
    fill: 'none', stroke: '#4A443B', strokeWidth: 9, strokeLinecap: 'butt',
    strokeDasharray: `${(CHAIN_P * 0.62).toFixed(3)} ${(CHAIN_P * 0.38).toFixed(3)}`,
    strokeDashoffset: -off,
  };
  return (
    <g>
      <circle cx={RX} cy={WY} r={COG} {...p} />
      <circle cx={BB.x} cy={BB.y} r={CR} {...p} />
      <line x1={T1.x} y1={T1.y} x2={T2.x} y2={T2.y} {...p} />
      <line x1={B1.x} y1={B1.y} x2={B2.x} y2={B2.y} {...p} />
    </g>
  );
}

function Pedal({ p, shade }) {
  return (
    <g>
      <line x1={BB.x} y1={BB.y} x2={p.x} y2={p.y} stroke={shade} strokeWidth="15" strokeLinecap="round" />
      <rect x={p.x - 33} y={p.y - 8} width="66" height="16" rx="5" fill={shade} />
      <rect x={p.x - 33} y={p.y - 8} width="66" height="5" rx="2.5" fill="#FFFFFF" opacity="0.28" />
      <circle cx={p.x} cy={p.y} r={6} fill={CREAM} />
    </g>
  );
}

function Confetti({ T, total }) {
  const N = 46, life = 2.4, bits = [];
  for (let i = 0; i < N; i++) {
    const ph = ((T / life) + rnd(i, 1)) % 1;
    const t = ph * life;
    const vx = -(150 + rnd(i, 2) * 320), vy = -(250 + rnd(i, 3) * 380);
    const x = 360 + rnd(i, 7) * 60 + vx * t;
    const y = 680 + vy * t + 0.5 * 540 * t * t;
    const turns = 2 + Math.floor(rnd(i, 4) * 3);
    const c = ACCENTS[Math.floor(rnd(i, 5) * ACCENTS.length)];
    const s = 9 + rnd(i, 6) * 10;
    const op = Math.min(1, ph * 10) * (1 - ph * ph);
    bits.push(
      <g key={i} transform={`translate(${x} ${y}) rotate(${ph * 360 * turns})`} opacity={op}>
        {rnd(i, 8) > 0.66
          ? <circle r={s * 0.48} fill={c} />
          : <rect x={-s * 0.5} y={-s * 0.28} width={s} height={s * 0.56} rx="2" fill={c} />}
      </g>
    );
  }
  return <g>{bits}</g>;
}

function Ground({ dist }) {
  const sp = 130, off = dist % sp, dashes = [];
  for (let i = -1; i < W / sp + 2; i++) {
    dashes.push(<rect key={i} x={i * sp - off} y={GROUND + 20} width="70" height="8" rx="4" fill="#CFC7B7" />);
  }
  const streaks = [];
  const sp2 = 420, off2 = (dist * 1.6) % sp2;
  for (let i = -1; i < W / sp2 + 2; i++) {
    for (let k = 0; k < 3; k++) {
      streaks.push(
        <rect key={i + '-' + k} x={i * sp2 - off2 + k * 90} y={220 + k * 130}
          width={130 - k * 25} height="6" rx="3" fill="#DED6C6" />
      );
    }
  }
  return (
    <g>
      {streaks}
      <line x1="0" y1={GROUND + 4} x2={W} y2={GROUND + 4} stroke="#B6AE9E" strokeWidth="3" />
      {dashes}
    </g>
  );
}

function Bicycle({ ink, confetti }) {
  const { T, authoredTotal } = useComposition();
  const total = authoredTotal || 6;
  const k = T / total;
  const wheelA = 360 * REVS * k;
  const crankA = wheelA / 3 - 90;
  const dist = 2 * Math.PI * R * REVS * k;
  const chainOff = 2 * Math.PI * CR * k;
  const bob = Math.sin(2 * Math.PI * REVS * k) * 3;
  const zoom = 1 + 0.02 * (1 - Math.cos(2 * Math.PI * k)) / 2;

  const cr = crankA * Math.PI / 180;
  const near = { x: BB.x + Math.cos(cr) * ARM, y: BB.y + Math.sin(cr) * ARM };
  const far = { x: BB.x - Math.cos(cr) * ARM, y: BB.y - Math.sin(cr) * ARM };

  return (
    <div style={{ width: '100%', height: '100%', background: CREAM, position: 'relative' }}
      data-screen-label={`t=${T.toFixed(0)}s`}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <rect x="0" y="0" width={W} height={H} fill={CREAM} />
        <g transform={`translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-W / 2} ${-H / 2})`}>
          <Ground dist={dist} />
          <g transform={`translate(0 ${bob})`}>
            {confetti === false ? null : <Confetti T={T} total={total} />}

            {/* frame */}
            <g fill="none" stroke={ink} strokeWidth="14" strokeLinecap="round">
              <line x1={RX} y1={WY} x2={BB.x} y2={BB.y} />
              <line x1={RX} y1={WY} x2="700" y2="378" />
              <line x1="700" y1="378" x2={BB.x} y2={BB.y} />
              <line x1="700" y1="378" x2="1012" y2="358" />
              <line x1={BB.x} y1={BB.y} x2="1040" y2="444" />
              <line x1="1012" y1="358" x2="1040" y2="444" strokeWidth="17" />
              <path d={`M1040,444 C1072,510 1092,566 ${FX},${WY}`} />
              <path d="M1012,358 L1046,336" strokeWidth="11" />
              <path d="M1046,338 C1054,316 1080,306 1096,317 C1110,327 1104,353 1088,357" strokeWidth="11" />
              <path d="M700,378 L690,352" strokeWidth="11" />
            </g>
            {/* saddle */}
            <path d="M642,354 C664,340 702,338 726,348 C732,356 722,364 700,364 L660,366 C646,366 638,360 642,354 Z" fill={ink} />

            <Wheel cx={RX} cy={WY} angle={wheelA} ink={ink} />
            <Wheel cx={FX} cy={WY} angle={wheelA} ink={ink} />

            <Chain off={chainOff} />
            <circle cx={RX} cy={WY} r={COG - 7} fill={CREAM} stroke={ink} strokeWidth="5" />
            <circle cx={RX} cy={WY} r={7} fill={ink} />
            <Pedal p={far} shade="#5A5347" />
            <circle cx={BB.x} cy={BB.y} r={CR - 11} fill={CREAM} stroke={ink} strokeWidth="6" />
            <g transform={`rotate(${crankA} ${BB.x} ${BB.y})`}>
              {[0, 1, 2, 3, 4].map(i => (
                <circle key={i} r="15" fill="none" stroke={ink} strokeWidth="5"
                  cx={BB.x + Math.cos(i / 5 * Math.PI * 2) * 40}
                  cy={BB.y + Math.sin(i / 5 * Math.PI * 2) * 40} />
              ))}
            </g>
            <Pedal p={near} shade={ink} />
          </g>
        </g>
      </svg>
    </div>
  );
}

function BikeVideo(props) {
  const ink = props.ink || INK_DEFAULT;
  return React.createElement(
    CompositionStage,
    { width: W, height: H, scenes: window.OM_SCENES, playback: window.OM_PLAYBACK, bg: CREAM },
    React.createElement(Bicycle, { ink, confetti: props.confetti })
  );
}

window.BikeVideo = BikeVideo;
