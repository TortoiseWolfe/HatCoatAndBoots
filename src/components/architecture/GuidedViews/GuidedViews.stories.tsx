import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import GuidedViews from './GuidedViews';

const meta: Meta<typeof GuidedViews> = {
  title: 'Book/Architecture/GuidedViews',
  component: GuidedViews,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'GuidedViews component for the architecture category.',
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
    children: 'Default GuidedViews content',
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'GuidedViews with custom styling',
    className: 'p-4 bg-primary text-white rounded',
  },
};

export const Empty: Story = {
  args: {},
};
