import React from 'react';
import { Badge } from './ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const SistemaAprimoradoStatus: React.FC = () => {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge variant="outline" className="flex items-center gap-1 text-xs">
        <CheckCircle className="h-3 w-3 text-green-500" />
        Sistema Aprimorado Ativo
      </Badge>
      <Badge variant="secondary" className="text-xs">
        <Info className="h-3 w-3 mr-1" />
        Imagens, Tamanhos Múltiplos, Margem Automática
      </Badge>
    </div>
  );
};

export default SistemaAprimoradoStatus;