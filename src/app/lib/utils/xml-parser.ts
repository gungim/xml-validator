export interface ParsedRule {
  name: string
  path: string
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  description?: string
  condition: Record<string, any>
  children?: ParsedRule[]
}

interface ElementInfo {
  name: string
  count: number
  hasChildren: boolean
  textContent: string
  attributes: Record<string, string>
}

/**
 * Infer data type from text content
 */
function inferDataType(
  content: string,
  hasChildren: boolean,
  isRepeated: boolean
): 'string' | 'number' | 'boolean' | 'object' | 'array' {
  if (hasChildren) {
    return isRepeated ? 'array' : 'object'
  }

  const trimmed = content.trim()

  // Check for boolean
  if (trimmed === 'true' || trimmed === 'false') {
    return 'boolean'
  }

  // Check for number
  if (trimmed && !isNaN(Number(trimmed))) {
    return 'number'
  }

  return 'string'
}

/**
 * Generate condition based on data type and content
 */
function generateCondition(
  dataType: string,
  content: string
): Record<string, any> {
  switch (dataType) {
    case 'string':
      const trimmed = content.trim()
      const condition: Record<string, any> = {}

      // Email detection
      if (trimmed.includes('@') && trimmed.includes('.')) {
        condition.pattern = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      }

      // Set min/max length if content exists
      if (trimmed.length > 0) {
        condition.minLength = 1
        condition.maxLength = Math.max(trimmed.length * 2, 100)
      }

      return condition

    case 'number':
      const num = Number(content.trim())
      return {
        min: num > 0 ? 0 : num - 100,
        max: num + 100,
      }

    case 'boolean':
      return {}

    case 'object':
    case 'array':
      return {}

    default:
      return {}
  }
}

/**
 * Parse XML element and its children recursively
 */
function parseElement(
  element: Element,
  parentPath: string,
  elementCounts: Map<string, ElementInfo>
): ParsedRule[] {
  const rules: ParsedRule[] = []
  const tagName = element.tagName
  const path = parentPath ? `${parentPath}.${tagName}` : `${tagName}`

  // Get element info
  const elementInfo = elementCounts.get(path)
  if (!elementInfo) return rules

  const isRepeated = elementInfo.count > 1
  const hasChildren = elementInfo.hasChildren
  const textContent = elementInfo.textContent

  // Determine data type
  const dataType = inferDataType(textContent, hasChildren, isRepeated)

  // Create rule for this element
  const rule: ParsedRule = {
    name: tagName,
    path,
    dataType,
    required: true,
    condition: generateCondition(dataType, textContent),
    children: [],
  }

  // Handle attributes as child rules
  if (element.attributes.length > 0) {
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i]
      const attrRule: ParsedRule = {
        name: `@${attr.name}`,
        path: `${path}/@${attr.name}`,
        dataType: 'string',
        required: true,
        condition: { minLength: 1 },
      }
      rule.children!.push(attrRule)
    }
  }

  // Handle child elements
  if (hasChildren) {
    const childElements = Array.from(element.children)
    const processedTags = new Set<string>()

    for (const child of childElements) {
      const childTag = child.tagName

      // Skip if already processed (for repeated elements, we only process once)
      if (processedTags.has(childTag)) continue
      processedTags.add(childTag)

      const childRules = parseElement(child, path, elementCounts)
      rule.children!.push(...childRules)
    }
  }

  rules.push(rule)
  return rules
}

/**
 * Count elements and gather info in first pass
 */
function analyzeElements(
  element: Element,
  parentPath: string,
  elementCounts: Map<string, ElementInfo>
): void {
  const tagName = element.tagName
  const path = parentPath ? `${parentPath}.${tagName}` : `${tagName}`

  // Get or create element info
  let info = elementCounts.get(path)
  if (!info) {
    info = {
      name: tagName,
      count: 0,
      hasChildren: false,
      textContent: '',
      attributes: {},
    }
    elementCounts.set(path, info)
  }

  info.count++
  info.hasChildren = element.children.length > 0

  // Get text content (only direct text, not from children)
  const textContent = Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent || '')
    .join('')
    .trim()

  if (textContent) {
    info.textContent = textContent
  }

  // Store attributes
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    info.attributes[attr.name] = attr.value
  }

  // Recursively analyze children
  for (const child of Array.from(element.children)) {
    analyzeElements(child, path, elementCounts)
  }
}

/**
 * Parse XML string and generate validation rules
 */
export function parseXMLToRules(xmlString: string): ParsedRule[] {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlString, 'text/xml')

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      throw new Error('Invalid XML: ' + parserError.textContent)
    }

    // Get root element
    const root = doc.documentElement
    if (!root) {
      throw new Error('No root element found')
    }

    // First pass: analyze all elements to count occurrences
    const elementCounts = new Map<string, ElementInfo>()
    analyzeElements(root, '', elementCounts)

    // Second pass: generate rules
    const rules = parseElement(root, '', elementCounts)

    return rules
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse XML: ${error.message}`)
    }
    throw new Error('Failed to parse XML: Unknown error')
  }
}
