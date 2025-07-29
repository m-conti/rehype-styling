import { visit } from 'unist-util-visit';
import type { Element, Text, Root, Parent } from 'hast';

export default function rehypeStyling() {

  const onVisit = (node: Text, index: number | undefined, parent: Parent | undefined) => {
    if (!parent || index === undefined || !('children' in parent)) return;

    const styleRegex = /^{([^}]*)}/;
    const match = node.value.match(styleRegex);
    if (!match) return;

    const extractedStyle = match[1];

    node.value = node.value.replace(styleRegex, '').trim();
    
    if (node.value === '') {
      parent.children.splice(parent.children.indexOf(node), 1);
    }

    const firstChild = parent.children[0];
    if (index !== 0 && parent.children.length > 0 && parent.children[index - 1]?.type === 'element') {
      (parent.children[index - 1] as Element).properties = { ...(parent.children[index - 1] as Element).properties, style: extractedStyle };
    } else if (firstChild && firstChild.type === 'element') {
      firstChild.properties = { ...(firstChild.properties ?? {}), style: extractedStyle };
    } else if (parent.type === 'element') {
      (parent as Element).properties = { ...((parent as Element).properties ?? {}), style: extractedStyle };
    }
  };

  return (tree: Root) => {
    visit(tree, 'text', onVisit);
  };
}
