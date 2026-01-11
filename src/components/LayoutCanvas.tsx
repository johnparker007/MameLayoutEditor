import { useMemo, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
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
    addLamp,
    updateLampPosition,
    updateLampSize,
  } = useLayoutStore((state) => ({
    project: state.project,
    selectedLampId: state.selectedLampId,
    selectLamp: state.selectLamp,
    addLamp: state.addLamp,
    updateLampPosition: state.updateLampPosition,
    updateLampSize: state.updateLampSize,
  }));

  const dragState = useRef<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
  }>({ isOpen: false, x: 0, y: 0 });

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

  const openContextMenu = (
    event: MouseEvent<HTMLDivElement>,
    lampId?: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (lampId) {
      selectLamp(lampId);
    }
    const bounds = containerRef.current?.getBoundingClientRect();
    const x = bounds ? event.clientX - bounds.left : event.clientX;
    const y = bounds ? event.clientY - bounds.top : event.clientY;
    setContextMenu({ isOpen: true, x, y });
  };

  const handleCanvasPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
    selectLamp(null);
  };

  const handleAddLamp = () => {
    addLamp();
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-auto rounded-md border border-slate-800 bg-slate-950"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerDown={handleCanvasPointerDown}
      onContextMenu={(event) => openContextMenu(event)}
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
              onPointerDown={(event) => {
                if (event.button !== 0) {
                  return;
                }
                beginDrag(event, lamp, "move");
              }}
              onContextMenu={(event) => openContextMenu(event, lamp.id)}
            >
              <span className="text-[10px] text-slate-200/80">{lamp.name}</span>
              <div
                className="absolute bottom-0 right-0 h-3 w-3 translate-x-1/2 translate-y-1/2 cursor-se-resize rounded-full border border-emerald-400 bg-slate-900"
                onPointerDown={(event) => {
                  if (event.button !== 0) {
                    return;
                  }
                  beginDrag(event, lamp, "resize");
                }}
              />
            </div>
          );
        })}
      </div>
      {contextMenu.isOpen ? (
        <div
          className="absolute z-10 min-w-[160px] rounded-md border border-slate-800 bg-slate-900 p-1 text-sm text-slate-200 shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Lamps
          </div>
          <div className="ml-2 rounded-md border border-slate-800 bg-slate-950">
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              onClick={handleAddLamp}
            >
              Lamp
            </button>
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-md bg-slate-900/80 px-3 py-2 text-xs text-slate-200">
        {lampsById.get(selectedLampId ?? "")?.name ?? "No lamp selected"}
      </div>
    </div>
  );
};
