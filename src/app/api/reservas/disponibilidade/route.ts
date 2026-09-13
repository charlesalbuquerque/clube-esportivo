import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);

  const quadraId = Number(searchParams.get("quadra_id"));
  const data = searchParams.get("data");

  if (!quadraId || !data) {
    return NextResponse.json(
      {
        error: "Quadra e data são obrigatórias.",
      },
      { status: 400 }
    );
  }

  const [ano, mes, dia] = data.split("-").map(Number);

  const dataLocal = new Date(ano, mes - 1, dia);
  const diaSemana = dataLocal.getDay();

  const { data: horarios, error: horariosError } =
    await supabase
      .from("quadra_horarios")
      .select(
        "id, quadra_id, dia_semana, hora_inicio, hora_fim, ativo"
      )
      .eq("quadra_id", quadraId)
      .eq("dia_semana", diaSemana)
      .eq("ativo", true)
      .order("hora_inicio");

  if (horariosError) {
    console.error(
      "Erro ao buscar horários:",
      horariosError
    );

    return NextResponse.json(
      {
        error: "Não foi possível carregar os horários.",
      },
      { status: 500 }
    );
  }

  const { data: reservas, error: reservasError } =
    await supabase
      .from("reservas")
      .select(
        "id, quadra_id, data, hora_inicio, hora_fim, status"
      )
      .eq("quadra_id", quadraId)
      .eq("data", data)
      .eq("status", "confirmada")
      .order("hora_inicio");

  if (reservasError) {
    console.error(
      "Erro ao buscar reservas:",
      reservasError
    );

    return NextResponse.json(
      {
        error: "Não foi possível carregar as reservas.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    horarios: horarios ?? [],
    reservas: reservas ?? [],
  });
}