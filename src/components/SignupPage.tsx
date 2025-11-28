import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { UserPlus, AlertCircle } from 'lucide-react';

interface SignupPageProps {
  onNavigate: (view: string) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch') || 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort') || 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const success = await signup(name, email, password);
      if (success) {
        onNavigate('home');
      } else {
        setError(t('auth.signupError') || 'Este email já está cadastrado');
      }
    } catch (err) {
      setError(t('auth.signupError') || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4 pt-20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center">
            {t('auth.createAccount') || 'Criar Conta'}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.signupDescription') || 'Junte-se à comunidade dos mercados do Recife'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.name') || 'Nome'}</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email') || 'Email'}</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password') || 'Senha'}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('auth.confirmPassword') || 'Confirmar Senha'}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (t('auth.loading') || 'Carregando...') : (t('auth.createAccount') || 'Criar Conta')}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t('auth.hasAccount') || 'Já tem uma conta?'}{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-orange-500 hover:underline"
              >
                {t('auth.login') || 'Entrar'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
