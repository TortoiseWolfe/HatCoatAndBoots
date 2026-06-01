import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LayerToggles from './LayerToggles';
import { hatManifest } from '../manifests/hat.manifest';

const meta: Meta<typeof LayerToggles> = {
  title: 'Book/Architecture/LayerToggles',
  component: LayerToggles,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Controlled per-layer toggle toolbar (roving tabindex, aria-pressed, ' +
          '44px targets) for the Hat chapter.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    layers: hatManifest.layers,
    visibleIds: new Set(hatManifest.layers.map((l) => l.id)),
    onToggle: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllOn: Story = {};

export const RoofHidden: Story = {
  args: {
    visibleIds: new Set(
      hatManifest.layers.map((l) => l.id).filter((id) => id !== 'roof-overhang')
    ),
  },
};
