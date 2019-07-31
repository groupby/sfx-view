import { SEARCHBOX_EVENT } from '../../src/events';
import { expect, stub } from '../utils';
import SearchBox from '../../src/search-box';
import { TemplateResult, html } from 'lit-element';
import { Base } from '@sfx/base';

describe('SearchBox Component', () => {
  let searchbox;
  let searchboxDispatchEvent;

  beforeEach(() => {
    searchbox = new SearchBox();
    searchboxDispatchEvent = stub(searchbox, 'dispatchEvent');
  });

  describe('Constructor', () => {
    it('should extend Base', () => {
      expect(searchbox).to.be.an.instanceof(Base);
    });

    describe('placeholder property', () => {
      it('should have default value `Type your search`', () => {
        expect(searchbox.placeholder).to.equal('Type your search');
      });
    });

    describe('value property', () => {
      it('should have default value of an empty string', () => {
        expect(searchbox.value).to.equal('');
      });
    });

    describe('searchButton property', () => {
      it('should have default value of false', () => {
        expect(searchbox.searchButton).to.be.false;
      });
    });

    describe('clearButton property', () => {
      it('should have default value of false', () => {
        expect(searchbox.clearButton).to.be.false;
      });
    });
  });

  describe('connectCallback', () => {
    it('should add an autocomplete_hover eventListener to the window', () => {
      const windowAddEventListener = stub(window, 'addEventListener');

      searchbox.connectedCallback();

      expect(windowAddEventListener).to.have.been.calledWith(SEARCHBOX_EVENT.UPDATE_SEARCH_TERM, searchbox.updateText);
    });
  });

  describe('disconnectCallback', () => {
    it('should remove the autocomplete_hover eventListener from the window', () => {
      const windowRemoveEventListener = stub(window, 'removeEventListener');

      searchbox.disconnectedCallback();

      expect(windowRemoveEventListener).to.have.been.calledWith(
        SEARCHBOX_EVENT.UPDATE_SEARCH_TERM,
        searchbox.updateText
      );
    });
  });

  describe('emitSearchEvent', () => {
    it('should dispatch a search request event', () => {
      const value = searchbox.value = 'a';

      searchbox.emitSearchEvent();
      const passedEvent = searchboxDispatchEvent.getCall(0).args[0];

      expect(passedEvent.type).to.equal(SEARCHBOX_EVENT.SEARCH_REQUEST);
      expect(passedEvent.detail).to.equal(value);
      expect(passedEvent.bubbles).to.equal(true);
    });
  });

  describe('emitSearchBoxClearClick', () => {
    it('should dispatch an emitSearchBoxClearClick', () => {
      searchbox.emitSearchBoxClearClick();
      const passedEvent = searchboxDispatchEvent.getCall(0).args[0];

      expect(passedEvent.type).to.equal(SEARCHBOX_EVENT.SEARCHBOX_CLEAR_CLICK);
      expect(passedEvent.bubbles).to.equal(true);
    });
  });

  describe('updateText', () => {
    it('should update the value property with information from the event', () => {
      const detail = 'inputText';
      const inputEvent = new CustomEvent('some-test-type', { detail });
      const updateSearchTermValue = stub(searchbox, 'updateSearchTermValue');
  
      searchbox.updateText(inputEvent);

      expect(updateSearchTermValue).to.be.calledWith(detail);
    });
  });

  describe('handleKeydown', () => {
    it('should invoke the emitSearchEvent function if enter is pressed and value property length is greater than 0', () => {
      const emitSearchStub = stub(searchbox, 'emitSearchEvent');
      searchbox.value = 'hello';

      searchbox.handleKeydown({ key: 'Enter' });

      expect(emitSearchStub).to.have.been.called;
    });
  });

  describe('handleInput', () => {
    it('should invoke the updateSearchTermValue function with a value from the event', () => {
      const updateSearchTermValueStub = stub(searchbox, 'updateSearchTermValue');
      const searchTerm = 'dee';

      searchbox.handleInput({ target: { value: searchTerm } });
      const passedEvent = searchboxDispatchEvent.getCall(0).args[0];

      expect(updateSearchTermValueStub).to.have.been.calledWith(searchTerm);
    });

    it('should dispatch a search box change event', () => {
      const updateSearchTermValueStub = stub(searchbox, 'updateSearchTermValue');
      const searchTerm = 'dee';

      searchbox.handleInput({ target: { value: searchTerm } });
      const passedEvent = searchboxDispatchEvent.getCall(0).args[0];

      expect(passedEvent.bubbles).to.equal(true);
      expect(passedEvent.type).to.equal(SEARCHBOX_EVENT.SEARCHBOX_CHANGE);
      expect(passedEvent.detail).to.equal(searchTerm);
    });
  });

  describe('updateSearchTermValue', () => {
    it('should set the search term property to the input value', () => {
      const searchTerm = 'catfood';

      searchbox.updateSearchTermValue(searchTerm);

      expect(searchbox.value).to.equal(searchTerm);
    });
  });

  describe('clearSearch', () => {
    it('should set the search term property to an empty string', () => {
      stub(searchbox, 'emitSearchBoxClearClick');

      searchbox.clearSearch();

      expect(searchbox.value).to.equal('');
    });

    it('should invoke the emitSearchBoxClearClick', () => {
      const emitSearchBoxStub = stub(searchbox, 'emitSearchBoxClearClick');

      searchbox.clearSearch();

      expect(emitSearchBoxStub).to.have.been.called;
    });
  });

  describe('clickExposed', () => {
    it('should dispatch a search box clicked event', () => {
      searchbox.clickExposed();
      const passedEvent = searchboxDispatchEvent.getCall(0).args[0];

      expect(passedEvent.type).to.equal(SEARCHBOX_EVENT.SEARCHBOX_CLICK);
      expect(passedEvent.bubbles).to.be.true;
    });
  });

  describe('render', () => {
    it('should return an instance of TemplateResult', () => {
      const result = searchbox.render();

      expect(result).to.be.an.instanceof(TemplateResult);
    });
  });
});
