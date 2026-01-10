import { LayoutCanvas } from "../components/LayoutCanvas";
import { LampInspector } from "../components/LampInspector";
import { Sidebar } from "../components/Sidebar";

export const EditorPage = () => {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-1 gap-4">
          <section className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <LayoutCanvas />
          </section>
          <aside className="w-80 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <h2 className="text-sm font-semibold text-slate-200">Inspector</h2>
            <div className="mt-3 space-y-3">
              <LampInspector />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
