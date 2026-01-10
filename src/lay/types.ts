export type RgbaColor = {
  hex: string;
  alpha: number;
};

export type Lamp = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onColor: RgbaColor;
  offColor: RgbaColor;
};

export type LayoutProject = {
  version: number;
  viewName: string;
  width: number;
  height: number;
  lamps: Lamp[];
};
