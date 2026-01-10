import type { LayoutProject, RgbaColor } from "./types";

const DEFAULT_ON_COLOR: RgbaColor = { hex: "#ff4d4d", alpha: 1 };
const DEFAULT_OFF_COLOR: RgbaColor = { hex: "#3b2f33", alpha: 1 };

export const createEmptyProject = (): LayoutProject => ({
  version: 2,
  viewName: "Main View",
  width: 800,
  height: 600,
  lamps: [],
});

export const createLamp = (index: number): LayoutProject["lamps"][number] => ({
  id: `lamp-${Date.now()}-${index}`,
  name: `Lamp ${index + 1}`,
  x: 80 + index * 24,
  y: 80 + index * 24,
  width: 60,
  height: 60,
  onColor: { ...DEFAULT_ON_COLOR },
  offColor: { ...DEFAULT_OFF_COLOR },
});

export const parseLay = (xml: string): LayoutProject => {
  return {
    ...createEmptyProject(),
    viewName: "Imported Layout",
  };
};

const hexToRgb = (hex: string) => {
  const sanitized = hex.replace("#", "");
  const full =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((char) => char + char)
          .join("")
      : sanitized.padStart(6, "0");
  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const formatNumber = (value: number) => {
  const rounded = Number(value.toFixed(3));
  return rounded.toString();
};

const serializeColor = (color: RgbaColor) => {
  const rgb = hexToRgb(color.hex);
  const red = formatNumber(rgb.r / 255);
  const green = formatNumber(rgb.g / 255);
  const blue = formatNumber(rgb.b / 255);
  const alpha = formatNumber(color.alpha);
  return { red, green, blue, alpha };
};

export const serializeLay = (project: LayoutProject): string => {
  const lines: string[] = [];
  lines.push("<mamelayout version=\"2\">");
  project.lamps.forEach((lamp) => {
    const off = serializeColor(lamp.offColor);
    const on = serializeColor(lamp.onColor);
    const safeName = `lamp_${lamp.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    lines.push(`  <element name=\"${safeName}\" defstate=\"0\">`);
    lines.push(
      `    <disk state=\"0\"><color red=\"${off.red}\" green=\"${off.green}\" blue=\"${off.blue}\" alpha=\"${off.alpha}\" /></disk>`
    );
    lines.push(
      `    <disk state=\"1\"><color red=\"${on.red}\" green=\"${on.green}\" blue=\"${on.blue}\" alpha=\"${on.alpha}\" /></disk>`
    );
    lines.push("  </element>");
  });
  lines.push(`  <view name=\"${project.viewName}\">`);
  lines.push(
    `    <bounds x=\"0\" y=\"0\" width=\"${formatNumber(
      project.width
    )}\" height=\"${formatNumber(project.height)}\" />`
  );
  project.lamps.forEach((lamp) => {
    const safeName = `lamp_${lamp.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    lines.push(`    <element ref=\"${safeName}\">`);
    lines.push(
      `      <bounds x=\"${formatNumber(lamp.x)}\" y=\"${formatNumber(
        lamp.y
      )}\" width=\"${formatNumber(lamp.width)}\" height=\"${formatNumber(
        lamp.height
      )}\" />`
    );
    lines.push("    </element>");
  });
  lines.push("  </view>");
  lines.push("</mamelayout>");
  return lines.join("\n");
};
