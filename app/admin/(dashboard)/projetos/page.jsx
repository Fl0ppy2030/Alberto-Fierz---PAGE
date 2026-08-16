"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

const STATUS_LABEL = {
  em_andamento: "Em andamento",
  concluido: "Concluído",
  feira_de_ciencias: "Feira de Ciências",
};
const VAZIO = { titulo: "", descricao: "", categoria: "Informática", turma: "", status: "em_andamento" };

export default function ProjetosAdminPage() {
  const supabase = createClient();
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState(null);

  async function carregar() {
    setCarregando(true);
    const { data, error } = await supabase.from("projetos").select("*").order("criado_em", { ascending: false });
    if (!error) setProjetos(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function editar(p) {
    setEditandoId(p.id);
    setForm({
      titulo: p.titulo,
      descricao: p.descricao || "",
      categoria: p.categoria,
      turma: p.turma || "",
      status: p.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(VAZIO);
  }

  async function excluir(id) {
    if (!confirm("Apagar este projeto? Essa ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("projetos").delete().eq("id", id);
    if (error) {
      setMsg({ tipo: "error", texto: "Não foi possível apagar. Tente novamente." });
      return;
    }
    setMsg({ tipo: "success", texto: "Projeto removido." });
    carregar();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    setMsg(null);

    const { error } = editandoId
      ? await supabase.from("projetos").update(form).eq("id", editandoId)
      : await supabase.from("projetos").insert(form);

    setSalvando(false);

    if (error) {
      setMsg({ tipo: "error", texto: "Erro ao salvar: " + error.message });
      return;
    }

    setMsg({ tipo: "success", texto: editandoId ? "Projeto atualizado." : "Projeto publicado." });
    cancelarEdicao();
    carregar();
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Projetos</h1>
          <p>Projetos e pesquisas dos alunos exibidos na página inicial.</p>
        </div>
      </div>

      {msg && <div className={`alert-box alert-${msg.tipo}`}>{msg.texto}</div>}

      <div className="admin-card">
        <h2>{editandoId ? "Editar projeto" : "Novo projeto"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="titulo">Título</label>
              <input
                id="titulo" type="text" required
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: App de caronas para a escola"
              />
            </div>
            <div className="field full">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Resumo do projeto em 1-2 frases"
              />
            </div>
            <div className="field">
              <label htmlFor="categoria">Curso / categoria</label>
              <select id="categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                <option>Informática</option>
                <option>Eletrônica</option>
                <option>Administração</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="turma">Turma</label>
              <input
                id="turma" type="text"
                value={form.turma}
                onChange={(e) => setForm({ ...form, turma: e.target.value })}
                placeholder="Ex: 3º INFO"
              />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="em_andamento">Em andamento</option>
                <option value="concluido">Concluído</option>
                <option value="feira_de_ciencias">Feira de Ciências</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button type="submit" className="btn btn-solid" disabled={salvando}>
              {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Publicar projeto"}
            </button>
            {editandoId && <button type="button" className="btn" onClick={cancelarEdicao}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h2>Projetos publicados ({projetos.length})</h2>
        {carregando ? (
          <p className="empty-state">Carregando...</p>
        ) : projetos.length === 0 ? (
          <p className="empty-state">Nenhum projeto cadastrado ainda.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Título</th><th>Curso</th><th>Turma</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {projetos.map((p) => (
                <tr key={p.id}>
                  <td>{p.titulo}</td>
                  <td>{p.categoria}</td>
                  <td>{p.turma}</td>
                  <td>{STATUS_LABEL[p.status] || p.status}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm" onClick={() => editar(p)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => excluir(p.id)}>Apagar</button>
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
