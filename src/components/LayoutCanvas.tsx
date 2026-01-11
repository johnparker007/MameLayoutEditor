import { useMemo, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import type { Lamp } from "../lay/types";
import { useLayoutStore } from "../state/layoutStore";

type DragState = {
  mode: "move" | "resize";
  startX: number;
  startY: number;
  lamps: Array<{
    id: string;
    originX: number;
    originY: number;
    originWidth: number;
    originHeight: number;
  }>;
};

const MIN_SIZE = 20;

export const LayoutCanvas = () => {
  const {
    project,
    selectedLampIds,
    primarySelectedLampId,
    setSelectedLamps,
    addLamp,
    bringLampToFront,
    sendLampToBack,
    updateLampPosition,
    updateLampSize,
  } = useLayoutStore((state) => ({
    project: state.project,
    selectedLampIds: state.selectedLampIds,
    primarySelectedLampId: state.primarySelectedLampId,
    setSelectedLamps: state.setSelectedLamps,
    addLamp: state.addLamp,
    bringLampToFront: state.bringLampToFront,
    sendLampToBack: state.sendLampToBack,
    updateLampPosition: state.updateLampPosition,
    updateLampSize: state.updateLampSize,
  }));

  const dragState = useRef<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectionState = useRef<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    additive: boolean;
    baseSelection: string[];
    isDragging: boolean;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
  }>({ isOpen: false, x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    isVisible: boolean;
  }>({ left: 0, top: 0, width: 0, height: 0, isVisible: false });

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

  const getCanvasPoint = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    const scrollLeft = containerRef.current?.scrollLeft ?? 0;
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    return {
      x: (bounds ? event.clientX - bounds.left : event.clientX) + scrollLeft,
      y: (bounds ? event.clientY - bounds.top : event.clientY) + scrollTop,
    };
  };

  const updateSelection = (ids: string[], primaryId?: string | null) => {
    const deduped = Array.from(new Set(ids));
    setSelectedLamps(deduped, primaryId ?? deduped[0] ?? null);
  };

  const handleLampPointerDown = (
    event: PointerEvent<HTMLDivElement>,
    lamp: Lamp,
    mode: "move" | "resize"
  ) => {
    if (event.button !== 0) {
      return;
    }
    event.stopPropagation();
    const isAlreadySelected = selectedLampIds.includes(lamp.id);
    let nextSelection = selectedLampIds;
    let primaryId: string | null = lamp.id;
    if (event.shiftKey) {
      if (isAlreadySelected) {
        nextSelection = selectedLampIds.filter((id) => id !== lamp.id);
        primaryId = nextSelection[0] ?? null;
      } else {
        nextSelection = [...selectedLampIds, lamp.id];
      }
    } else if (!isAlreadySelected) {
      nextSelection = [lamp.id];
    }
    updateSelection(nextSelection, primaryId);
    if (nextSelection.includes(lamp.id)) {
      beginDrag(event, lamp, mode, nextSelection);
    }
  };

  const beginDrag = (
    event: PointerEvent<HTMLDivElement>,
    lamp: Lamp,
    mode: "move" | "resize",
    selectedIds: string[]
  ) => {
    const selectedLamps =
      mode === "move"
        ? project.lamps.filter((item) => selectedIds.includes(item.id))
        : [lamp];
    dragState.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      lamps: selectedLamps.map((item) => ({
        id: item.id,
        originX: item.x,
        originY: item.y,
        originWidth: item.width,
        originHeight: item.height,
      })),
    };
    containerRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) {
      if (!selectionState.current) {
        return;
      }
      const { x, y } = getCanvasPoint(event);
      selectionState.current.currentX = x;
      selectionState.current.currentY = y;
      selectionState.current.isDragging = true;
      const left = Math.min(selectionState.current.startX, x);
      const top = Math.min(selectionState.current.startY, y);
      const width = Math.abs(selectionState.current.startX - x);
      const height = Math.abs(selectionState.current.startY - y);
      setSelectionBox({ left, top, width, height, isVisible: true });
      return;
    }
    const { mode, startX, startY, lamps } = dragState.current;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (mode === "move") {
      lamps.forEach((item) => {
        updateLampPosition(item.id, item.originX + dx, item.originY + dy);
      });
    } else {
      const target = lamps[0];
      if (!target) {
        return;
      }
      updateLampSize(
        target.id,
        Math.max(MIN_SIZE, target.originWidth + dx),
        Math.max(MIN_SIZE, target.originHeight + dy)
      );
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current) {
      dragState.current = null;
      containerRef.current?.releasePointerCapture(event.pointerId);
    }
    if (selectionState.current) {
      const { startX, startY, currentX, currentY, additive, baseSelection, isDragging } =
        selectionState.current;
      if (isDragging) {
        const left = Math.min(startX, currentX);
        const right = Math.max(startX, currentX);
        const top = Math.min(startY, currentY);
        const bottom = Math.max(startY, currentY);
        const selectedInBox = project.lamps
          .filter(
            (lamp) =>
              lamp.x >= left &&
              lamp.y >= top &&
              lamp.x + lamp.width <= right &&
              lamp.y + lamp.height <= bottom
          )
          .map((lamp) => lamp.id);
        updateSelection(additive ? [...baseSelection, ...selectedInBox] : selectedInBox);
      }
      selectionState.current = null;
      setSelectionBox((prev) => ({ ...prev, isVisible: false }));
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
      if (!selectedLampIds.includes(lampId)) {
        updateSelection([lampId], lampId);
      } else {
        updateSelection(selectedLampIds, lampId);
      }
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
    if (!event.shiftKey) {
      updateSelection([]);
    }
    const { x, y } = getCanvasPoint(event);
    selectionState.current = {
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      additive: event.shiftKey,
      baseSelection: selectedLampIds,
      isDragging: false,
    };
    containerRef.current?.setPointerCapture(event.pointerId);
  };

  const handleAddLamp = () => {
    addLamp();
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  };

  const handleBringToFront = () => {
    if (!primarySelectedLampId) {
      return;
    }
    bringLampToFront(primarySelectedLampId);
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  };

  const handleSendToBack = () => {
    if (!primarySelectedLampId) {
      return;
    }
    sendLampToBack(primarySelectedLampId);
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
          const isSelected = selectedLampIds.includes(lamp.id);
          return (
            <div
              key={lamp.id}
              className={`absolute flex select-none items-center justify-center rounded-full border ${
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
                handleLampPointerDown(event, lamp, "move");
              }}
              onContextMenu={(event) => openContextMenu(event, lamp.id)}
            >
              <span className="text-[10px] text-slate-200/80">{lamp.name}</span>
              <div
                className="absolute bottom-0 right-0 h-3 w-3 translate-x-1/2 translate-y-1/2 cursor-se-resize rounded-full border border-emerald-400 bg-slate-900"
                onPointerDown={(event) => {
                  handleLampPointerDown(event, lamp, "resize");
                }}
              />
            </div>
          );
        })}
        {selectionBox.isVisible ? (
          <div
            className="pointer-events-none absolute border border-emerald-400 bg-emerald-400/10"
            style={{
              left: selectionBox.left,
              top: selectionBox.top,
              width: selectionBox.width,
              height: selectionBox.height,
            }}
          />
        ) : null}
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
          <div className="mt-2 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Order
          </div>
          <div className="ml-2 rounded-md border border-slate-800 bg-slate-950">
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent"
              onClick={handleBringToFront}
              disabled={!primarySelectedLampId}
            >
              Bring To Front
            </button>
            <button
              type="button"
              className="w-full border-t border-slate-800 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent"
              onClick={handleSendToBack}
              disabled={!primarySelectedLampId}
            >
              Send To Back
            </button>
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-md bg-slate-900/80 px-3 py-2 text-xs text-slate-200">
        {selectedLampIds.length === 0
          ? "No lamp selected"
          : selectedLampIds.length === 1
            ? lampsById.get(selectedLampIds[0])?.name ?? "1 lamp selected"
            : `${selectedLampIds.length} lamps selected`}
      </div>
    </div>
  );
};
