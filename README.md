# ✨ Aurum Parfums — E-Commerce Full-Stack de Alta Perfumaria de Luxo

Sistema web full-stack completo, moderno, sofisticado e 100% funcional desenvolvido em **Português do Brasil (pt-BR)** para a marca de perfumaria de luxo **"Aurum Parfums"**.

Este projeto foi construído com padrões de software comercial prontos para venda e produção. Conta com frontend responsivo com estética obsidian/dourada, backend em Python FastAPI, banco de dados relacional com SQLAlchemy/SQLite, segurança JWT com RBAC (`USER` e `ADMIN`), upload real de imagens do computador, simulador de pagamento sandbox e painel administrativo completo.

---

## 🔑 Credenciais de Demonstração (Para Testar Imediatamente)

### 1. Cliente da Loja (Área Pública e Compras)
- **E-mail**: `cliente@aurumparfums.com`
- **Senha**: `cliente123`
- **Acesso**: Fazer compras, adicionar ao carrinho, aplicar cupons, visualizar pedidos e gerenciar favoritos.

### 2. Administrador da Loja (Painel Exclusivo)
- **E-mail**: `admin@aurumparfums.com`
- **Senha**: `admin123`
- **Acesso**: Dashboard financeiro, cadastrar novos perfumes com upload de fotos do computador, editar estoque, atualizar status de pedidos e gerenciar cupons.

---

## 🎟️ Cupons Promocionais Cadastrados
- `PRIMEIRA10`: 10% de Desconto em compras acima de R$ 500
- `PERFUME15`: 15% de Desconto em compras acima de R$ 1000
- `AURUM20`: R$ 150.00 OFF em compras acima de R$ 800

---

## 🛠️ Tecnologias e Arquitetura

### Backend (Python)
- **Framework**: FastAPI (Assíncrono, alta performance)
- **Banco de Dados**: SQLite (com SQLAlchemy ORM, facilmente intercambiável por PostgreSQL)
- **Segurança**: Criptografia de senhas (bcrypt/pbkdf2) e Tokens JWT com verificação de papéis no backend (`@router.get(..., dependencies=[Depends(get_current_admin)])`)
- **Processamento de Imagens**: Pillow e suporte a arquivos multipart estáticos (`/static/uploads/products/`)

### Frontend (React)
- **Core**: React 18 com TypeScript e Vite
- **Estilização**: Tailwind CSS (Tema customizado obsidian `#08080C` e dourado `#D4AF37`, glassmorphism, sombras luminosas)
- **Ícones**: Lucide React Icons
- **Comunicação**: Axios com interceptor de JWT e ID de sessão persistente

---

## 📂 Estrutura Profissional de Pastas

```
aurum-parfums/
├── backend/
│   ├── app/
│   │   ├── main.py              # Ponto de entrada da API e CORS
│   │   ├── seed.py              # Povoamento inicial do banco com produtos de luxo
│   │   ├── core/
│   │   │   ├── config.py        # Configurações globais (.env)
│   │   │   ├── database.py      # Conexão e Sessão SQLAlchemy
│   │   │   └── security.py      # JWT e Criptografia de senhas
│   │   ├── models/
│   │   │   └── models.py        # Tabelas: Users, Products, Orders, Carts, etc.
│   │   ├── schemas/
│   │   │   └── schemas.py       # Schemas Pydantic para validação
│   │   ├── routers/             # Rotas divididas por módulos
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── cart.py
│   │   │   ├── checkout.py
│   │   │   ├── orders.py
│   │   │   ├── coupons.py
│   │   │   └── admin.py         # Painel Administrativo Protegido
│   │   └── uploads/             # Diretório estático de fotos salvas
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Header, Footer, ProductCard, CartDrawer, etc.
│   │   ├── context/             # AuthContext, CartContext, WishlistContext
│   │   ├── pages/               # HomePage, CatalogPage, ProductDetailPage, AdminDashboardPage, etc.
│   │   ├── services/            # api.ts (Axios)
│   │   ├── types/               # Interfaces TypeScript
│   │   └── index.css            # Tokens de design e animações
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## 🚀 Como Executar Localmente no VS Code

### Passo 1: Iniciar o Backend (API Python)

1. Abra um terminal no diretório `backend`:
```bash
cd backend
```
2. Instale as dependências:
```bash
pip install -r requirements.txt
```
3. Execute o servidor de desenvolvimento:
```bash
python app/main.py
```
*(O banco de dados `aurum_parfums.db` será criado e semeado automaticamente na primeira execução no endereço `http-[#]-127-0-0-1-[#]-8000.https.proxy.beijing2.mykdev.online`). Documentação OpenAPI disponível em `http-[#]-127-0-0-1-[#]-8000.https.proxy.beijing2.mykdev.online/docs`.*

---

### Passo 2: Iniciar o Frontend (React + Vite)

1. Em outro terminal, acesse a pasta `frontend`:
```bash
cd frontend
```
2. Instale os pacotes npm:
```bash
npm install
```
3. Inicie o servidor Vite:
```bash
npm run dev
```
4. Acesse a loja no seu navegador em `http-[#]-localhost-[#]-5173.https.proxy.beijing2.mykdev.online`.

---

## 💳 Funcionamento do Pagamento em Modo Sandbox
O sistema conta com simulação completa para 3 métodos de pagamento:
- **PIX**: Gera um QR Code visual real e uma chave "Copia e Cola" válida para demonstração com cópia instantânea para a área de transferência.
- **Cartão de Crédito**: Aceita números de teste, valida quantidade de parcelas (ex: 1x a 10x sem juros) e gera código de autorização `AUTH-DEMO`.
- **Boleto Bancário**: Gera código numérico simulado e data de vencimento configurável (+3 dias).

---

## 📸 Como Cadastrar Produtos e Enviar Fotos do Computador

1. Faça login como **Administrador** (`admin@aurumparfums.com` / `admin123`).
2. Clique no botão de destaque **"+ NOVO PRODUTO"** no topo da tela ou acesse o painel.
3. Preencha o nome do perfume, marca, categoria, preço e pirâmide olfativa.
4. Na seção **Upload de Fotos**, clique no botão grande **"+ ADICIONAR FOTOS DIRETO DO COMPUTADOR"**.
5. O navegador abrirá a janela do **Windows Explorer**. Escolha uma ou várias imagens (`.jpg`, `.png` ou `.webp`).
6. O sistema gerará a pré-visualização das miniaturas instantaneamente.
7. Clique em **"Salvar e Publicar Perfume"**. As imagens serão salvas na pasta `backend/app/uploads/products/` e o perfume aparecerá imediatamente na Home e no Catálogo!

---

## 🌐 Guia de Hospedagem (Domínio Gratuito -> Domínio Próprio)

Como o sistema foi desenhado desacoplado usando variáveis de ambiente:
1. **Ambiente Gratuito**: Você pode subir o backend no **Render.com** ou **Railway.app** (gerando URL gratuita `.onrender.com`) e o frontend no **Vercel** ou **Netlify** (`.vercel.app`).
2. **Migração para Domínio Próprio**: Quando adquirir o domínio oficial da empresa de luxo (ex: `aurumparfums.com.br`), basta cadastrar o CNAME no painel da Vercel/Render. **Nenhuma alteração no código do projeto será necessária!**
