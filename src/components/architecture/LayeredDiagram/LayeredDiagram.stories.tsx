import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LayeredDiagram from './LayeredDiagram';
import { hatManifest } from '../manifests/hat.manifest';

/**
 * The four guided views as Storybook stories (T028). `EverythingOn` is the
 * no-JS spread (the full composite the Hat gate ships); the others are the
 * teaching beats. Each is a printable spread (Principle IV).
 */
const meta: Meta<typeof LayeredDiagram> = {
  title: 'Book/Architecture/LayeredDiagram',
  component: LayeredDiagram,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The layered "illustrated blueprint" engine for the Hat chapter. ' +
          'One building in one shared coordinate space; a guided view shows a ' +
          'subset of layers without moving any geometry.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    manifest: hatManifest,
    chapterFocus: 'roof',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EverythingOn: Story = {
  name: 'Everything (no-JS spread)',
  args: { initialPresetId: 'everything' },
};

export const BareWall: Story = {
  name: 'Bare Wall (the problem)',
  args: { initialPresetId: 'bare-wall' },
};

export const RoofLine: Story = {
  name: 'Roof Line (one roof, two seasons)',
  args: { initialPresetId: 'roof-line' },
};

export const HowItShedsWater: Story = {
  args: { initialPresetId: 'how-it-sheds-water' },
};
