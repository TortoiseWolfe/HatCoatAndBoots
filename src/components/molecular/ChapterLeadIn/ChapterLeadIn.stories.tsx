import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChapterLeadIn } from './ChapterLeadIn';

const meta: Meta<typeof ChapterLeadIn> = {
  title: 'Components/Molecular/ChapterLeadIn',
  component: ChapterLeadIn,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The chapter lead-in: visible title, subtitle, and intro paragraphs above the building.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSubtitle: Story = {
  args: {
    title: 'The Hat: What a Roof Knows About the Sun',
    subtitle:
      'How a simple overhang does three jobs at once — without a single moving part.',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'The Coat: What a Wall Knows About the Cold',
  },
};
