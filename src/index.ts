import { visit } from 'unist-util-visit';
import type { Element, Text, Root, Parent } from 'hast';

interface ParsedAttributes {
  classes: string[];
  id: string | null;
  attributes: Record<string, string>;
}

export default function rehypeStyling() {
  const attributeRegex = /^{([^}]*)}/;

  const onVisit = (node: Text, index: number | undefined, parent: Parent | undefined): void => {
    if (!parent || index === undefined || !('children' in parent)) return;

    const match = node.value.match(attributeRegex);
    if (!match) return;

    const attributeString = match[1].trim();
    
    // Handle empty braces
    if (!attributeString) {
      node.value = node.value.replace(attributeRegex, '').trim();
      if (node.value === '') {
        parent.children.splice(parent.children.indexOf(node), 1);
      }
      
      // For empty braces, still apply an empty style attribute to maintain compatibility
      const targetElement = getTargetElement(parent, index);
      if (targetElement) {
        targetElement.properties ??= {};
        targetElement.properties.style = '';
      }
      return;
    }

    const parsedAttributes = parseAttributes(attributeString);
    
    node.value = node.value.replace(attributeRegex, '').trim();
    
    if (node.value === '') {
      parent.children.splice(parent.children.indexOf(node), 1);
    }

    // Apply attributes using priority logic
    const targetElement = getTargetElement(parent, index);
    if (targetElement) {
      applyAttributes(targetElement, parsedAttributes);
    }
  };

  const getTargetElement = (parent: Parent, index: number): Element | null => {
    const firstChild = parent.children[0];
    
    // Post-element styling: apply to previous element
    if (index !== 0 && parent.children.length > 0 && parent.children[index - 1]?.type === 'element') {
      return parent.children[index - 1] as Element;
    }
    
    // Apply to first child element
    if (firstChild?.type === 'element' && parent.children.length === 1) {
      return firstChild as Element;
    }
    
    // Apply to parent element
    if (parent.type === 'element') {
      return parent as Element;
    }
    
    return null;
  };

  const parseAttributes = (attributeString: string): ParsedAttributes => {
    const result: ParsedAttributes = {
      classes: [],
      id: null,
      attributes: {}
    };

    // Split by spaces but preserve quoted strings
    const tokens = attributeString.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
    const cssProperties: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      switch (true) {
        case token.startsWith('.'):
          // Class selector
          result.classes.push(token.slice(1));
          break;
          
        case token.startsWith('#'):
          // ID selector
          result.id = token.slice(1);
          break;
          
        case token.includes('=') && !token.includes(':'):
          // HTML attribute (data-test="value" or title="tooltip")
          const [key, ...valueParts] = token.split('=');
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          result.attributes[key] = value;
          break;
          
        case token.includes(':'):
          // CSS property - collect all tokens until we hit a new property/selector
          let cssDeclaration = token;
          let j = i + 1;
          
          while (j < tokens.length) {
            const nextToken = tokens[j];
            if (nextToken.startsWith('.') || 
                nextToken.startsWith('#') || 
                (nextToken.includes('=') && !nextToken.includes(':')) ||
                nextToken.includes(':')) {
              break;
            }
            cssDeclaration += ` ${nextToken}`;
            j++;
          }
          
          cssDeclaration = cssDeclaration.trim();
          if (!cssDeclaration.endsWith(';')) {
            cssDeclaration += ';';
          }
          
          cssProperties.push(cssDeclaration);
          i = j - 1;
          break;
      }
    }

    // Add CSS properties as a style attribute
    if (cssProperties.length > 0) {
      result.attributes.style = cssProperties.join(' ').trim();
    }

    return result;
  };

  const applyAttributes = (element: Element, attributes: ParsedAttributes): void => {
    element.properties ??= {};

    // Apply classes
    if (attributes.classes.length > 0) {
      const existingClasses = element.properties.className;
      const existingClassArray = Array.isArray(existingClasses) 
        ? existingClasses 
        : typeof existingClasses === 'string' 
          ? existingClasses.split(' ').filter(Boolean)
          : [];
      
      element.properties.className = [...new Set([...existingClassArray, ...attributes.classes])].join(' ');
    }

    // Apply ID
    if (attributes.id) {
      element.properties.id = attributes.id;
    }

    // Apply all attributes (including style if present)
    for (const [key, value] of Object.entries(attributes.attributes)) {
      if (key === 'style') {
        // Handle style attribute specially - merge with existing styles
        const existingStyle = (element.properties.style as string) || '';
        const separator = existingStyle && !existingStyle.endsWith(';') ? '; ' : existingStyle ? ' ' : '';
        element.properties.style = `${existingStyle}${separator}${value}`;
      } else {
        // Apply other attributes directly
        element.properties[key] = value;
      }
    }
  };

  return (tree: Root) => {
    visit(tree, 'text', onVisit);
  };
}
