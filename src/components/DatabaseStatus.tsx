import { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';

export function DatabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    setErrorDetails('');
    
    try {
      console.log('[DatabaseStatus] Checking connection to edge function...');
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/health`;
      console.log('[DatabaseStatus] URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      console.log('[DatabaseStatus] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DatabaseStatus] Error response:', errorText);
        setErrorDetails(`HTTP ${response.status}: ${errorText}`);
        setStatus('error');
        return;
      }

      const data = await response.json();
      console.log('[DatabaseStatus] Response data:', data);

      if (data.status === 'ok') {
        setStatus('connected');
        console.log('[DatabaseStatus] Connection successful!');
      } else {
        setStatus('error');
        setErrorDetails('Invalid response from server');
      }
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setErrorDetails(errorMessage);
      console.error('[DatabaseStatus] Connection error:', error);
    }
  };

  const getStatusText = () => {
    if (status === 'checking') return 'Verificando conexão';
    if (status === 'connected') return 'Sistema online';
    return 'Sistema offline';
  };

  return (
    <div className="flex flex-col items-end gap-2 mb-6">
      <div className="flex items-center gap-2">
        {status === 'checking' && (
          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
        )}
        {status === 'connected' && (
          <div 
            className="h-2 w-2 rounded-full bg-green-500" 
            title={getStatusText()}
          />
        )}
        {status === 'error' && (
          <div 
            className="h-2 w-2 rounded-full bg-red-500 animate-pulse" 
            title={getStatusText()}
          />
        )}
        <span className="text-xs text-muted-foreground">
          {getStatusText()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkConnection}
          className="h-6 w-6 p-0"
          title="Verificar novamente"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      {status === 'error' && errorDetails && (
        <div className="text-xs text-red-500 max-w-xs text-right">
          {errorDetails}
        </div>
      )}
    </div>
  );
}
