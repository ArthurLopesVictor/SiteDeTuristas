import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { X, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DeployAlert() {
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed the alert
    const dismissed = localStorage.getItem('deploy-alert-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsChecking(false);
      return;
    }

    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        setIsWorking(true);
        setIsVisible(false);
      } else {
        setIsWorking(false);
        setIsVisible(true);
      }
    } catch (error) {
      setIsWorking(false);
      setIsVisible(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('deploy-alert-dismissed', 'true');
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleRecheck = () => {
    setIsChecking(true);
    checkApiStatus();
  };

  if (isChecking || isDismissed || !isVisible) {
    return null;
  }

  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>⚠️ Edge Function Não Deployada</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-destructive/20"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-sm">
          ✅ <strong>O código foi corrigido!</strong> Agora você só precisa fazer o deploy da Edge Function no Supabase (leva 2 minutos).
        </p>
        
        <div className="bg-destructive/10 p-3 rounded text-xs space-y-2">
          <p className="font-semibold">🚀 Solução Rápida (2 minutos):</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>
              Acesse o{' '}
              <a
                href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1 hover:text-foreground"
              >
                Dashboard do Supabase
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Clique em "Create a new function"</li>
            <li>Nome: <code className="bg-background px-1 py-0.5 rounded">make-server</code></li>
            <li>Copie <strong>TODO</strong> o código de <code className="bg-background px-1 py-0.5 rounded">/supabase/functions/make-server/index.tsx</code></li>
            <li>Cole no editor e clique em "Deploy function"</li>
          </ol>
          <p className="text-muted-foreground italic mt-2">
            ℹ️ O arquivo agora é único e contém todo o código necessário.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRecheck}
            className="text-xs"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verificar Novamente
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open('/NEXT_STEP.md', '_blank')}
            className="text-xs"
          >
            📚 Guia Passo a Passo
          </Button>
        </div>

        <details className="text-xs">
          <summary className="cursor-pointer hover:underline text-muted-foreground">
            Alternativa: Deploy via CLI
          </summary>
          <div className="mt-2 p-2 bg-background rounded font-mono space-y-1">
            <div>$ npm install -g supabase</div>
            <div>$ supabase login</div>
            <div>$ supabase link --project-ref {projectId}</div>
            <div>$ supabase functions deploy make-server</div>
          </div>
        </details>
      </AlertDescription>
    </Alert>
  );
}
