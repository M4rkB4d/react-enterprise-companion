import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    // Note: @storybook/addon-vitest removed due to React 19 prebundling bug
    // (see https://github.com/storybookjs/storybook/issues/31592)
    // Stories are tested visually via `npm run storybook`
  ],
  framework: '@storybook/react-vite',
};

export default config;
