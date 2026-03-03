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
        class="bg-base-100 border border-base-300 md:shadow-xl w-full max-h-[95dvh] md:max-h-[90vh] md:max-w-2xl overflow-hidden flex flex-col rounded-t-2xl relative"
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
          <h3 class="text-lg text-base-content">
            {editingRow() ? "Modifica" : "Aggiungi media"}
          </h3>
          <button
            type="button"
            onClick={() => canClose() && closeModal()}
            disabled={formSubmitting()}
            class="btn btn-ghost btn-square min-h-11 min-w-11 touch-manipulation disabled:opacity-50 disabled:pointer-events-none"
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
            <div class="alert alert-error rounded-xl" role="alert">
              <MdiAlertCircle class="h-5 w-5 shrink-0" />
              <span class="text-sm">{error()}</span>
            </div>
          )}
          <div>
            <label class="block text-sm text-base-content/70 mb-1">Punto</label>
            <select
              value={formPointId() ?? ""}
              onInput={(e) =>
                setFormPointId(parseInt(e.currentTarget.value, 10) || null)
              }
              class="select select-bordered w-full min-h-12 touch-manipulation"
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
              <p class="mt-1 text-xs text-base-content/60">
                Opzionale: se non scegli un punto, verrà usata la posizione dal
                file (EXIF) o dal navigatore.
              </p>
            )}
          </div>
          <div>
            <label class="block text-sm text-base-content/70 mb-1">URL</label>
            <input
              type="text"
              value={formUrl()}
              onInput={(e) => setFormUrl(e.currentTarget.value)}
              class="input input-bordered w-full min-h-12 mb-2 touch-manipulation"
              placeholder="https://…"
            />
            <div class="flex items-center gap-2 text-sm text-base-content/60 flex-wrap">
              <span>oppure</span>
              <label class="btn btn-neutral min-h-11 gap-1 touch-manipulation cursor-pointer">
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
            <label class="block text-sm text-base-content/70 mb-1">Titolo</label>
            <input
              type="text"
              value={formTitle()}
              onInput={(e) => setFormTitle(e.currentTarget.value)}
              class="input input-bordered w-full min-h-12 touch-manipulation"
            />
          </div>
          <div class="easymde-editor">
            <label class="block text-sm text-base-content/70 mb-1">
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
              class="btn btn-primary flex-1 min-h-12 touch-manipulation disabled:opacity-50"
            >
              Salva
            </button>
            <button
              type="button"
              onClick={closeModal}
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
