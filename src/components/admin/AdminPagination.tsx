import { type Accessor, type Setter } from "solid-js";
import MdiChevronLeft from "virtual:icons/mdi/chevron-left";
import MdiChevronRight from "virtual:icons/mdi/chevron-right";

type Props = {
  page: Accessor<number>;
  totalPages: Accessor<number>;
  setPage: Setter<number>;
  total: Accessor<number>;
  pageSize: Accessor<number>;
  itemLabel?: string;
};

const btnClass =
  "min-h-[44px] px-4 py-2.5 btn btn-neutral btn-sm sm:btn-md gap-2 touch-manipulation";

export default function AdminPagination(props: Props) {
  const from = () =>
    props.total() === 0 ? 0 : props.page() * props.pageSize() + 1;
  const to = () =>
    Math.min((props.page() + 1) * props.pageSize(), props.total());

  return (
    <div class="flex flex-wrap gap-2 justify-between items-center w-full">
      <span class="text-sm text-base-content/60">
        {props.itemLabel
          ? `${props.total()} ${props.itemLabel} · `
          : ""}
        {props.total() === 0
          ? "0"
          : `${from()}–${to()} di ${props.total()}`}
        {" · "}
        pagina {props.page() + 1} di {props.totalPages()}
      </span>
      <div class="flex gap-2">
        <button
          type="button"
          disabled={props.page() <= 0}
          onClick={() =>
            props.setPage((p) => Math.max(0, p - 1))
          }
          class={btnClass}
          aria-label="Pagina precedente"
        >
          <MdiChevronLeft class="w-5 h-5 shrink-0" aria-hidden />
          <span class="hidden sm:inline">Precedente</span>
        </button>
        <button
          type="button"
          disabled={props.page() >= props.totalPages() - 1}
          onClick={() =>
            props.setPage((p) =>
              Math.min(props.totalPages() - 1, p + 1)
            )
          }
          class={btnClass}
          aria-label="Pagina successiva"
        >
          <span class="hidden sm:inline">Successivo</span>
          <MdiChevronRight class="w-5 h-5 shrink-0" aria-hidden />
        </button>
      </div>
    </div>
  );
}
