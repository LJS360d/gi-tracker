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
        class="bg-base-100 border border-base-300 md:shadow-xl w-full max-h-[95dvh] md:max-h-[90vh] md:max-w-md overflow-hidden flex flex-col rounded-t-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {formSubmitting() && (
          <div
            class="absolute inset-0 z-10 flex items-center justify-center bg-base-100/80 rounded-t-2xl md:rounded-xl"
            aria-busy="true"
            aria-live="polite"
          >
            <div class="flex flex-col items-center gap-3">
              <span class="loading loading-spinner loading-lg text-primary" aria-hidden />
              <span class="text-sm text-base-content/70">Salvataggio in corso…</span>
            </div>
          </div>
        )}
        <div class="flex items-center justify-between shrink-0 p-4 border-b border-base-300">
          <h2 id="edit-point-title" class="text-lg text-base-content">
            Modifica punto
          </h2>
          <button
            type="button"
            onClick={() => canClose() && closeEditModal()}
            disabled={formSubmitting()}
            class="btn btn-ghost btn-square min-h-11 min-w-11 touch-manipulation disabled:opacity-50 disabled:pointer-events-none"
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
            <div class="alert alert-error rounded-xl" role="alert">
              <span class="text-sm">{error()}</span>
            </div>
          )}
          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1 text-sm text-base-content/70">
              Latitudine
              <input
                type="text"
                inputmode="decimal"
                value={formLat()}
                onInput={(e) => setFormLat((e.target as HTMLInputElement).value)}
                class="input input-bordered min-h-12 touch-manipulation"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm text-base-content/70">
              Longitudine
              <input
                type="text"
                inputmode="decimal"
                value={formLng()}
                onInput={(e) => setFormLng((e.target as HTMLInputElement).value)}
                class="input input-bordered min-h-12 touch-manipulation"
              />
            </label>
          </div>
          <label class="flex flex-col gap-1 text-sm text-base-content/70">
            Data e ora
            <input
              type="datetime-local"
              value={formDeviceTs()}
              onInput={(e) =>
                setFormDeviceTs((e.target as HTMLInputElement).value)}
              class="input input-bordered min-h-12 touch-manipulation"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm text-base-content/70">
            Tipo di segmento
            <select
              value={formSegmentType()}
              onInput={(e) =>
                setFormSegmentType((e.target as HTMLSelectElement).value)}
              class="select select-bordered min-h-12 touch-manipulation w-full"
            >
              <option value="ground">Terra</option>
              <option value="plane">Aereo</option>
              <option value="boat">Barca</option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-sm text-base-content/70">
            Indirizzo
            <input
              type="text"
              value={formAddress()}
              onInput={(e) =>
                setFormAddress((e.target as HTMLInputElement).value)}
              class="input input-bordered min-h-12 touch-manipulation"
            />
          </label>
          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={formSubmitting()}
              class="btn btn-primary flex-1 min-h-12 touch-manipulation disabled:opacity-50"
            >
              Salva
            </button>
            <button
              type="button"
              onClick={closeEditModal}
              class="btn btn-ghost min-h-12 touch-manipulation"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
