import type { JSX } from "solid-js";

type Props = {
  title: string;
  description?: string;
  error?: string | null;
  maxWidth?: "md" | "lg" | "xl" | "4xl" | "6xl";
  children: JSX.Element;
};

const maxWidthClass = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
};

export default function AdminSection(props: Props) {
  const maxClass = () =>
    maxWidthClass[props.maxWidth ?? "lg"];

  return (
    <div
      class={`w-full ${maxClass()} text-base-content/80`}
    >
      <h2 class="text-xl font-light text-base-content mb-2">
        {props.title}
      </h2>
      {props.description && (
        <p class="text-base-content/60 mb-4 text-sm md:text-base">
          {props.description}
        </p>
      )}
      {props.error && (
        <p class="mb-4 text-error">
          {props.error}
          {props.error === "Sessione scaduta." && (
            <>
              {" "}
              <a href="/admin" class="underline">
                Accedi di nuovo
              </a>
            </>
          )}
        </p>
      )}
      {props.children}
    </div>
  );
}
