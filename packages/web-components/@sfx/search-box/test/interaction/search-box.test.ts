import { SEARCHBOX_EVENT } from '../../src/events';
import { expect, stub, waitForUpdateComplete } from '../utils';
import SearchBox from '../../src/search-box';
import { TemplateResult, html } from 'lit-element';

describe('SearchBox Component', () => {
  let searchbox;

  beforeEach(() => {
    searchbox = new SearchBox();
  });

  describe.only('interaction tests', () => {
    let container;

    before(() => {
      container = document.createElement('div');
      container.id = "interaction-container";
      document.body.appendChild(container);
    });

    after(() => {
      container.parentNode.removeChild(container);
    });

    beforeEach(() => {
      container.innerHTML = '';
    });

    it('should set the searchbox input value when the searchbox.value property is updated', () => {
      container.appendChild(searchbox);

      return window.customElements.whenDefined('sfx-search-box').then(() => {
        searchbox.value = "Search Term";

        return waitForUpdateComplete(searchbox);
      }).then(() => {
        const searchboxInput = searchbox.querySelector('input');

        expect(searchboxInput.value).to.equal('Search Term');
      });
    });

    it('should update the searchbox value property when an input event is dispatched', () => {
      container.appendChild(searchbox);

      return window.customElements.whenDefined('sfx-search-box').then(() => {
        const searchboxInput = searchbox.querySelector('input');
        searchboxInput.value = "Search Term";
        const inputEvent = new Event('input', { 'bubbles': true });

        searchboxInput.dispatchEvent(inputEvent);

        return waitForUpdateComplete(searchbox);
      }).then(() => {
        expect(searchbox.value).to.equal('Search Term');
      });
    });

    it('should clear the searchbox when the clear button is clicked', () => {
      searchbox.clearButton = true;
      searchbox.searchButton = true;

      container.appendChild(searchbox);

      return window.customElements.whenDefined('sfx-search-box').then(() => {
        const searchboxNode = document.querySelector('sfx-search-box');
        const searchboxInput = searchboxNode.querySelector('input');

        searchbox.value = searchboxInput.value = "Search Term";

        return waitForUpdateComplete(searchbox);
      }).then(() => {
        const searchboxNode = document.querySelector('sfx-search-box');
        const searchboxButtons = searchboxNode.querySelectorAll('button');
        const searchboxClearButton = searchboxButtons[0];
        searchboxClearButton.click();

        return waitForUpdateComplete(searchbox);
      }).then(() => {
        const searchboxNode = document.querySelector('sfx-search-box');
        const searchboxInput = searchboxNode.querySelector('input');

        expect(searchbox.value).to.equal('');
        expect(searchboxInput.value).to.equal('');
      });
    });

    it('should dispatch a search event when the search button is clicked', () => {
      searchbox.clearButton = true;
      searchbox.searchButton = true;
      let eventListenerResolve;
      const eventListenerPromise = new Promise((resolve) => eventListenerResolve = resolve);

      container.appendChild(searchbox);

      const searchboxNode = container.querySelector('sfx-search-box');

      searchboxNode.addEventListener(SEARCHBOX_EVENT.SEARCH_REQUEST, (e: any) => {
        eventListenerResolve(e);
      });

      return window.customElements.whenDefined('sfx-search-box').then(() => {
        const searchboxNode = document.querySelector('sfx-search-box');
        const searchboxInput = searchboxNode.querySelector('input');

        searchbox.value = searchboxInput.value = "Search Term";

        return waitForUpdateComplete(searchbox);
      }).then(() => {
        const searchboxButtons = searchbox.querySelectorAll('button');
        const searchboxSearchButton = searchboxButtons[1];

        searchboxSearchButton.click();

        return waitForUpdateComplete(searchbox);
      }).then(() => {

        return eventListenerPromise;
      }).then((e: any) => {

        expect(e.detail).to.equal('Search Term');
      });
    });
  });
});
