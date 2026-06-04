import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LayerToggles } from './LayerToggles';
import type { Layer } from '@/components/organisms/BookViewer/manifests/types';

const LAYERS: Layer[] = [
  {
    id: 'footing',
    src: 'book/hat/footing.svg',
    label: 'Foundation',
    alt: '',
    tabColor: '#9aa7b3',
    tabWord: 'FOOTING',
    z: 10,
    explodeOffset: { x: 0, y: 70 },
    bbox: { x: 40, y: 300, w: 280, h: 44 },
  },
  {
    id: 'wall',
    src: 'book/hat/wall.svg',
    label: 'Wall',
    alt: '',
    tabColor: '#c9a86a',
    tabWord: 'WALL',
    z: 20,
    explodeOffset: { x: 0, y: 0 },
    bbox: { x: 148, y: 116, w: 96, h: 188 },
  },
  {
    id: 'window',
    src: 'book/hat/window.svg',
    label: 'Window',
    alt: '',
    tabColor: '#7fa8c9',
    tabWord: 'WINDOW',
    z: 30,
    explodeOffset: { x: 90, y: 0 },
    bbox: { x: 182, y: 150, w: 54, h: 103 },
  },
  {
    id: 'roof-overhang',
    src: 'book/hat/roof-overhang.svg',
    label: 'Overhang',
    alt: '',
    tabColor: '#c8714a',
    tabWord: 'ROOF',
    z: 60,
    explodeOffset: { x: 0, y: -80 },
    bbox: { x: 110, y: 62, w: 188, h: 88 },
  },
];

const meta: Meta<typeof LayerToggles> = {
  title: 'Components/Molecular/LayerToggles',
  component: LayerToggles,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The visible layer controls — a labeled, clickable chip per building part to turn each layer on and off.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SomeOff: Story = {
  args: {
    layers: LAYERS,
    isDocked: (id: string) => id !== 'roof-overhang',
    onToggle: () => {},
  },
};
