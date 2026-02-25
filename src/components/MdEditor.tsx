import { onMount, onCleanup } from "solid-js";
import "easymde/dist/easymde.min.css";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export function MdEditor(props: Props) {
  let textAreaRef: HTMLTextAreaElement | undefined;
  let mdeInstance: any = null;

  onMount(async () => {
    const { default: EasyMDE } = await import("easymde");

    if (!textAreaRef) return;

    mdeInstance = new EasyMDE({
      element: textAreaRef,
      initialValue: props.value,
      spellChecker: false,
      status: false,
      nativeSpellcheck: false,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "link",
        "code",
        "|",
        "undo",
        "redo",
        "preview",
      ],
      minHeight: "150px",
      forceSync: true, // Crucial for PWA form submission
    });

    // Sync changes back to Solid signal
    mdeInstance.codemirror.on("change", () => {
      props.onChange(mdeInstance.value());
    });
  });

  onCleanup(() => {
    if (mdeInstance) {
      mdeInstance.toTextArea();
      mdeInstance = null;
    }
  });

  return (
    <div class="mde-container w-full prose-invert">
      <textarea ref={textAreaRef} class="hidden" />
    </div>
  );
}
