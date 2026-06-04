import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StoryRibbon } from './StoryRibbon';

const LEGEND = [
  { id: 'footing', tabColor: '#9aa7b3', docked: true },
  { id: 'wall', tabColor: '#c9a86a', docked: true },
  { id: 'window', tabColor: '#cfe3ee', docked: true },
  { id: 'roof', tabColor: '#c8714a', docked: true },
  { id: 'summer', tabColor: '#e8a02e', docked: false },
  { id: 'winter', tabColor: '#e6b455', docked: false },
  { id: 'rain', tabColor: '#5b86a8', docked: false },
];

const meta: Meta<typeof StoryRibbon> = {
  title: 'Components/Molecular/StoryRibbon',
  component: StoryRibbon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The narrative ribbon: beat heading + prose, Back/Next pills, and a live legend (one dot per layer).',
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
    stepIndex: 1,
    stepCount: 4,
    legend: LEGEND,
    onPrev: () => {},
    onNext: () => {},
  },
};

export const FirstStep: Story = {
  args: {
    ...MiddleStep.args,
    heading: 'A house is layers',
    stepIndex: 0,
  },
};
