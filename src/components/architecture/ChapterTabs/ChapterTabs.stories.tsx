import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ChapterTabs from './ChapterTabs';
import { chapters } from '../manifests/chapters';

const TAGLINES = {
  hat: 'the roof overhang',
  coat: 'the insulated walls',
  boots: 'the foundation',
};

const meta: Meta<typeof ChapterTabs> = {
  title: 'Book/Architecture/ChapterTabs',
  component: ChapterTabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Chapter-focus navigation (Hat / Coat / Boots). The available chapter ' +
          'is a link; coming-soon chapters stay present but inert.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    chapters,
    taglines: TAGLINES,
    activeId: null,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NeutralIndex: Story = { args: { activeId: null } };
export const HatActive: Story = { args: { activeId: 'hat' } };
