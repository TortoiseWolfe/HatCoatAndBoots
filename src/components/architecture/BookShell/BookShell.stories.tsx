import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import BookShell from './BookShell';

const meta: Meta<typeof BookShell> = {
  title: 'Book/Architecture/BookShell',
  component: BookShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The one shared shell for every book page — same 3-column viewer with ' +
          'the building byte-identically positioned; only chapterFocus + rail ' +
          'copy change between home/hat/coat/boots.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const IndexNeutral: Story = {
  args: { chapterFocus: null },
};

export const HatFocus: Story = {
  args: { chapterFocus: 'roof' },
};

export const EnvelopeFocus: Story = {
  args: { chapterFocus: 'envelope' },
};
