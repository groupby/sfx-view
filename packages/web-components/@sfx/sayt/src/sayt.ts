import {
  LitElement,
  customElement,
  html, property,
  PropertyValues,
  TemplateResult,
} from 'lit-element';
// eslint-disable-next-line import/no-unresolved
import { ifDefined } from 'lit-html/directives/if-defined';
import { debounce } from 'debounce';
import {
  AUTOCOMPLETE_ACTIVE_TERM,
  AUTOCOMPLETE_REQUEST,
  AUTOCOMPLETE_RESPONSE,
  SAYT_HIDE,
  SAYT_SHOW,
  SAYT_PRODUCTS_REQUEST,
  SAYT_PRODUCTS_RESPONSE,
  SEARCHBOX_INPUT,
  AutocompleteActiveTermPayload,
  SearchboxInputPayload,
  WithGroup,
} from '@sfx/events';

/**
 * The `sfx-sayt` component is responsible for displaying and hiding the
 * `sfx-autocomplete` and `sfx-products` components.
 */
@customElement('sfx-sayt')
export default class Sayt extends LitElement {
  /**
   * Determines if the `sfx-autocomplete` component will be hidden or not.
   */
  @property({ type: Boolean, reflect: true }) hideAutocomplete = false;

  /**
   * Determines if the `sfx-products` component will be hidden or not.
   */
  @property({ type: Boolean, reflect: true }) hideProducts = false;

  /**
   * Determines the visibility of the `sayt` component.
   */
  @property({ type: Boolean, reflect: true }) visible = false;

  /**
   * Stores the ID of the relevant search element.
   */
  @property({ type: String, reflect: true }) searchbox = '';

  /**
   * The name of the event group that this component belongs to.
   * This component will dispatch events with this group in their
   * payloads and will only react to events that contain this group.
   */
  @property({ type: String, reflect: true }) group = '';

  /**
   * Customizes the text in the close button.
   */
  @property({ type: String, reflect: true }) closeText = 'Close';

  /**
   * Shows a button to allow for closing SAYT manually.
   */
  @property({ type: Boolean, reflect: true }) showCloseButton = false;

  /**
   * The minimum length of the search term required before a SAYT request will be made with it.
   */
  @property({ type: Number, reflect: true }) minSearchLength = 3;

  /**
   * The debounce delay in millilseconds.
   */
  @property({ type: Number, reflect: true }) debounce = 300;

  /**
   * The area to use in product searches.
   */
  @property({ type: String, reflect: true }) area: string = '';

  /**
   * The collection to use in autocomplete and product searches.
   */
  @property({ type: String, reflect: true }) collection: string = '';

  /**
   * A debounced version of [[requestSaytProducts]].
   * The delay is configured through the [[debounce]] property.
   */
  debouncedRequestSaytProducts: SaytRequester & ReturnType<typeof debounce>;

  /**
   * A debounced version of [[requestSaytAutocompleteTerms]].
   * The delay is configured through the [[debounce]] property.
   */
  debouncedRequestSaytAutocompleteTerms: SaytRequester & ReturnType<typeof debounce>;

  /**
   * Calls superclass constructor and bind methods.
   */
  constructor() {
    super();

    this.showSayt = this.showSayt.bind(this);
    this.hideSayt = this.hideSayt.bind(this);
    this.processClick = this.processClick.bind(this);
    this.processKeyEvent = this.processKeyEvent.bind(this);
    this.nodeInSearchbox = this.nodeInSearchbox.bind(this);
    this.hideCorrectSayt = this.hideCorrectSayt.bind(this);
    this.showCorrectSayt = this.showCorrectSayt.bind(this);
    this.isCorrectSayt = this.isCorrectSayt.bind(this);
    this.requestSayt = this.requestSayt.bind(this);
    this.processSearchboxInput = this.processSearchboxInput.bind(this);
    this.processSfxSearchboxChange = this.processSfxSearchboxChange.bind(this);
    this.setSearchboxListener = this.setSearchboxListener.bind(this);
    this.handleAutocompleteTermHover = this.handleAutocompleteTermHover.bind(this);
    this.setDebouncedMethods = this.setDebouncedMethods.bind(this);

    this.setDebouncedMethods();
  }

