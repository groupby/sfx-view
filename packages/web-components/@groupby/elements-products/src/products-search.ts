import { css, CSSResult, customElement } from 'lit-element';
import {
  SEARCH_RESPONSE,
  Product,
  SearchResponsePayload,
  CacheResponsePayload,
} from '@groupby/elements-events';
import * as shortid from 'shortid';
import { ProductsBase } from '.';

/**
 * The `gbe-products` web component wraps and renders a number of
 * `gbe-product` components. It wraps each `gbe-product` component in an
 * additional wrapper for flexibility.
 *
 * This component updates upon receiving a [[SEARCH_RESPONSE]] event.
 */
@customElement('gbe-products')
export default class ProductsSearch extends ProductsBase {
  /**
   * A random string suitable for use in stable IDs related to this
   * component.
   */
  protected componentId = shortid.generate();

  protected cacheResponseEventName = this.getResponseEventName('products-search', this.componentId);

  /**
   * Binds relevant methods.
   */
  constructor() {
    super();
    this.setProductsFromEvent = this.setProductsFromEvent.bind(this);
    this.setProductsFromCacheData = this.setProductsFromCacheData.bind(this);
  }

  /**
   * Registers event listeners.
   */
  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener(SEARCH_RESPONSE, this.setProductsFromEvent);
    window.addEventListener(this.cacheResponseEventName, this.setProductsFromCacheData);
    this.requestInitialData(SEARCH_RESPONSE, this.group, this.cacheResponseEventName);
  }

  /**
   * Removes event listeners.
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener(SEARCH_RESPONSE, this.setProductsFromEvent);
    window.removeEventListener(this.cacheResponseEventName, this.setProductsFromCacheData);
  }

  /**
   * Receives an event for populating initial data.
   * Intended to be used on mount of this component.
   *
   * @param event The event object.
   */
  setProductsFromCacheData(event: CustomEvent<CacheResponsePayload>): void {
    const eventGroup = event.detail.data.group || '';
    const componentGroup = this.group || '';
    if (eventGroup === componentGroup) {
      const data = event.detail.data || {};
      this.products = data.products || [];
    }
  }

  /**
   * Sets the `products` property from the products in an event.
   *
   * @param event An event containing a search result with product data.
   */
  setProductsFromEvent(event: CustomEvent<SearchResponsePayload<Product>>): void {
    const eventGroup = event.detail.group || '';
    const componentGroup = this.group || '';
    if (eventGroup === componentGroup) {
      this.products = event.detail.results.products || [];
    }
  }

  protected renderStyles(): CSSResult {
    return css`
      gbe-products {
        display: flex;
        flex-wrap: wrap;
      }

      gbe-products[hidden] {
        display: none;
      }
    `;
  }
}
