# 🔧 Troubleshooting - Problema de Cadastro

## 📋 **Passos para Diagnosticar:**

### 1. **Verificar se o Backend está Rodando:**
```bash
cd termo-backend-project
npm run dev
```
**Deve aparecer:** `Server running on port 3000`

### 2. **Testar Backend Diretamente:**
```bash
curl --location 'http://localhost:3000/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Teste Usuario",
    "email": "teste@teste.com",
    "password": "senha123"
}'
```

### 3. **Verificar Console do Navegador:**
1. Abra o DevTools (F12)
2. Vá para a aba "Console"
3. Tente fazer o cadastro
4. Veja os logs detalhados que adicionei

### 4. **Verificar Network Tab:**
1. Abra o DevTools (F12)
2. Vá para a aba "Network"
3. Tente fazer o cadastro
4. Veja se a requisição está sendo feita
5. Verifique o status da resposta

## 🚨 **Possíveis Problemas:**

### **Problema 1: Backend não está rodando**
**Sintomas:** Erro de conexão no console
**Solução:** 
```bash
cd termo-backend-project
npm install
npm run dev
```

### **Problema 2: Porta 3000 ocupada**
**Sintomas:** Erro "EADDRINUSE"
**Solução:** 
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9
# Ou mudar a porta no .env
```

### **Problema 3: CORS**
**Sintomas:** Erro de CORS no console
**Solução:** Backend já tem CORS configurado, mas pode ser problema de configuração

### **Problema 4: Validação do Frontend**
**Sintomas:** Formulário não envia
**Solução:** Verificar se todos os campos estão preenchidos

### **Problema 5: Email já existe**
**Sintomas:** Erro 409 no console
**Solução:** Usar email diferente

## 🔍 **Logs que Você Deve Ver:**

### **Se funcionando:**
```
🚀 Iniciando registro: {name: "João", email: "joao@teste.com", password: "senha123"}
📤 Enviando requisição para: http://localhost:3000/api/auth/register
✅ Resposta do backend: {message: "User registered successfully", token: "...", user: {...}}
👤 Usuário mapeado: {id: 8, name: "João", email: "joao@teste.com", avatar: null}
```

### **Se com erro:**
```
❌ Erro no registro: [Error object]
📋 Detalhes do erro: {status: 409, statusText: "Conflict", data: {...}, message: "..."}
```

## 🛠️ **Comandos de Teste:**

### **Teste 1: Verificar se backend responde**
```bash
curl http://localhost:3000/
```
**Deve retornar:** `{"message":"Termo Backend API"}`

### **Teste 2: Testar registro**
```bash
curl --location 'http://localhost:3000/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Teste",
    "email": "teste@teste.com",
    "password": "1234"
}'
```

### **Teste 3: Verificar se email já existe**
```bash
curl --location 'http://localhost:3000/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Teste",
    "email": "teste@teste.com",
    "password": "1234"
}'
```
**Deve retornar:** `{"error":"Conflict","message":"Email already registered"}`

## 📞 **Próximos Passos:**

1. **Execute os testes acima**
2. **Verifique o console do navegador**
3. **Me informe qual erro específico está aparecendo**
4. **Compartilhe os logs do console**

---

**Com esses logs detalhados, conseguiremos identificar exatamente onde está o problema!**