  /**
   * Registers event listeners.
   */
  connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener(SAYT_SHOW, this.showCorrectSayt);
    window.addEventListener(AUTOCOMPLETE_RESPONSE, this.showCorrectSayt);
    window.addEventListener(SAYT_PRODUCTS_RESPONSE, this.showCorrectSayt);
    window.addEventListener(SAYT_HIDE, this.hideCorrectSayt);
    window.addEventListener(AUTOCOMPLETE_ACTIVE_TERM, this.handleAutocompleteTermHover);
    window.addEventListener('click', this.processClick);
    window.addEventListener('keydown', this.processKeyEvent);
    this.addEventListener(AUTOCOMPLETE_ACTIVE_TERM, this.handleAutocompleteTermHover);
    this.setSearchboxListener(this.searchbox, 'add');
  }

  /**
   * Removes event listeners.
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();

    window.removeEventListener(SAYT_SHOW, this.showCorrectSayt);
    window.removeEventListener(AUTOCOMPLETE_RESPONSE, this.showCorrectSayt);
    window.removeEventListener(SAYT_PRODUCTS_RESPONSE, this.showCorrectSayt);
    window.removeEventListener(SAYT_HIDE, this.hideCorrectSayt);
    window.removeEventListener(AUTOCOMPLETE_ACTIVE_TERM, this.handleAutocompleteTermHover);
    window.removeEventListener('click', this.processClick);
    window.removeEventListener('keydown', this.processKeyEvent);
    this.removeEventListener(AUTOCOMPLETE_ACTIVE_TERM, this.handleAutocompleteTermHover);
    this.setSearchboxListener(this.searchbox, 'remove');
  }

  createRenderRoot(): Element|ShadowRoot {
    return this;
  }

  /**
   * Update a component property when the property changes.
   *
   * @param changedProps A map of the all the changed properties.
   */
  updated(changedProps: PropertyValues): void {
    if (changedProps.has('visible')) {
      this.hidden = !this.visible;
    }
    if (changedProps.has('searchbox')) {
      const oldSearchbox = changedProps.get('searchbox') as string;

      this.setSearchboxListener(oldSearchbox, 'remove');
      this.setSearchboxListener(this.searchbox, 'add');
    }
    if (changedProps.has('debounce')) {
      this.setDebouncedMethods();
    }
  }

  /**
   * Toggle the events being registered and unregisterd when the `searchbox` property changes.
   *
   * @param searchboxId A searchbox ID given to the searchbox.
   * @param action A string to indicate the type of eventListener(add or remove).
   */
  setSearchboxListener(searchboxId: string, action: 'add' | 'remove'): void {
    const setEventListener = `${action}EventListener` as 'addEventListener' | 'removeEventListener';
    if (searchboxId) {
      const searchbox = document.getElementById(searchboxId);
      if (searchbox) {
        searchbox[setEventListener]('input', this.processSearchboxInput);
      }
    } else {
      window[setEventListener](SEARCHBOX_INPUT, this.processSfxSearchboxChange);
    }
  }

  /**
   * Changes the [[visible]] property to `true`.
   */
  showSayt(): void {
    this.visible = true;
  }

  /**
   * Makes SAYT visible if the event refers to the correct SAYT component.
   * @see [[isCorrectSayt]]
   *
   * @param event An event that can contain a searchbox ID.
   */
  showCorrectSayt(event: CustomEvent<WithGroup>): void {
    if (this.isCorrectSayt(event)) {
      this.showSayt();
    }
  }

  /**
   * Changes the [[visible]] property to `false`.
   * This will also clear pending calls for SAYT products.
   */
  hideSayt(): void {
    this.visible = false;
    this.debouncedRequestSaytProducts.clear();
  }

  /**
   * Hides SAYT if the event refers to the correct SAYT component.
   *
   * @param event An event that can contain a searchbox ID.
   */
  hideCorrectSayt(event: CustomEvent<WithGroup>): void {
    if (this.isCorrectSayt(event)) {
      this.hideSayt();
    }
  }

  /**
   * Triggers requests for Sayt autocomplete terms and Sayt products
   * simultaneously using a query and group name.
   * They will only be called if the term is at least [[minSearchLength]] long.
   *
   * @param query The search term to use.
   */
  requestSayt(query: string): void {
    if (query.length < this.minSearchLength) {
      this.hideSayt();
      return;
    }

    this.debouncedRequestSaytAutocompleteTerms(query);
    this.debouncedRequestSaytProducts(query);
  }

  /**
   * Regenerates specific debounced methods.
   *
   * @see [[debouncedRequestSaytAutocompleteTerms]]
   * @see [[debouncedRequestSaytProducts]]
   */
  setDebouncedMethods(): void {
    this.debouncedRequestSaytAutocompleteTerms = debounce(this.requestSaytAutocompleteTerms, this.debounce, false);
    this.debouncedRequestSaytProducts = debounce(this.requestSaytProducts, this.debounce, false);
  }

  /**
   * Dispatches an event to request data. Intended for requesting
   * products or autocomplete terms.
   *
   * @param eventType The type of the event to be dispatched.
   * @param query The query term.
   */
  dispatchRequestEvent(eventType: string, query: string): void {
    const requestEvent = new CustomEvent(eventType, {
      detail: {
        query,
        group: this.group,
        config: {
          area: this.area,
          collection: this.collection,
        },
      },
      bubbles: true,
    });
    this.dispatchEvent(requestEvent);
  }

  /**
   * Dispatches an [[AUTOCOMPLETE_REQUEST]] event with the provided data.
   *
   * @param query The search term to use.
   */
  requestSaytAutocompleteTerms(query: string): void {
    this.dispatchRequestEvent(AUTOCOMPLETE_REQUEST, query);
  }

  /**
   * Dispatches a [[SAYT_PRODUCTS_REQUEST]] event with the provided data.
   *
   * @param query The search term to use.
   */
  requestSaytProducts(query: string): void {
    this.dispatchRequestEvent(SAYT_PRODUCTS_REQUEST, query);
  }

  /**
   * Handles how the hover on Sayt autocomplete terms updates the sayt products.
   * Triggers a request of Sayt products using the query.
   *
   * @param event The hover event dispatched from autocomplete.
   */
  handleAutocompleteTermHover(event: CustomEvent<AutocompleteActiveTermPayload>): void {
    if (this.isCorrectSayt(event)) {
      this.debouncedRequestSaytProducts(event.detail.query);
    }
  }

  /**
   * Handles searchbox input events by passing the event's value to `requestSayt()`
   * in the case where a `searchbox` ID is passed to the Sayt component.
   * Can be used to not require listening for a specific SF-X event.
   *
   * @param event The searchbox input event dispatched from the searchbox.
   */
  processSearchboxInput(event: Event): void {
    this.requestSayt((event.target as HTMLInputElement).value);
  }

  /**
   * Handles SF-X searchbox changes by passing the event's value to `requestSayt()`
   * if [[isCorrectSayt]] returns `true`.
   * Used when a `searchbox` ID is not passed to the Sayt component.
   *
   * @param event The [[SEARCHBOX_INPUT]] event dispatched from the searchbox.
   */
  processSfxSearchboxChange(event: CustomEvent<SearchboxInputPayload>): void {
    if (this.isCorrectSayt(event)) {
      this.requestSayt(event.detail.term);
    }
  }

  /**
   * Determines whether an event refers to the correct SAYT. This is true if
   * the `group` in the event matches this component's group. If `group` is not defined
   * in the event, it will default to an empty string.
   *
   * @param event An event that contains a group name for comparison.
   */
  isCorrectSayt(event: CustomEvent<WithGroup>): boolean {
    const group = (event.detail && event.detail.group) || '';
    return group === this.group;
  }

  /**
   * Processes a click event in order to close SAYT under the right conditions.
   *
   * @param event The click event.
   */
  processClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (this.contains(target) || this.nodeInSearchbox(target)) return;
    this.hideSayt();
  }

  /**
   * Handles hiding SAYT on click of a close link/button (or other event).
   *
   * @param event An event with a default action to be prevented.
   */
  clickCloseSayt(event: Event): void {
    event.preventDefault();
    this.hideSayt();
  }

  /**
   * Checks whether a given node is inside of SAYT's identified search box.
   *
   * @param node The node to check for containment.
   */
  nodeInSearchbox(node: Node): boolean {
    if (!this.searchbox) return false;
    const searchbox = document.getElementById(this.searchbox);
    return !!searchbox && searchbox.contains(node);
  }

  /**
   * Processes a keyboard event in order to close SAYT when certain keys are pressed.
   * Namely:
   *   - Escape
   *
   * @param event A keyboard event used for checking which key has been pressed.
   */
  processKeyEvent(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
      case 'Esc': // IE/Edge
        this.hideSayt();
        break;
      case 'ArrowUp':
      case 'Up': // IE/Edge
        this.selectPreviousAutocompleteTerm();
        break;
      case 'ArrowDown':
      case 'Down': // IE/Edge
        this.selectNextAutocompleteTerm();
        break;
      default: // Do nothing
    }
  }

  selectPreviousAutocompleteTerm(): void {
    const autocomplete = this.querySelector<any>('[data-sfx-ref="autocomplete"]');
    if (!autocomplete) return;

    autocomplete.selectPrevious();
    if (!this.searchbox) return;

    const searchbox = document.getElementById(this.searchbox);
    if (!searchbox) return;
    searchbox.setAttribute('aria-activedescendant', autocomplete.selectedId);
  }

  selectNextAutocompleteTerm(): void {
    const autocomplete = this.querySelector<any>('[data-sfx-ref="autocomplete"]');
    if (!autocomplete) return;

    autocomplete.selectNext();
    if (!this.searchbox) return;

    const searchbox = document.getElementById(this.searchbox);
    if (!searchbox) return;
    searchbox.setAttribute('aria-activedescendant', autocomplete.selectedId);
  }

  /**
   * Returns a TemplateResult object for rendering in LitElement.
   */
  render(): TemplateResult {
    return html`
      <style>
        sfx-sayt {
          display: block;
        }

        sfx-sayt[hidden] {
          display: none;
        }

        .sfx-sayt-container {
          display: flex;
        }
      </style>
      ${this.showCloseButton
    ? html`
            <button class="sfx-close" aria-label="Close" @click=${this.clickCloseSayt}>
              ${this.closeText}
            </button>
          `
    : ''}
      <div class="sfx-sayt-container">
        ${this.hideAutocomplete
    ? ''
    : html`
            <sfx-autocomplete group="${ifDefined(this.group)}">
            </sfx-autocomplete>`
}
        ${this.hideProducts
    ? ''
    : html`
            <sfx-products-sayt group="${ifDefined(this.group)}">
            </sfx-products-sayt>`
}
      </div>
    `;
  }
}

/**
 * The type of the callback expected to be passed to getDebounce.
 */
export interface SaytRequester {
  (query: string, searchbox?: string): void;
}
