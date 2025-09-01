import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, EyeOff, Lock, User, ShoppingBag, Sparkles, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { validateCredentials, saveAuthData } from '../utils/authStorage';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simular delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validar credenciais
      const isValid = validateCredentials({ username, password });

      if (isValid) {
        // Salvar dados de autenticação
        saveAuthData(username);
        onLogin();
      } else {
        setError('Credenciais inválidas. Verifique seu usuário e senha.');
      }
    } catch (error) {
      console.error('Erro durante o login:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const floatingElements = Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute opacity-20"
      initial={{ 
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotate: Math.random() * 360
      }}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 2
      }}
      style={{
        left: `${10 + Math.random() * 80}%`,
        top: `${10 + Math.random() * 80}%`,
      }}
    >
      {i % 4 === 0 && <Heart className="h-6 w-6 text-bentin-pink" />}
      {i % 4 === 1 && <Sparkles className="h-5 w-5 text-bentin-blue" />}
      {i % 4 === 2 && <ShoppingBag className="h-5 w-5 text-bentin-green" />}
      {i % 4 === 3 && <Sparkles className="h-4 w-4 text-bentin-orange" />}
    </motion.div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Elementos flutuantes de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements}
      </div>

      {/* Bolhas decorativas */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-bentin-pink/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/3 right-16 w-32 h-32 bg-bentin-blue/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-bentin-green/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-32 right-1/3 w-16 h-16 bg-bentin-orange/10 rounded-full blur-xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bentin-card border-2 border-border/20 shadow-2xl backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-bentin-pink via-bentin-blue to-bentin-green rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            >
              <Lock className="h-8 w-8 text-white drop-shadow-md" />
            </motion.div>
            
            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-r from-bentin-pink via-bentin-blue to-bentin-green bg-clip-text text-transparent"
              >
                Meu Bentin
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-sm"
              >
                Sistema de Gestão
              </motion.p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-center text-sm text-muted-foreground bg-gradient-to-r from-bentin-mint/20 to-bentin-light-blue/20 rounded-lg p-3 border border-border/30">
                Faça login para acessar o sistema de gestão completo
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="username" className="flex items-center gap-2 font-semibold text-slate-700">
                  <User className="h-4 w-4 text-bentin-blue" />
                  Usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-xl border-2 border-border/50 focus:border-bentin-blue focus:ring-bentin-blue/20 transition-all duration-200 bg-input-background"
                  required
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="flex items-center gap-2 font-semibold text-slate-700">
                  <Lock className="h-4 w-4 text-bentin-pink" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-2 border-border/50 focus:border-bentin-pink focus:ring-bentin-pink/20 transition-all duration-200 bg-input-background pr-12"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground hover:text-bentin-pink transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground hover:text-bentin-pink transition-colors" />
                    )}
                  </Button>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert className="border-destructive/20 bg-destructive/5">
                    <AlertDescription className="text-destructive font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-bentin-pink to-bentin-blue hover:from-bentin-pink/90 hover:to-bentin-blue/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Entrando...
                    </motion.div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Entrar no Sistema
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center"
            >
              <p className="text-xs text-muted-foreground bg-slate-50 rounded-lg p-2 border border-border/30">
                🔒 Sistema protegido por autenticação
              </p>
            </motion.div>
          </CardContent>
        </Card>


      </motion.div>
    </div>
  );
}