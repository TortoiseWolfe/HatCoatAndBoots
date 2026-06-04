import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChapterViewer } from './BookViewer';
import type { ChapterManifest } from './manifests/types';

const DEMO: ChapterManifest = {
  slug: 'hat',
  meta: { title: 'The Hat', kicker: 'Why a roof needs a brim' },
  layers: [
    {
      id: 'wall',
      src: 'book/hat/wall.svg',
      label: 'Walls',
      alt: 'The insulated wall',
      tabColor: '#c9a86a',
      tabWord: 'WALL',
      z: 20,
      explodeOffset: { x: 0, y: 0 },
    },
    {
      id: 'roof',
      src: 'book/hat/roof-overhang.svg',
      label: 'Roof overhang',
      alt: 'The roof and its overhang',
      tabColor: '#c8714a',
      tabWord: 'ROOF',
      z: 40,
      explodeOffset: { x: 0, y: -60 },
    },
  ],
  steps: [
    {
      id: 'whole',
      heading: 'A house is layers',
      prose: 'Every building is a stack of jobs.',
      dockedLayerIds: ['wall', 'roof'],
    },
    {
      id: 'summer',
      heading: 'The summer sun is blocked',
      prose: 'The overhang shades the window, so the room stays cool.',
      dockedLayerIds: ['wall'],
      spotlightLayerId: 'roof',
    },
  ],
};

const meta: Meta<typeof ChapterViewer> = {
  title: 'Components/Organisms/ChapterViewer',
  component: ChapterViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The chapter viewer: a scroll-story whose beats dock/explode the building’s layers, with the parts themselves as controls.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    manifest: DEMO,
  },
};
