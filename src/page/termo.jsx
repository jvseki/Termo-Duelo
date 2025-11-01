import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomKeyword, finishGame } from "../services/gameService";
import LoadingSpinner from "../components/LoadingSpinner";

const MAX_TENTATIVAS = 5;

export default function Termo() {
  const [tentativas, setTentativas] = useState([]);
  const [entrada, setEntrada] = useState("");
  const [ganhou, setGanhou] = useState(false);
  const [palavra, setPalavra] = useState("");
  const [keywordId, setKeywordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  
  const navigate = useNavigate();
  const gameOver = ganhou || tentativas.length >= MAX_TENTATIVAS;

  useEffect(() => {
    loadKeyword();
  }, []);

  const loadKeyword = async () => {
    setLoading(true);
    try {
      const result = await getRandomKeyword();
      if (result.success && result.keyword) {
        setPalavra(result.keyword);
        setKeywordId(result.keywordId);
      } else {
        console.error('Erro ao carregar palavra:', result.message);
        navigate("/home");
      }
    } catch (error) {
      console.error('Erro ao carregar palavra:', error);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishGame = async (isWin, finalTries = null) => {
    if (finishing) return;
    
    setFinishing(true);
    try {
      const tries = finalTries !== null ? finalTries : tentativas.length;
      const result = await finishGame({
        keyword: palavra,
        keywordId,
        tries,
        maxTries: MAX_TENTATIVAS,
        isWin
      });

      if (result.success) {
        setGameResult({
          isWin,
          palavra,
          tries,
          points: result.game?.points || 0,
          xp: result.game?.xp || 0,
          game: result.game
        });
      } else {
        setGameResult({
          isWin: false,
          palavra,
          tries: finalTries || tentativas.length,
          points: 0,
          xp: 0,
          error: result.message || 'Erro ao salvar resultado do jogo.'
        });
      }
    } catch (error) {
      console.error('Erro ao finalizar jogo:', error);
      setGameResult({
        isWin: false,
        palavra,
        tries: finalTries || tentativas.length,
        points: 0,
        xp: 0,
        error: 'Erro ao salvar resultado do jogo.'
      });
    } finally {
      setFinishing(false);
    }
  };

  const verificarTentativa = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (gameOver || !palavra) return;
    if (entrada.length !== palavra.length) return;

    const tentativa = entrada.toUpperCase();
    const counts = {};
    for (let ch of palavra) counts[ch] = (counts[ch] || 0) + 1;

    const resultado = Array(palavra.length).fill(null);

    for (let i = 0; i < palavra.length; i++) {
      if (tentativa[i] === palavra[i]) {
        resultado[i] = { letra: tentativa[i], cor: "green" };
        counts[tentativa[i]]--;
      }
    }

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
      handleFinishGame(true, novas.length);
      return;
    }

    if (novas.length >= MAX_TENTATIVAS) {
      handleFinishGame(false, novas.length);
      return;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f1f5f9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          padding: 20,
        }}
      >
        <LoadingSpinner size="lg" text="Carregando palavra..." />
      </div>
    );
  }

  if (!palavra) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f1f5f9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          padding: 20,
        }}
      >
        <p>Erro ao carregar palavra. Tente novamente.</p>
        <button
          onClick={() => navigate("/home")}
          style={{
            backgroundColor: "#3b82f6",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  // Página de resultado do jogo
  if (gameResult) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: gameResult.isWin ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          padding: 20,
          color: "#fff",
        }}
      >
        <div
          style={{
            padding: 48,
            borderRadius: 20,
            background: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            width: "min(600px, 92vw)",
            textAlign: "center",
            color: "#1e293b",
          }}
        >
          {/* Ícone de vitória/derrota */}
          <div style={{ fontSize: 80, marginBottom: 24 }}>
            {gameResult.isWin ? "🎉" : "😔"}
          </div>

          {/* Título */}
          <h1 style={{ 
            fontSize: 36, 
            fontWeight: "bold", 
            margin: "0 0 16px 0",
            color: gameResult.isWin ? "#10b981" : "#ef4444"
          }}>
            {gameResult.isWin ? "Parabéns!" : "Tentativas Esgotadas"}
          </h1>

          {/* Mensagem */}
          <p style={{ fontSize: 18, color: "#64748b", marginBottom: 32 }}>
            {gameResult.isWin 
              ? `Você acertou a palavra em ${gameResult.tries} tentativa${gameResult.tries > 1 ? 's' : ''}!`
              : `A palavra era: ${gameResult.palavra}`
            }
          </p>

          {/* Estatísticas */}
          <div style={{
            display: "flex",
            justifyContent: "space-around",
            gap: 16,
            marginBottom: 32,
            flexWrap: "wrap"
          }}>
            <div style={{
              backgroundColor: "#f1f5f9",
              padding: 20,
              borderRadius: 12,
              flex: 1,
              minWidth: 120
            }}>
              <div style={{ fontSize: 32, fontWeight: "bold", color: "#3b82f6", marginBottom: 8 }}>
                {gameResult.points}
              </div>
              <div style={{ fontSize: 14, color: "#64748b" }}>Pontos</div>
            </div>
            <div style={{
              backgroundColor: "#f1f5f9",
              padding: 20,
              borderRadius: 12,
              flex: 1,
              minWidth: 120
            }}>
              <div style={{ fontSize: 32, fontWeight: "bold", color: "#10b981", marginBottom: 8 }}>
                {gameResult.xp}
              </div>
              <div style={{ fontSize: 14, color: "#64748b" }}>XP Ganho</div>
            </div>
            <div style={{
              backgroundColor: "#f1f5f9",
              padding: 20,
              borderRadius: 12,
              flex: 1,
              minWidth: 120
            }}>
              <div style={{ fontSize: 32, fontWeight: "bold", color: "#f59e0b", marginBottom: 8 }}>
                {gameResult.tries}/{MAX_TENTATIVAS}
              </div>
              <div style={{ fontSize: 14, color: "#64748b" }}>Tentativas</div>
            </div>
          </div>

          {gameResult.error && (
            <div style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              padding: 12,
              borderRadius: 8,
              marginBottom: 24,
              fontSize: 14
            }}>
              {gameResult.error}
            </div>
          )}

          {/* Botões de ação */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => {
                setGameResult(null);
                setTentativas([]);
                setEntrada("");
                setGanhou(false);
                loadKeyword();
              }}
              style={{
                backgroundColor: "#3b82f6",
                color: "#fff",
                border: "none",
                padding: "14px 28px",
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#3b82f6";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              🔄 Jogar Novamente
            </button>
            <button
              onClick={() => navigate("/home")}
              style={{
                backgroundColor: "#64748b",
                color: "#fff",
                border: "none",
                padding: "14px 28px",
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#475569";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#64748b";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              🏠 Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // centraliza vertical
        alignItems: "center", // centraliza horizontal
        gap: 24,
        padding: 20,
        position: "relative",
      }}
    >
      {/* Botão Voltar para Home */}
      <button
        onClick={() => {
          if (!finishing) {
            navigate("/home");
          }
        }}
        disabled={finishing}
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          backgroundColor: finishing ? "#9ca3af" : "#3b82f6",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 12,
          border: "none",
          cursor: finishing ? "not-allowed" : "pointer",
          fontSize: 16,
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: 8,
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          if (!finishing) {
            e.currentTarget.style.backgroundColor = "#2563eb";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
          }
        }}
        onMouseLeave={(e) => {
          if (!finishing) {
            e.currentTarget.style.backgroundColor = "#3b82f6";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
          }
        }}
      >
        ← Voltar para Home
      </button>
      {/* Painel principal branco */}
      <div
        style={{
          padding: 36,
          borderRadius: 14,
          background: "#fff",
          boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
          width: "min(560px, 92vw)",
          textAlign: "center",
        }}
      >
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

        <h2 style={{ marginTop: 0 }}>Termo</h2>
        <p>
          Você tem <strong>{MAX_TENTATIVAS}</strong> tentativas para adivinhar a palavra de{" "}
          <strong>{palavra.length}</strong> letras.
        </p>

        {/* Tentativas exibidas */}
        <div style={{ marginTop: 20 }}>
          {tentativas.map((linha, idx) => (
            <div key={idx} style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 6 }}>
              {linha.map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      c.cor === "green"
                        ? "#10b981"
                        : c.cor === "yellow"
                        ? "#f59e0b"
                        : "#9ca3af",
                    color: "#fff",
                    borderRadius: 6,
                    fontWeight: "bold",
                    fontSize: 20,
                  }}
                >
                  {c.letra}
                </div>
              ))}
            </div>
          ))}
        </div>

        <p style={{ marginTop: 12, color: "#666" }}>
          Tentativas: {tentativas.length} / {MAX_TENTATIVAS}
        </p>
      </div>

      {/* Campo de input centralizado embaixo do painel */}
      <form
        onSubmit={verificarTentativa}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "center",
          width: "min(560px, 92vw)",
        }}
      >
        <input
          value={entrada}
          onChange={(e) => {
            if (!gameOver) setEntrada(e.target.value);
          }}
          maxLength={palavra.length}
          placeholder={`Digite uma palavra de ${palavra.length} letras`}
          style={{
            textTransform: "uppercase",
            padding: 14,
            width: "100%",
            textAlign: "center",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 18,
            outline: "none",
          }}
          disabled={gameOver}
        />
        <button
          type="submit"
          disabled={gameOver || finishing}
          style={{
            backgroundColor: finishing ? "#9ca3af" : "#3b82f6",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: 8,
            cursor: (gameOver || finishing) ? "not-allowed" : "pointer",
            boxShadow: "0 8px 24px rgba(59,130,246,0.18)",
            fontSize: 16,
            fontWeight: 600,
            transition: "background-color 150ms ease, transform 120ms ease",
            width: "40%",
            maxWidth: 220,
          }}
          onMouseEnter={(e) => {
            if (!gameOver && !finishing) {
              e.currentTarget.style.backgroundColor = "#2563eb";
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!gameOver && !finishing) {
              e.currentTarget.style.backgroundColor = "#3b82f6";
              e.currentTarget.style.transform = "none";
            }
          }}
        >
          {finishing ? "Salvando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
