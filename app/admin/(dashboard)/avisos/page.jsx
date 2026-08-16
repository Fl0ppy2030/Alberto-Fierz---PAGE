"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

const TAG_LABEL = { prova: "Prova", evento: "Evento", prazo: "Prazo" };
const VAZIO = { titulo: "", descricao: "", tag: "evento", data: "" };

export default function AvisosAdminPage() {
  const supabase = createClient();
  const [avisos, setAvisos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState(null); // { tipo: 'error'|'success', texto }

  async function carregar() {
    setCarregando(true);
    const { data, error } = await supabase.from("avisos").select("*").order("data", { ascending: true });
    if (!error) setAvisos(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function editar(aviso) {
    setEditandoId(aviso.id);
    setForm({
      titulo: aviso.titulo,
      descricao: aviso.descricao || "",
      tag: aviso.tag,
      data: aviso.data,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(VAZIO);
  }

  async function excluir(id) {
    if (!confirm("Apagar este aviso do mural? Essa ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("avisos").delete().eq("id", id);
    if (error) {
      setMsg({ tipo: "error", texto: "Não foi possível apagar. Tente novamente." });
      return;
    }
    setMsg({ tipo: "success", texto: "Aviso removido do mural." });
    carregar();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    setMsg(null);

    const payload = {
      titulo: form.titulo,
      descricao: form.descricao,
      tag: form.tag,
      data: form.data,
    };

    const { error } = editandoId
      ? await supabase.from("avisos").update(payload).eq("id", editandoId)
      : await supabase.from("avisos").insert(payload);

    setSalvando(false);

    if (error) {
      setMsg({ tipo: "error", texto: "Erro ao salvar: " + error.message });
      return;
    }

    setMsg({ tipo: "success", texto: editandoId ? "Aviso atualizado." : "Aviso publicado no mural." });
    cancelarEdicao();
    carregar();
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Avisos</h1>
          <p>Provas, eventos e prazos que aparecem no mural da página inicial.</p>
        </div>
      </div>

      {msg && <div className={`alert-box alert-${msg.tipo}`}>{msg.texto}</div>}

      <div className="admin-card">
        <h2>{editandoId ? "Editar aviso" : "Novo aviso"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="titulo">Título</label>
              <input
                id="titulo"
                type="text"
                required
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Prova de Matemática — 2º ano"
              />
            </div>
            <div className="field full">
              <label htmlFor="descricao">Descrição (opcional)</label>
              <textarea
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Detalhes do aviso, local, horário..."
              />
            </div>
            <div className="field">
              <label htmlFor="tag">Tipo</label>
              <select id="tag" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
                <option value="prova">Prova</option>
                <option value="evento">Evento</option>
                <option value="prazo">Prazo</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="data">Data</label>
              <input
                id="data"
                type="date"
                required
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button type="submit" className="btn btn-solid" disabled={salvando}>
              {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Publicar aviso"}
            </button>
            {editandoId && (
              <button type="button" className="btn" onClick={cancelarEdicao}>Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h2>Avisos publicados ({avisos.length})</h2>
        {carregando ? (
          <p className="empty-state">Carregando...</p>
        ) : avisos.length === 0 ? (
          <p className="empty-state">Nenhum aviso publicado ainda.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {avisos.map((a) => (
                <tr key={a.id}>
                  <td>{a.titulo}</td>
                  <td>{TAG_LABEL[a.tag] || a.tag}</td>
                  <td>{a.data}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm" onClick={() => editar(a)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => excluir(a.id)}>Apagar</button>
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
