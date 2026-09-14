"use client";

import { useActionState } from "react";
import { updateOwnProfile } from "@/app/actions/associados";

export function PerfilForm({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string;
}) {
  const [state, action, pending] = useActionState(updateOwnProfile, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="full_name" className="text-sm font-medium text-ink-soft">
          Nome
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={fullName}
          required
          className="rounded border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium text-ink-soft">
          Telefone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone}
          className="rounded border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
