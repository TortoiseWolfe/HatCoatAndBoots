import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import GuidedViews from './GuidedViews';
import { hatManifest } from '../manifests/hat.manifest';

const meta: Meta<typeof GuidedViews> = {
  title: 'Book/Architecture/GuidedViews',
  component: GuidedViews,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Controlled guided-view selector (radiogroup) with an aria-live ' +
          'explanation for the Hat chapter.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    presets: hatManifest.presets,
    activePresetId: 'everything',
    onSelect: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Everything: Story = { args: { activePresetId: 'everything' } };
export const RoofLine: Story = { args: { activePresetId: 'roof-line' } };
export const HowItShedsWater: Story = {
  args: { activePresetId: 'how-it-sheds-water' },
};
