export const AI_TOOL_IDS = ["bg-remover", "upscaler"];

export const CHAIN_MAP: Record<string, string[]> = {
  "bg-remover":       ["compressor", "resizer", "watermark", "cropper", "converter"],
  "compressor":       ["resizer", "converter"],
  "resizer":          ["compressor", "cropper", "watermark", "converter"],
  "cropper":          ["compressor", "resizer", "watermark", "converter"],
  "watermark":        ["compressor", "converter"],
  "converter":        ["compressor", "resizer"],
};
