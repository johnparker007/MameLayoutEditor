import { create } from "zustand";
import type { LayoutProject, Lamp, RgbaColor } from "../lay/types";
import { createEmptyProject, createLamp, parseLay, serializeLay } from "../lay/parse";

type LayoutState = {
  filename: string | null;
  rawXml: string | null;
  project: LayoutProject | null;
  selectedLampId: string | null;
  exportFileHandle: FileSystemFileHandle | null;
  setFile: (filename: string, rawXml: string) => void;
  clearFile: () => void;
  createNewProject: () => void;
  addLamp: () => void;
  selectLamp: (id: string | null) => void;
  bringLampToFront: (id: string) => void;
  sendLampToBack: (id: string) => void;
  updateLamp: (id: string, updates: Partial<Lamp>) => void;
  updateLampPosition: (id: string, x: number, y: number) => void;
  updateLampSize: (id: string, width: number, height: number) => void;
  updateLampColors: (id: string, onColor: RgbaColor, offColor: RgbaColor) => void;
  exportLay: () => string | null;
  setExportFileHandle: (handle: FileSystemFileHandle | null) => void;
};

export const useLayoutStore = create<LayoutState>((set, get) => ({
  filename: null,
  rawXml: null,
  project: null,
  selectedLampId: null,
  exportFileHandle: null,
  setFile: (filename, rawXml) =>
    set({
      filename,
      rawXml,
      project: parseLay(rawXml),
      selectedLampId: null,
      exportFileHandle: null,
    }),
  clearFile: () =>
    set({
      filename: null,
      rawXml: null,
      project: null,
      selectedLampId: null,
      exportFileHandle: null,
    }),
  createNewProject: () =>
    set({
      filename: "untitled.lay",
      rawXml: null,
      project: createEmptyProject(),
      selectedLampId: null,
      exportFileHandle: null,
    }),
  addLamp: () => {
    const { project } = get();
    const nextProject = project ?? createEmptyProject();
    const lamp = createLamp(nextProject.lamps.length);
    set({
      project: {
        ...nextProject,
        lamps: [...nextProject.lamps, lamp],
      },
      selectedLampId: lamp.id,
    });
  },
  selectLamp: (id) => set({ selectedLampId: id }),
  bringLampToFront: (id) => {
    const { project } = get();
    if (!project) {
      return;
    }
    const index = project.lamps.findIndex((lamp) => lamp.id === id);
    if (index === -1) {
      return;
    }
    const reordered = [...project.lamps];
    const [lamp] = reordered.splice(index, 1);
    reordered.push(lamp);
    set({
      project: {
        ...project,
        lamps: reordered,
      },
    });
  },
  sendLampToBack: (id) => {
    const { project } = get();
    if (!project) {
      return;
    }
    const index = project.lamps.findIndex((lamp) => lamp.id === id);
    if (index === -1) {
      return;
    }
    const reordered = [...project.lamps];
    const [lamp] = reordered.splice(index, 1);
    reordered.unshift(lamp);
    set({
      project: {
        ...project,
        lamps: reordered,
      },
    });
  },
  updateLamp: (id, updates) => {
    const { project } = get();
    if (!project) {
      return;
    }
    set({
      project: {
        ...project,
        lamps: project.lamps.map((lamp) =>
          lamp.id === id ? { ...lamp, ...updates } : lamp
        ),
      },
    });
  },
  updateLampPosition: (id, x, y) => {
    const { project } = get();
    if (!project) {
      return;
    }
    set({
      project: {
        ...project,
        lamps: project.lamps.map((lamp) =>
          lamp.id === id ? { ...lamp, x, y } : lamp
        ),
      },
    });
  },
  updateLampSize: (id, width, height) => {
    const { project } = get();
    if (!project) {
      return;
    }
    set({
      project: {
        ...project,
        lamps: project.lamps.map((lamp) =>
          lamp.id === id ? { ...lamp, width, height } : lamp
        ),
      },
    });
  },
  updateLampColors: (id, onColor, offColor) => {
    const { project } = get();
    if (!project) {
      return;
    }
    set({
      project: {
        ...project,
        lamps: project.lamps.map((lamp) =>
          lamp.id === id ? { ...lamp, onColor, offColor } : lamp
        ),
      },
    });
  },
  exportLay: () => {
    const { project } = get();
    if (!project) {
      return null;
    }
    return serializeLay(project);
  },
  setExportFileHandle: (handle) => set({ exportFileHandle: handle }),
}));
