interface Props {
  type: 'front-only' | 'perimeter' | 'full-coverage';
  selected: boolean;
}

export function CoverageIcon({ type, selected }: Props) {
  const orange = '#E36F1E';
  const ink = '#1D252D';
  const grey = '#9A9A9A';
  const fill = selected ? 'rgba(227,111,30,0.13)' : 'rgba(227,111,30,0.07)';

  if (type === 'front-only') {
    return (
      <svg viewBox="0 0 100 100" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="38" width="44" height="38" rx="2" stroke={ink} strokeWidth="1.5" fill="white"/>
        <polyline points="24,40 50,22 76,40" stroke={ink} strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="43" y="60" width="14" height="16" rx="1" stroke={grey} strokeWidth="1" fill="none"/>
        <path d="M50 38 L36 18 L64 18 Z" fill={fill} stroke={orange} strokeWidth="1" strokeLinejoin="round" strokeDasharray="3 2"/>
        <rect x="44" y="34" width="12" height="7" rx="2" fill={ink}/>
        <circle cx="50" cy="37.5" r="2.2" fill={orange}/>
        <line x1="50" y1="32" x2="50" y2="22" stroke={orange} strokeWidth="1" strokeDasharray="2 2"/>
      </svg>
    );
  }

  if (type === 'perimeter') {
    return (
      <svg viewBox="0 0 100 100" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="28" width="44" height="44" rx="2" stroke={ink} strokeWidth="1.5" fill="white"/>
        <rect x="43" y="28" width="14" height="6" rx="0" stroke={grey} strokeWidth="1" fill="none"/>
        <path d="M50 28 L38 14 L62 14 Z" fill={fill} stroke={orange} strokeWidth="1" strokeLinejoin="round" strokeDasharray="3 2"/>
        <path d="M50 72 L38 86 L62 86 Z" fill={fill} stroke={orange} strokeWidth="1" strokeLinejoin="round" strokeDasharray="3 2"/>
        <path d="M28 50 L14 38 L14 62 Z" fill={fill} stroke={orange} strokeWidth="1" strokeLinejoin="round" strokeDasharray="3 2"/>
        <path d="M72 50 L86 38 L86 62 Z" fill={fill} stroke={orange} strokeWidth="1" strokeLinejoin="round" strokeDasharray="3 2"/>
        <circle cx="50" cy="26" r="3" fill={ink}/><circle cx="50" cy="26" r="1.2" fill={orange}/>
        <circle cx="50" cy="74" r="3" fill={ink}/><circle cx="50" cy="74" r="1.2" fill={orange}/>
        <circle cx="26" cy="50" r="3" fill={ink}/><circle cx="26" cy="50" r="1.2" fill={orange}/>
        <circle cx="74" cy="50" r="3" fill={ink}/><circle cx="74" cy="50" r="1.2" fill={orange}/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="28" width="44" height="44" rx="2" stroke={ink} strokeWidth="1.5" fill="white"/>
      <line x1="50" y1="28" x2="50" y2="72" stroke={grey} strokeWidth="0.75" strokeDasharray="2 2"/>
      <line x1="28" y1="52" x2="72" y2="52" stroke={grey} strokeWidth="0.75" strokeDasharray="2 2"/>
      <path d="M50 28 L38 14 L62 14 Z" fill={fill} stroke={orange} strokeWidth="1" strokeLinejoin="round" strokeDasharray="3 2"/>
      <path d="M50 72 L38 86 L62 86 Z" fill={fill} stroke={orange} strokeWidth="1" strokeLinejoin="round" strokeDasharray="3 2"/>
      <path d="M28 50 L14 38 L14 62 Z" fill={fill} stroke={orange} strokeWidth="1" strokeLinejoin="round" strokeDasharray="3 2"/>
      <path d="M72 50 L86 38 L86 62 Z" fill={fill} stroke={orange} strokeWidth="1" strokeLinejoin="round" strokeDasharray="3 2"/>
      <circle cx="50" cy="26" r="3" fill={ink}/><circle cx="50" cy="26" r="1.2" fill={orange}/>
      <circle cx="50" cy="74" r="3" fill={ink}/><circle cx="50" cy="74" r="1.2" fill={orange}/>
      <circle cx="26" cy="50" r="3" fill={ink}/><circle cx="26" cy="50" r="1.2" fill={orange}/>
      <circle cx="74" cy="50" r="3" fill={ink}/><circle cx="74" cy="50" r="1.2" fill={orange}/>
      <circle cx="39" cy="40" r="2.5" fill={orange} opacity="0.85"/>
      <circle cx="61" cy="62" r="2.5" fill={orange} opacity="0.85"/>
      <circle cx="39" cy="40" r="7" stroke={orange} strokeWidth="0.75" strokeDasharray="2 2" fill="none" opacity="0.5"/>
      <circle cx="61" cy="62" r="7" stroke={orange} strokeWidth="0.75" strokeDasharray="2 2" fill="none" opacity="0.5"/>
    </svg>
  );
}
