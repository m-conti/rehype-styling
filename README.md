# rehype-styling

![npm](https://img.shields.io/npm/v/rehype-styling)
![license](https://img.shields.io/github/license/m-conti/rehype-styling)
![bundle size](https://img.shields.io/bundlephobia/min/rehype-styling)

A modern [rehype](https://github.com/rehypejs/rehype) plugin specifically designed to work with [remark](https://github.com/remarkjs/remark) for enhanced Markdown styling. This plugin extracts CSS styles from text content and applies them to HTML elements. It looks for CSS style declarations wrapped in curly braces at the beginning of text nodes and intelligently applies them as inline styles to the most appropriate element.

## How It Works

The plugin automatically applies styles using smart logic:
1. **First Child Element**: If the first child of the parent is an element, styles are applied to it
2. **Parent Element**: If the first child is not an element (e.g., text node), styles are applied to the parent element

This approach ensures styles are applied to the most semantically appropriate element in the document structure.

## Installation

```bash
npm install rehype-styling
# or
yarn add rehype-styling
# or
pnpm add rehype-styling
```

## Usage

This plugin is specifically designed to enhance Markdown content by transforming text that starts with CSS style declarations in curly braces `{style-declarations}` and applying them as inline styles to elements.

### With Markdown (Recommended)

```typescript
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeStyling from 'rehype-styling';

const processor = unified()
  .use(rehypeParse)
  .use(rehypeStyling)
  .use(rehypeStringify);

const input = `<p>{color: red; font-weight: bold;}This text will be styled</p>`;
const result = await processor.process(input);
console.log(String(result));
// Output: <p style="color: red; font-weight: bold;">This text will be styled</p>
```

### Comprehensive Markdown Examples

```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStyling from 'rehype-styling';
import rehypeStringify from 'rehype-stringify';

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeStyling)
  .use(rehypeStringify);

const markdown = `
# {color: #2563eb; border-bottom: 2px solid #3b82f6;}Styled Heading

This is a paragraph with {background-color: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;}highlighted content that stands out.

## {font-family: 'Georgia', serif; color: #7c3aed;}Beautiful Subheading

Regular paragraph content followed by some {font-weight: bold; color: #dc2626;}important red text.

### Links and Images

Check out this {color: #059669; text-decoration: underline;}[styled link](https://example.com) in the content.

![{border: 2px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);}Beautiful Image](https://via.placeholder.com/400x200)

### Lists and Emphasis

- {background: #dcfce7; padding: 8px; border-radius: 4px;}This is a highlighted list item
- Regular list item
- {font-style: italic; color: #6366f1;}Another styled item

**{background: linear-gradient(45deg, #ff6b6b, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;}Gradient text effect** looks amazing!

> {border-left: 4px solid #8b5cf6; background: #f3f4f6; padding: 16px; font-style: italic;}This is a beautifully styled blockquote that stands out from regular content.

### Code and Tables

Here's some \`{background: #1f2937; color: #10b981; padding: 2px 4px; border-radius: 3px;}inline code\` with custom styling.
`;

const result = await processor.process(markdown);
console.log(String(result));
```

## Configuration

The plugin works automatically without any configuration options. It uses smart logic to determine where to apply extracted styles:

- If the first child element exists, styles are applied to it
- If the first child is not an element, styles are applied to the parent element

## Examples

### Smart Style Application

**Input:**
```html
<div>
  <span>{color: red; font-weight: bold;}This text will be styled</span>
</div>
```

**Output:**
```html
<div>
  <span style="color: red; font-weight: bold;">This text will be styled</span>
</div>
```

**Input (when first child is text):**
```html
<p>{background: yellow; padding: 10px;}This paragraph will be styled</p>
```

**Output:**
```html
<p style="background: yellow; padding: 10px;">This paragraph will be styled</p>
```

### Empty Style Removal

**Input:**
```html
<div>{display: none;}</div>
```

**Output:**
```html
<div style="display: none;"></div>
```

### Multiple Styles in Document

**Input:**
```html
<article>
  <h1>{color: navy; text-decoration: underline;}Main Title</h1>
  <p>{background: lightgray; padding: 8px;}Highlighted paragraph</p>
  <span>{font-style: italic;}Italic text</span>
</article>
```

**Output:**
```html
<article>
  <h1 style="color: navy; text-decoration: underline;">Main Title</h1>
  <p style="background: lightgray; padding: 8px;">Highlighted paragraph</p>
  <span style="font-style: italic;">Italic text</span>
</article>
```

### Bold/Strong Text Styling

**Input:**
```html
<p>Here's some <strong>{color: red; font-weight: 900;}important information</strong> to consider.</p>
```

**Output:**
```html
<p>Here's some <strong style="color: red; font-weight: 900;">important information</strong> to consider.</p>
```

**Complex Example:**
```html
<li>Let's <strong>{color: #059669; background: #dcfce7; padding: 2px 6px; border-radius: 4px;}evaluate the environmental footprint</strong> of digital devices</li>
```

**Output:**
```html
<li>Let's <strong style="color: #059669; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">evaluate the environmental footprint</strong> of digital devices</li>
```

## How It Works

1. The plugin visits all text nodes in the HTML tree
2. It looks for text that starts with CSS style declarations wrapped in curly braces: `{css-styles}`
3. When found, it extracts the CSS styles and removes the curly brace syntax from the text
4. It applies the extracted styles using smart logic:
   - If the first child element exists, styles are applied to it
   - If the first child is not an element, styles are applied to the parent element
5. If the text becomes empty after removing the style syntax, the text node is removed entirely

## Use Cases

- **Enhanced Markdown**: The primary use case - add sophisticated styling to Markdown content
- **Content Management**: Allow content creators to add styling without HTML knowledge
- **Documentation**: Style specific parts of documentation dynamically
- **Blog Posts**: Add visual emphasis and styling to blog content
- **Educational Content**: Highlight important information in learning materials
- **Technical Writing**: Create visually appealing code documentation and tutorials

## Real-World Markdown Examples

### Blog Post Styling

```markdown
# {color: #1a202c; font-size: 2.5rem; margin-bottom: 1rem;}My Awesome Blog Post

{color: #4a5568; font-size: 1.1rem; margin-bottom: 2rem;}Published on March 15, 2024 by John Doe

![{width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 2rem 0;}Hero Image](https://example.com/hero.jpg)

## {color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;}Introduction

This is an introduction paragraph with {background: #fed7d7; color: #c53030; padding: 2px 6px; border-radius: 4px; font-weight: 600;}important warnings and {background: #c6f6d5; color: #22543d; padding: 2px 6px; border-radius: 4px; font-weight: 600;}success highlights.

Check out our {color: #3182ce; text-decoration: underline; font-weight: 500;}[main website](https://example.com) for more information.
```

### Documentation Styling

```markdown
# {color: #2b6cb0; display: flex; align-items: center;}📚 API Documentation

## {background: #edf2f7; padding: 1rem; border-radius: 8px; border-left: 4px solid #4299e1;}Installation

{background: #f7fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 6px; font-family: 'Monaco', monospace;}npm install awesome-package

### {color: #38a169;}✅ Basic Usage

{background: #f0fff4; border: 1px solid #9ae6b4; padding: 1rem; border-radius: 6px;}This is a success example showing how to use the package correctly.

### {color: #e53e3e;}❌ Common Mistakes

{background: #fff5f5; border: 1px solid #feb2b2; padding: 1rem; border-radius: 6px;}Avoid this pattern as it can lead to unexpected behavior.
```

### Styling Bold/Strong Text

The plugin works seamlessly with Markdown bold text (`**bold**` or `__bold__`) by applying styles directly to the `<strong>` element:

```markdown
Here's some regular text with **{color: #dc2626; font-weight: 900;}important bold text** that stands out.

- Let's **{color: #059669; background: #dcfce7; padding: 2px 6px; border-radius: 4px;}evaluate the environmental footprint** of digital devices
- Consider **{color: #7c3aed; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);}technical specifications** when making decisions
- Always **{background: linear-gradient(45deg, #ff6b6b, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;}double-check your work** before submitting

You can also combine with other formatting:
- **{font-size: 1.2em; color: #1e40af;}Bold and larger text**
- ***{color: #be185d; font-style: italic;}Bold italic with custom color***
- **{border: 2px solid #f59e0b; padding: 4px 8px; border-radius: 6px; background: #fef3c7;}Boxed important text**
```

This generates HTML like:
```html
<p>Here's some regular text with <strong style="color: #dc2626; font-weight: 900;">important bold text</strong> that stands out.</p>

<ul>
  <li>Let's <strong style="color: #059669; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">evaluate the environmental footprint</strong> of digital devices</li>
  <li>Consider <strong style="color: #7c3aed; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">technical specifications</strong> when making decisions</li>
</ul>
```

### Educational Content

```markdown
# {background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; border-radius: 12px;}JavaScript Fundamentals

## {color: #4c51bf; border-bottom: 3px solid #4c51bf; display: inline-block;}Variables and Types

{font-size: 1.1rem; line-height: 1.6; margin: 1rem 0;}In JavaScript, you can declare variables using {background: #2d3748; color: #68d391; padding: 2px 6px; border-radius: 3px; font-family: monospace;}let, {background: #2d3748; color: #68d391; padding: 2px 6px; border-radius: 3px; font-family: monospace;}const, or {background: #2d3748; color: #f56565; padding: 2px 6px; border-radius: 3px; font-family: monospace;}var.

> {background: #ebf8ff; border-left: 4px solid #3182ce; padding: 1rem; margin: 1rem 0; font-style: italic;}💡 **Pro Tip**: Always use `const` by default, and only use `let` when you need to reassign the variable.

### {color: #38a169;}Examples

- {background: #f0fff4; padding: 8px; border-radius: 4px; border-left: 3px solid #38a169;}Good: `const userName = 'John';`
- {background: #fff5f5; padding: 8px; border-radius: 4px; border-left: 3px solid #e53e3e;}Bad: `var userName = 'John';`
```

## Integration with Markdown Ecosystems

This plugin is specifically designed to work seamlessly with the remark/rehype ecosystem for enhanced Markdown processing.

### With MDX (Recommended for React)

```typescript
import { compile } from '@mdx-js/mdx';
import rehypeStyling from 'rehype-styling';

const mdxContent = `
# {color: #2563eb; text-align: center;}Welcome to My MDX Document

This is {background: #fef3c7; padding: 4px 8px; border-radius: 4px; font-weight: 600;}highlighted text in MDX.

![{border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);}Profile Image](./profile.jpg)

## {color: #059669;}Features

- {background: #dcfce7; padding: 6px; border-radius: 4px;}✅ Styled list items
- {color: #7c3aed; font-weight: 600;}🎨 Custom colors
- {font-family: 'Georgia', serif; font-style: italic;}📝 Typography control
`;

const result = await compile(mdxContent, {
  rehypePlugins: [rehypeStyling]
});
```

### With Astro (Perfect for Static Sites)

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import rehypeStyling from 'rehype-styling';

export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeStyling]
  }
});
```

Example Astro Markdown file:
```markdown
---
title: "Styled Blog Post"
---

# {background: linear-gradient(45deg, #ff6b6b, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 3rem;}{title}

{color: #6b7280; font-size: 1.1rem;}This post demonstrates beautiful styling in Astro.

![{border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);}Featured Image](./featured.jpg)
```

### With Next.js (App Router)

```javascript
// next.config.js
import rehypeStyling from 'rehype-styling';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

export default nextConfig;
```

```javascript
// mdx-components.tsx
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
```

Example MDX file in Next.js:
```mdx
# {color: #0070f3; border-bottom: 2px solid #0070f3;}Next.js Blog Post

{background: #f6f8fa; border: 1px solid #d0d7de; padding: 16px; border-radius: 8px;}This is a styled callout box in Next.js with MDX.

![{width: 100%; height: auto; border-radius: 12px; margin: 2rem 0;}Next.js Logo](./nextjs-logo.png)
```

### With VitePress

```javascript
// .vitepress/config.js
import { defineConfig } from 'vitepress';
import rehypeStyling from 'rehype-styling';

export default defineConfig({
  markdown: {
    config: (md) => {
      md.use(rehypeStyling);
    }
  }
});
```

### With Docusaurus

```javascript
// docusaurus.config.js
const rehypeStyling = require('rehype-styling');

module.exports = {
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          rehypePlugins: [rehypeStyling],
        },
        blog: {
          rehypePlugins: [rehypeStyling],
        },
      },
    ],
  ],
};
```

## API

### `rehypeStyling()`

Returns a transformer function that can be used with unified processors.

#### Returns

A transformer function that processes the HTML tree and applies inline styles based on text content using smart element selection logic.

## Performance

The plugin is designed to be efficient:

- Only processes text nodes by default
- Uses regex matching for fast style extraction
- Minimal tree traversal overhead
- No external dependencies beyond peer dependencies

## Browser Support

This plugin generates standard HTML with inline styles, which is supported by all modern browsers. The generated output is compatible with:

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Server-side rendering (SSR)
- Static site generation (SSG)
- Progressive web apps (PWA)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT © [Matthieu Conti](https://github.com/m-conti)

## Related

- [rehype](https://github.com/rehypejs/rehype) - HTML processor powered by plugins
- [rehype-custom-component](https://github.com/m-conti/rehype-custom-component) - Transform custom component shortcodes
- [unified](https://github.com/unifiedjs/unified) - Interface for parsing, inspecting, transforming, and serializing content through syntax trees
