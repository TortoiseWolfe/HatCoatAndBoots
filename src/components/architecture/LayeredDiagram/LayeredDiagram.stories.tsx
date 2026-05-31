import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LayeredDiagram from './LayeredDiagram';

const meta: Meta<typeof LayeredDiagram> = {
  title: 'Book/Architecture/LayeredDiagram',
  component: LayeredDiagram,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'LayeredDiagram component for the architecture category.',
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
    children: 'Default LayeredDiagram content',
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'LayeredDiagram with custom styling',
    className: 'p-4 bg-primary text-white rounded',
  },
};

export const Empty: Story = {
  args: {},
};
