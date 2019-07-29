import { LitElement, customElement, html, property, PropertyValues } from 'lit-element';
import { SAYT_EVENT } from './events';

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
   * Determines the visibility of the `sayt` component.
   */
  @property({ type: Boolean, reflect: true }) visible = false;
  /**
   * Stores the ID of the relevant search element.
   */
  @property({ type: String, reflect: true }) searchbar = '';

  /**
   * Calls superclass constructor and bind methods.
   */
  constructor() {
    super();

    this.showSayt = this.showSayt.bind(this);
    this.hideSayt = this.hideSayt.bind(this);
    this.processClick = this.processClick.bind(this);
    this.processKeyPress = this.processKeyPress.bind(this);
    this.nodeInSearchBar = this.nodeInSearchBar.bind(this);
    this.hideCorrectSayt = this.hideCorrectSayt.bind(this);
    this.showCorrectSayt = this.showCorrectSayt.bind(this);
    this.isCorrectSayt = this.isCorrectSayt.bind(this);
  }

  /**
   * Registers event listeners.
   */
  connectedCallback() {
    super.connectedCallback();

    window.addEventListener(SAYT_EVENT.SAYT_SHOW, this.showCorrectSayt);
    window.addEventListener(SAYT_EVENT.SAYT_HIDE, this.hideCorrectSayt);
    window.addEventListener('click', this.processClick);
    window.addEventListener('keypress', this.processKeyPress);
  }

  /**
   * Removes event listeners.
   */
  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener(SAYT_EVENT.SAYT_SHOW, this.showCorrectSayt);
    window.removeEventListener(SAYT_EVENT.SAYT_HIDE, this.hideCorrectSayt);
    window.removeEventListener('click', this.processClick);
    window.removeEventListener('keypress', this.processKeyPress);
  }

  createRenderRoot() {
    return this;
  }

  /**
   * Update component `hidden` property when the `visible` property changes.
   *
   * @param changedProps A map of the all the change properties.
   */
  updated(changedProps: PropertyValues) {
    if (changedProps.has('visible')) {
      this.hidden = !this.visible;
    }
  }

  /**
   * Changes the `visible` property to `true`.
   */
  showSayt() {
    this.visible = true;
  }

  /**
   * Makes SAYT visible if the event refers to the correct SAYT component.
   *
   * @param event An event that can contain a searchbar ID.
   */
  showCorrectSayt(event: CustomEvent) {
    if (this.isCorrectSayt(event)) {
      this.showSayt();
    }
  }

  /**
   * Changes the `visible` property to `false`.
   */
  hideSayt() {
    this.visible = false;
  }

  /**
   * Hides SAYT if the event refers to the correct SAYT component.
   *
   * @param event An event that can contain a searchbar ID.
   */
  hideCorrectSayt(event: CustomEvent) {
    if (this.isCorrectSayt(event)) {
      this.hideSayt();
    }
  }

  /**
   * Determines whether an event refers to the correct SAYT. This is true if
   * either a matching `searchbar` ID is specified, or if no `searchbar` ID
   * is specified at all.
   *
   * @param event An event that can contain a searchbar ID for comparison.
   */
  isCorrectSayt(event: CustomEvent) {
    const searchbar = event.detail.searchbar;
    return searchbar === this.searchbar || searchbar === undefined;
  }

  /**
   * Processes a click event in order to close SAYT under the right conditions.
   * 
   * @param event The click event.
   */
  processClick(event: Event) {
    const target = event.target as Node;
    if (this.contains(target) || this.nodeInSearchBar(target)) return;

    this.hideSayt();
  }

  /**
   * Checks whether a given node is inside of SAYT's identified search bar.
   * 
   * @param node The node to check for containment.
   */
  nodeInSearchBar(node: Node) {
    const searchBar = document.querySelector('#' + this.searchbar);
    return !!searchBar && searchBar.contains(node);
  }

  /**
   * Processes a keypress event in order to close SAYT under the right conditions.
   * @param event 
   */
  processKeyPress(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.hideSayt();
    }
  }

  /**
   * Returns a TemplateResult object for rendering in LitElement.
   */
  render() {
    return html`
      ${ this.hideAutocomplete ? '' : html`<sfx-autocomplete></sfx-autocomplete>` }
    `;
  }
}
