import { createQuadra } from "@/app/actions/quadras";

export function NovaQuadraForm({
  redirectTo,
}: {
  redirectTo: string;
}) {
  const action = async (formData: FormData) => {
    "use server";

    await createQuadra(redirectTo, formData);
  };

  return (
    <form
      action={action}
      className="mb-6 rounded border border-zinc-200 bg-white p-4"
    >
      <h2 className="mb-4 text-base font-semibold text-zinc-900">
        Cadastrar nova quadra
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="nome"
            className="text-xs text-zinc-600"
          >
            Nome da quadra
          </label>

          <input
            id="nome"
            name="nome"
            type="text"
            placeholder="Ex.: Quadra Society 1"
            required
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="tipo"
            className="text-xs text-zinc-600"
          >
            Tipo
          </label>

          <select
            id="tipo"
            name="tipo"
            required
            defaultValue=""
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Selecione...
            </option>

            <option value="futebol">Futebol</option>
            <option value="futsal">Futsal</option>
            <option value="society">Society</option>
            <option value="tenis">Tênis</option>
            <option value="volei">Vôlei</option>
            <option value="basquete">Basquete</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label
            htmlFor="descricao"
            className="text-xs text-zinc-600"
          >
            Descrição
          </label>

          <textarea
            id="descricao"
            name="descricao"
            rows={3}
            placeholder="Descrição ou informações adicionais da quadra"
            className="resize-none rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Cadastrar quadra
      </button>
    </form>
  );
}