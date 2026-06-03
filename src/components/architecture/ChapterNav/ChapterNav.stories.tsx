import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ChapterNav from './ChapterNav';
import type { ChapterFocusRecord } from '../manifests/types';

const allReal: ChapterFocusRecord[] = [
  {
    id: 'hat',
    label: 'Hat',
    region: 'roof',
    available: true,
    href: '/book/hat',
  },
  {
    id: 'coat',
    label: 'Coat',
    region: 'envelope',
    available: true,
    href: '/book/coat',
  },
  {
    id: 'boots',
    label: 'Boots',
    region: 'foundation',
    available: true,
    href: '/book/boots',
  },
];

const meta: Meta<typeof ChapterNav> = {
  title: 'Book/Architecture/ChapterNav',
  component: ChapterNav,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The book chapter navigation (Hat / Coat / Boots) as a horizontal ' +
          'tab strip for the navbar. Route-aware: the active chapter is derived ' +
          'from the current path and underlined.',
      },
    },
    nextjs: { appDirectory: true, navigation: { pathname: '/book/coat' } },
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text', description: 'Additional CSS classes' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** All three chapters available; the Coat tab is active (per the mocked path). */
export const AllChapters: Story = {
  args: { chapters: allReal },
};

/** A chapter still being written shows a muted "Soon" badge and is not a link. */
export const WithComingSoon: Story = {
  args: {
    chapters: [allReal[0], allReal[1], { ...allReal[2], available: false }],
  },
};
