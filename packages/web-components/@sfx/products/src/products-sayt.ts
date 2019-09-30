import { css, CSSResult, customElement } from 'lit-element';
import {
  SAYT_PRODUCTS_RESPONSE,
  SaytProductsResponsePayload,
} from '@sfx/events';
import { ProductsBase } from './';

/**
 * The `sfx-products-sayt` web component wraps and renders a number of
 * `sfx-product` components. It wraps each `sfx-product` component in an
 * additional wrapper for flexibility.
 */
@customElement('sfx-products-sayt')
export default class ProductsSayt extends ProductsBase {
  /**
   * Binds relevant methods.
   */
  constructor() {
    super();

    this.setProductsFromEvent = this.setProductsFromEvent.bind(this);
  }

  /**
   * Registers event listeners.
   */
  connectedCallback() {
    super.connectedCallback();

    window.addEventListener(SAYT_PRODUCTS_RESPONSE, this.setProductsFromEvent);
  }

  /**
   * Removes event listeners.
   */
  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener(SAYT_PRODUCTS_RESPONSE, this.setProductsFromEvent);
  }

  /**
   * Sets the `products` property from the products in an event.
   *
   * @param event An event containing a search result with product data.
   */
  setProductsFromEvent(event: CustomEvent<SaytProductsResponsePayload>) {
    const eventGroup = event.detail.group || '';
    if (eventGroup === this.group) {
      this.products = event.detail.products || [];
    }
  }

  protected renderStyles(): CSSResult {
    return css`
      sfx-products-sayt {
        display: flex;
        flex-wrap: wrap;
      }

      sfx-products-sayt[hidden] {
        display: none;
      }
    `;
  }
}
