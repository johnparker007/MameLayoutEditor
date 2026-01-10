import * as Separator from "@radix-ui/react-separator";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import { useLayoutStore } from "../state/layoutStore";

export const Sidebar = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { filename, rawXml, setFile } = useLayoutStore((state) => ({
    filename: state.filename,
    rawXml: state.rawXml,
    setFile: state.setFile,
  }));

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    setFile(file.name, text);
    event.target.value = "";
  };

  const handleSave = () => {
    if (!rawXml) {
      return;
    }
    const blob = new Blob([rawXml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename ?? "layout.lay";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="flex h-full w-64 flex-col gap-6 border-r border-slate-800 bg-slate-900 p-4">
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleOpenClick}
          className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Open .lay
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!rawXml}
          className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save .lay
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".lay,.xml"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <Separator.Root className="h-px w-full bg-slate-800" />
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Assets
        </h2>
        <div className="rounded-md border border-dashed border-slate-700 p-3 text-xs text-slate-500">
          Asset list will appear here.
        </div>
      </div>
    </aside>
  );
};
