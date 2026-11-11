import { NextRequest, NextResponse } from "next/server";
import { sql, ensureTable } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureTable();

    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get("categoria");
    const q = searchParams.get("q")?.trim();

    let rows;

    if (categoria && categoria !== "Todos" && q) {
      const searchPattern = `%${q}%`;
      rows = await sql`
        SELECT * FROM pontos_umbanda
        WHERE categoria = ${categoria}
          AND (
            nome_ponto ILIKE ${searchPattern}
            OR nome_guia_orixa ILIKE ${searchPattern}
            OR letra ILIKE ${searchPattern}
          )
        ORDER BY nome_ponto ASC, id DESC
      `;
    } else if (categoria && categoria !== "Todos") {
      rows = await sql`
        SELECT * FROM pontos_umbanda
        WHERE categoria = ${categoria}
        ORDER BY nome_ponto ASC, id DESC
      `;
    } else if (q) {
      const searchPattern = `%${q}%`;
      rows = await sql`
        SELECT * FROM pontos_umbanda
        WHERE nome_ponto ILIKE ${searchPattern}
           OR nome_guia_orixa ILIKE ${searchPattern}
           OR categoria ILIKE ${searchPattern}
           OR letra ILIKE ${searchPattern}
        ORDER BY nome_ponto ASC, id DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM pontos_umbanda
        ORDER BY nome_ponto ASC, id DESC
      `;
    }

    return NextResponse.json({ pontos: rows });
  } catch (error: unknown) {
    console.error("Error fetching pontos:", error);
    const message = error instanceof Error ? error.message : "Erro ao buscar pontos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();

    const body = await req.json();
    const { nome_ponto, nome_guia_orixa, categoria, tipo_toque, letra } = body;

    if (!nome_ponto?.trim() || !nome_guia_orixa?.trim() || !categoria?.trim() || !letra?.trim()) {
      return NextResponse.json(
        { error: "Preencha Nome do Ponto, Nome do Guia/Orixá, Categoria e a Letra do Ponto." },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO pontos_umbanda (nome_ponto, nome_guia_orixa, categoria, tipo_toque, letra)
      VALUES (
        ${nome_ponto.trim()},
        ${nome_guia_orixa.trim()},
        ${categoria.trim()},
        ${tipo_toque?.trim() || null},
        ${letra.trim()}
      )
      RETURNING *
    `;

    return NextResponse.json({ ponto: result[0] }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating ponto:", error);
    const message = error instanceof Error ? error.message : "Erro ao cadastrar ponto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
