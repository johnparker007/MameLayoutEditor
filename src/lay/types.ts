export type LayElement = {
  id: string;
  type: string;
};

export type LayDocument = {
  version: string;
  elements: LayElement[];
  rawXml?: string;
};
