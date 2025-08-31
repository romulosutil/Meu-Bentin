// Logo Meu Bentin - usando imagem de fallback ou SVG customizado

interface MeuBentinLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  variant?: 'default' | 'compact' | 'navbar';
  showHoverEffect?: boolean;
}

export default function MeuBentinLogo({ 
  className = "h-16 w-auto", 
  size = 'md',
  variant = 'default',
  showHoverEffect = true
}: MeuBentinLogoProps) {
  // Tamanhos predefinidos baseados no design system Meu Bentin
  const sizeClasses = {
    xs: "h-8 w-auto",
    sm: "h-12 w-auto",
    md: "h-16 w-auto", 
    lg: "h-20 w-auto",
    xl: "h-24 w-auto",
    custom: className
  };

  const variantClasses = {
    default: "flex items-center justify-center",
    compact: "flex items-center justify-start", 
    navbar: "flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg p-2"
  };

  const finalClassName = size === 'custom' ? className : sizeClasses[size];
  const hoverEffect = showHoverEffect ? "transition-all duration-200 hover:scale-[1.02] cursor-pointer" : "";
  const containerClass = `${finalClassName} ${variantClasses[variant]} ${hoverEffect}`;

  const handleLogoClick = () => {
    // Scroll suave para o topo ou refresh do dashboard
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div 
      className={containerClass}
      onClick={showHoverEffect ? handleLogoClick : undefined}
      role={showHoverEffect ? "button" : undefined}
      tabIndex={showHoverEffect ? 0 : undefined}
      aria-label={showHoverEffect ? "Voltar ao topo do dashboard" : "Logo Meu Bentin"}
    >
      {/* SVG Logo oficial do Meu Bentin */}
      <svg
        viewBox="0 0 200 80"
        className="h-full w-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fundo do logo com gradiente das cores oficiais */}
        <rect
          width="200"
          height="80"
          rx="20"
          fill="url(#logoGradient)"
          className="drop-shadow-lg"
        />
        
        {/* Gradientes */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e91e63" />
            <stop offset="50%" stopColor="#2196f3" />
            <stop offset="100%" stopColor="#4caf50" />
          </linearGradient>
          
          <filter id="textShadow">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
          </filter>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Três crianças abraçadas - representação estilizada */}
        <g transform="translate(20, 15)">
          {/* Criança esquerda */}
          <circle cx="25" cy="25" r="10" fill="#fff" opacity="0.95" />
          <circle cx="22" cy="22" r="2" fill="#333" />
          <circle cx="28" cy="22" r="2" fill="#333" />
          <path d="M 20 28 Q 25 32 30 28" stroke="#e91e63" strokeWidth="2" fill="none" />
          <circle cx="25" cy="40" r="8" fill="#e91e63" opacity="0.8" />
          
          {/* Criança centro */}
          <circle cx="75" cy="20" r="12" fill="#fff" opacity="0.95" />
          <circle cx="71" cy="17" r="2" fill="#333" />
          <circle cx="79" cy="17" r="2" fill="#333" />
          <path d="M 69 23 Q 75 27 81 23" stroke="#2196f3" strokeWidth="2" fill="none" />
          <circle cx="75" cy="38" r="10" fill="#2196f3" opacity="0.8" />
          
          {/* Criança direita */}
          <circle cx="125" cy="25" r="10" fill="#fff" opacity="0.95" />
          <circle cx="122" cy="22" r="2" fill="#333" />
          <circle cx="128" cy="22" r="2" fill="#333" />
          <path d="M 120 28 Q 125 32 130 28" stroke="#4caf50" strokeWidth="2" fill="none" />
          <circle cx="125" cy="40" r="8" fill="#4caf50" opacity="0.8" />
          
          {/* Braços conectando as crianças */}
          <path d="M 35 35 Q 50 30 65 35" stroke="#fff" strokeWidth="4" opacity="0.8" strokeLinecap="round" />
          <path d="M 85 35 Q 100 30 115 35" stroke="#fff" strokeWidth="4" opacity="0.8" strokeLinecap="round" />
        </g>
        
        {/* Elementos decorativos */}
        <g>
          <circle cx="170" cy="20" r="4" fill="#ffeb3b" opacity="0.8" />
          <circle cx="180" cy="35" r="3" fill="#ff5722" opacity="0.8" />
          <circle cx="15" cy="25" r="3" fill="#9c27b0" opacity="0.8" />
          <circle cx="10" cy="40" r="2" fill="#00bcd4" opacity="0.8" />
          
          {/* Estrelas */}
          <polygon points="185,15 187,21 193,21 188,25 190,31 185,27 180,31 182,25 177,21 183,21" fill="#fff" opacity="0.7" />
          <polygon points="15,60 16,63 19,63 17,65 18,68 15,66 12,68 13,65 11,63 14,63" fill="#fff" opacity="0.7" />
        </g>
        
        {/* Texto "Meu Bentin" */}
        <text
          x="100"
          y="62"
          textAnchor="middle"
          className="font-bold text-xl"
          fill="white"
          filter="url(#textShadow)"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <tspan fill="#fff" className="font-extrabold">Meu </tspan>
          <tspan fill="#e3f2fd" className="font-extrabold">Ben</tspan>
          <tspan fill="#f1f8e9" className="font-extrabold">tin</tspan>
        </text>
        
        {/* Corações pequenos */}
        <g fill="#fff" opacity="0.6">
          <path d="M30,65 C30,63 32,61 34,63 C36,61 38,63 38,65 C38,67 34,71 34,71 C34,71 30,67 30,65 Z" />
          <path d="M160,65 C160,63 162,61 164,63 C166,61 168,63 168,65 C168,67 164,71 164,71 C164,71 160,67 160,65 Z" />
        </g>
      </svg>
    </div>
  );
}

// Componentes auxiliares para casos específicos
export function MeuBentinLogoNavbar() {
  return <MeuBentinLogo size="sm" variant="navbar" />;
}

export function MeuBentinLogoCompact() {
  return <MeuBentinLogo size="sm" variant="compact" showHoverEffect={false} />;
}

export function MeuBentinLogoHeader() {
  return <MeuBentinLogo size="lg" variant="default" showHoverEffect={true} />;
}