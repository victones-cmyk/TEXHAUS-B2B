import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const envVars = {};
  envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
      envVars[key.trim()] = value.join('=').trim().replace(/"/g, '').replace(/'/g, '');
    }
  });

  const supabaseUrl = envVars.VITE_SUPABASE_URL;
  const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE')) {
    console.error("ERRO: Credenciais ausentes ou valores padrão ainda estão no .env.local.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  async function testConnection() {
    console.log("Testando conexão com o Supabase em:", supabaseUrl);
    
    // Tenta inserir um registro de teste
    const testCnpj = 'TESTE-' + Date.now();
    const { data, error } = await supabase
      .from('b2b_registrations')
      .insert([
        { 
          full_name: 'Teste de Sistema', 
          company_name: 'Texhaus Dev', 
          cnpj: testCnpj, 
          email: `teste-${Date.now()}@texhaus.com.br`, 
          phone: '(00) 0000-0000', 
          customer_type: 'outro', 
          city: 'São Paulo', 
          state: 'SP' 
        }
      ])
      .select();
      
    if (error) {
      console.error("\n❌ FALHA NO TESTE.");
      console.error("Detalhes do Erro:", error.message);
      console.error("Dica: Verifique se você rodou o script SQL exatamente como indicado.");
    } else {
      console.log("\n✅ SUCESSO! Banco de dados conectado e tabela configurada perfeitamente.");
      
      // Limpa o registro de teste
      await supabase.from('b2b_registrations').delete().eq('cnpj', testCnpj);
      console.log("Registro de teste apagado.");
    }
  }

  testConnection();
} catch (e) {
  console.error("Erro ao ler o arquivo .env.local:", e.message);
}
