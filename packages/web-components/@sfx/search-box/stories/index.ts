import { storiesOf } from '@storybook/html';
import { withKnobs, text } from '@storybook/addon-knobs';
import '../src/searchbox.ts';

// start of event dispatch testing
window.addEventListener('sfx::search_request', (e) => {
  console.log('search request received')
  console.log('event', e)
});

window.addEventListener('sfx::autocomplete_request', (e) => {
  console.log('autocomplete request received')
  console.log('event', e)
});

window.addEventListener('sfx::search_box_cleared', (e) => {
  console.log('search box cleared event received')
  console.log('event', e)
});
// end of event dispatch testing

// start of event listener testing
const autocompleteHover = new CustomEvent('sfx::autocomplete_hover', { detail: 'catfood', bubbles: true });
// end of event listener testing

setTimeout(() => {
  window.dispatchEvent(autocompleteHover)
}, 3000)

storiesOf('Components|Searchbox', module)
  .addDecorator(withKnobs)
  .add('Default', () => `
  <sfx-search-box></sfx-search-box>
`)



