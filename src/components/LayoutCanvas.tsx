import { useMemo, useRef } from "react";
import type { PointerEvent } from "react";
import type { Lamp } from "../lay/types";
import { useLayoutStore } from "../state/layoutStore";

type DragState = {
  id: string;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  originWidth: number;
  originHeight: number;
};

const MIN_SIZE = 20;

export const LayoutCanvas = () => {
  const {
    project,
    selectedLampId,
    selectLamp,
    updateLampPosition,
    updateLampSize,
  } = useLayoutStore((state) => ({
    project: state.project,
    selectedLampId: state.selectedLampId,
    selectLamp: state.selectLamp,
    updateLampPosition: state.updateLampPosition,
    updateLampSize: state.updateLampSize,
  }));

  const dragState = useRef<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const lampsById = useMemo(() => {
    const map = new Map<string, Lamp>();
    project?.lamps.forEach((lamp) => map.set(lamp.id, lamp));
    return map;
  }, [project]);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-slate-700 text-sm text-slate-500">
        Create a new project or open a .lay file to start.
      </div>
    );
  }

  const beginDrag = (
    event: PointerEvent<HTMLDivElement>,
    lamp: Lamp,
    mode: "move" | "resize"
  ) => {
    event.stopPropagation();
    selectLamp(lamp.id);
    dragState.current = {
      id: lamp.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      originX: lamp.x,
      originY: lamp.y,
      originWidth: lamp.width,
      originHeight: lamp.height,
    };
    containerRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) {
      return;
    }
    const { id, mode, startX, startY, originX, originY, originWidth, originHeight } =
      dragState.current;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (mode === "move") {
      updateLampPosition(id, originX + dx, originY + dy);
    } else {
      updateLampSize(
        id,
        Math.max(MIN_SIZE, originWidth + dx),
        Math.max(MIN_SIZE, originHeight + dy)
      );
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current) {
      dragState.current = null;
      containerRef.current?.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-auto rounded-md border border-slate-800 bg-slate-950"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerDown={() => selectLamp(null)}
    >
      <div
        className="relative bg-slate-950"
        style={{ width: project.width, height: project.height }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(#0f172a_1px,transparent_1px),linear-gradient(90deg,#0f172a_1px,transparent_1px)] bg-[size:32px_32px]" />
        {project.lamps.map((lamp) => {
          const isSelected = lamp.id === selectedLampId;
          return (
            <div
              key={lamp.id}
              className={`absolute flex items-center justify-center rounded-full border ${
                isSelected
                  ? "border-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.3)]"
                  : "border-slate-700"
              }`}
              style={{
                left: lamp.x,
                top: lamp.y,
                width: lamp.width,
                height: lamp.height,
                background: lamp.offColor.hex,
              }}
              onPointerDown={(event) => beginDrag(event, lamp, "move")}
            >
              <span className="text-[10px] text-slate-200/80">{lamp.name}</span>
              <div
                className="absolute bottom-0 right-0 h-3 w-3 translate-x-1/2 translate-y-1/2 cursor-se-resize rounded-full border border-emerald-400 bg-slate-900"
                onPointerDown={(event) => beginDrag(event, lamp, "resize")}
              />
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-md bg-slate-900/80 px-3 py-2 text-xs text-slate-200">
        {lampsById.get(selectedLampId ?? "")?.name ?? "No lamp selected"}
      </div>
    </div>
  );
};
