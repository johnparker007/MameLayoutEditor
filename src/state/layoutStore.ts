import { create } from "zustand";
import type { LayDocument } from "../lay/types";
import { parseLay } from "../lay/parse";

export type LayoutState = {
  filename: string | null;
  rawXml: string | null;
  document: LayDocument | null;
  setFile: (filename: string, rawXml: string) => void;
  clearFile: () => void;
};

export const useLayoutStore = create<LayoutState>((set) => ({
  filename: null,
  rawXml: null,
  document: null,
  setFile: (filename, rawXml) =>
    set({
      filename,
      rawXml,
      document: parseLay(rawXml),
    }),
  clearFile: () => set({ filename: null, rawXml: null, document: null }),
}));
