// Teste de conexão com o backend
// Execute este código no console do navegador para testar

async function testBackendConnection() {
  console.log('🔍 Testando conexão com o backend...');
  
  try {
    // Teste 1: Verificar se o backend está rodando
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Teste Usuario',
        email: 'teste@teste.com',
        password: 'senha123'
      })
    });
    
    const data = await response.json();
    console.log('✅ Backend está rodando!');
    console.log('📋 Resposta:', data);
    
    if (response.status === 409) {
      console.log('⚠️ Email já existe (isso é normal)');
    }
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error);
    console.log('🔧 Possíveis soluções:');
    console.log('1. Verifique se o backend está rodando: cd termo-backend-project && npm run dev');
    console.log('2. Verifique se a porta 3000 está livre');
    console.log('3. Verifique se não há CORS bloqueando');
  }
}

// Executar teste
testBackendConnection();
