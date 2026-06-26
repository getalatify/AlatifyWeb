import MarkdownIt from "markdown-it";

interface Token {
  type: string;
  tag: string;
  content: string;
  children: Token[] | null;
  markup: string;
  info: string;
  nesting: number;
  block: boolean;
  hidden: boolean;
  map: [number, number] | null;
  level: number;
  attrs: [string, string][] | null;
  attrGet: (name: string) => string | null;
}

// Helper to fetch and convert a remote URL to base64 data URL
export async function getBase64FromUrl(url: string): Promise<string | null> {
  if (url.startsWith("data:image/")) {
    return url;
  }
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to load remote image: " + url, err);
    return null;
  }
}

// Extract first H1 content from Markdown tokens to use as file name
export function getSlugifiedTitle(tokens: Token[]): string {
  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i].type === "heading_open" && tokens[i].tag === "h1") {
      const nextToken = tokens[i + 1];
      if (nextToken && nextToken.type === "inline") {
        const text = nextToken.content;
        return text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/[-\s]+/g, "-");
      }
    }
  }
  return "document";
}

interface InlineStyle {
  bold?: boolean;
  italics?: boolean;
  decoration?: "lineThrough" | "underline";
}

// Map inline tokens to pdfmake text children runs
export function mapInlineTokens(children: Token[] | null, imageMap: Map<string, string>): Record<string, unknown>[] {
  if (!children) return [];
  const result: Record<string, unknown>[] = [];
  const activeStyles: InlineStyle = {};
  let currentLink: string | null = null;

  for (const token of children) {
    if (token.type === "text") {
      result.push({
        text: token.content,
        ...activeStyles,
        ...(currentLink ? { link: currentLink, color: "#0066cc", decoration: "underline" } : {}),
      });
    } else if (token.type === "strong_open") {
      activeStyles.bold = true;
    } else if (token.type === "strong_close") {
      delete activeStyles.bold;
    } else if (token.type === "em_open") {
      activeStyles.italics = true;
    } else if (token.type === "em_close") {
      delete activeStyles.italics;
    } else if (token.type === "s_open") {
      activeStyles.decoration = "lineThrough";
    } else if (token.type === "s_close") {
      delete activeStyles.decoration;
    } else if (token.type === "link_open") {
      const href = token.attrGet("href");
      currentLink = href;
    } else if (token.type === "link_close") {
      currentLink = null;
    } else if (token.type === "code_inline") {
      result.push({
        text: token.content,
        // Inherits default Roboto font. Code block text has background fill to be visually distinct.
        background: "#f4f4f5",
        color: "#c7254e",
        ...activeStyles,
      });
    } else if (token.type === "image") {
      const src = token.attrGet("src");
      if (src) {
        const base64 = imageMap.get(src);
        if (base64) {
          result.push({
            image: base64,
            width: 150,
            margin: [0, 5, 0, 5],
          });
        }
      }
    }
  }
  return result;
}

