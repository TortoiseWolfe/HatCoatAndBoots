import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HatViewer from './HatViewer';

const meta: Meta<typeof HatViewer> = {
  title: 'Book/Architecture/HatViewer',
  component: HatViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Hat-chapter interactive island: the shared building focused on ' +
          'the roof, with guided views and per-layer toggles, hash-synced.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const StartOnRoofLine: Story = {
  args: { initialViewId: 'roof-line' },
};
