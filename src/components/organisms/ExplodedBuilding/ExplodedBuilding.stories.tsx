import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ExplodedBuilding } from './ExplodedBuilding';
import type { Layer } from '../BookViewer/manifests/types';

const LAYERS: Layer[] = [
  {
    id: 'wall',
    src: 'book/hat/wall.svg',
    label: 'Walls',
    alt: 'The insulated wall',
    tabColor: '#c9a86a',
    tabWord: 'WALL',
    z: 20,
    explodeOffset: { x: 0, y: 0 },
    bbox: { x: 148, y: 116, w: 96, h: 188 },
  },
  {
    id: 'roof-overhang',
    src: 'book/hat/roof-overhang.svg',
    label: 'Roof overhang',
    alt: 'The roof and its overhang',
    tabColor: '#c8714a',
    tabWord: 'ROOF',
    z: 40,
    explodeOffset: { x: 0, y: -75 },
    bbox: { x: 110, y: 62, w: 188, h: 88 },
  },
];

const meta: Meta<typeof ExplodedBuilding> = {
  title: 'Components/Organisms/ExplodedBuilding',
  component: ExplodedBuilding,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The chapter building, exploded into its real SVG layers over a full-bleed sky. Each layer is a button — the part itself is the control.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllDocked: Story = {
  args: {
    layers: LAYERS,
    isDocked: () => true,
    onToggle: () => {},
  },
};

export const RoofExploded: Story = {
  args: {
    layers: LAYERS,
    isDocked: (id: string) => id !== 'roof-overhang',
    onToggle: () => {},
    spotlightId: 'roof-overhang',
  },
};
