import { NextRequest, NextResponse } from "next/server";
import { sql, ensureTable } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await context.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { nome_ponto, nome_guia_orixa, categoria, tipo_toque, letra } = body;

    if (!nome_ponto?.trim() || !nome_guia_orixa?.trim() || !categoria?.trim() || !letra?.trim()) {
      return NextResponse.json(
        { error: "Preencha Nome do Ponto, Nome do Guia/Orixá, Categoria e a Letra do Ponto." },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE pontos_umbanda
      SET
        nome_ponto = ${nome_ponto.trim()},
        nome_guia_orixa = ${nome_guia_orixa.trim()},
        categoria = ${categoria.trim()},
        tipo_toque = ${tipo_toque?.trim() || null},
        letra = ${letra.trim()},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${numericId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Ponto não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ponto: result[0] });
  } catch (error: unknown) {
    console.error("Error updating ponto:", error);
    const message = error instanceof Error ? error.message : "Erro ao atualizar ponto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await context.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM pontos_umbanda
      WHERE id = ${numericId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Ponto não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ deletedId: numericId });
  } catch (error: unknown) {
    console.error("Error deleting ponto:", error);
    const message = error instanceof Error ? error.message : "Erro ao excluir ponto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
