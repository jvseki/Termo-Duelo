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
        alert(result.message || 'Erro ao carregar palavra. Tente novamente.');
        navigate("/home");
      }
    } catch (error) {
      console.error('Erro ao carregar palavra:', error);
      alert('Erro ao carregar palavra. Tente novamente.');
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
        if (isWin) {
          alert(`Parabéns! Você acertou a palavra.\nPontuação: ${result.game?.points || 0}\nXP ganho: ${result.game?.xp || 0}`);
        } else {
          alert(`Tentativas esgotadas. A palavra era: ${palavra}.\nXP ganho: ${result.game?.xp || 0}`);
        }
        setTimeout(() => {
          navigate("/home");
        }, 2000);
      } else {
        alert(result.message || 'Erro ao salvar resultado do jogo.');
        setTimeout(() => {
          navigate("/home");
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao finalizar jogo:', error);
      alert('Erro ao salvar resultado do jogo.');
      setTimeout(() => {
        navigate("/home");
      }, 2000);
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
