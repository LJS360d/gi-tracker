import {
  closeEditModal,
  editingPoint,
  error,
  formAddress,
  formDeviceTs,
  formLat,
  formLng,
  formSegmentType,
  formSubmitting,
  handlePointSubmit,
  setFormAddress,
  setFormDeviceTs,
  setFormLat,
  setFormLng,
  setFormSegmentType,
} from "@/stores/adminPointsStore";
import MdiClose from "virtual:icons/mdi/close";

export default function AdminPointModal() {
  const pt = editingPoint();
  if (!pt) return null;

  const canClose = () => !formSubmitting();

  return (
    <div
      class="fixed inset-0 z-100 flex items-end md:items-center justify-center bg-black/70 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-point-title"
      onClick={(e) =>
        e.target === e.currentTarget && canClose() && closeEditModal()
      }
    >
      <div
        class="bg-neutral-900 border border-neutral-700 md:rounded-xl shadow-xl w-full max-h-[95dvh] md:max-h-[90vh] md:max-w-md overflow-hidden flex flex-col rounded-t-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {formSubmitting() && (
          <div
            class="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900/80 rounded-t-2xl md:rounded-xl"
            aria-busy="true"
            aria-live="polite"
          >
            <div class="flex flex-col items-center gap-3">
              <div
                class="h-10 w-10 border-2 border-neutral-500 border-t-neutral-100 rounded-full animate-spin"
                aria-hidden
              />
              <span class="text-sm text-neutral-400">Salvataggio in corso…</span>
            </div>
          </div>
        )}
        <div class="flex items-center justify-between shrink-0 p-4 border-b border-neutral-700">
          <h2 id="edit-point-title" class="text-lg text-neutral-100">
            Modifica punto
          </h2>
          <button
            type="button"
            onClick={() => canClose() && closeEditModal()}
            disabled={formSubmitting()}
            class="min-h-11 min-w-11 flex items-center justify-center rounded-xl text-neutral-400 active:bg-neutral-800 active:text-white touch-manipulation disabled:opacity-50 disabled:pointer-events-none md:hover:bg-neutral-800 md:hover:text-white"
            aria-label="Annulla"
          >
            <MdiClose class="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={handlePointSubmit}
          class="p-4 overflow-y-auto space-y-4 flex-1"
        >
          {error() && (
            <div
              class="flex items-center gap-3 p-3 rounded-xl border border-red-500/60 bg-red-950/30 text-red-200"
              role="alert"
            >
              <span class="text-sm">{error()}</span>
            </div>
          )}
          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1 text-sm text-neutral-400">
              Latitudine
              <input
                type="text"
                inputmode="decimal"
                value={formLat()}
                onInput={(e) => setFormLat((e.target as HTMLInputElement).value)}
                class="min-h-12 px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm text-neutral-400">
              Longitudine
              <input
                type="text"
                inputmode="decimal"
                value={formLng()}
                onInput={(e) => setFormLng((e.target as HTMLInputElement).value)}
                class="min-h-12 px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation"
              />
            </label>
          </div>
          <label class="flex flex-col gap-1 text-sm text-neutral-400">
            Data e ora
            <input
              type="datetime-local"
              value={formDeviceTs()}
              onInput={(e) =>
                setFormDeviceTs((e.target as HTMLInputElement).value)}
              class="min-h-12 px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm text-neutral-400">
            Tipo di segmento
            <select
              value={formSegmentType()}
              onInput={(e) =>
                setFormSegmentType((e.target as HTMLSelectElement).value)}
              class="min-h-12 px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation"
            >
              <option value="ground">Terra</option>
              <option value="plane">Aereo</option>
              <option value="boat">Barca</option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-sm text-neutral-400">
            Indirizzo
            <input
              type="text"
              value={formAddress()}
              onInput={(e) =>
                setFormAddress((e.target as HTMLInputElement).value)}
              class="min-h-12 px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation"
            />
          </label>
          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={formSubmitting()}
              class="flex-1 min-h-12 px-4 py-3 text-base rounded-xl bg-neutral-700 active:bg-neutral-600 text-neutral-100 disabled:opacity-50 touch-manipulation"
            >
              Salva
            </button>
            <button
              type="button"
              onClick={closeEditModal}
              class="min-h-12 px-4 py-3 text-base rounded-xl bg-neutral-800 text-neutral-400 active:text-neutral-200 touch-manipulation"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
