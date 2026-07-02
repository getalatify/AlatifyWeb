export const AI_TOOL_IDS = ["bg-remover", "upscaler"];

export const CHAIN_MAP: Record<string, string[]> = {
  "bg-remover": ["compressor", "resizer"],
  "compressor": ["resizer"],
  "resizer": ["compressor"],
};
