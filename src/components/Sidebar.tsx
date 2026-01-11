import * as Separator from "@radix-ui/react-separator";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import { useLayoutStore } from "../state/layoutStore";

const ensureLayExtension = (name: string) =>
  name.toLowerCase().endsWith(".lay") ? name : `${name}.lay`;

export const Sidebar = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    filename,
    rawXml,
    project,
    exportFileHandle,
    setFile,
    createNewProject,
    addLamp,
    exportLay,
    setExportFileHandle,
  } = useLayoutStore((state) => ({
    filename: state.filename,
    rawXml: state.rawXml,
    project: state.project,
    exportFileHandle: state.exportFileHandle,
    setFile: state.setFile,
    createNewProject: state.createNewProject,
    addLamp: state.addLamp,
    exportLay: state.exportLay,
    setExportFileHandle: state.setExportFileHandle,
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

  const writeExport = async (
    handle: FileSystemFileHandle,
    xml: string
  ): Promise<void> => {
    const writable = await handle.createWritable();
    await writable.write(xml);
    await writable.close();
  };

  const requestExportHandle = async (
    xml: string
  ): Promise<FileSystemFileHandle | null> => {
    if (!("showSaveFilePicker" in window)) {
      return null;
    }
    const suggestedName = ensureLayExtension(filename ?? "layout.lay");
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: "MAME layout",
          accept: { "application/xml": [".lay"] },
        },
      ],
    });
    if (handle.name.toLowerCase().endsWith(".lay")) {
      await writeExport(handle, xml);
      return handle;
    }
    const normalizedHandle = await window.showSaveFilePicker({
      suggestedName: ensureLayExtension(handle.name),
      types: [
        {
          description: "MAME layout",
          accept: { "application/xml": [".lay"] },
        },
      ],
    });
    await writeExport(normalizedHandle, xml);
    return normalizedHandle;
  };

  const handleExport = async () => {
    const xml = exportLay();
    if (!xml) {
      return;
    }
    if (exportFileHandle) {
      await writeExport(exportFileHandle, xml);
      return;
    }
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = ensureLayExtension(filename ?? "layout.lay");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportAs = async () => {
    const xml = exportLay();
    if (!xml) {
      return;
    }
    try {
      const handle = await requestExportHandle(xml);
      if (!handle) {
        return;
      }
      setExportFileHandle(handle);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      throw error;
    }
  };

  return (
    <aside className="flex h-full w-64 flex-col gap-6 border-r border-slate-800 bg-slate-900 p-4">
      <div className="space-y-2">
        <button
          type="button"
          onClick={createNewProject}
          className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          New project
        </button>
        <button
          type="button"
          onClick={handleOpenClick}
          className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Open .lay
        </button>
        <button
          type="button"
          onClick={addLamp}
          disabled={!project}
          className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add lamp
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={!project && !rawXml}
          className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export .lay
        </button>
        <button
          type="button"
          onClick={handleExportAs}
          disabled={!project && !rawXml}
          className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export .lay as...
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
