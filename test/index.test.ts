import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStyling from '../src/index.js';
import type { Root, Element } from 'hast';

describe('rehype-styling', () => {
  const createProcessor = () =>
    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeStyling);

  describe('basic functionality', () => {
    it('extracts CSS styles from text nodes and applies to parent element', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{color: red; font-weight: bold;}This is styled text' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const pElement = result.children[0] as Element;
      
      expect(pElement.properties).toEqual({
        style: 'color: red; font-weight: bold;'
      });
      expect(pElement.children).toHaveLength(1);
      expect(pElement.children[0]).toEqual({
        type: 'text',
        value: 'This is styled text'
      });
    });

    it('removes empty text nodes after style extraction', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{display: none;}' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const divElement = result.children[0] as Element;
      
      expect(divElement.properties).toEqual({
        style: 'display: none;'
      });
      expect(divElement.children).toHaveLength(0);
    });

    it('ignores text without style syntax', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: 'This is normal text without styles' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const pElement = result.children[0] as Element;
      
      expect(pElement.properties).toEqual({});
      expect(pElement.children[0]).toEqual({
        type: 'text',
        value: 'This is normal text without styles'
      });
    });

    it('handles multiple style properties', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{background-color: yellow; padding: 10px; margin: 5px; border: 1px solid black;}Highlighted text' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const spanElement = result.children[0] as Element;
      
      expect(spanElement.properties).toEqual({
        style: 'background-color: yellow; padding: 10px; margin: 5px; border: 1px solid black;'
      });
    });
  });

  describe('smart style application', () => {
    it('applies styles to first child element when it exists', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: {},
            children: [
              {
                type: 'element',
                tagName: 'span',
                properties: {},
                children: [
                  { 
                    type: 'text', 
                    value: '{color: blue; font-weight: bold;}Text content' 
                  }
                ]
              },
              {
                type: 'element',
                tagName: 'p',
                properties: {},
                children: [{ type: 'text', value: 'Another element' }]
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const divElement = result.children[0] as Element;
      const spanElement = divElement.children[0] as Element;
      
      // Parent div should not have styles
      expect(divElement.properties).toEqual({});
      
      // First child span should have styles applied
      expect(spanElement.properties).toEqual({
        style: 'color: blue; font-weight: bold;'
      });
    });

    it('applies styles to parent when first child is not an element', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{font-size: 18px; color: red;}This is the first child text node' 
              },
              {
                type: 'element',
                tagName: 'span',
                properties: {},
                children: [{ type: 'text', value: 'Second child element' }]
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const pElement = result.children[0] as Element;
      const spanElement = pElement.children[1] as Element;
      
      // Parent p should have styles since first child is text node
      expect(pElement.properties).toEqual({
        style: 'font-size: 18px; color: red;'
      });
      
      // Second child span should not have styles
      expect(spanElement.properties).toEqual({});
    });

    it('applies styles to parent when there are no child elements', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'h1',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{text-decoration: underline; color: navy;}Main Heading' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const h1Element = result.children[0] as Element;
      
      // Parent h1 should have styles since there are no element children
      expect(h1Element.properties).toEqual({
        style: 'text-decoration: underline; color: navy;'
      });
    });
  });

  describe('edge cases', () => {
    it('handles malformed style syntax gracefully', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{color: red; font-weight: bold' // Missing closing brace
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const pElement = result.children[0] as Element;
      
      // Should not apply styles if syntax is malformed
      expect(pElement.properties).toEqual({});
      expect(pElement.children[0]).toEqual({
        type: 'text',
        value: '{color: red; font-weight: bold'
      });
    });

    it('handles styles in the middle of text (should not match)', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: 'Some text {color: red;} in the middle' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const pElement = result.children[0] as Element;
      
      // Should not apply styles if not at the beginning
      expect(pElement.properties).toEqual({});
      expect(pElement.children[0]).toEqual({
        type: 'text',
        value: 'Some text {color: red;} in the middle'
      });
    });

    it('handles empty style declarations', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{}Some text here' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const pElement = result.children[0] as Element;
      
      expect(pElement.properties).toEqual({
        style: ''
      });
      expect(pElement.children[0]).toEqual({
        type: 'text',
        value: 'Some text here'
      });
    });

    it('preserves existing element properties', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {
              className: 'existing-class',
              id: 'my-paragraph'
            },
            children: [
              { 
                type: 'text', 
                value: '{color: green;}Styled text' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const pElement = result.children[0] as Element;
      
      expect(pElement.properties).toEqual({
        className: 'existing-class',
        id: 'my-paragraph',
        style: 'color: green;'
      });
    });
  });

  describe('complex scenarios', () => {
    it('handles nested elements with styles', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'article',
            properties: {},
            children: [
              {
                type: 'element',
                tagName: 'h1',
                properties: {},
                children: [
                  { 
                    type: 'text', 
                    value: '{color: navy; text-decoration: underline;}Main Title' 
                  }
                ]
              },
              {
                type: 'element',
                tagName: 'p',
                properties: {},
                children: [
                  { 
                    type: 'text', 
                    value: '{background: lightgray; padding: 8px;}Important paragraph' 
                  }
                ]
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const articleElement = result.children[0] as Element;
      const h1Element = articleElement.children[0] as Element;
      const pElement = articleElement.children[1] as Element;
      
      expect(h1Element.properties).toEqual({
        style: 'color: navy; text-decoration: underline;'
      });
      expect(pElement.properties).toEqual({
        style: 'background: lightgray; padding: 8px;'
      });
    });

    it('handles text nodes with only whitespace after style removal', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{margin: 10px;}   ' // Only whitespace after style
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const divElement = result.children[0] as Element;
      
      expect(divElement.properties).toEqual({
        style: 'margin: 10px;'
      });
      // Should remove the text node since it becomes empty after trimming
      expect(divElement.children).toHaveLength(0);
    });

    it('handles complex real-world content with bold text and styling', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'li',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: "let's " 
              },
              {
                type: 'element',
                tagName: 'strong',
                properties: {},
                children: [
                  { 
                    type: 'text', 
                    value: '{color: red;}Evaluate the environmental footprint of digital devices'
                  }
                ]
              },
              { 
                type: 'text', 
                value: ' with the exact technical specifications or from model names,' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const liElement = result.children[0] as Element;
      
      // The style should be applied to the strong element since the style is inside its text content
      const strongElement = liElement.children[1] as Element;
      expect(strongElement.properties).toEqual({
        style: 'color: red;'
      });
      
      // The text content should be cleaned up
      expect(strongElement.children[0]).toEqual({
        type: 'text',
        value: 'Evaluate the environmental footprint of digital devices'
      });
      
      // Verify the overall structure is preserved
      expect(liElement.children).toHaveLength(3);
      expect(liElement.children[0]).toEqual({
        type: 'text',
        value: "let's "
      });
      expect(liElement.children[2]).toEqual({
        type: 'text',
        value: ' with the exact technical specifications or from model names,'
      });
      
      // The li element should not have styles since the style was inside the strong element
      expect(liElement.properties).toEqual({});
    });

    it('handles styles applied after elements (post-element styling)', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [
              {
                type: 'element',
                tagName: 'strong',
                properties: {},
                children: [
                  { 
                    type: 'text', 
                    value: 'Important text'
                  }
                ]
              },
              { 
                type: 'text', 
                value: '{color: red; font-weight: 900;} that needs attention' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const pElement = result.children[0] as Element;
      const strongElement = pElement.children[0] as Element;
      
      // The style should be applied to the preceding strong element
      expect(strongElement.properties).toEqual({
        style: 'color: red; font-weight: 900;'
      });
      
      // The text content after style should be cleaned up (trim removes leading space)
      expect(pElement.children[1]).toEqual({
        type: 'text',
        value: 'that needs attention'
      });
      
      // Strong element content should remain unchanged
      expect(strongElement.children[0]).toEqual({
        type: 'text',
        value: 'Important text'
      });
      
      // Parent should not have styles
      expect(pElement.properties).toEqual({});
    });

    it('handles multiple post-element styles in sequence', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: {},
            children: [
              {
                type: 'element',
                tagName: 'em',
                properties: {},
                children: [
                  { 
                    type: 'text', 
                    value: 'Italic text'
                  }
                ]
              },
              { 
                type: 'text', 
                value: '{font-style: italic; color: blue;} and '
              },
              {
                type: 'element',
                tagName: 'strong',
                properties: {},
                children: [
                  { 
                    type: 'text', 
                    value: 'bold text'
                  }
                ]
              },
              { 
                type: 'text', 
                value: '{font-weight: bold; color: green;} together'
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const divElement = result.children[0] as Element;
      
      // Get elements by their actual positions after processing
      const elements = divElement.children.filter(child => child.type === 'element') as Element[];
      const emElement = elements[0];
      const strongElement = elements[1];
      
      // First style should apply to em element (post-element styling)
      expect(emElement.properties).toEqual({
        style: 'font-style: italic; color: blue;'
      });
      
      // Second style should apply to strong element (post-element styling)
      expect(strongElement.properties).toEqual({
        style: 'font-weight: bold; color: green;'
      });
      
      // Text nodes should be cleaned up (trimmed)
      const textNodes = divElement.children.filter(child => child.type === 'text');
      expect(textNodes).toHaveLength(2);
      expect(textNodes[0]).toEqual({
        type: 'text',
        value: 'and'
      });
      expect(textNodes[1]).toEqual({
        type: 'text',
        value: 'together'
      });
    });

    it('handles class selectors', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{.highlight .important}Styled text with classes' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const pElement = result.children[0] as Element;
      
      expect(pElement.properties).toEqual({
        className: 'highlight important'
      });
      expect(pElement.children[0]).toEqual({
        type: 'text',
        value: 'Styled text with classes'
      });
    });

    it('handles ID selectors', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{#my-unique-id}Content with ID' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const divElement = result.children[0] as Element;
      
      expect(divElement.properties).toEqual({
        id: 'my-unique-id'
      });
      expect(divElement.children[0]).toEqual({
        type: 'text',
        value: 'Content with ID'
      });
    });

    it('handles HTML attributes', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{data-test="value" title="tooltip"}Text with attributes' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const spanElement = result.children[0] as Element;
      
      expect(spanElement.properties).toEqual({
        'data-test': 'value',
        title: 'tooltip'
      });
    });

    it('handles mixed attributes (classes, ID, styles, and attributes)', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'article',
            properties: {},
            children: [
              { 
                type: 'text', 
                value: '{.card .featured #main-article color: blue; padding: 20px; data-category="tech" aria-label="Featured article"}Complex styled content' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const articleElement = result.children[0] as Element;
      
      expect(articleElement.properties).toEqual({
        className: 'card featured',
        id: 'main-article',
        style: 'color: blue; padding: 20px;',
        'data-category': 'tech',
        'aria-label': 'Featured article'
      });
    });

    it('merges with existing classes', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: {
              className: 'existing-class'
            },
            children: [
              { 
                type: 'text', 
                value: '{.new-class .another-class}Text content' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const divElement = result.children[0] as Element;
      
      expect(divElement.properties).toEqual({
        className: 'existing-class new-class another-class'
      });
    });

    it('merges with existing styles', async () => {
      const processor = createProcessor();
      const tree: Root = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {
              style: 'margin: 10px;'
            },
            children: [
              { 
                type: 'text', 
                value: '{color: red; font-size: 14px;}Text content' 
              }
            ]
          }
        ]
      };
      
      const result = await processor.run(tree) as Root;
      const pElement = result.children[0] as Element;
      
      expect(pElement.properties).toEqual({
        style: 'margin: 10px; color: red; font-size: 14px;'
      });
    });
  });
});
