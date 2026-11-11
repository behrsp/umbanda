# Pontos de Umbanda — Acervo de Orixás e Guias

Aplicação web responsiva (Mobile & Desktop) com tema **Preto e Vermelho** para cadastrar, alterar, excluir, buscar rapidamente e ler letras de pontos cantados de Umbanda em modo expandido (tela cheia).

## Funcionalidades

- **Cadastro Completo (CRUD)**:
  - **Cadastrar** novo ponto com *Nome do Ponto*, *Nome do Guia ou Orixá*, *Categoria*, *Toque/Ritmo (opcional)* e *Letra completa*.
  - **Alterar (Editar)** qualquer ponto cadastrado.
  - **Excluir** pontos com confirmação de segurança.
- **Modo Leitura Expandido (Tela Cheia)**:
  - Ao clicar sobre a letra ou no card de um ponto, a letra se expande em tela cheia para leitura fácil no celular ou computador.
  - Controles de tamanho de fonte (`A-` / `A+`), alinhamento do texto (esquerda ou centralizado), cópia rápida e navegação entre pontos (*Anterior* / *Próximo*).
- **Busca Rápida Instantânea**:
  - Pesquise simultaneamente pelo **Nome do Ponto**, **Nome do Guia ou Orixá**, **Categoria** ou **trecho da letra**.
- **16 Categorias de Orixás e Guias**:
  - **Orixás**: Oxalá, Oxossi, Obaluaê, Oxum, Ogum, Xangô, Yemanjá, Nanã, Yansã.
  - **Guias e Entidades**: Pretos Velhos, Erês, Exús e PomboGiras, Malandros, Marinheiros, Boiadeiros, Baianos.

## Tecnologias

- **Next.js 15 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (Design responsivo Mobile-First em Preto e Vermelho)
- **NeonDB Serverless PostgreSQL** (`@neondatabase/serverless`)
- **Lucide Icons**

## Publicação na Vercel

1. Importe o repositório `https://github.com/behrsp/umbanda.git` na [Vercel](https://vercel.com).
2. (Opcional) Adicione a variável de ambiente `DATABASE_URL` nas configurações do projeto na Vercel com a string de conexão do NeonDB.
3. Clique em **Deploy**.
