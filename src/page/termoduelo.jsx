import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { getCurrentUserData } from "../services/authService";
import LoadingSpinner from "../components/LoadingSpinner";

const TEMPO_TOTAL = 180;

export default function TermoDuelo() {
    const { socket, isConnected, error: socketError } = useSocket();
    const navigate = useNavigate();
    const currentUser = getCurrentUserData();
    
    const [telaAtual, setTelaAtual] = useState("selecionarAmigo");
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [onlineFriends, setOnlineFriends] = useState([]);
    const [amigoSelecionado, setAmigoSelecionado] = useState(null);
    const [invitePending, setInvitePending] = useState(null);
    const [receivedInvite, setReceivedInvite] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [opponent, setOpponent] = useState(null);
    const [jogadorPronto, setJogadorPronto] = useState(false);
    const [adversarioPronto, setAdversarioPronto] = useState(false);
    const [tempoRestante, setTempoRestante] = useState(TEMPO_TOTAL);
    const [pontuacaoJogador, setPontuacaoJogador] = useState(0);
    const [pontuacaoAdversario, setPontuacaoAdversario] = useState(0);
    const [entrada, setEntrada] = useState("");
    const [palavraAtual, setPalavraAtual] = useState("");
    const [letrasResultado, setLetrasResultado] = useState([]);
    const [jogoAtivo, setJogoAtivo] = useState(false);
    const gameTimerRef = useRef(null);

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('friends:onlineList', (data) => {
            setOnlineFriends(data.friends || []);
            setLoadingFriends(false);
        });

        socket.on('game:inviteReceived', (data) => {
            setReceivedInvite(data.invite);
        });

        socket.on('game:inviteSent', (data) => {
            setInvitePending(data.invite);
        });

        socket.on('game:inviteAccepted', (data) => {
            setRoomId(data.roomId);
            setOpponent(data.opponent);
            setInvitePending(null);
            setReceivedInvite(null);
            setTelaAtual("lobby");
        });

        socket.on('game:inviteRejected', (data) => {
            setInvitePending(null);
            alert('Convite de jogo rejeitado.');
        });

        socket.on('game:inviteExpired', (data) => {
            if (invitePending && invitePending.id === data.inviteId) {
                setInvitePending(null);
            }
            if (receivedInvite && receivedInvite.id === data.inviteId) {
                setReceivedInvite(null);
            }
        });

        socket.on('game:opponentReady', (data) => {
            setAdversarioPronto(true);
        });

        socket.on('game:start', (data) => {
            setPalavraAtual(data.keyword);
            setLetrasResultado(Array(data.keyword.length).fill({letra: "", cor: "gray"}));
            setTelaAtual("jogo");
            setJogoAtivo(true);
            setTempoRestante(TEMPO_TOTAL);
        });

        socket.on('game:newKeyword', (data) => {
            setPalavraAtual(data.keyword);
            setLetrasResultado(Array(data.keyword.length).fill({letra: "", cor: "gray"}));
            setEntrada("");
        });

        socket.on('game:guessResult', (data) => {
            if (data.correct) {
                setPontuacaoJogador(data.score);
                setPontuacaoAdversario(data.opponentScore);
                setEntrada("");
            }
        });

        socket.on('game:opponentGuessResult', (data) => {
            setPontuacaoJogador(data.yourScore);
            setPontuacaoAdversario(data.opponentScore);
        });

        socket.on('game:opponentLeft', () => {
            alert('O adversário saiu do jogo.');
            handleFimDoJogo();
        });

        socket.on('game:error', (data) => {
            alert(data.message || 'Erro no jogo');
        });

        socket.on('user:online', (data) => {
            if (onlineFriends.find(f => f.id === data.userId)) {
                setOnlineFriends(prev => {
                    const updated = [...prev];
                    const index = updated.findIndex(f => f.id === data.userId);
                    if (index !== -1) {
                        updated[index] = { ...updated[index], online: true };
                    }
                    return updated;
                });
            }
        });

        socket.on('user:offline', (data) => {
            setOnlineFriends(prev => {
                return prev.filter(f => f.id !== data.userId);
            });
        });

        if (isConnected) {
            socket.emit('user:setOnline');
            socket.emit('friends:getOnline');
        }

        return () => {
            if (socket) {
                socket.off('friends:onlineList');
                socket.off('game:inviteReceived');
                socket.off('game:inviteSent');
                socket.off('game:inviteAccepted');
                socket.off('game:inviteRejected');
                socket.off('game:inviteExpired');
                socket.off('game:opponentReady');
                socket.off('game:start');
                socket.off('game:newKeyword');
                socket.off('game:guessResult');
                socket.off('game:opponentGuessResult');
                socket.off('game:opponentLeft');
                socket.off('game:error');
                socket.off('user:online');
                socket.off('user:offline');
            }
        };
    }, [socket, isConnected]);

    useEffect(() => {
        if (telaAtual === "jogo" && jogoAtivo) {
            if (tempoRestante <= 0) {
                setJogoAtivo(false);
                const vencedor = pontuacaoJogador > pontuacaoAdversario ? "Você venceu!" : 
                               pontuacaoJogador < pontuacaoAdversario ? `${opponent?.nickname || 'Adversário'} venceu!` : "Empate!";
                alert(`⏳ Tempo esgotado! Resultado final:\nVocê: ${pontuacaoJogador}\n${opponent?.nickname || 'Adversário'}: ${pontuacaoAdversario}\n\n🏆 ${vencedor}`);
                setTimeout(() => {
                    handleFimDoJogo();
                }, 2000);
                return;
            }
            
            gameTimerRef.current = setInterval(() => {
                setTempoRestante((t) => t - 1);
            }, 1000);
            
            return () => {
                if (gameTimerRef.current) {
                    clearInterval(gameTimerRef.current);
                }
            };
        }
    }, [telaAtual, jogoAtivo, tempoRestante, pontuacaoJogador, pontuacaoAdversario, opponent]);

    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleInviteFriend = (friendId) => {
        if (!socket || !isConnected) {
            alert('Não conectado ao servidor');
            return;
        }

        socket.emit('game:invite', { toId: friendId });
        setInvitePending({ toId: friendId });
    };

    const handleAcceptInvite = () => {
        if (!socket || !receivedInvite) return;
        
        socket.emit('game:acceptInvite', { inviteId: receivedInvite.id });
    };

    const handleRejectInvite = () => {
        if (!socket || !receivedInvite) return;
        
        socket.emit('game:rejectInvite', { inviteId: receivedInvite.id });
        setReceivedInvite(null);
    };

    const handleFicarPronto = () => {
        if (!socket || !roomId) return;
        
        setJogadorPronto(true);
        socket.emit('game:ready', { roomId });
    };

    const verificarTentativa = (e) => {
        e.preventDefault();
        if (!socket || !jogoAtivo || !palavraAtual) return;
        
        const tentativa = entrada.toUpperCase().trim();
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

        socket.emit('game:guess', {
            roomId,
            guess: tentativa
        });

        if (resultado.every((r) => r.cor === "green")) {
            setEntrada("");
        } else {
            setEntrada("");
        }
    };

    const handleVoltar = () => {
        if (socket && roomId) {
            socket.emit('game:leave', { roomId });
        }
        
        if (telaAtual === "selecionarAmigo") {
            navigate("/home");
        } else if (telaAtual === "lobby") {
            setTelaAtual("selecionarAmigo");
            setAmigoSelecionado(null);
            setOpponent(null);
            setRoomId(null);
            setJogadorPronto(false);
            setAdversarioPronto(false);
        }
    };

    const handleFimDoJogo = () => {
        if (socket && roomId) {
            socket.emit('game:leave', { roomId });
        }
        
        setTelaAtual("selecionarAmigo");
        setAmigoSelecionado(null);
        setOpponent(null);
        setRoomId(null);
        setJogadorPronto(false);
        setAdversarioPronto(false);
        setJogoAtivo(false);
        setTempoRestante(TEMPO_TOTAL);
        setPontuacaoJogador(0);
        setPontuacaoAdversario(0);
        setPalavraAtual("");
        setLetrasResultado([]);
        setEntrada("");
        setInvitePending(null);
        setReceivedInvite(null);
        
        if (gameTimerRef.current) {
            clearInterval(gameTimerRef.current);
        }
    };

    if (!isConnected) {
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
            }}>
                <LoadingSpinner size="lg" text="Conectando ao servidor..." />
                {socketError && (
                    <p style={{ color: "#ef4444", marginTop: 16 }}>
                        {socketError}
                    </p>
                )}
            </div>
        );
    }

    if (receivedInvite) {
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
            }}>
                <div style={{
                    padding: 36,
                    borderRadius: 14,
                    background: "#fff",
                    boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
                    width: "min(600px, 92vw)",
                    textAlign: "center",
                }}>
                    <h2 style={{ marginTop: 0, marginBottom: 24 }}>Convite Recebido</h2>
                    <p style={{ color: "#666", marginBottom: 24 }}>
                        {receivedInvite.fromNickname} está te desafiando para uma partida!
                    </p>
                    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                        <button
                            onClick={handleAcceptInvite}
                            style={{
                                backgroundColor: "#10b981",
                                color: "#fff",
                                border: "none",
                                padding: "16px 32px",
                                borderRadius: 12,
                                cursor: "pointer",
                                fontSize: 16,
                                fontWeight: 600,
                            }}
                        >
                            ✓ Aceitar
                        </button>
                        <button
                            onClick={handleRejectInvite}
                            style={{
                                backgroundColor: "#ef4444",
                                color: "#fff",
                                border: "none",
                                padding: "16px 32px",
                                borderRadius: 12,
                                cursor: "pointer",
                                fontSize: 16,
                                fontWeight: 600,
                            }}
                        >
                            ✕ Recusar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                        zIndex: 10,
                    }}
                >
                    ← Voltar para Home
                </button>

                <div style={{
                    padding: 36,
                    borderRadius: 14,
                    background: "#fff",
                    boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
                    width: "min(600px, 92vw)",
                    textAlign: "center",
                }}>
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
                        Selecione um amigo online para desafiar em uma partida de 3 minutos!
                    </p>

                    {loadingFriends ? (
                        <LoadingSpinner size="sm" text="Carregando amigos online..." />
                    ) : onlineFriends.length === 0 ? (
                        <div style={{ padding: 24 }}>
                            <p style={{ color: "#666" }}>Nenhum amigo online no momento.</p>
                            <button
                                onClick={() => {
                                    if (socket) {
                                        socket.emit('friends:getOnline');
                                    }
                                }}
                                style={{
                                    backgroundColor: "#3b82f6",
                                    color: "#fff",
                                    border: "none",
                                    padding: "12px 24px",
                                    borderRadius: 12,
                                    cursor: "pointer",
                                    fontSize: 14,
                                    marginTop: 16,
                                }}
                            >
                                Atualizar Lista
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {onlineFriends.map((amigo) => (
                                <div
                                    key={amigo.id}
                                    onClick={() => !invitePending && handleInviteFriend(amigo.id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "16px 20px",
                                        backgroundColor: invitePending?.toId === amigo.id ? "#fef3c7" : "#f8fafc",
                                        borderRadius: 12,
                                        border: `2px solid ${invitePending?.toId === amigo.id ? "#f59e0b" : "#e2e8f0"}`,
                                        cursor: invitePending?.toId === amigo.id ? "not-allowed" : "pointer",
                                        opacity: invitePending?.toId === amigo.id ? 0.7 : 1,
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
                                        {amigo.avatar ? (
                                            <img src={amigo.avatar} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                                        ) : (
                                            getInitials(amigo.nickname)
                                        )}
                                    </div>
                                    <div style={{ flex: 1, textAlign: "left" }}>
                                        <h4 style={{ margin: 0, color: "#1e293b" }}>{amigo.nickname}</h4>
                                        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
                                            <span style={{ color: "#10b981", fontWeight: "600" }}>● Online</span>
                                        </p>
                                    </div>
                                    {invitePending?.toId === amigo.id ? (
                                        <div style={{
                                            padding: "8px 16px",
                                            borderRadius: 20,
                                            backgroundColor: "#f59e0b",
                                            color: "#fff",
                                            fontSize: 14,
                                            fontWeight: "600",
                                        }}>
                                            Convite enviado...
                                        </div>
                                    ) : (
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
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

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
                        zIndex: 10,
                    }}
                >
                    ← Voltar
                </button>

                <div style={{
                    padding: 36,
                    borderRadius: 14,
                    background: "#fff",
                    boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
                    width: "min(600px, 92vw)",
                    textAlign: "center",
                }}>
                    <h2 style={{ marginTop: 0, marginBottom: 24 }}>Lobby do Desafio</h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
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
                                {currentUser?.avatar ? (
                                    <img src={currentUser.avatar} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                                ) : (
                                    getInitials(currentUser?.name || "Você")
                                )}
                            </div>
                            <div style={{ flex: 1, textAlign: "left" }}>
                                <h4 style={{ margin: 0, color: "#1e293b" }}>{currentUser?.name || "Você"}</h4>
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
                                {opponent?.avatar ? (
                                    <img src={opponent.avatar} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                                ) : (
                                    getInitials(opponent?.nickname || "Adversário")
                                )}
                            </div>
                            <div style={{ flex: 1, textAlign: "left" }}>
                                <h4 style={{ margin: 0, color: "#1e293b" }}>{opponent?.nickname || "Adversário"}</h4>
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
                            }}
                        >
                            ✓ Estou Pronto!
                        </button>
                    )}

                    {jogadorPronto && !adversarioPronto && (
                        <p style={{ color: "#f59e0b", fontWeight: "600" }}>
                            Aguardando {opponent?.nickname || 'adversário'} ficar pronto...
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
            <div style={{ display: "flex", justifyContent: "space-between", width: "min(500px, 95%)", marginBottom: 20 }}>
                <div style={{ backgroundColor: "#10b981", color: "#fff", padding: "10px 20px", borderRadius: 8 }}>
                    Você ⚡ {pontuacaoJogador}
                </div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#1e293b" }}>
                    ⏳ {Math.floor(tempoRestante / 60)}:{String(tempoRestante % 60).padStart(2, "0")}
                </div>
                <div style={{ backgroundColor: "#ef4444", color: "#fff", padding: "10px 20px", borderRadius: 8 }}>
                    {opponent?.nickname || 'Adversário'} ⚡ {pontuacaoAdversario}
                </div>
            </div>

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
                        onChange={(e) => setEntrada(e.target.value.toUpperCase())}
                        maxLength={palavraAtual.length}
                        placeholder={`Digite uma palavra de ${palavraAtual.length} letras`}
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
                        disabled={!jogoAtivo || entrada.length !== palavraAtual.length}
                        style={{
                            backgroundColor: jogoAtivo && entrada.length === palavraAtual.length ? "#3b82f6" : "#d1d5db",
                            color: "#fff",
                            border: "none",
                            padding: "12px 24px",
                            borderRadius: 8,
                            cursor: jogoAtivo && entrada.length === palavraAtual.length ? "pointer" : "not-allowed",
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
