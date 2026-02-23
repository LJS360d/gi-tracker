import { A, useLocation } from "@solidjs/router";
import { ArrowLeft, Settings, ImageIcon } from "lucide-solid";
import { useI18n } from "~/i18n";

export default function AdminLayout(props: { children?: import("solid-js").JSX.Element }) {
  const { t } = useI18n();
  const location = useLocation();
  const isConfig = () => location.pathname === "/admin";
  const isMedia = () => location.pathname.startsWith("/admin/media");

  return (
    <div class="min-h-screen min-h-[100dvh] bg-[#0d0d0d] flex flex-col pb-16 md:pb-0 md:flex-row">
      <header class="sticky top-0 z-40 shrink-0 border-b border-neutral-800 bg-[#1a1a1a] pt-[env(safe-area-inset-top)]">
        <div class="flex md:flex-col items-center justify-between gap-3 py-3 min-h-14 md:min-h-12">
          <A
            href="/"
            class="flex items-center gap-2 min-h-[44px] min-w-[44px] -ml-1 pl-1 pr-2 text-neutral-400 active:bg-neutral-800 active:text-white md:hover:bg-neutral-800 md:hover:text-white touch-manipulation"
          >
            <ArrowLeft class="h-5 w-5 shrink-0" />
            <span class="text-base">{t("admin.backToMap")}</span>
          </A>
          <nav class="hidden md:w-full md:flex md:flex-col md:items-center md:gap-1">
            <A
              href="/admin"
              class="px-4 py-2.5 text-sm min-h-[44px] flex gap-2 items-center touch-manipulation md:w-full"
              classList={{
                "bg-neutral-800 text-white": isConfig(),
                "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200": !isConfig()
              }}
              end
            >
              <Settings class="h-6 w-6 shrink-0" aria-hidden />
              {t("admin.config")}
            </A>
            <A
              href="/admin/media"
              class="px-4 py-2.5 text-sm min-h-[44px] gap-2 flex items-center touch-manipulation md:w-full"
              classList={{
                "bg-neutral-800 text-white": isMedia(),
                "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200": !isMedia()
              }}
            >
              <ImageIcon class="h-6 w-6 shrink-0" aria-hidden />
              {t("admin.media")}
            </A>
          </nav>
        </div>
      </header>

      <main class="flex-1 overflow-auto px-4 py-4 md:px-8 md:py-6 pb-[env(safe-area-inset-bottom)]">
        {props.children}
      </main>

      <nav
        class="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-neutral-800 bg-[#1a1a1a] pb-[env(safe-area-inset-bottom)] md:hidden"
        role="tablist"
        aria-label={t("admin.navLabel")}
      >
        <A
          href="/admin"
          class="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 px-3 rounded-none text-sm touch-manipulation"
          classList={{
            "text-white bg-neutral-800/80": isConfig(),
            "text-neutral-400 active:bg-neutral-800/50": !isConfig()
          }}
          end
          aria-current={isConfig() ? "page" : undefined}
        >
          <Settings class="h-6 w-6 shrink-0" aria-hidden />
          <span>{t("admin.config")}</span>
        </A>
        <A
          href="/admin/media"
          class="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 px-3 rounded-none text-sm touch-manipulation"
          classList={{
            "text-white bg-neutral-800/80": isMedia(),
            "text-neutral-400 active:bg-neutral-800/50": !isMedia()
          }}
          aria-current={isMedia() ? "page" : undefined}
        >
          <ImageIcon class="h-6 w-6 shrink-0" aria-hidden />
          <span>{t("admin.media")}</span>
        </A>
      </nav>
    </div>
  );
}
