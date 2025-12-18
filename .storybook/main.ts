import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [],
  framework: "@storybook/react-vite",
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
