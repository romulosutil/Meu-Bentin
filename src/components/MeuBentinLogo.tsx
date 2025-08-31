import logoImage from 'figma:asset/cad42b6696e345b68354c15fd24ef4b9098c27ad.png';

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
      <img 
        src={logoImage} 
        alt="Meu Bentin - Loja Infantil com três crianças abraçadas representando diversão e cuidado" 
        className="h-full w-auto object-contain select-none"
        loading="eager"
        draggable="false"
        style={{ 
          maxWidth: 'none',
          aspectRatio: 'auto',
          imageRendering: 'high-quality'
        }}
        onError={(e) => {
          console.error('Erro ao carregar logo Meu Bentin:', e);
          // Fallback elegante para texto se a imagem não carregar
          const target = e.currentTarget;
          target.style.display = 'none';
          
          if (target.nextSibling) return;
          
          const fallback = document.createElement('div');
          fallback.className = 'flex items-center justify-center text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-bentin-pink via-bentin-blue to-bentin-green bg-clip-text text-transparent px-4 py-2 rounded-lg border-2 border-slate-200';
          fallback.innerHTML = `
            <span style="color: #e91e63;">Meu</span>
            <span style="color: #2196f3;">Ben</span>
            <span style="color: #4caf50;">tin</span>
          `;
          target.parentNode?.appendChild(fallback);
        }}
      />
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