"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

const VAZIO = { edicao: "", titulo: "", resumo: "", link: "", data: "", destaque: false };

export default function JornalAdminPage() {
  const supabase = createClient();
  const [edicoes, setEdicoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState(null);

  async function carregar() {
    setCarregando(true);
    const { data, error } = await supabase.from("jornal").select("*").order("edicao", { ascending: false });
    if (!error) setEdicoes(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function editar(j) {
    setEditandoId(j.id);
    setForm({
      edicao: j.edicao,
      titulo: j.titulo,
      resumo: j.resumo || "",
      link: j.link || "",
      data: j.data,
      destaque: j.destaque,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(VAZIO);
  }

  async function excluir(id) {
    if (!confirm("Apagar esta edição do jornal? Essa ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("jornal").delete().eq("id", id);
    if (error) {
      setMsg({ tipo: "error", texto: "Não foi possível apagar. Tente novamente." });
      return;
    }
    setMsg({ tipo: "success", texto: "Edição removida." });
    carregar();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    setMsg(null);

    const payload = { ...form, edicao: Number(form.edicao) };

    // Se esta edição for marcada como destaque, tira o destaque das outras
    if (payload.destaque) {
      await supabase.from("jornal").update({ destaque: false }).neq("id", editandoId || "00000000-0000-0000-0000-000000000000");
    }

    const { error } = editandoId
      ? await supabase.from("jornal").update(payload).eq("id", editandoId)
      : await supabase.from("jornal").insert(payload);

    setSalvando(false);

    if (error) {
      setMsg({ tipo: "error", texto: "Erro ao salvar: " + error.message });
      return;
    }

    setMsg({ tipo: "success", texto: editandoId ? "Edição atualizada." : "Edição publicada." });
    cancelarEdicao();
    carregar();
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Jornal semanal</h1>
          <p>A edição marcada como "destaque" aparece em tamanho grande na página inicial.</p>
        </div>
      </div>

      {msg && <div className={`alert-box alert-${msg.tipo}`}>{msg.texto}</div>}

      <div className="admin-card">
        <h2>{editandoId ? "Editar edição" : "Nova edição"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="edicao">Número da edição</label>
              <input
                id="edicao" type="number" required
                value={form.edicao}
                onChange={(e) => setForm({ ...form, edicao: e.target.value })}
                placeholder="Ex: 25"
              />
            </div>
            <div className="field">
              <label htmlFor="data">Data de publicação</label>
              <input
                id="data" type="date" required
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              />
            </div>
            <div className="field full">
              <label htmlFor="titulo">Título da matéria</label>
              <input
                id="titulo" type="text" required
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Turmas do 3º ano visitam parque tecnológico"
              />
            </div>
            <div className="field full">
              <label htmlFor="resumo">Resumo</label>
              <textarea
                id="resumo"
                value={form.resumo}
                onChange={(e) => setForm({ ...form, resumo: e.target.value })}
                placeholder="Um parágrafo curto sobre a matéria"
              />
            </div>
            <div className="field full">
              <label htmlFor="link">Link para a edição completa (opcional)</label>
              <input
                id="link" type="text"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://... (Google Docs, PDF, etc.)"
              />
            </div>
            <div className="field full checkbox-row">
              <input
                id="destaque" type="checkbox"
                checked={form.destaque}
                onChange={(e) => setForm({ ...form, destaque: e.target.checked })}
              />
              <label htmlFor="destaque" style={{ margin: 0 }}>Marcar como edição em destaque (última publicada)</label>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button type="submit" className="btn btn-solid" disabled={salvando}>
              {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Publicar edição"}
            </button>
            {editandoId && <button type="button" className="btn" onClick={cancelarEdicao}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h2>Edições publicadas ({edicoes.length})</h2>
        {carregando ? (
          <p className="empty-state">Carregando...</p>
        ) : edicoes.length === 0 ? (
          <p className="empty-state">Nenhuma edição publicada ainda.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Edição</th><th>Título</th><th>Data</th><th>Destaque</th><th></th></tr>
            </thead>
            <tbody>
              {edicoes.map((j) => (
                <tr key={j.id}>
                  <td>#{j.edicao}</td>
                  <td>{j.titulo}</td>
                  <td>{j.data}</td>
                  <td>{j.destaque ? "★ Sim" : "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm" onClick={() => editar(j)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => excluir(j.id)}>Apagar</button>
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
