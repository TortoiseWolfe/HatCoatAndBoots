import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StoryRibbon } from './StoryRibbon';

const meta: Meta<typeof StoryRibbon> = {
  title: 'Components/Molecular/StoryRibbon',
  component: StoryRibbon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The narrative ribbon: beat heading + teaching prose + optional takeaway, with Back/Next pills and a step counter.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const MiddleStep: Story = {
  args: {
    heading: 'The summer sun is blocked',
    prose:
      'In summer the sun climbs high. The overhang shades the window, so the room stays cool with no machine.',
    takeaway:
      'One fixed roof edge. Summer sun is blocked, winter sun slips underneath.',
    stepIndex: 1,
    stepCount: 4,
    onPrev: () => {},
    onNext: () => {},
  },
};

export const FirstStep: Story = {
  args: {
    ...MiddleStep.args,
    heading: 'The Whole System',
    stepIndex: 0,
  },
};
