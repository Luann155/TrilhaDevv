import React, { useState } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { useToast } from '@/components/ui/use-toast';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn as LoginLucideIcon } from 'lucide-react';

    const AuthPage = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loading, setLoading] = useState(false);
      const [showPassword, setShowPassword] = useState(false);
      const [isSignUp, setIsSignUp] = useState(false); 
      const { toast } = useToast();
      const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/1e9da85f-0f3d-41c2-8d4c-abdb48609b38/313196da4c6c4ff2c3deb79423d2ed81.png";

      const handleAuth = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
          let response;
          if (isSignUp) {
            response = await supabase.auth.signUp({ 
              email, 
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/dashboard` 
              }
            });
            if (!response.error && response.data.user) {
               toast({ title: "Cadastro realizado!", description: "Verifique seu e-mail para confirmar sua conta.", className: "bg-green-500 text-white" });
            }
          } else {
            response = await supabase.auth.signInWithPassword({ email, password });
             if (!response.error && response.data.user) {
               toast({ title: "Login bem-sucedido!", description: "Bem-vindo(a) de volta!", className: "bg-green-500 text-white" });
             }
          }

          if (response.error) {
            throw response.error;
          }
        } catch (error) {
          console.error("Authentication error:", error);
          toast({
            title: "Erro de autenticação",
            description: error.message || "Ocorreu um erro. Tente novamente.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4"
        >
          <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-lg border-primary/20">
            <CardHeader className="text-center">
              <motion.img 
                src={logoUrl} 
                alt="Trilha Dev Logo" 
                className="w-24 h-auto mx-auto mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
              <CardTitle className="text-3xl font-bold text-primary">{isSignUp ? "Crie sua Conta" : "Acesse sua Conta"}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {isSignUp ? "Junte-se à Trilha Dev para organizar seus estudos." : "Continue sua jornada de aprendizado."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setIsSignUp(value === "signup")}>
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Entrar</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Cadastrar</TabsTrigger>
                </TabsList>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSignUp ? "signup-form" : "login-form"}
                    initial={{ opacity: 0, x: isSignUp ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isSignUp ? -50 : 50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleAuth} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground/80">E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 pr-4 py-3 text-base bg-background/70 border-border/50 focus:border-primary"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-10 pr-12 py-3 text-base bg-background/70 border-border/50 focus:border-primary"
                            disabled={loading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full text-base py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground shadow-md" disabled={loading}>
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-5 w-5 border-2 border-background border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          isSignUp ? <UserPlus className="mr-2 h-5 w-5" /> : <LoginLucideIcon className="mr-2 h-5 w-5" />
                        )}
                        {loading ? "Processando..." : (isSignUp ? "Criar conta" : "Entrar")}
                      </Button>
                    </form>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
            <CardFooter className="text-center text-xs text-muted-foreground mt-4">
              Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default AuthPage;