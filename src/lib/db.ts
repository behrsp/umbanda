import { neon } from "@neondatabase/serverless";

const DEFAULT_DATABASE_URL =
  "postgresql://neondb_owner:npg_umSPLd0nIQU4@ep-summer-frost-b6q0roou-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require";

const rawUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
// Ensure compatibility with Neon serverless HTTP driver
const cleanUrl = rawUrl.replace("&channel_binding=require", "").replace("?channel_binding=require&", "?");

export const sql = neon(cleanUrl);

export interface Ponto {
  id: number;
  nome_ponto: string;
  nome_guia_orixa: string;
  categoria: string;
  tipo_toque?: string | null;
  letra: string;
  created_at: string;
  updated_at: string;
}

let isInitialized = false;

export async function ensureTable() {
  if (isInitialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS pontos_umbanda (
      id SERIAL PRIMARY KEY,
      nome_ponto VARCHAR(255) NOT NULL,
      nome_guia_orixa VARCHAR(255) NOT NULL,
      categoria VARCHAR(100) NOT NULL,
      tipo_toque VARCHAR(100),
      letra TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_pontos_categoria ON pontos_umbanda (categoria);
  `;

  // Seed initial example points only if table is completely empty
  const countResult = await sql`SELECT COUNT(*)::int AS total FROM pontos_umbanda`;
  const total = countResult[0]?.total ?? 0;

  if (total === 0) {
    await sql`
      INSERT INTO pontos_umbanda (nome_ponto, nome_guia_orixa, categoria, tipo_toque, letra)
      VALUES
      (
        'Cavaleiro na Porta',
        'Ogum Beira-Mar',
        'Ogum',
        'Ijexá / Nagô',
        E'Eu tenho sete espadas pra me defender\nEu tenho Ogum em minha companhia\n\nMas Ogum é meu Pai\nOgum é meu Guia\nOgum é meu Pai\nVenha com Deus e a Virgem Maria'
      ),
      (
        'Quem manda na mata é Oxóssi',
        'Caboclo das Sete Encruzilhadas',
        'Oxossi',
        'Congo de Ouro',
        E'Quem manda na mata é Oxóssi\nOxóssi é caçador\nOxóssi é caçador\n\nOuvi meu Pai assobiar\nEle mandou chamar\nÉ na Aruanda ê\nÉ na Aruanda á\nSeu Pena Branca de Umbanda\nEle mandou chamar'
      ),
      (
        'Sino da Igrejinha',
        'Exú Tranca Ruas das Almas',
        'Exús e PomboGiras',
        'Samba Cabula / Congo',
        E'O sino da igrejinha faz belém, blém, blom\nO sino da igrejinha faz belém, blém, blom\n\nDeu meia-noite, o galo já cantou\nSeu Tranca Ruas que é o dono da gira\nOi corre gira que Ogum mandou!'
      ),
      (
        'Fio de Contas',
        'Pai Joaquim de Angola',
        'Pretos Velhos',
        'Congo',
        E'Vovô não quer casca de coco no terreiro\nVovô não quer casca de coco no terreiro\n\nPra não lembrar do tempo do cativeiro\nPra não lembrar do tempo do cativeiro'
      )
    `;
  }

  isInitialized = true;
}
