# Análise Detalhada - Termo Duelo

## 📋 Índice
1. [Introdução](#introdução)
2. [Arquitetura da Aplicação](#arquitetura-da-aplicação)
3. [Análise Detalhada dos Arquivos](#análise-detalhada-dos-arquivos)
4. [Funcionalidades Principais](#funcionalidades-principais)
5. [Tecnologias Utilizadas](#tecnologias-utilizadas)
6. [Conclusão](#conclusão)

---

## Introdução

O **Termo Duelo** é uma aplicação web desenvolvida em React que implementa um jogo de palavras similar ao Wordle, com funcionalidades de multiplayer. A aplicação permite que usuários se cadastrem, façam login, gerenciem amigos e joguem tanto no modo solo quanto no modo multiplayer.

### Características Principais:
- 🎮 **Jogo Solo**: Modo clássico com 5 tentativas
- 👥 **Multiplayer**: Duelo de 3 minutos entre amigos
- 🏆 **Sistema de Ranking**: Classificação dos jogadores
- 👤 **Gerenciamento de Perfil**: Avatar e dados pessoais
- 👫 **Sistema de Amigos**: Adicionar e gerenciar amigos

---

## Arquitetura da Aplicação

### Estrutura de Arquivos
```
src/
├── main.jsx              # Ponto de entrada
├── App.jsx               # Configuração de rotas
├── page/
│   ├── login.jsx         # Autenticação
│   ├── home.jsx          # Dashboard principal
│   ├── ranking.jsx       # Classificação
│   ├── termo.jsx         # Jogo solo
│   └── termoduelo.jsx    # Jogo multiplayer
├── components/           # Componentes reutilizáveis
├── contexts/            # Context API
├── hooks/               # Custom hooks
├── services/            # Serviços de API
├── styles/              # Temas e estilos
└── utils/               # Utilitários
```

### Fluxo de Navegação
```
Login → Home → [Termo Solo | Termo Duelo | Ranking]
                ↓
        Termo Duelo: Seleção → Lobby → Jogo
```

---

## Análise Detalhada dos Arquivos

### 1. **main.jsx** - Ponto de Entrada

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
```

**Linha 1**: Importa a biblioteca React, necessária para usar JSX e hooks  
**Linha 2**: Importa ReactDOM e especificamente a função `createRoot` (versão moderna do React 18)  
**Linha 3**: Importa o componente principal App da aplicação  
**Linha 4**: Importa os estilos CSS globais

```javascript
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Linha 6**: Cria a raiz da aplicação React no elemento HTML com id "root"  
**Linha 7-9**: Renderiza o componente App dentro do StrictMode (modo rigoroso que detecta problemas potenciais)  
**Linha 10**: Fecha a chamada de render

---

### 2. **App.jsx** - Configuração de Rotas

```javascript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./page/login";
import Register from "./page/register";
import Home from "./page/home";
import Ranking from "./page/ranking";
import Termo from "./page/termo";
import TermoDuelo from "./page/termoduelo";
```

**Linha 1**: Importa componentes do React Router para navegação entre páginas  
**Linha 2**: Importa o contexto de autenticação que gerencia o estado do usuário  
**Linhas 3-8**: Importa todos os componentes de página da aplicação

```javascript
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/termo" element={<Termo />} />
          <Route path="/termoduelo" element={<TermoDuelo />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

**Linha 10**: Define o componente principal App como exportação padrão  
**Linha 12**: Envolve toda a aplicação com AuthProvider para gerenciar autenticação  
**Linha 13**: Configura o roteador para navegação entre páginas  
**Linha 14**: Define o container de rotas  
**Linhas 15-20**: Define cada rota da aplicação:
- `/` → Página de login (página inicial)
- `/register` → Página de cadastro
- `/home` → Página principal do usuário
- `/ranking` → Página de classificação
- `/termo` → Jogo solo
- `/termoduelo` → Jogo multiplayer

---

### 3. **login.jsx** - Página de Autenticação

#### Estados Principais
```javascript
const [formData, setFormData] = useState({
  email: "",
  password: ""
});
const [errors, setErrors] = useState({});
const [rememberMe, setRememberMe] = useState(false);
const [showForgotPassword, setShowForgotPassword] = useState(false);
const [showPassword, setShowPassword] = useState(false);
```

**Linhas 13-20**: Estados para dados do formulário, erros de validação, checkbox "lembrar de mim", modal de recuperação de senha e visibilidade da senha

#### Função de Submissão
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  const validation = validateLoginForm(formData);
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }

  const result = await login({
    ...formData,
    rememberMe
  });

  if (result.success) {
    navigate("/home");
  }
};
```

**Linhas 42-59**: Função de submissão do formulário:
- **Linha 43**: Previne comportamento padrão do formulário
- **Linha 45**: Valida os dados do formulário
- **Linhas 46-49**: Se inválido, define erros e retorna
- **Linhas 51-55**: Chama função de login com dados + rememberMe
- **Linhas 57-59**: Se sucesso, navega para home

#### Interface
- Logo colorido "TERMO"
- Formulário com validação em tempo real
- Botão para mostrar/ocultar senha
- Checkbox "lembrar de mim"
- Link de recuperação de senha
- Botões de login social (Google, Facebook)
- Link para cadastro

---

### 4. **home.jsx** - Página Principal

#### Estados Complexos
```javascript
const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
const [showEditProfile, setShowEditProfile] = useState(false);
const [showAddFriend, setShowAddFriend] = useState(false);
const [showFriendsList, setShowFriendsList] = useState(false);
const [showProfileDropdown, setShowProfileDropdown] = useState(false);
const [editName, setEditName] = useState("");
const [editAvatar, setEditAvatar] = useState(null);
const [friendEmail, setFriendEmail] = useState("");
const [friends, setFriends] = useState([]);
const [activeRankingTab, setActiveRankingTab] = useState("daily");
```

**Linhas 20-31**: Estados para controlar modais, dados de edição, lista de amigos e aba ativa do ranking

#### Funcionalidades Principais

##### Gerenciamento de Amigos
```javascript
const handleAddFriend = async (e) => {
  e.preventDefault();
  
  if (!friendEmail.trim()) {
    alert("Por favor, digite o email do amigo!");
    return;
  }

  if (friends.some(friend => friend.email === friendEmail.toLowerCase())) {
    alert("Este usuário já está na sua lista de amigos!");
    return;
  }

  if (friendEmail.toLowerCase() === user.email) {
    alert("Você não pode adicionar a si mesmo como amigo!");
    return;
  }

  const allUsers = JSON.parse(localStorage.getItem('termo_duelo_users') || '[]');
  const friendUser = allUsers.find(u => u.email === friendEmail.toLowerCase());

  if (!friendUser) {
    alert("Usuário não encontrado! Verifique o email digitado.");
    return;
  }

  const newFriend = {
    id: friendUser.id,
    name: friendUser.name,
    email: friendUser.email,
    addedAt: new Date().toISOString()
  };

  const updatedFriends = [...friends, newFriend];
  setFriends(updatedFriends);
  saveFriends(updatedFriends);
  
  setFriendEmail("");
  setShowAddFriend(false);
  alert(`Amigo ${friendUser.name} adicionado com sucesso!`);
};
```

**Linhas 111-155**: Função para adicionar amigo com validações completas

##### Interface Principal
- **Header**: Logo, navegação e dropdown do perfil
- **Card do Perfil**: Avatar, nome, nível, XP, estatísticas
- **Modos de Jogo**: Botões para Solo e Multiplayer
- **Ranking**: Card com posição do usuário

#### Modais
1. **Confirmação de Logout**: Modal de segurança
2. **Edição de Perfil**: Formulário com seleção de avatar
3. **Adicionar Amigo**: Campo de email + lista de amigos existentes
4. **Lista de Amigos**: Gerenciamento completo da lista

---

### 5. **ranking.jsx** - Página de Classificação

#### Geração de Dados
```javascript
const loadRankingData = () => {
  setLoading(true);
  
  // Simular carregamento de dados
  setTimeout(() => {
    const allUsers = JSON.parse(localStorage.getItem('termo_duelo_users') || '[]');
    
    // Gerar dados de ranking baseados nos usuários existentes
    const ranking = allUsers.map((user, index) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      points: Math.floor(Math.random() * 2000) + 500, // Pontos aleatórios para demonstração
      gamesPlayed: Math.floor(Math.random() * 200) + 50,
      winRate: Math.floor(Math.random() * 40) + 60, // 60-100%
      streak: Math.floor(Math.random() * 15) + 1,
      lastPlayed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));

    // Ordenar por pontos
    ranking.sort((a, b) => b.points - a.points);
    
    // Adicionar posição
    const rankingWithPosition = ranking.map((player, index) => ({
      ...player,
      position: index + 1
    }));

    setRankingData(rankingWithPosition);
    setLoading(false);
  }, 1000);
};
```

**Linhas 21-52**: Função que gera dados de ranking simulados baseados nos usuários do localStorage

#### Interface
- **Header**: Navegação com página ativa destacada
- **Card do Usuário**: Posição atual do jogador
- **Lista de Ranking**: Top 10 jogadores com medalhas
- **Loading**: Spinner durante carregamento

---

### 6. **termo.jsx** - Jogo Solo

#### Constantes do Jogo
```javascript
const PALAVRA_CERTA = "LIMAO";
const MAX_TENTATIVAS = 5;
```

**Linhas 4-5**: Palavra a ser adivinhada e número máximo de tentativas

#### Lógica Principal do Jogo
```javascript
const verificarTentativa = (e) => {
  if (e && e.preventDefault) e.preventDefault();
  if (gameOver) return;
  if (entrada.length !== palavra.length) return;

  const tentativa = entrada.toUpperCase();
  const counts = {};
  for (let ch of palavra) counts[ch] = (counts[ch] || 0) + 1;

  const resultado = Array(palavra.length).fill(null);

  // marca verdes
  for (let i = 0; i < palavra.length; i++) {
    if (tentativa[i] === palavra[i]) {
      resultado[i] = { letra: tentativa[i], cor: "green" };
      counts[tentativa[i]]--;
    }
  }

  // marca amarelos e cinza
  for (let i = 0; i < palavra.length; i++) {
    if (resultado[i]) continue;
    const ch = tentativa[i];
    if (counts[ch] > 0) {
      resultado[i] = { letra: ch, cor: "yellow" };
      counts[ch]--;
    } else {
      resultado[i] = { letra: ch, cor: "grey" };
    }
  }

  const novas = [...tentativas, resultado];
  setTentativas(novas);
  setEntrada("");

  if (resultado.every((r) => r.cor === "green")) {
    setGanhou(true);
    alert("Parabéns! Você acertou a palavra.");
    return;
  }

  if (novas.length >= MAX_TENTATIVAS) {
    alert(`Tentativas esgotadas. A palavra era: ${palavra}.`);
  }
};
```

**Linhas 17-60**: Algoritmo completo do jogo:
- **Linha 18**: Previne comportamento padrão do formulário
- **Linha 19**: Retorna se o jogo acabou
- **Linha 20**: Retorna se a palavra não tem o tamanho correto
- **Linha 22**: Converte entrada para maiúscula
- **Linhas 23-24**: Conta quantas vezes cada letra aparece na palavra correta
- **Linha 26**: Cria array para resultado
- **Linhas 28-33**: Marca letras verdes (posição e letra corretas)
- **Linhas 35-44**: Marca letras amarelas (letra existe mas posição errada) e cinzas (letra não existe)
- **Linhas 46-48**: Adiciona nova tentativa e limpa entrada
- **Linhas 50-54**: Verifica se ganhou (todas verdes)
- **Linhas 56-58**: Verifica se perdeu (esgotou tentativas)

#### Interface
- **Botão Voltar**: Navegação para home
- **Logo TERMO**: Logo colorido
- **Instruções**: Regras do jogo
- **Tentativas**: Exibição das tentativas com cores
- **Formulário**: Input e botão de envio

---

### 7. **termoduelo.jsx** - Jogo Multiplayer

#### Estados do Multiplayer
```javascript
const [telaAtual, setTelaAtual] = useState("selecionarAmigo"); // "selecionarAmigo", "lobby", "jogo"
const [amigoSelecionado, setAmigoSelecionado] = useState(null);
const [jogadorPronto, setJogadorPronto] = useState(false);
const [adversarioPronto, setAdversarioPronto] = useState(false);
const [tempoRestante, setTempoRestante] = useState(TEMPO_TOTAL);
const [pontuacaoJogador, setPontuacaoJogador] = useState(0);
const [pontuacaoAdversario, setPontuacaoAdversario] = useState(0);
const [entrada, setEntrada] = useState("");
const [palavraAtual, setPalavraAtual] = useState("");
const [letrasResultado, setLetrasResultado] = useState([]);
const [jogoAtivo, setJogoAtivo] = useState(false);
```

**Linhas 15-28**: Estados complexos para controlar as 3 telas do multiplayer

#### Cronômetro do Jogo
```javascript
useEffect(() => {
  if (telaAtual !== "jogo" || !jogoAtivo) return;
  if (tempoRestante <= 0) {
    setJogoAtivo(false);
    const vencedor = pontuacaoJogador > pontuacaoAdversario ? "Você venceu!" : 
                   pontuacaoJogador < pontuacaoAdversario ? `${amigoSelecionado?.name} venceu!` : "Empate!";
    alert(`⏳ Tempo esgotado! Resultado final:\nVocê: ${pontuacaoJogador}\n${amigoSelecionado?.name}: ${pontuacaoAdversario}\n\n🏆 ${vencedor}`);
    setTimeout(() => {
      handleFimDoJogo();
    }, 2000);
    return;
  }
  const timer = setInterval(() => {
    setTempoRestante((t) => t - 1);
  }, 1000);
  return () => clearInterval(timer);
}, [telaAtual, jogoAtivo, tempoRestante, pontuacaoJogador, pontuacaoAdversario, amigoSelecionado]);
```

**Linhas 50-66**: Effect do cronômetro que determina vencedor quando tempo acaba

#### Três Telas do Multiplayer

##### 1. Seleção de Amigo
- Lista de amigos online
- Cards clicáveis com efeitos hover
- Botão de voltar para home

##### 2. Lobby
- Cards dos dois jogadores
- Status de prontidão
- Botão "Estou Pronto!"
- Mensagens de status
- Simulação do adversário ficando pronto

##### 3. Jogo
- Header com pontuações e cronômetro
- Área de jogo com letras coloridas
- Formulário de entrada
- Sem botão de voltar (só sai quando tempo acaba)

---

## Funcionalidades Principais

### 🔐 **Sistema de Autenticação**
- Login com validação de formulário
- Recuperação de senha (placeholder)
- Checkbox "lembrar de mim"
- Login social (Google, Facebook) - placeholder
- Redirecionamento automático baseado no status de login

### 👤 **Gerenciamento de Perfil**
- Edição de nome e avatar
- Seleção entre 13 avatares diferentes
- Geração automática de iniciais
- Validação de dados

### 👫 **Sistema de Amigos**
- Adicionar amigos por email
- Validação de existência do usuário
- Lista de amigos com opção de remoção
- Persistência no localStorage
- Interface responsiva

### 🎮 **Jogo Solo**
- Palavra fixa "LIMAO" (5 letras)
- 5 tentativas máximo
- Sistema de cores (verde/amarelo/cinza)
- Validação de tamanho da palavra
- Feedback visual das tentativas

### ⚔️ **Jogo Multiplayer**
- Seleção de amigo online
- Lobby com confirmação de prontidão
- Cronômetro de 3 minutos
- Sistema de pontuação
- Múltiplas palavras aleatórias
- Interface de 3 telas distintas

### 🏆 **Sistema de Ranking**
- Geração de dados simulados
- Ordenação por pontuação
- Medalhas para top 3
- Card da posição do usuário
- Loading state

### 🎨 **Interface e UX**
- Design moderno com CSS-in-JS
- Logo colorido "TERMO"
- Modais profissionais
- Efeitos hover e transições
- Responsividade
- Estados de loading
- Feedback visual

---

## Tecnologias Utilizadas

### **Frontend**
- **React 18**: Biblioteca principal com hooks
- **React Router**: Navegação entre páginas
- **Context API**: Gerenciamento de estado global
- **CSS-in-JS**: Estilização inline com tema
- **localStorage**: Persistência de dados

### **Hooks Utilizados**
- `useState`: Gerenciamento de estado local
- `useEffect`: Efeitos colaterais e lifecycle
- `useNavigate`: Navegação programática
- `useAuth`: Contexto de autenticação

### **Padrões de Desenvolvimento**
- **Componentes Funcionais**: Uso de hooks ao invés de classes
- **Props Drilling**: Evitado com Context API
- **Separação de Responsabilidades**: Páginas, componentes, contextos
- **Validação de Formulários**: Utilitários reutilizáveis
- **Error Handling**: Try/catch e estados de erro

### **Estrutura de Dados**
```javascript
// Usuário
{
  id: string,
  name: string,
  email: string,
  avatar: string | null,
  password: string
}

// Amigo
{
  id: string,
  name: string,
  email: string,
  addedAt: string
}

// Ranking
{
  id: string,
  name: string,
  avatar: string,
  points: number,
  gamesPlayed: number,
  winRate: number,
  streak: number,
  position: number,
  lastPlayed: string
}
```

---

## Conclusão

O **Termo Duelo** é uma aplicação React bem estruturada que implementa um jogo de palavras com funcionalidades de multiplayer. A arquitetura utiliza padrões modernos do React, com separação clara de responsabilidades e gerenciamento de estado eficiente.

### **Pontos Fortes:**
- ✅ Interface moderna e responsiva
- ✅ Sistema de autenticação completo
- ✅ Gerenciamento de estado bem organizado
- ✅ Funcionalidades de multiplayer implementadas
- ✅ Validação de formulários robusta
- ✅ Persistência de dados no localStorage

### **Possíveis Melhorias:**
- 🔄 Integração com backend real
- 🔄 Sistema de notificações em tempo real
- 🔄 Mais palavras no jogo
- 🔄 Sistema de conquistas
- 🔄 Chat entre jogadores
- 🔄 Estatísticas mais detalhadas

### **Aprendizados Técnicos:**
- Uso avançado de hooks do React
- Gerenciamento de estado complexo
- Navegação entre múltiplas telas
- Validação de formulários
- Persistência de dados
- Design de interface responsiva

A aplicação demonstra conhecimento sólido em React e boas práticas de desenvolvimento frontend, criando uma experiência de usuário fluida e envolvente para um jogo de palavras multiplayer.

---

*Documento gerado automaticamente - Análise completa do código Termo Duelo*
