/**
 * Alternative XML parser for Deno that doesn't rely on DOMParser's text/xml support
 * Uses a simple approach with string manipulation and regular expressions
 */

interface SimpleXMLNode {
  tag: string;
  content: string;
  attributes: Record<string, string>;
  children: SimpleXMLNode[];
}

/**
 * Parses XML text into a simplified DOM-like structure
 * @param xml The XML string to parse
 * @returns A simple object representing the XML structure
 */
export function parseXML(xml: string): SimpleXMLNode[] {
  // First, protect CDATA sections by replacing them with a marker
  // This ensures CDATA content doesn't interfere with the XML parsing
  const cdataMarkers: string[] = [];
  let cdataCounter = 0;

  xml = xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (match, cdataContent) => {
    const marker = `__CDATA_MARKER_${cdataCounter}__`;
    cdataMarkers[cdataCounter] = cdataContent;
    cdataCounter++;
    return marker;
  });

  // Clean up the XML - remove comments and processing instructions
  xml = xml.replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?[\s\S]*?\?>/g, "")
    .trim();

  // Parse the XML
  const nodes = parseNodes(xml);

  // Restore CDATA content in the parsed tree
  restoreCDATAMarkers(nodes, cdataMarkers);

  return nodes;
}

/**
 * Recursively restores CDATA markers with their original content
 */
function restoreCDATAMarkers(
  nodes: SimpleXMLNode[],
  cdataMarkers: string[],
): void {
  for (const node of nodes) {
    // Check and replace markers in content
    for (let i = 0; i < cdataMarkers.length; i++) {
      const marker = `__CDATA_MARKER_${i}__`;
      if (node.content.includes(marker)) {
        node.content = node.content.replace(marker, cdataMarkers[i]);
      }
    }

    // Process children recursively
    if (node.children.length > 0) {
      restoreCDATAMarkers(node.children, cdataMarkers);
    }
  }
}

/**
 * Cleans CDATA sections in content
 * This is a safety measure for any CDATA that might have been missed
 * @param content The content text possibly containing CDATA sections
 * @returns Cleaned content with CDATA wrappers removed
 */
function cleanCDATAContent(content: string): string {
  // Check if the content contains CDATA sections
  if (content.includes("<![CDATA[")) {
    // Replace all CDATA sections with their content
    return content.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  }
  return content;
}

/**
 * Recursively parses XML nodes
 */
function parseNodes(xml: string): SimpleXMLNode[] {
  const nodes: SimpleXMLNode[] = [];
  const tagRegex =
    /<([^\s>\/]+)([^>]*)>([\s\S]*?)<\/\1>|<([^\s>\/]+)([^>]*?)\/>/g;

  let match;
  while ((match = tagRegex.exec(xml)) !== null) {
    if (match[4]) {
      // Self-closing tag
      nodes.push({
        tag: match[4],
        content: "",
        attributes: parseAttributes(match[5] || ""),
        children: [],
      });
    } else {
      // Regular tag with content
      const tag = match[1];
      const attrsStr = match[2] || "";
      let content = match[3] || "";

      // Clean any remaining CDATA sections
      content = cleanCDATAContent(content);

      // Check if content has child tags
      if (/<[^\s>\/]+/.test(content)) {
        // Has child nodes
        nodes.push({
          tag,
          content: cleanCDATAContent(
            content.replace(/<[^>]*>[\s\S]*?<\/[^>]*>|<[^>]*\/>/g, "")
              .trim(),
          ),
          attributes: parseAttributes(attrsStr),
          children: parseNodes(content),
        });
      } else {
        // No child nodes
        nodes.push({
          tag,
          content: cleanCDATAContent(content.trim()),
          attributes: parseAttributes(attrsStr),
          children: [],
        });
      }
    }
  }

  return nodes;
}

/**
 * Parses XML attributes from a string
 */
function parseAttributes(str: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

  let match;
  while ((match = attrRegex.exec(str)) !== null) {
    const name = match[1];
    const value = match[2] !== undefined ? match[2] : match[3];
    attrs[name] = value;
  }

  return attrs;
}

/**
 * Gets a tag's text content
 */
export function getTagContent(root: SimpleXMLNode[], tagName: string): string {
  for (const node of root) {
    if (node.tag.toLowerCase() === tagName.toLowerCase()) {
      return cleanCDATAContent(node.content);
    }

    if (node.children.length > 0) {
      const content = getTagContent(node.children, tagName);
      if (content) return content;
    }
  }

  return "";
}

/**
 * Gets all nodes with a specific tag name
 */
export function getElementsByTagName(
  root: SimpleXMLNode[],
  tagName: string,
): SimpleXMLNode[] {
  const result: SimpleXMLNode[] = [];

  for (const node of root) {
    if (node.tag.toLowerCase() === tagName.toLowerCase()) {
      result.push(node);
    }

    if (node.children.length > 0) {
      result.push(...getElementsByTagName(node.children, tagName));
    }
  }

  return result;
}
