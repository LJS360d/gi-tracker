import {
  closeModal,
  editingRow,
  error,
  formDescription,
  formPointId,
  formSubmitting,
  formTitle,
  formUrl,
  handleFileChange,
  handleSubmit,
  points,
  setFormDescription,
  setFormPointId,
  setFormTitle,
  setFormUrl,
  uploading
} from "@/stores/adminMediaStore";
import MdiAlertCircle from "virtual:icons/mdi/alert-circle";
import MdiClose from "virtual:icons/mdi/close";
import MdiUpload from "virtual:icons/mdi/upload";
import { MdEditor } from "./MdEditor";
import { pointOptionLabel, uniquePointOptionsByLabel } from "./adminMediaUtils";

export default function AdminMediaModal() {
  const canClose = () => !formSubmitting();
  return (
    <div
      class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 md:p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) =>
        e.target === e.currentTarget && canClose() && closeModal()
      }
    >
      <div
        class="bg-neutral-900 border border-neutral-700 md:rounded-xl shadow-xl w-full max-h-[95dvh] md:max-h-[90vh] md:max-w-2xl overflow-hidden flex flex-col rounded-t-2xl relative"
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
          <h3 class="text-lg text-neutral-100">
            {editingRow() ? "Modifica" : "Aggiungi media"}
          </h3>
          <button
            type="button"
            onClick={() => canClose() && closeModal()}
            disabled={formSubmitting()}
            class="min-h-11 min-w-11 flex items-center justify-center rounded-xl text-neutral-400 active:bg-neutral-800 active:text-white touch-manipulation disabled:opacity-50 disabled:pointer-events-none md:hover:bg-neutral-800 md:hover:text-white"
            aria-label="Annulla"
          >
            <MdiClose class="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          class="p-4 overflow-y-auto space-y-4 flex-1"
        >
          {error() && (
            <div
              class="flex items-center gap-3 p-3 rounded-xl border border-red-500/60 bg-red-950/30 text-red-200"
              role="alert"
            >
              <MdiAlertCircle class="h-5 w-5 shrink-0 text-red-400" />
              <span class="text-sm">{error()}</span>
            </div>
          )}
          <div>
            <label class="block text-sm text-neutral-400 mb-1">Punto</label>
            <select
              value={formPointId() ?? ""}
              onInput={(e) =>
                setFormPointId(parseInt(e.currentTarget.value, 10) || null)
              }
              class="w-full min-h-12 px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation"
            >
              <option value="">—</option>
              {(() => {
                const pts = points();
                const grouped = uniquePointOptionsByLabel(pts);
                const repIds = new Set(grouped.map((r) => r.id));
                const pid = formPointId();
                const currentPoint =
                  pid != null ? pts.find((p) => p.id === pid) : null;
                return (
                  <>
                    {pid != null && currentPoint == null && (
                      <option value={pid}>#{pid} (non sulla mappa)</option>
                    )}
                    {pid != null &&
                      currentPoint != null &&
                      !repIds.has(pid) && (
                        <option value={pid}>
                          {pointOptionLabel(currentPoint)}
                        </option>
                      )}
                    {grouped.map(({ id, label }) => (
                      <option value={id}>{label}</option>
                    ))}
                  </>
                );
              })()}
            </select>
            {!editingRow() && (
              <p class="mt-1 text-xs text-neutral-500">
                Opzionale: se non scegli un punto, verrà usata la posizione dal
                file (EXIF) o dal navigatore.
              </p>
            )}
          </div>
          <div>
            <label class="block text-sm text-neutral-400 mb-1">URL</label>
            <input
              type="text"
              value={formUrl()}
              onInput={(e) => setFormUrl(e.currentTarget.value)}
              class="w-full min-h-12 px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 mb-2 touch-manipulation"
              placeholder="https://…"
            />
            <div class="flex items-center gap-2 text-sm text-neutral-500 flex-wrap">
              <span>oppure</span>
              <label class="min-h-11 flex items-center cursor-pointer px-4 py-2.5 rounded-xl bg-neutral-700 active:bg-neutral-600 text-neutral-200 touch-manipulation md:hover:bg-neutral-600 gap-1">
                <input
                  type="file"
                  accept="image/*,video/*"
                  class="sr-only"
                  onChange={handleFileChange}
                  disabled={uploading()}
                />
                <MdiUpload class="w-5 h-5" />
                {uploading() ? "…" : "Carica file"}
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm text-neutral-400 mb-1">Titolo</label>
            <input
              type="text"
              value={formTitle()}
              onInput={(e) => setFormTitle(e.currentTarget.value)}
              class="w-full min-h-12 px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation"
            />
          </div>
          <div class="easymde-dark">
            <label class="block text-sm text-neutral-400 mb-1">
              Descrizione (Markdown)
            </label>
            <MdEditor
              value={formDescription()}
              onChange={(md) => setFormDescription(md)}
            />
          </div>
          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={formSubmitting()}
              class="flex-1 min-h-12 px-4 py-3 text-base rounded-xl bg-neutral-700 active:bg-neutral-600 text-neutral-100 disabled:opacity-50 touch-manipulation md:hover:bg-neutral-600"
            >
              Salva
            </button>
            <button
              type="button"
              onClick={closeModal}
              class="min-h-12 px-4 py-3 text-base rounded-xl bg-neutral-800 text-neutral-400 active:text-neutral-200 touch-manipulation md:hover:text-neutral-200"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
