import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { LogOut, User, Clock, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatLoginTime } from '../utils/authStorage';

export default function AuthenticatedHeader() {
  const { user, loginTime, logout, sessionInfo } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const getSessionStatus = () => {
    if (!sessionInfo) return 'Status desconhecido';
    
    if (sessionInfo.isExpiringSoon) {
      return 'Expirando em breve';
    }
    
    return 'Ativa e segura';
  };

  const getUserInitials = (username: string | null) => {
    if (!username) return 'U';
    return username.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        {/* Título e subtítulo */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-bentin-pink via-bentin-blue to-bentin-green bg-clip-text text-transparent leading-tight">
            Sistema de Gestão
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 font-semibold mt-2 sm:mt-3">
            Meu Bentin
          </p>
        </div>

        {/* Menu do usuário */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-700">
              Olá, {user}
            </p>
            <p className="text-xs text-muted-foreground">
              Logado às {loginTime ? formatLoginTime(loginTime) : 'N/A'}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12 px-3 rounded-xl border-2 border-border/50 hover:border-bentin-blue hover:bg-bentin-blue/5 transition-all duration-200 group"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-bentin-pink to-bentin-blue text-white font-semibold text-sm">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-bentin-blue transition-colors" />
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-2">
              <div className="flex items-center gap-3 p-2 mb-2 bg-gradient-to-r from-bentin-pink/10 to-bentin-blue/10 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-bentin-pink to-bentin-blue text-white font-semibold">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-700 truncate">
                    {user}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Administrador
                  </p>
                </div>
              </div>

              <DropdownMenuItem className="flex items-center gap-2 p-3 rounded-lg cursor-default focus:bg-transparent">
                <User className="h-4 w-4 text-bentin-blue" />
                <div>
                  <p className="text-sm font-medium">Usuário</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user}
                  </p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-2 p-3 rounded-lg cursor-default focus:bg-transparent">
                <Clock className="h-4 w-4 text-bentin-green" />
                <div>
                  <p className="text-sm font-medium">Login</p>
                  <p className="text-xs text-muted-foreground">
                    {loginTime ? formatLoginTime(loginTime) : 'N/A'}
                  </p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-2 p-3 rounded-lg cursor-default focus:bg-transparent">
                <Shield className="h-4 w-4 text-bentin-orange" />
                <div>
                  <p className="text-sm font-medium">Sessão</p>
                  <p className="text-xs text-muted-foreground">
                    {getSessionStatus()}
                  </p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuItem 
                className="flex items-center gap-2 p-3 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Sair do Sistema</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialog de confirmação de logout */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-destructive" />
              Confirmar Saída
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair do sistema? Você precisará fazer login novamente para acessar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              Sim, Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}