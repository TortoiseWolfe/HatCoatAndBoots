import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LayerToggles from './LayerToggles';

const meta: Meta<typeof LayerToggles> = {
  title: 'Book/Architecture/LayerToggles',
  component: LayerToggles,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'LayerToggles component for the architecture category.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to display inside the component',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default LayerToggles content',
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'LayerToggles with custom styling',
    className: 'p-4 bg-primary text-white rounded',
  },
};

export const Empty: Story = {
  args: {},
};
