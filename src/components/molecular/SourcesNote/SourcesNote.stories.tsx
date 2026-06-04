import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SourcesNote } from './SourcesNote';

const meta: Meta<typeof SourcesNote> = {
  title: 'Components/Molecular/SourcesNote',
  component: SourcesNote,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A collapsible disclosure with the chapter’s "why it matters" note and verified sources.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  args: {
    whyItMatters:
      'A building with a well-designed overhang gives you comfort as a gift.',
    sourcedAside:
      'At a typical mid-latitude, the noon sun sits about 47 degrees higher in midsummer than in midwinter.',
    sources: [
      {
        title: 'U.S. Department of Energy — Passive Solar Homes',
        url: 'https://www.energy.gov/energysaver/passive-solar-homes',
      },
      {
        title: 'NOAA Global Monitoring Laboratory — Solar Position Calculator',
        url: 'https://gml.noaa.gov/grad/solcalc/azel.html',
      },
    ],
  },
};
