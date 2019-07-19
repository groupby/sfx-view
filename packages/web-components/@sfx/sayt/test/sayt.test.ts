import { expect, spy, stub } from './utils';
import Sayt from '../src/sayt';

describe('Sayt Component', () => {
  let sayt;

  beforeEach(() => {
    sayt = new Sayt();
  });

  describe('connectedCallback()', () => {
    it('should register event listeners to the window', () => {
      const addEventListener = stub(window, 'addEventListener');

      sayt.connectedCallback();

      expect(addEventListener).to.be.calledWith('sfx::sayt_show', sayt.eventCallback);
      expect(addEventListener).to.be.calledWith('sfx::sayt_hide', sayt.eventCallback);
    });
  });


  describe('disconnectedCallback()', () => {
    it('should remove event listeners on the window', () => {
      const removeEventListener = stub(window, 'removeEventListener');

      sayt.disconnectedCallback();

      expect(removeEventListener).to.be.calledWith('sfx::sayt_show', sayt.eventCallback);
      expect(removeEventListener).to.be.calledWith('sfx::sayt_hide', sayt.eventCallback);
    });
  });

  describe('updated()', () => {
    it('should change the hidden property if the show property has changed', () => {
      sayt.hidden = true;
      sayt.show = true;

      sayt.updated(new Map([['show', false]]));

      expect(sayt.hidden).to.equal(false);
    });
  });

  describe('render()', () => {
    it('should call a render function', () => {
      const renderStub = stub(sayt, 'render').returns('component has rendered');
      expect(sayt.render()).to.equal('component has rendered');
      expect(renderStub).to.be.calledOnce;
    });
  });
});
