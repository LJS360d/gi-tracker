import { adminFetchOpts, apiHeaders } from "@/lib/admin-client";
import debounce from "lodash/debounce";
import { createSignal, onMount } from "solid-js";

type Config = { delay_hours: number; sharing_enabled: boolean };
type Status = { last_sync_server_ts: number | null };

function formatLastSync(ts: number | null): string {
  if (ts == null) return "";
  const d = new Date(ts);
  return d.toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
}

type Props = {
  initialConfig?: Config | null;
  initialStatus?: Status | null;
};

export default function AdminConfig(props: Props) {
  const [config, setConfig] = createSignal<Config | null>(props.initialConfig ?? null);
  const [status, setStatus] = createSignal<Status | null>(props.initialStatus ?? null);
  const [error, setError] = createSignal<string | null>(null);
  const [pendingDelay, setPendingDelay] = createSignal<number | null>(null);
  const [pendingSharing, setPendingSharing] = createSignal<boolean | null>(null);

  onMount(() => {
    setError(null);
    fetch("/api/admin/config", { ...adminFetchOpts, headers: apiHeaders() })
      .then((r) => {
        if (r.status === 401) {
          setError("Sessione scaduta.");
          return null;
        }
        return r.json();
      })
      .then((data) => data && setConfig({ delay_hours: data.delay_hours, sharing_enabled: data.sharing_enabled }));
    fetch("/api/admin/status", { ...adminFetchOpts, headers: apiHeaders() })
      .then((r) => r.json())
      .then((data) => setStatus({ last_sync_server_ts: data?.last_sync_server_ts ?? null }));
  });

  function handleDelayChange(hours: number) {
    setPendingDelay(hours);
    fetch("/api/admin/config", {
      method: "PATCH",
      ...adminFetchOpts,
      headers: apiHeaders(),
      body: JSON.stringify({ delay_hours: hours }),
    })
      .then((r) => r.json())
      .then((data) => data?.delay_hours != null && setConfig((c) => (c ? { ...c, delay_hours: data.delay_hours } : null)))
      .then(() => setPendingDelay(null))
      .catch(() => setPendingDelay(null));
  }

  const debouncedHandleDelayChange = debounce(handleDelayChange, 200);

  function handleSharingChange(enabled: boolean) {
    setPendingSharing(enabled);
    fetch("/api/admin/config", {
      method: "PATCH",
      ...adminFetchOpts,
      headers: apiHeaders(),
      body: JSON.stringify({ sharing_enabled: enabled }),
    })
      .then((r) => r.json())
      .then((data) => data?.sharing_enabled != null && setConfig((c) => (c ? { ...c, sharing_enabled: data.sharing_enabled } : null)))
      .then(() => setPendingSharing(null))
      .catch(() => setPendingSharing(null));
  }

  const cfg = () => config();
  const delay = () => pendingDelay() ?? cfg()?.delay_hours ?? 48;
  const sharing = () => pendingSharing() ?? cfg()?.sharing_enabled ?? true;

  return (
    <div class="w-full max-w-xl text-neutral-300">
      <h2 class="text-xl font-light text-neutral-100 mb-4">Configurazione</h2>
      {error() && (
        <p class="mb-4 text-red-400">
          {error()}{" "}
          <a href="/admin" class="underline">Accedi di nuovo</a>
        </p>
      )}
      <div class="mb-6 flex justify-end">
        <a
          href="/api/admin/logout"
          class="min-h-[44px] min-w-[44px] px-4 py-2.5 text-base text-neutral-500 active:text-neutral-300 rounded-xl active:bg-neutral-800 touch-manipulation md:hover:bg-neutral-800 md:hover:text-neutral-300 inline-flex items-center justify-center"
        >
          Esci
        </a>
      </div>
      <div class="space-y-8">
        <div>
          <label for="delay" class="block text-sm text-neutral-400 mb-2">
            Ritardo pubblico (ore)
          </label>
          <input
            id="delay"
            type="range"
            min={0}
            list="delay-ticks"
            max={24 * 10}
            value={delay()}
            onInput={(e) => debouncedHandleDelayChange(parseInt(e.currentTarget.value, 10))}
            class="w-full h-3 rounded-full bg-neutral-700 accent-neutral-400 touch-manipulation [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-400"
          />
          <span class="block mt-2 text-neutral-500 text-base">{delay()} h{delay() >= 24 ? ` (${Math.round(delay() / 24)}g${delay() % 24 > 0 ? ` e ${delay() % 24}h` : ""})` : ""}</span>
        </div>
        <datalist id="delay-ticks">
          <option value={24 * 0.25} />
          <option value={24 * 0.5} />
          <option value={24 * 0.75} />
          <option value={24} />
          <option value={24 * 1.5} />
          <option value={24 * 2} />
          <option value={24 * 3} />
          <option value={24 * 4} />
          <option value={24 * 5} />
          <option value={24 * 6} />
          <option value={24 * 7} />
          <option value={24 * 8} />
          <option value={24 * 9} />
          <option value={24 * 10} />
        </datalist>
        <div class="flex items-center gap-3 min-h-[48px]">
          <input
            id="sharing"
            type="checkbox"
            checked={sharing()}
            onInput={(e) => handleSharingChange(e.currentTarget.checked)}
            class="w-6 h-6 rounded border-neutral-600 bg-neutral-800 accent-neutral-400 touch-manipulation shrink-0"
          />
          <label for="sharing" class="text-base text-neutral-200 touch-manipulation cursor-pointer">
            Condivisione attiva
          </label>
        </div>
        <div class="py-2">
          <span class="text-sm text-neutral-400">Ultima sincronizzazione: </span>
          <span class="text-base text-neutral-200">
            {status()?.last_sync_server_ts != null ? formatLastSync(status()!.last_sync_server_ts) : "Mai"}
          </span>
        </div>
      </div>
    </div>
  );
}
