export const AboutPage = () => {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">About</h1>
      <p className="text-sm text-slate-300">
        This scaffold provides a minimal shell for editing MAME .lay layout
        files. Parsing and layout-specific editing capabilities will be added
        once sample layouts are available.
      </p>
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
        Current focus: project setup, routing, state handling, and basic UI
        structure.
      </div>
    </div>
  );
};
