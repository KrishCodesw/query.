import { toSvg } from "html-to-image";

export async function exportSvg() {
  const el = document.querySelector(".react-flow");

  if (!el) return;

  const svg = await toSvg(el as HTMLElement);

  const link = document.createElement("a");
  link.download = "er-diagram.svg";
  link.href = svg;
  link.click();
}
