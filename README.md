# ETI Vértice — site + painel administrativo

Site institucional com painel de administração (`/admin`) para que a coordenação/professores
publiquem avisos, projetos, edições do jornal e fotos **sem mexer em código**.

Stack: **Next.js** (site + painel) + **Supabase** (banco de dados, login e armazenamento de fotos),
hospedado na **Vercel**.

---

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Clique em **New project**. Escolha um nome (ex: `eti-vertice`) e uma senha forte para o banco
   (guarde essa senha, mas ela não será usada neste projeto — só o painel do Supabase usa).
3. Espere o projeto terminar de ser criado (leva ~2 minutos).

### 1.1 Rodar o schema (criar as tabelas)

1. No menu lateral, vá em **SQL Editor** → **New query**.
2. Abra o arquivo [`schema.sql`](./schema.sql) deste projeto, copie todo o conteúdo e cole no editor.
3. Clique em **Run**. Isso cria as tabelas `avisos`, `projetos`, `jornal`, `fotos`, as permissões de
   segurança, o bucket de fotos e alguns dados de exemplo (pode apagar depois pelo próprio painel).

### 1.2 Criar o usuário administrador (login do professor/coordenação)

1. Vá em **Authentication** → **Users** → **Add user** → **Create new user**.
2. Preencha e-mail e senha do primeiro administrador (ex: `coordenacao@etivertice.edu.br`).
3. Marque **Auto Confirm User** para não precisar confirmar por e-mail.
4. Repita para cada professor/funcionário que terá acesso ao painel.

> Esse é o login que será usado em `/admin/login` no site.

### 1.3 Pegar as chaves da API

1. Vá em **Project Settings** (ícone de engrenagem) → **API**.
2. Copie a **Project URL** e a chave **anon public**. Você vai usar as duas no próximo passo.

---

## 2. Rodar o site localmente (opcional, para testar antes de publicar)

Requer [Node.js](https://nodejs.org) instalado.

```bash
# dentro da pasta do projeto
cp .env.local.example .env.local
```

Abra `.env.local` e preencha com os valores copiados no passo 1.3:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

Depois:

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` para o site público e `http://localhost:3000/admin/login`
para o painel.

---

## 3. Publicar na Vercel

1. Suba este projeto para um repositório no GitHub (crie um repo novo e faça `git push`).
2. Acesse [vercel.com](https://vercel.com), crie uma conta (pode entrar com o GitHub) e clique em
   **Add New → Project**.
3. Selecione o repositório do site.
4. Na tela de configuração, abra **Environment Variables** e adicione as duas mesmas variáveis do
   passo 2:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em **Deploy**. Em ~1 minuto o site estará no ar em um endereço `.vercel.app`
   (dá pra configurar um domínio próprio depois, em **Settings → Domains**).

Pronto: o site público fica em `https://seu-site.vercel.app` e o painel em
`https://seu-site.vercel.app/admin/login`.

---

## 4. Uso do dia a dia (para quem não mexe em código)

- Acesse `/admin/login`, entre com e-mail e senha cadastrados no passo 1.2.
- **Avisos**: criar, editar e apagar os cartões do mural da página inicial.
- **Projetos**: criar, editar e apagar os projetos/pesquisas exibidos no site.
- **Jornal semanal**: cada edição nova pode ser marcada como "destaque" — ela vira automaticamente
  a manchete grande da página inicial, e a anterior volta pra lista de edições passadas.
- **Galeria**: enviar fotos diretamente do computador (upload), com legenda opcional.

Toda alteração aparece no site em até 30 segundos (o site atualiza sozinho, sem precisar
republicar nada).

---

## 5. Estrutura do projeto

```
app/
  page.jsx                 → site público (busca os dados do Supabase)
  admin/
    login/page.jsx          → tela de login
    (dashboard)/
      layout.jsx             → menu lateral do painel
      avisos/page.jsx         → CRUD de avisos
      projetos/page.jsx       → CRUD de projetos
      jornal/page.jsx         → CRUD do jornal semanal
      galeria/page.jsx        → upload e CRUD de fotos
lib/
  supabaseClient.js         → conexão com Supabase no navegador
  supabaseServer.js         → conexão com Supabase no servidor
middleware.js               → protege as rotas /admin (exige login)
schema.sql                  → tabelas, permissões e dados de exemplo
```

## 6. Próximos passos possíveis

- Tornar os **cursos técnicos** (hoje fixos no código, em `app/page.jsx`) também editáveis pelo
  painel — mesmo padrão das outras seções, com uma tabela `cursos` nova.
- Adicionar mais de um nível de permissão (ex: professores só editam projetos, coordenação edita tudo).
- Trocar o endereço do mapa e os textos fixos (hero, endereço, contato) pelo conteúdo real da escola.
