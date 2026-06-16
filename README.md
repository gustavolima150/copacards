# ⚽ COPACARDS — Rede Social de Figurinhas da Copa

![COPACARDS](https://img.shields.io/badge/COPACARDS-v1.0.0-009739?style=for-the-badge&logo=data:image/svg+xml;base64,...)

Rede social para colecionadores de figurinhas digitais de atletas da Copa do Mundo. Compartilhe, curta, comente e troque figurinhas!

---

## 🎨 Identidade Visual
| Cor | Hex |
|-----|-----|
| 🟢 Verde Brasil | `#009739` |
| 🟡 Amarelo | `#FEDD00` |
| 🔵 Azul | `#012169` |
| ⚪ Branco | `#FFFFFF` |
| ⚫ Escuro | `#0F172A` |

---

## 🚀 Como Rodar Localmente

### 1. Instalar dependências
```bash
cd copacards
npm install
```

### 2. Configurar variáveis de ambiente
Renomeie `.env.example` para `.env` e preencha:
```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
```

### 3. Configurar Supabase
- Acesse [supabase.com](https://supabase.com) e crie um projeto
- Vá em **SQL Editor** e execute o arquivo `supabase/schema.sql` completo
- Copie `Project URL` e `anon public key` para o `.env`

### 4. Rodar em desenvolvimento
```bash
npm run dev
```

---

## ☁️ Deploy na Vercel

1. Faça push do projeto para o GitHub (sem o `.env` e sem `node_modules`)
2. Acesse [vercel.com](https://vercel.com) → "New Project" → importe o repositório
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Clique em **Deploy** ✅

---

## 🗄️ Tabelas do Supabase

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil do usuário (avatar, bio, seleção favorita) |
| `stickers` | Figurinhas digitais (atleta, seleção, posição, status) |
| `posts` | Postagens no feed com figurinha + legenda |
| `likes` | Curtidas nas postagens |
| `comments` | Comentários nas postagens |
| `follows` | Relacionamentos entre usuários |
| `conversations` | Conversas privadas (DMs) |
| `messages` | Mensagens dentro de uma conversa |

---

## 📦 Stack Tecnológica

- **Frontend:** Vite + React 18
- **Estilo:** Tailwind CSS 3 + shadcn/ui components
- **Backend:** Supabase (Auth + Database + Storage)
- **Estado global:** Zustand
- **Formulários:** React Hook Form + Zod
- **Roteamento:** React Router DOM v6
- **Deploy:** Vercel

---

## ✨ Funcionalidades

- ✅ Autenticação (login, cadastro, esqueci senha)
- ✅ Feed com postagens de figurinhas
- ✅ Curtir / remover curtida
- ✅ Comentários em tempo real
- ✅ Perfil editável (avatar, bio, seleção favorita)
- ✅ Seguir / deixar de seguir colecionadores
- ✅ Chat/Direct Messages privadas
- ✅ CRUD completo de figurinhas digitais
- ✅ Gerenciar coleção (Tenho / Quero / Repetida)
- ✅ Busca de pessoas e figurinhas
- ✅ Modo claro / escuro
- ✅ Upload de imagens (Supabase Storage)
- ✅ Responsivo (mobile-first)
- ✅ Deploy ready (Vercel)
