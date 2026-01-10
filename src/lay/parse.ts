import type { LayDocument } from "./types";

export const parseLay = (xml: string): LayDocument => {
  return {
    version: "0.0",
    elements: [],
    rawXml: xml,
  };
};

export const serializeLay = (doc: LayDocument): string => {
  return doc.rawXml ?? "";
};
