"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function GaleriaAdminPage() {
  const supabase = createClient();
  const [fotos, setFotos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [arquivo, setArquivo] = useState(null);
  const [legenda, setLegenda] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState(null);

  async function carregar() {
    setCarregando(true);
    const { data, error } = await supabase.from("fotos").select("*").order("ordem", { ascending: true });
    if (!error) setFotos(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function excluir(foto) {
    if (!confirm("Apagar esta foto da galeria? Essa ação não pode ser desfeita.")) return;

    // apaga o registro do banco
    const { error } = await supabase.from("fotos").delete().eq("id", foto.id);
    if (error) {
      setMsg({ tipo: "error", texto: "Não foi possível apagar. Tente novamente." });
      return;
    }

    // tenta apagar o arquivo do armazenamento também (se veio do bucket "galeria")
    const marker = "/storage/v1/object/public/galeria/";
    const idx = foto.url.indexOf(marker);
    if (idx !== -1) {
      const path = foto.url.slice(idx + marker.length);
      await supabase.storage.from("galeria").remove([path]);
    }

    setMsg({ tipo: "success", texto: "Foto removida da galeria." });
    carregar();
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!arquivo) {
      setMsg({ tipo: "error", texto: "Escolha um arquivo de imagem primeiro." });
      return;
    }
    setEnviando(true);
    setMsg(null);

    const extensao = arquivo.name.split(".").pop();
    const nomeArquivo = `${crypto.randomUUID()}.${extensao}`;

    const { error: uploadError } = await supabase.storage.from("galeria").upload(nomeArquivo, arquivo);

    if (uploadError) {
      setEnviando(false);
      setMsg({ tipo: "error", texto: "Erro no upload: " + uploadError.message });
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("galeria").getPublicUrl(nomeArquivo);

    const { error: insertError } = await supabase.from("fotos").insert({
      url: publicUrlData.publicUrl,
      legenda,
      ordem: fotos.length,
    });

    setEnviando(false);

    if (insertError) {
      setMsg({ tipo: "error", texto: "Erro ao salvar: " + insertError.message });
      return;
    }

    setMsg({ tipo: "success", texto: "Foto adicionada à galeria." });
    setArquivo(null);
    setLegenda("");
    e.target.reset();
    carregar();
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Galeria de fotos</h1>
          <p>Fotos da escola e dos projetos, exibidas no acervo da página inicial.</p>
        </div>
      </div>

      {msg && <div className={`alert-box alert-${msg.tipo}`}>{msg.texto}</div>}

      <div className="admin-card">
        <h2>Adicionar nova foto</h2>
        <form onSubmit={handleUpload}>
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="arquivo">Arquivo de imagem</label>
              <input
                id="arquivo" type="file" accept="image/*" required
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
              />
            </div>
            <div className="field full">
              <label htmlFor="legenda">Legenda</label>
              <input
                id="legenda" type="text"
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
                placeholder="Ex: Feira de Ciências 2026"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-solid" disabled={enviando} style={{ marginTop: "18px" }}>
            {enviando ? "Enviando..." : "Enviar foto"}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h2>Fotos publicadas ({fotos.length})</h2>
        {carregando ? (
          <p className="empty-state">Carregando...</p>
        ) : fotos.length === 0 ? (
          <p className="empty-state">Nenhuma foto publicada ainda.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th></th><th>Legenda</th><th></th></tr>
            </thead>
            <tbody>
              {fotos.map((f) => (
                <tr key={f.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt={f.legenda || ""} className="thumb-preview" />
                  </td>
                  <td>{f.legenda || <span style={{ color: "var(--ink-soft)" }}>Sem legenda</span>}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-danger" onClick={() => excluir(f)}>Apagar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
