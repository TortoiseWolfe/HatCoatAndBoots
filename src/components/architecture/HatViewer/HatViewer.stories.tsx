import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HatViewer from './HatViewer';

const meta: Meta<typeof HatViewer> = {
  title: 'Book/Architecture/HatViewer',
  component: HatViewer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'HatViewer component for the architecture category.',
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
    children: 'Default HatViewer content',
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'HatViewer with custom styling',
    className: 'p-4 bg-primary text-white rounded',
  },
};

export const Empty: Story = {
  args: {},
};
