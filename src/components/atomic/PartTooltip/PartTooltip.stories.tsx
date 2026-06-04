import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PartTooltip } from './PartTooltip';

const meta: Meta<typeof PartTooltip> = {
  title: 'Components/Atomic/PartTooltip',
  component: PartTooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Single-instance, AAA-contrast tooltip naming a building part. Opaque card so contrast is independent of the artwork behind it.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    open: true,
    name: 'Roof overhang',
    verb: 'Tap to take the roof off',
  },
};

export const Closed: Story = {
  args: {
    open: false,
    name: 'Roof overhang',
    verb: 'Tap to take the roof off',
  },
};
