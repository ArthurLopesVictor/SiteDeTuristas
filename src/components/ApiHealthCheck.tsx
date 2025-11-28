import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

export function ApiHealthCheck() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<{
    health: 'success' | 'error' | null;
    markets: 'success' | 'error' | null;
    marketCount: number;
    errors: string[];
  }>({
    health: null,
    markets: null,
    marketCount: 0,
    errors: [],
  });

  const runHealthCheck = async () => {
    setChecking(true);
    const errors: string[] = [];
    const newResults = {
      health: null as 'success' | 'error' | null,
      markets: null as 'success' | 'error' | null,
      marketCount: 0,
      errors: [] as string[],
    };

    // Get anon key for authorization
    const { publicAnonKey } = await import('../utils/supabase/info');
    const headers = {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    };

    // Test 1: Health endpoint
    try {
      const healthResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/health`,
        { headers }
      );
      
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        console.log('✅ Health check:', data);
        newResults.health = 'success';
      } else {
        newResults.health = 'error';
        const errorText = await healthResponse.text();
        errors.push(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
        if (healthResponse.status === 401) {
          errors.push('Erro 401: Verifique se o ANON_KEY está correto');
        } else if (healthResponse.status === 403) {
          errors.push('Erro 403: Edge Function não deployada. Consulte /guidelines/DEPLOY_ISSUE_403.md');
        } else if (healthResponse.status === 404) {
          errors.push('Erro 404: Edge Function não encontrada. Nome correto: make-server');
        }
        console.error('Health error response:', errorText);
      }
    } catch (err: any) {
      newResults.health = 'error';
      errors.push(`Health check error: ${err?.message || String(err)}`);
      if (err?.message?.includes('Failed to fetch')) {
        errors.push('Erro de rede: Verifique se o Supabase está acessível');
      }
    }

    // Test 2: Markets endpoint
    try {
      const marketsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/markets`,
        { headers }
      );
      
      if (marketsResponse.ok) {
        const data = await marketsResponse.json();
        console.log('✅ Markets check:', data);
        newResults.markets = 'success';
        newResults.marketCount = data.markets?.length || 0;
      } else {
        newResults.markets = 'error';
        const errorText = await marketsResponse.text();
        errors.push(`Markets endpoint failed: ${marketsResponse.status} ${marketsResponse.statusText}`);
        if (marketsResponse.status === 401) {
          errors.push('Erro 401: Verifique se o ANON_KEY está correto');
        } else if (marketsResponse.status === 403) {
          errors.push('Erro 403: Edge Function não deployada. Consulte /guidelines/DEPLOY_ISSUE_403.md');
        } else if (marketsResponse.status === 404) {
          errors.push('Erro 404: Edge Function não encontrada. Nome correto: make-server');
        } else if (marketsResponse.status === 500) {
          errors.push('Erro 500: Verifique se a tabela kv_store_a5c257ac existe');
        }
        console.error('Markets error response:', errorText);
      }
    } catch (err: any) {
      newResults.markets = 'error';
      errors.push(`Markets endpoint error: ${err?.message || String(err)}`);
      if (err?.message?.includes('Failed to fetch')) {
        errors.push('Erro de rede: Verifique se o Supabase está acessível');
      }
    }

    newResults.errors = errors;
    setResults(newResults);
    setChecking(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Status da API</CardTitle>
        <CardDescription>
          Verificar se a Edge Function está funcionando corretamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runHealthCheck}
          disabled={checking}
          className="w-full"
        >
          {checking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Executar Verificação'
          )}
        </Button>

        {(results.health || results.markets) && (
          <div className="space-y-3 pt-4 border-t">
            {/* Health Check Result */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Health Check</p>
                <p className="text-sm text-muted-foreground">
                  /health endpoint
                </p>
              </div>
              {results.health === 'success' ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
            </div>

            {/* Markets Endpoint Result */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Markets Endpoint</p>
                <p className="text-sm text-muted-foreground">
                  {results.marketCount} mercado(s) encontrado(s)
                </p>
              </div>
              {results.markets === 'success' ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
            </div>

            {/* Errors */}
            {results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <p className="font-medium mb-2">Erros encontrados:</p>
                  <ul className="list-disc ml-5 space-y-1 text-sm">
                    {results.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-destructive/10 rounded space-y-2 text-xs">
                    <p className="font-semibold">📚 Guias de Solução:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li><code>/guidelines/DEPLOY_ISSUE_403.md</code> - Resolver erro 403 (Edge Function não deployada)</li>
                      <li><code>/guidelines/TESTAR_API.md</code> - Testar e verificar a API</li>
                      <li><code>/guidelines/EDGE_FUNCTION_DEPLOY.md</code> - Como fazer deploy da Edge Function</li>
                    </ul>
                    <p className="mt-2 pt-2 border-t border-destructive/20">
                      <strong>Ação rápida:</strong> Verifique se a Edge Function <code>make-server</code> está deployada no Dashboard do Supabase.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {results.health === 'success' && results.markets === 'success' && (
              <Alert className="border-green-500 bg-green-50">
                <AlertDescription>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-green-800">
                      ✅ Todos os testes passaram! A API está funcionando corretamente.
                    </p>
                  </div>
                  {results.marketCount === 0 && (
                    <p className="mt-2 text-sm text-green-700">
                      Não há mercados cadastrados ainda. Seja o primeiro a adicionar um mercado!
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Technical Info */}
        <details className="text-sm pt-4 border-t">
          <summary className="cursor-pointer hover:underline text-muted-foreground">
            Informações Técnicas
          </summary>
          <div className="mt-3 p-3 bg-muted rounded text-xs space-y-2">
            <p><strong>Project ID:</strong> {projectId}</p>
            <p><strong>Health Endpoint:</strong><br />
              https://{projectId}.supabase.co/functions/v1/make-server-a5c257ac/health
            </p>
            <p><strong>Markets Endpoint:</strong><br />
              https://{projectId}.supabase.co/functions/v1/make-server-a5c257ac/markets
            </p>
            <p className="pt-2 border-t"><strong>Para resolver problemas:</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Verifique se a Edge Function está deployada</li>
              <li>Verifique se a tabela kv_store_a5c257ac existe</li>
              <li>Consulte /guidelines/TESTAR_API.md</li>
            </ul>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
