import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '../utils/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';

export default function UserHeader() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split(/[._]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const getUserName = () => {
    if (user.name) return user.name;
    return user.email.split('@')[0];
  };

  return (
    <div className="flex items-center justify-between mb-6 sm:mb-8">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-bentin-pink via-bentin-blue to-bentin-green bg-clip-text text-transparent leading-tight">
          Sistema de Gestão
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 font-semibold mt-1 sm:mt-2">
          Meu Bentin
        </p>
      </div>

      {/* Menu do Usuário */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 sm:gap-3 h-auto p-2 sm:p-3 rounded-xl hover:bg-white/80 border border-border/50 bg-white/60 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-bentin-pink to-bentin-blue text-white font-semibold text-sm">
                  {getInitials(user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left min-w-0">
                <p className="font-semibold text-sm text-slate-700 truncate max-w-32">
                  {getUserName()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Online
                </p>
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-white/95 backdrop-blur-md border border-border/50 shadow-xl rounded-xl"
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="font-semibold text-sm leading-none">
                {getUserName()}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer focus:bg-slate-50 rounded-lg mx-1">
            <User className="mr-2 h-4 w-4 text-bentin-blue" />
            <span>Minha Conta</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer focus:bg-slate-50 rounded-lg mx-1">
            <Shield className="mr-2 h-4 w-4 text-bentin-green" />
            <span>Configurações</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={logout}
            className="cursor-pointer focus:bg-red-50 text-red-600 focus:text-red-700 rounded-lg mx-1"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair do Sistema</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}