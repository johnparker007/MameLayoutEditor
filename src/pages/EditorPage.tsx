import { Sidebar } from "../components/Sidebar";

export const EditorPage = () => {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-1 gap-4">
          <section className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <div className="flex h-full items-center justify-center rounded-md border border-dashed border-slate-700 text-sm text-slate-500">
              Canvas / viewport placeholder
            </div>
          </section>
          <aside className="w-72 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <h2 className="text-sm font-semibold text-slate-200">Inspector</h2>
            <div className="mt-3 space-y-3 text-xs text-slate-400">
              <div className="rounded-md border border-dashed border-slate-700 p-3">
                Selection details will appear here.
              </div>
              <div className="rounded-md border border-dashed border-slate-700 p-3">
                Property editors placeholder.
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
