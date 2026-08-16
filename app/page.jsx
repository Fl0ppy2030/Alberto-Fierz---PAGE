import { createClient } from "@/lib/supabaseServer";

const TAG_LABEL = { prova: "Prova", evento: "Evento", prazo: "Prazo" };
const STATUS_LABEL = {
  em_andamento: "Em andamento",
  concluido: "Concluído",
  feira_de_ciencias: "Feira de Ciências",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function weekday(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const dias = ["Domingo", "2ª feira", "3ª feira", "4ª feira", "5ª feira", "6ª feira", "Sábado"];
  return dias[d.getDay()];
}

export const revalidate = 30; // revalida a página a cada 30s para refletir novas edições do admin

export default async function HomePage() {
  const supabase = createClient();

  const [avisosRes, projetosRes, jornalRes, fotosRes] = await Promise.all([
    supabase.from("avisos").select("*").order("data", { ascending: true }).limit(8),
    supabase.from("projetos").select("*").order("criado_em", { ascending: false }).limit(6),
    supabase.from("jornal").select("*").order("edicao", { ascending: false }).limit(6),
    supabase.from("fotos").select("*").order("ordem", { ascending: true }).limit(9),
  ]);

  const avisos = avisosRes.data || [];
  const projetos = projetosRes.data || [];
  const jornal = jornalRes.data || [];
  const fotos = fotosRes.data || [];

  const destaque = jornal.find((j) => j.destaque) || jornal[0];
  const outrasEdicoes = jornal.filter((j) => j.id !== destaque?.id);

  return (
    <>
      <header className="site-header">
        <div className="nav-inner">
          <a href="#topo" className="logo">
            <svg className="logo-mark" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 3L36 34H4L20 3Z" stroke="#F2C14E" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="20" cy="24" r="2.4" fill="#3E8E7E" />
            </svg>
            ALBERTO FIERZ
          </a>
          <ul className="navlinks">
            <li><a href="#avisos">Avisos</a></li>
            <li><a href="#sobre">A escola</a></li>
            <li><a href="#projetos">Projetos</a></li>
            <li><a href="#jornal">Jornal</a></li>
            <li><a href="#galeria">Galeria</a></li>
            <li><a href="#localizacao">Localização</a></li>
          </ul>
        </div>
      </header>

      <main id="topo">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">ALBERTO FIERZ · ANO LETIVO 2026</span>
              <h1>Ensino médio<br />e técnico, <span>construído</span><br />junto com você.</h1>
              <p className="hero-sub">
                Site mantido por alunos e pela equipe pedagógica: avisos, cursos técnicos, projetos
                e o registro de tudo o que acontece na escola, semana a semana.
              </p>
              <div className="hero-actions">
                <a href="#avisos" className="btn btn-solid">Ver avisos da semana</a>
                <a href="#sobre" className="btn">Conhecer os cursos</a>
              </div>
            </div>
            <div className="hero-badges">
              <div className="hero-badge">
                <div className="num">03</div>
                <div className="label">Cursos técnicos integrados</div>
              </div>
              <div className="hero-badge">
                <div className="num">{projetos.length}</div>
                <div className="label">Projetos de alunos cadastrados</div>
              </div>
            </div>
          </div>
        </section>

        {/* AVISOS */}
        <section className="avisos section-pad" id="avisos">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Mural</span>
              <h2>Avisos da escola</h2>
              <p>Provas, prazos e eventos — atualizado pela coordenação.</p>
            </div>
            {avisos.length === 0 ? (
              <p className="empty-state">Nenhum aviso publicado no momento.</p>
            ) : (
              <div className="board">
                {avisos.map((a) => (
                  <div className="pin-card" key={a.id}>
                    <span className={`tag tag-${a.tag}`}>{TAG_LABEL[a.tag] || a.tag}</span>
                    <h3>{a.titulo}</h3>
                    {a.descricao && <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>{a.descricao}</p>}
                    <div className="meta">
                      <span>{formatDate(a.data)}</span>
                      <span>{weekday(a.data)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SOBRE */}
        <section className="section-pad" id="sobre">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">A escola</span>
              <h2>Quem somos</h2>
            </div>
            <div className="sobre-grid">
              <div className="sobre-text">
                <p>
                  A ALBERTO FIERZ é uma escola estadual de Ensino Médio Técnico Integrado, onde os alunos
                  concluem o ensino médio já formados em uma área técnica — sem custo extra e na mesma
                  carga horária integral.
                </p>
                <p>
                  Além das disciplinas tradicionais, a escola oferece projetos
                  de pesquisa orientados por professores e parcerias com empresas da região para estágio
                  e visitas técnicas.
                </p>
                <div className="stat-row">
                  <div className="stat"><div className="n">XXXX</div><div className="l">Fundação</div></div>
                  <div className="stat"><div className="n">XXX</div><div className="l">Alunos matriculados</div></div>
                  <div className="stat"><div className="n">02</div><div className="l">Cursos técnicos</div></div>
                </div>
              </div>

              <div className="course-list">
                <div className="course-card">
                  <div className="course-top">
                    <svg className="course-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="13" rx="1.2" /><path d="M8 21h8M12 17v4" /></svg>
                    <span className="course-code">TEC-01</span>
                  </div>
                  <h3>Técnico em Ciências de Dados</h3>
                  <p>Análise de dados, machine learning, programação e estatística.</p>
                  <div className="course-dur">3 anos · integrado ao Ensino Médio</div>
                </div>
                <div className="course-card">
                  <div className="course-top">
                    <svg className="course-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" strokeLinejoin="round" /></svg>
                    <span className="course-code">TEC-02</span>
                  </div>
                  <h3>Técnico em Administração</h3>
                  <p>Gestão financeira, empreendedorismo, marketing e rotinas administrativas de empresas.</p>
                  <div className="course-dur">3 anos · integrado ao Ensino Médio</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJETOS */}
        <section className="projetos section-pad" id="projetos">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Pesquisa & extensão</span>
              <h2 style={{ color: "var(--white)" }}>Projetos dos alunos</h2>
              <p>O que está sendo produzido nos laboratórios e grupos de pesquisa este ano.</p>
            </div>
            {projetos.length === 0 ? (
              <p className="empty-state" style={{ color: "rgba(255,255,255,0.6)" }}>Nenhum projeto cadastrado ainda.</p>
            ) : (
              <div className="proj-grid">
                {projetos.map((p) => (
                  <div className="proj-card" key={p.id}>
                    <span className="proj-tag">{p.categoria}</span>
                    <h3>{p.titulo}</h3>
                    {p.descricao && <p>{p.descricao}</p>}
                    <div className="proj-foot">
                      <span>{p.turma}</span>
                      <span>{STATUS_LABEL[p.status] || p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* JORNAL */}
        <section className="section-pad" id="jornal">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Publicação estudantil</span>
              <h2>Jornal semanal</h2>
              <p>Escrito e editado pelo grêmio estudantil.</p>
            </div>
            {!destaque ? (
              <p className="empty-state">Nenhuma edição publicada ainda.</p>
            ) : (
              <div className="jornal-grid">
                <div className="jornal-feature">
                  <span className="eyebrow">Edição nº {destaque.edicao} · {formatDate(destaque.data)}</span>
                  <h3>{destaque.titulo}</h3>
                  {destaque.resumo && <p>{destaque.resumo}</p>}
                  <a href={destaque.link || "#"} className="btn">Ler edição completa</a>
                </div>
                <ul className="jornal-list">
                  {outrasEdicoes.length === 0 && (
                    <li><span>Nenhuma edição anterior cadastrada.</span></li>
                  )}
                  {outrasEdicoes.map((j) => (
                    <li key={j.id}>
                      <a href={j.link || "#"}>Edição nº {j.edicao} — {j.titulo}</a>
                      <span className="jornal-date">{formatDate(j.data)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* GALERIA */}
        <section className="galeria section-pad" id="galeria">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Acervo</span>
              <h2>Galeria de imagens</h2>
              <p>Registros da escola, das feiras e dos projetos técnicos.</p>
            </div>
            {fotos.length === 0 ? (
              <p className="empty-state">Nenhuma foto publicada ainda.</p>
            ) : (
              <div className="gallery-grid">
                {fotos.map((f) => (
                  <div className="photo" key={f.id}>
                    <div className="photo-tape"></div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="photo-img" src={f.url} alt={f.legenda || "Foto da escola"} />
                    {f.legenda && <div className="photo-cap">{f.legenda}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* LOCALIZAÇÃO */}
        <section className="section-pad" id="localizacao">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Como chegar</span>
              <h2>Localização</h2>
            </div>
            <div className="loc-grid">
              <div className="loc-card">
                <div className="loc-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="10" r="2.4" /></svg>
                  <div><h4>Endereço</h4><p> Rua Ponciano Tonussi, 87 — Parque Dona Esther<br />Cosmópolis — SP, 13150-000</p></div>
                </div>
                <div className="loc-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
                  <div><h4>Horário de funcionamento</h4><p>Segunda a sexta, 7h às 16h<br />Secretaria: 7h às 15h</p></div>
                </div>
                <div className="loc-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2Z" /></svg>
                  <div><h4>Contato</h4><p>(19) 3872-1667<br />e917761a@educacao.sp.gov.br</p></div>
                </div>
              </div>
              <div className="map-frame">
                <iframe
                  src="https://www.google.com/maps?q=Rua+Ponciano+Tonussi,+87,+Cosmópolis&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa de localização da escola"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="foot-logo">ALBERTO FIERZ</div>
              <p style={{ fontSize: "0.88rem", maxWidth: "32ch" }}>
                Escola pública de Ensino Médio Técnico Integrado. Site mantido pela comunidade escolar.
              </p>
            </div>
            <div>
              <h5>Navegação</h5>
              <ul>
                <li><a href="#avisos">Avisos</a></li>
                <li><a href="#sobre">A escola</a></li>
                <li><a href="#projetos">Projetos</a></li>
                <li><a href="#jornal">Jornal</a></li>
                <li><a href="#galeria">Galeria</a></li>
              </ul>
            </div>
            <div>
              <h5>Contato</h5>
              <ul>
                <li>e917761a@educacao.sp.gov.br</li>
                <li>(19) 3872-1667</li>
                <li>Rua Ponciano Tonussi, 87 — SP</li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 ALBERTO FIERZ — todos os direitos reservados</span>
            <span><a href="/admin/login">Acesso restrito</a></span>
          </div>
        </div>
      </footer>
    </>
  );
}
