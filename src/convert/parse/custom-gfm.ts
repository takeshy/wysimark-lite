import type { Plugin, Processor } from 'unified'
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table'
import { gfm } from 'micromark-extension-gfm'
import { gfmToMarkdown } from 'mdast-util-gfm'

// Internal type for unified processor data
interface ProcessorData {
  micromarkExtensions?: unknown[];
  fromMarkdownExtensions?: unknown[];
  toMarkdownExtensions?: unknown[];
}

/**
 * Helper function to wrap a handler to ensure this.data is initialized
 */
function wrapHandler(originalHandler: Function | undefined) {
  if (!originalHandler) return undefined;
  return function(this: any, token: any) {
    if (!this.data) {
      this.data = {};
    }
    return originalHandler.call(this, token);
  };
}

/**
 * Custom wrapper around remark-gfm that ensures the data object is initialized
 * This fixes the "Cannot read/set properties of undefined" errors
 * that occur when parsing tables
 */
export function customRemarkGfm(): Plugin {
  // Return a plugin function that initializes the data object
  return function(this: Processor) {
    // Make sure 'this' exists
    if (!this) {
      return;
    }

    // Initialize the data object on the processor
    // Get the data object - unified processor's data() method returns the data object
    const data = this.data() as ProcessorData;

    // Initialize the extensions arrays if they don't exist
    const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
    const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
    const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

    // Add the GFM extensions
    // We're using the original extensions from remark-gfm
    micromarkExtensions.push(gfm());

    // Create a patched version of gfmTableFromMarkdown
    const patchedFromMarkdown = function() {
      const extension = gfmTableFromMarkdown();

      // Wrap all enter handlers to ensure this.data is initialized
      if (extension.enter) {
        for (const key of Object.keys(extension.enter)) {
          (extension.enter as any)[key] = wrapHandler((extension.enter as any)[key]);
        }
      }

      // Wrap all exit handlers to ensure this.data is initialized
      if (extension.exit) {
        for (const key of Object.keys(extension.exit)) {
          (extension.exit as any)[key] = wrapHandler((extension.exit as any)[key]);
        }
      }

      return extension;
    };

    // Add our patched extensions
    fromMarkdownExtensions.push(patchedFromMarkdown());
    toMarkdownExtensions.push(gfmToMarkdown());

    return undefined; // Return undefined as the plugin doesn't need to return anything
  }
}
