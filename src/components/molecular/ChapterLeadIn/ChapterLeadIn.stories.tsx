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

export const Full: Story = {
  args: {
    title: 'The Hat: What a Roof Knows About the Sun',
    subtitle:
      'How a simple overhang does three jobs at once — without a single moving part.',
    intro: [
      'Look up at the roof of an old farmhouse. Notice how far the eave reaches out past the wall. That wasn’t an accident.',
      'Here is the puzzle: the same window that overheats a room in summer is exactly the window you want warming that room in winter.',
    ],
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'The Coat: What a Wall Knows About the Cold',
  },
};