// Main parser to compile tokens list to pdfmake content nodes
export function tokensToPdfMake(tokens: Token[], imageMap: Map<string, string>): Record<string, unknown>[] {
  const content: Record<string, unknown>[] = [];
  const listStack: { type: "ul" | "ol"; index: number }[] = [];
  let blockquoteDepth = 0;
  let blockquoteBuffer: Record<string, unknown>[] = [];

  // Table state
  let inTable = false;
  let isHeader = false;
  let currentTable: Record<string, unknown>[][] = [];
  let currentRow: Record<string, unknown>[] = [];
  let currentCell: Record<string, unknown> | null = null;

  // List item state
  let inListItem = false;
  let isFirstListItemBlock = false;

  const pushToOutput = (item: Record<string, unknown>) => {
    if (blockquoteDepth > 0) {
      blockquoteBuffer.push(item);
    } else {
      content.push(item);
    }
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (inTable) {
      if (token.type === "thead_open") {
        isHeader = true;
      } else if (token.type === "thead_close") {
        isHeader = false;
      } else if (token.type === "tr_open") {
        currentRow = [];
      } else if (token.type === "tr_close") {
        currentTable.push(currentRow);
      } else if (token.type === "th_open" || token.type === "td_open") {
        currentCell = null;
      } else if (token.type === "th_close" || token.type === "td_close") {
        if (currentCell) {
          currentRow.push(currentCell);
        }
      } else if (token.type === "inline") {
        const mappedInline = mapInlineTokens(token.children, imageMap);
        currentCell = {
          text: mappedInline,
          bold: isHeader,
          ...(isHeader ? { fillColor: "#f8fafc" } : {}),
        };
      } else if (token.type === "table_close") {
        inTable = false;
        pushToOutput({
          table: {
            headerRows: 1,
            widths: Array(currentTable[0]?.length || 0).fill("*"),
            body: currentTable,
          },
          layout: {
            hLineWidth: (rowIndex: number, node: { table: { body: unknown[] } }) =>
              rowIndex === 0 || rowIndex === node.table.body.length ? 1 : 0.5,
            vLineWidth: () => 0,
            hLineColor: () => "#e2e8f0",
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 6,
            paddingBottom: () => 6,
          },
          margin: [0, 8, 0, 12],
        });
      }
      continue;
    }

    switch (token.type) {
      case "heading_open": {
        const level = parseInt(token.tag.slice(1)) || 1;
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === "inline") {
          let fontSize = 12;
          let margin: [number, number, number, number] = [0, 8, 0, 4];
          if (level === 1) {
            fontSize = 22;
            margin = [0, 16, 0, 8];
          } else if (level === 2) {
            fontSize = 18;
            margin = [0, 14, 0, 6];
          } else if (level === 3) {
            fontSize = 14;
            margin = [0, 12, 0, 4];
          } else if (level === 4) {
            fontSize = 12;
            margin = [0, 10, 0, 4];
          }

          const headingContent = mapInlineTokens(nextToken.children, imageMap);

          let leftMargin = margin[0];
          if (inListItem) {
            leftMargin = (listStack.length - 1) * 16 + (isFirstListItemBlock ? 0 : 12);
            isFirstListItemBlock = false;
          }

          pushToOutput({
            text: headingContent,
            fontSize,
            bold: true,
            keepWithNext: true,
            margin: [leftMargin, margin[1], margin[2], margin[3]],
          });
          i++; // skip inline token since we processed it
        }
        break;
      }

      case "paragraph_open": {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === "inline") {
          let leftMargin = 0;
          let isTaskItem = false;
          let isChecked = false;
          const inlineContent = nextToken.children || [];

          // Detect task list checkbox
          if (inListItem && isFirstListItemBlock && inlineContent.length > 0) {
            const firstToken = inlineContent[0];
            if (firstToken && firstToken.type === "text" && firstToken.content) {
              const textVal = firstToken.content;
              if (textVal.startsWith("[ ] ") || textVal.startsWith("[x] ") || textVal.startsWith("[X] ")) {
                isTaskItem = true;
                isChecked = textVal.toLowerCase().startsWith("[x] ");
                // Strip the checkbox characters from the text token
                firstToken.content = textVal.slice(4);
              }
            }
          }

          if (inListItem) {
            leftMargin = (listStack.length - 1) * 16 + (isFirstListItemBlock ? 0 : 12);
          }

          const mappedInline = mapInlineTokens(inlineContent, imageMap);

          if (inListItem && isFirstListItemBlock) {
            if (isTaskItem) {
              // Prepend custom checkbox markers
              mappedInline.unshift(
                isChecked
                  ? { text: "[x] ", bold: true, color: "#10b981" }
                  : { text: "[ ] ", bold: true, color: "#9ca3af" }
              );
            } else {
              // Prepend standard list bullet/number
              const parentList = listStack[listStack.length - 1];
              if (parentList) {
                if (parentList.type === "ul") {
                  mappedInline.unshift({ text: "•  ", bold: true });
                } else {
                  mappedInline.unshift({ text: `${parentList.index}.  `, bold: true });
                  parentList.index++;
                }
              }
            }
            isFirstListItemBlock = false;
          }

          pushToOutput({
            text: mappedInline,
            margin: [leftMargin, 0, 0, inListItem ? 4 : 8],
          });
          i++; // skip inline token since we processed it
        }
        break;
      }

      case "blockquote_open": {
        blockquoteDepth++;
        if (blockquoteDepth === 1) {
          blockquoteBuffer = [];
        }
        break;
      }

      case "blockquote_close": {
        blockquoteDepth--;
        if (blockquoteDepth === 0) {
          // Render blockquote contents inside single cell table
          content.push({
            table: {
              widths: ["*"],
              body: [
                [
                  {
                    stack: blockquoteBuffer,
                    margin: [8, 4, 8, 4],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: (colIndex: number) => (colIndex === 0 ? 3 : 0),
              vLineColor: () => "#cbd5e1",
              fillColor: () => "#f8fafc",
            },
            margin: [0, 8, 0, 8],
          });
        }
        break;
      }

      case "bullet_list_open": {
        listStack.push({ type: "ul", index: 1 });
        break;
      }

      case "bullet_list_close": {
        listStack.pop();
        break;
      }

      case "ordered_list_open": {
        listStack.push({ type: "ol", index: 1 });
        break;
      }

      case "ordered_list_close": {
        listStack.pop();
        break;
      }

      case "list_item_open": {
        inListItem = true;
        isFirstListItemBlock = true;
        break;
      }

      case "list_item_close": {
        inListItem = false;
        break;
      }

      case "table_open": {
        inTable = true;
        currentTable = [];
        break;
      }

      case "fence": {
        // Monospaced Code Blocks
        pushToOutput({
          table: {
            widths: ["*"],
            body: [
              [
                {
                  text: token.content.replace(/\n$/, ""),
                  // Inherits default Roboto font. Code block text has background fill to be visually distinct.
                  fontSize: 9,
                  color: "#0f172a",
                  margin: [8, 6, 8, 6],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#e2e8f0",
            vLineColor: () => "#e2e8f0",
            fillColor: () => "#f8fafc",
          },
          margin: [0, 8, 0, 8],
        });
        break;
      }

      case "hr": {
        pushToOutput({
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 515,
              y2: 5,
              lineWidth: 0.5,
              lineColor: "#cbd5e1",
            },
          ],
          margin: [0, 12, 0, 12],
        });
        break;
      }

      default:
        break;
    }
  }

  return content;
}

// Top level compiler entry point
export async function compileMarkdownToPdf(markdownText: string): Promise<{
  docDefinition: Record<string, unknown>;
  filename: string;
  hasFailedImages: boolean;
}> {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  });

  const tokens = md.parse(markdownText, {}) as unknown as Token[];

  // Identify all image sources
  const imageUrls: string[] = [];
  const collectImageUrls = (tokensList: Token[]) => {
    for (const token of tokensList) {
      if (token.type === "image") {
        const src = token.attrGet("src");
        if (src) {
          imageUrls.push(src);
        }
      }
      if (token.children) {
        collectImageUrls(token.children);
      }
    }
  };
  collectImageUrls(tokens);

  // Fetch unique remote URLs
  const uniqueUrls = Array.from(new Set(imageUrls));
  const imageMap = new Map<string, string>();
  let hasFailedImages = false;

  await Promise.all(
    uniqueUrls.map(async (url) => {
      const base64 = await getBase64FromUrl(url);
      if (base64) {
        imageMap.set(url, base64);
      } else {
        hasFailedImages = true;
      }
    })
  );

  const filename = getSlugifiedTitle(tokens) + ".pdf";
  const pdfContent = tokensToPdfMake(tokens, imageMap);

  const docDefinition = {
    content: pdfContent,
    defaultStyle: {
      fontSize: 10,
      lineHeight: 1.4,
    },
    pageMargins: [40, 50, 40, 50] as [number, number, number, number],
  };

  return { docDefinition, filename, hasFailedImages };
}
