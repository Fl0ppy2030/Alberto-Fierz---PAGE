-- ============================================================
-- Schema do banco de dados
-- Rode este arquivo inteiro em: Supabase > SQL Editor > New query
-- ============================================================

-- Extensão necessária para gerar IDs únicos
create extension if not exists "pgcrypto";

-- ---------- AVISOS (mural) ----------
create table if not exists avisos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  tag text not null default 'evento' check (tag in ('prova', 'evento', 'prazo')),
  data date not null default current_date,
  criado_em timestamptz not null default now()
);

-- ---------- PROJETOS / PESQUISAS ----------
create table if not exists projetos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  categoria text not null default 'Informática',
  turma text,
  status text not null default 'em_andamento' check (status in ('em_andamento', 'concluido', 'feira_de_ciencias')),
  criado_em timestamptz not null default now()
);

-- ---------- JORNAL SEMANAL ----------
create table if not exists jornal (
  id uuid primary key default gen_random_uuid(),
  edicao integer not null,
  titulo text not null,
  resumo text,
  link text,
  data date not null default current_date,
  destaque boolean not null default false,
  criado_em timestamptz not null default now()
);

-- ---------- GALERIA DE FOTOS ----------
create table if not exists fotos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  legenda text,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

-- ============================================================
-- SEGURANÇA (Row Level Security)
-- Qualquer visitante pode LER. Só usuários logados (admin/professor)
-- podem CRIAR, EDITAR ou APAGAR.
-- ============================================================

alter table avisos enable row level security;
alter table projetos enable row level security;
alter table jornal enable row level security;
alter table fotos enable row level security;

-- Leitura pública
create policy "avisos_leitura_publica" on avisos for select using (true);
create policy "projetos_leitura_publica" on projetos for select using (true);
create policy "jornal_leitura_publica" on jornal for select using (true);
create policy "fotos_leitura_publica" on fotos for select using (true);

-- Escrita apenas autenticado (o admin logado)
create policy "avisos_escrita_admin" on avisos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "projetos_escrita_admin" on projetos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "jornal_escrita_admin" on jornal for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "fotos_escrita_admin" on fotos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE (bucket para as fotos da galeria)
-- Se preferir, crie o bucket pela interface: Storage > New bucket >
-- nome "galeria" > marque "Public bucket". O SQL abaixo faz o mesmo.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('galeria', 'galeria', true)
on conflict (id) do nothing;

create policy "galeria_leitura_publica" on storage.objects
  for select using (bucket_id = 'galeria');

create policy "galeria_upload_admin" on storage.objects
  for insert with check (bucket_id = 'galeria' and auth.role() = 'authenticated');

create policy "galeria_exclusao_admin" on storage.objects
  for delete using (bucket_id = 'galeria' and auth.role() = 'authenticated');

-- ============================================================
-- DADOS DE EXEMPLO (opcional — pode apagar depois)
-- ============================================================

insert into avisos (titulo, descricao, tag, data) values
  ('Prova de Matemática — 2º ano', 'Conteúdo: funções e progressões. Sala 12, 1º horário.', 'prova', current_date + 2),
  ('Feira de Ciências e Tecnologia', 'Apresentação dos projetos técnicos para a comunidade. Pátio principal.', 'evento', current_date + 6),
  ('Entrega do Trabalho de Eletrônica', 'Projeto final do módulo de circuitos digitais, via portal do aluno.', 'prazo', current_date + 9);

insert into projetos (titulo, descricao, categoria, turma, status) values
  ('App de caronas para a escola', 'Aplicativo para organizar caronas entre alunos e reduzir custo de transporte.', 'Informática', '3º INFO', 'em_andamento'),
  ('Sensor de qualidade da água do rio local', 'Protótipo de baixo custo para medir pH e turbidez.', 'Eletrônica', '2º ELET', 'feira_de_ciencias'),
  ('Incubadora de negócios estudantis', 'Programa que ajuda alunos a formalizar pequenos negócios.', 'Administração', '3º ADM', 'concluido');

insert into jornal (edicao, titulo, resumo, link, data, destaque) values
  (24, 'Turmas do 3º ano visitam parque tecnológico da região', 'Alunos dos três cursos técnicos conheceram de perto processos de prototipagem em startups locais.', '#', current_date, true),
  (23, 'Resultado da gincana de robótica', 'Confira quem venceu a disputa deste ano.', '#', current_date - 7, false),
  (22, 'Entrevista com ex-alunos formados', 'Onde estão e o que fazem hoje os formandos da ETI Vértice.', '#', current_date - 14, false);
