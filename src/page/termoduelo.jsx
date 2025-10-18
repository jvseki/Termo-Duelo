import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PALAVRAS = ["LIMAO", "TERMO", "PEDRA", "LIVRO", "FESTA", "MOUSE", "GATOS", "CASAS"];
const TEMPO_TOTAL = 180;

// Dados mockados para amigos
const AMIGOS_MOCK = [
    { id: 1, name: "Seki", email: "jvseki@functionbeautifun@gmail.com", avatar: "S", online: true },
    { id: 2, name: "Mantovani", email: "jvseki@icloud.com", avatar: "M", online: true },
    { id: 3, name: "Ana", email: "ana@email.com", avatar: "A", online: false },
    { id: 4, name: "Carlos", email: "carlos@email.com", avatar: "C", online: true },
];

export default function TermoDuelo() {
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
    const navigate = useNavigate();

    // Simular adversário ficando pronto após 2 segundos no lobby
    useEffect(() => {
        if (telaAtual === "lobby" && amigoSelecionado) {
            const timer = setTimeout(() => {
                setAdversarioPronto(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [telaAtual, amigoSelecionado]);

    // Iniciar jogo quando ambos estiverem prontos
    useEffect(() => {
        if (jogadorPronto && adversarioPronto && telaAtual === "lobby") {
            setTimeout(() => {
                setTelaAtual("jogo");
                sortearPalavra();
                setJogoAtivo(true);
            }, 1000);
        }
    }, [jogadorPronto, adversarioPronto, telaAtual]);

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

    const sortearPalavra = () => {
        const aleatoria = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
        setPalavraAtual(aleatoria);
        setLetrasResultado(Array(aleatoria.length).fill({letra: "", cor: "gray"}));
    };

    const verificarTentativa = (e) => {
        e.preventDefault();
        const tentativa = entrada.toUpperCase();
        if (tentativa.length !== palavraAtual.length) return;

        const counts = {};
        for (let ch of palavraAtual) counts[ch] = (counts[ch] || 0) + 1;

        const resultado = Array(palavraAtual.length).fill(null);

        for (let i = 0; i < palavraAtual.length; i++) {
            if (tentativa[i] === palavraAtual[i]) {
                resultado[i] = { letra: tentativa[i], cor: "green"};
                counts[tentativa[i]]--;
            }
        }

        for (let i = 0; i < palavraAtual.length; i++) {
            if (resultado[i]) continue;
            const ch = tentativa[i];
            if (counts[ch] > 0) {
                resultado[i] = {letra: ch, cor: "yellow"};
                counts[ch]--;
            } else {
                resultado[i] = { letra: ch, cor: "gray"};
            }
        }

        setLetrasResultado(resultado);

        // Se acertou a palavra
        if (resultado.every((r) => r.cor === "green")) {
            setPontuacaoJogador((p) => p + 1);
            sortearPalavra();
            setEntrada("");
        } else {
            setEntrada("");
        }
    };

    const handleSelecionarAmigo = (amigo) => {
        setAmigoSelecionado(amigo);
        setTelaAtual("lobby");
    };

    const handleFicarPronto = () => {
        setJogadorPronto(true);
    };

    const handleVoltar = () => {
        if (telaAtual === "selecionarAmigo") {
            navigate("/home");
        } else if (telaAtual === "lobby") {
            setTelaAtual("selecionarAmigo");
            setAmigoSelecionado(null);
            setJogadorPronto(false);
            setAdversarioPronto(false);
        }
    };

    const handleFimDoJogo = () => {
        setTelaAtual("selecionarAmigo");
        setAmigoSelecionado(null);
        setJogadorPronto(false);
        setAdversarioPronto(false);
        setJogoAtivo(false);
        setTempoRestante(TEMPO_TOTAL);
        setPontuacaoJogador(0);
        setPontuacaoAdversario(0);
    };

    // Tela de seleção de amigo
    if (telaAtual === "selecionarAmigo") {
        return (
            <div style={{
                minHeight: "100vh",
                backgroundColor: "#f1f5f9",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 24,
                padding: 20,
                position: "relative",
            }}>
                {/* Botão Voltar - apenas na tela de seleção */}
                <button
                    onClick={handleVoltar}
                    style={{
                        position: "absolute",
                        top: 24,
                        left: 24,
                        backgroundColor: "#3b82f6",
                        color: "#fff",
                        padding: "12px 24px",
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        zIndex: 10,
                    }}
                >
                    ← Voltar para Home
                </button>

                {/* Card principal */}
                <div style={{
                    padding: 36,
                    borderRadius: 14,
                    background: "#fff",
                    boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
                    width: "min(600px, 92vw)",
                    textAlign: "center",
                }}>
                    {/* Logo TERMO */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12 }}>
                        {["T", "E", "R", "M", "O"].map((letra, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 6,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    backgroundColor:
                                        i === 0 || i === 2 ? "#10b981" : i === 1 || i === 3 ? "#3b82f6" : "#f59e0b",
                                    fontWeight: "bold",
                                    fontSize: 18,
                                }}
                            >
                                {letra}
                            </div>
                        ))}
                    </div>

                    <h2 style={{ marginTop: 0, marginBottom: 8 }}>Desafiar Amigo</h2>
                    <p style={{ color: "#666", marginBottom: 24 }}>
                        Selecione um amigo para desafiar em uma partida de 3 minutos!
                    </p>

                    {/* Lista de amigos */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {AMIGOS_MOCK.filter(amigo => amigo.online).map((amigo) => (
                            <div
                                key={amigo.id}
                                onClick={() => handleSelecionarAmigo(amigo)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "16px 20px",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: 12,
                                    border: "2px solid #e2e8f0",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                                    e.currentTarget.style.borderColor = "#3b82f6";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#f8fafc";
                                    e.currentTarget.style.borderColor = "#e2e8f0";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    backgroundColor: "#3b82f6",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    marginRight: 16,
                                }}>
                                    {amigo.avatar}
                                </div>
                                <div style={{ flex: 1, textAlign: "left" }}>
                                    <h4 style={{ margin: 0, color: "#1e293b" }}>{amigo.name}</h4>
                                    <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{amigo.email}</p>
                                </div>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    backgroundColor: "#10b981",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontSize: 16,
                                }}>
                                    ⚔️
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Tela de lobby
    if (telaAtual === "lobby") {
        return (
            <div style={{
                minHeight: "100vh",
                backgroundColor: "#f1f5f9",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 24,
                padding: 20,
                position: "relative",
            }}>
                {/* Botão Voltar - apenas no lobby */}
                <button
                    onClick={handleVoltar}
                    style={{
                        position: "absolute",
                        top: 24,
                        left: 24,
                        backgroundColor: "#3b82f6",
                        color: "#fff",
                        padding: "12px 24px",
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        zIndex: 10,
                    }}
                >
                    ← Voltar
                </button>

                {/* Card principal */}
                <div style={{
                    padding: 36,
                    borderRadius: 14,
                    background: "#fff",
                    boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
                    width: "min(600px, 92vw)",
                    textAlign: "center",
                }}>
                    <h2 style={{ marginTop: 0, marginBottom: 24 }}>Lobby do Desafio</h2>

                    {/* Cards dos jogadores */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
                        {/* Jogador 1 (Você) */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "20px",
                            backgroundColor: jogadorPronto ? "#dcfce7" : "#f8fafc",
                            borderRadius: 12,
                            border: `2px solid ${jogadorPronto ? "#10b981" : "#e2e8f0"}`,
                        }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                backgroundColor: "#3b82f6",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                                fontWeight: "bold",
                                marginRight: 16,
                            }}>
                                T
                            </div>
                            <div style={{ flex: 1, textAlign: "left" }}>
                                <h4 style={{ margin: 0, color: "#1e293b" }}>teste1</h4>
                                <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>(Você)</p>
                            </div>
                            <div style={{
                                padding: "8px 16px",
                                borderRadius: 20,
                                backgroundColor: jogadorPronto ? "#10b981" : "#ef4444",
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: "600",
                            }}>
                                {jogadorPronto ? "✓ Pronto!" : "⏳ Aguardando..."}
                            </div>
                        </div>

                        {/* VS */}
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}>
                            <div style={{
                                padding: "12px 24px",
                                backgroundColor: "#f59e0b",
                                color: "#fff",
                                borderRadius: 20,
                                fontSize: 18,
                                fontWeight: "bold",
                            }}>
                                VS
                            </div>
                        </div>

                        {/* Jogador 2 (Adversário) */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "20px",
                            backgroundColor: adversarioPronto ? "#dcfce7" : "#f8fafc",
                            borderRadius: 12,
                            border: `2px solid ${adversarioPronto ? "#10b981" : "#e2e8f0"}`,
                        }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                backgroundColor: "#ef4444",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                                fontWeight: "bold",
                                marginRight: 16,
                            }}>
                                {amigoSelecionado?.avatar}
                            </div>
                            <div style={{ flex: 1, textAlign: "left" }}>
                                <h4 style={{ margin: 0, color: "#1e293b" }}>{amigoSelecionado?.name}</h4>
                                <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>(Adversário)</p>
                            </div>
                            <div style={{
                                padding: "8px 16px",
                                borderRadius: 20,
                                backgroundColor: adversarioPronto ? "#10b981" : "#ef4444",
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: "600",
                            }}>
                                {adversarioPronto ? "✓ Pronto!" : "⏳ Aguardando..."}
                            </div>
                        </div>
                    </div>

                    {/* Instrução e botão */}
                    <p style={{ color: "#666", marginBottom: 20 }}>
                        Clique em 'Pronto' quando estiver preparado!
                    </p>
                    
                    {!jogadorPronto && (
                        <button
                            onClick={handleFicarPronto}
                            style={{
                                backgroundColor: "#10b981",
                                color: "#fff",
                                border: "none",
                                padding: "16px 32px",
                                borderRadius: 12,
                                cursor: "pointer",
                                fontSize: 16,
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                margin: "0 auto",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#059669";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#10b981";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            ✓ Estou Pronto!
                        </button>
                    )}

                    {jogadorPronto && !adversarioPronto && (
                        <p style={{ color: "#f59e0b", fontWeight: "600" }}>
                            Aguardando {amigoSelecionado?.name} ficar pronto...
                        </p>
                    )}

                    {jogadorPronto && adversarioPronto && (
                        <p style={{ color: "#10b981", fontWeight: "600" }}>
                            Iniciando partida...
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Tela do jogo (mantém o código original do jogo)
    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f1f5f9",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
            padding: 20,
            position: "relative",
        }}>
            {/* Sem botão voltar na tela do jogo - só pode sair quando o tempo acabar */}

            {/* Header do jogo */}
            <div style={{ display: "flex", justifyContent: "space-between", width: "min(500px, 95%)", marginBottom: 20 }}>
                <div style={{ backgroundColor: "#10b981", color: "#fff", padding: "10px 20px", borderRadius: 8 }}>
                    Você ⚡ {pontuacaoJogador}
                </div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#1e293b" }}>
                    ⏳ {Math.floor(tempoRestante / 60)}:{String(tempoRestante % 60).padStart(2, "0")}
                </div>
                <div style={{ backgroundColor: "#ef4444", color: "#fff", padding: "10px 20px", borderRadius: 8 }}>
                    {amigoSelecionado?.name} ⚡ {pontuacaoAdversario}
                </div>
            </div>

            {/* Área do jogo */}
            <div style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
                padding: 30,
                width: "min(500px, 95%)",
                textAlign: "center"
            }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
                    {letrasResultado.map((c, i) => (
                        <div
                            key={i}
                            style={{
                                width: 48,
                                height: 48,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: c.cor === "green" ? "#10b981" : c.cor === "yellow" ? "#f59e0b" : "#d1d5db",
                                color: "#fff",
                                borderRadius: 8,
                                fontWeight: "bold",
                                fontSize: 20
                            }}
                        >
                            {c.letra}
                        </div>
                    ))}
                </div>

                <form onSubmit={verificarTentativa}>
                    <input
                        value={entrada}
                        onChange={(e) => setEntrada(e.target.value)}
                        maxLength={5}
                        placeholder="Digite a palavra"
                        style={{
                            width: "100%",
                            padding: 12,
                            fontSize: 18,
                            textAlign: "center",
                            borderRadius: 8,
                            border: "1px solid #ccc",
                            textTransform: "uppercase",
                            marginBottom: 12
                        }}
                        disabled={!jogoAtivo}
                    />
                    <button
                        type="submit"
                        disabled={!jogoAtivo}
                        style={{
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            padding: "12px 24px",
                            borderRadius: 8,
                            cursor: jogoAtivo ? "pointer" : "not-allowed",
                            fontSize: 16,
                            fontWeight: 600,
                            width: "100%"
                        }}
                    >
                        Enviar
                    </button>
                </form>
            </div>
        </div>
    );
}