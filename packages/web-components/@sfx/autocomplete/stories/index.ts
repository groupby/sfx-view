import { storiesOf } from '@storybook/html';
import addons from '@storybook/addons';
import { withKnobs, text } from '@storybook/addon-knobs';
import '../src/index';

const results = [
  {
    title: '',
    items: [
      {
        label: 'Golf Ball'
      },
      {
        label: 'Basketball'
      },
      {
        label: 'Baseball'
      },
    ]
  },
  {
    title: 'Brands',
    items: [
      {
        label: 'New Balance'
      },
      {
        label: 'Bauer'
      },
      {
        label: 'CCM'
      },
    ]
  },
  {
    title: 'Categories',
    items: [
      {
        label: 'Sport Equipment'
      },
      {
        label: 'Sport Apparel'
      },
    ]
  },
];

const autocompleteReceivedResultsEvent = {
  customEvents: [
    {
      name: 'sfx::autocomplete_received_results',
      payload: [
        {
          title: '',
          items: [{ label: 'Teal' }, { label: 'Orange' }, { label: 'Fuschia' }]
        },
        {
          title: 'Brands',
          items: [{ label: 'Kashi' }, { label: 'Excel' }]
        },
        {
          title: 'Colors',
          items: [{ label: 'Teal' }, { label: 'Orange' }, { label: 'Fuschia' }]
        }
      ]
    }
  ]
};

const optionalTitle = 'Autocomplete Results';

/*
 * --- Slots Testing ---
 * The final story demonstrates that content slotted in (in this case,
 * the <div> contained within the autocomplete custom element)
 * appears within the light-dom as desired.
 *
 */

storiesOf('Components|Autocomplete', module)
  .addDecorator(withKnobs)
  .add(
    'Default',
    () => `
      <sfx-autocomplete results="${text('Autocomplete Results', JSON.stringify(results))}"></sfx-autocomplete>
    `,
    autocompleteReceivedResultsEvent,
    {
      notes: {
        markdown: `
          # Autocomplete
          Hardcoded

          - Display hardcoded data with one titled autocomplete grouping, and one untitled autocomplete grouping.
          `
      }
    }
  )
  .add(
    'No Data - populate with data received',
    () => `
      <sfx-autocomplete>
      </sfx-autocomplete>
    `,
    autocompleteReceivedResultsEvent
  )
  .add(
    'With Slots',
    () => `
      <sfx-autocomplete results="${text('Autocomplete Results', JSON.stringify(results))}">
        <div>Content appears after main content</div>
      </sfx-autocomplete>
    `,
    autocompleteReceivedResultsEvent
  )
  .add(
    'With title customization',
    () => `
    <sfx-autocomplete
      caption="${text('Optional Title', optionalTitle)}"
      results="${text('Autocomplete', JSON.stringify(results))}">
    </sfx-autocomplete>
    `,
    autocompleteReceivedResultsEvent
  );
