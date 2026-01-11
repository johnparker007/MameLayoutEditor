import { useMemo } from "react";
import { useLayoutStore } from "../state/layoutStore";

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const LampInspector = () => {
  const {
    project,
    selectedLampId,
    updateLamp,
    updateLampColors,
  } = useLayoutStore((state) => ({
    project: state.project,
    selectedLampId: state.primarySelectedLampId,
    updateLamp: state.updateLamp,
    updateLampColors: state.updateLampColors,
  }));

  const selectedLamp = useMemo(() => {
    if (!project || !selectedLampId) {
      return null;
    }
    return project.lamps.find((lamp) => lamp.id === selectedLampId) ?? null;
  }, [project, selectedLampId]);

  if (!selectedLamp) {
    return (
      <div className="rounded-md border border-dashed border-slate-700 p-3 text-xs text-slate-500">
        Select a lamp to edit its properties.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs text-slate-300">
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Name
        </label>
        <input
          type="text"
          value={selectedLamp.name}
          onChange={(event) =>
            updateLamp(selectedLamp.id, { name: event.target.value })
          }
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-200"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            X
          </label>
          <input
            type="number"
            value={selectedLamp.x}
            onChange={(event) =>
              updateLamp(selectedLamp.id, {
                x: Number(event.target.value || 0),
              })
            }
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-200"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Y
          </label>
          <input
            type="number"
            value={selectedLamp.y}
            onChange={(event) =>
              updateLamp(selectedLamp.id, {
                y: Number(event.target.value || 0),
              })
            }
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-200"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Width
          </label>
          <input
            type="number"
            min={20}
            value={selectedLamp.width}
            onChange={(event) =>
              updateLamp(selectedLamp.id, {
                width: clampNumber(Number(event.target.value || 20), 20, 2000),
              })
            }
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-200"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Height
          </label>
          <input
            type="number"
            min={20}
            value={selectedLamp.height}
            onChange={(event) =>
              updateLamp(selectedLamp.id, {
                height: clampNumber(Number(event.target.value || 20), 20, 2000),
              })
            }
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-200"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Shape
        </label>
        <select
          value={selectedLamp.shape}
          onChange={(event) =>
            updateLamp(selectedLamp.id, {
              shape: event.target.value as "rectangle" | "disc",
            })
          }
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-200"
        >
          <option value="rectangle">Rectangle</option>
          <option value="disc">Disc</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Lamp colors
        </label>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-400">Off</span>
            <input
              type="color"
              value={selectedLamp.offColor.hex}
              onChange={(event) =>
                updateLampColors(
                  selectedLamp.id,
                  selectedLamp.onColor,
                  {
                    ...selectedLamp.offColor,
                    hex: event.target.value,
                  }
                )
              }
              className="h-8 w-10 rounded border border-slate-700 bg-slate-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-400">On</span>
            <input
              type="color"
              value={selectedLamp.onColor.hex}
              onChange={(event) =>
                updateLampColors(
                  selectedLamp.id,
                  { ...selectedLamp.onColor, hex: event.target.value },
                  selectedLamp.offColor
                )
              }
              className="h-8 w-10 rounded border border-slate-700 bg-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
