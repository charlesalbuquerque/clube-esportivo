import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ReservaBody = {
  quadra_id?: number;
  data?: string;
  hora_inicio?: string;
  hora_fim?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verifica se o usuário está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "Você precisa estar autenticado para fazer uma reserva.",
      },
      { status: 401 }
    );
  }

  let body: ReservaBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Dados da reserva inválidos.",
      },
      { status: 400 }
    );
  }

  const quadraId = Number(body.quadra_id);
  const data = body.data;
  const horaInicio = body.hora_inicio;
  const horaFim = body.hora_fim;

  if (
    !quadraId ||
    !data ||
    !horaInicio ||
    !horaFim
  ) {
    return NextResponse.json(
      {
        error: "Quadra, data e horário são obrigatórios.",
      },
      { status: 400 }
    );
  }

  if (horaInicio >= horaFim) {
    return NextResponse.json(
      {
        error: "O horário inicial deve ser menor que o horário final.",
      },
      { status: 400 }
    );
  }

  // Impede reservas para datas anteriores
  const hoje = new Date();

  const anoHoje = hoje.getFullYear();
  const mesHoje = String(hoje.getMonth() + 1).padStart(2, "0");
  const diaHoje = String(hoje.getDate()).padStart(2, "0");

  const dataHoje = `${anoHoje}-${mesHoje}-${diaHoje}`;

  if (data < dataHoje) {
    return NextResponse.json(
      {
        error: "Não é possível reservar uma data que já passou.",
      },
      { status: 400 }
    );
  }

  // Verifica se a quadra existe
  const { data: quadra, error: quadraError } =
    await supabase
      .from("quadras")
      .select("id")
      .eq("id", quadraId)
      .single();

  if (quadraError || !quadra) {
    return NextResponse.json(
      {
        error: "Quadra não encontrada.",
      },
      { status: 404 }
    );
  }

  // Verifica se o horário está cadastrado
  const [ano, mes, dia] = data.split("-").map(Number);

  const dataLocal = new Date(ano, mes - 1, dia);
  const diaSemana = dataLocal.getDay();

  const { data: horario, error: horarioError } =
    await supabase
      .from("quadra_horarios")
      .select(
        "id, hora_inicio, hora_fim, ativo"
      )
      .eq("quadra_id", quadraId)
      .eq("dia_semana", diaSemana)
      .eq("hora_inicio", horaInicio)
      .eq("hora_fim", horaFim)
      .eq("ativo", true)
      .maybeSingle();

  if (horarioError) {
    console.error(
      "Erro ao verificar horário:",
      horarioError
    );

    return NextResponse.json(
      {
        error: "Não foi possível verificar a disponibilidade do horário.",
      },
      { status: 500 }
    );
  }

  if (!horario) {
    return NextResponse.json(
      {
        error: "Esse horário não está disponível para esta data.",
      },
      { status: 400 }
    );
  }

  // Verifica conflito de horário
  const { data: conflito, error: conflitoError } =
    await supabase
      .from("reservas")
      .select(
        "id, hora_inicio, hora_fim"
      )
      .eq("quadra_id", quadraId)
      .eq("data", data)
      .eq("status", "confirmada")
      .lt("hora_inicio", horaFim)
      .gt("hora_fim", horaInicio)
      .limit(1)
      .maybeSingle();

  if (conflitoError) {
    console.error(
      "Erro ao verificar conflito:",
      conflitoError
    );

    return NextResponse.json(
      {
        error: "Não foi possível verificar o conflito de horário.",
      },
      { status: 500 }
    );
  }

  if (conflito) {
    return NextResponse.json(
      {
        error: "Esse horário já foi reservado por outro associado.",
      },
      { status: 409 }
    );
  }

  // Cria a reserva
  const { data: reserva, error: reservaError } =
    await supabase
      .from("reservas")
      .insert({
        quadra_id: quadraId,
        associado_id: user.id,
        data,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        status: "confirmada",
      })
      .select(
        "id, quadra_id, data, hora_inicio, hora_fim, status"
      )
      .single();

  if (reservaError) {
    console.error(
      "Erro ao criar reserva:",
      reservaError
    );

    // Se o trigger de conflito já estiver instalado no banco
    if (
      reservaError.message?.includes(
        "HORARIO_INDISPONIVEL"
      )
    ) {
      return NextResponse.json(
        {
          error: "Esse horário acabou de ser reservado por outra pessoa.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Não foi possível realizar a reserva.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      reserva,
    },
    { status: 201 }
  );
}