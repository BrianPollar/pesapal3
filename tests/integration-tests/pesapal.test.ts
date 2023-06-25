import { expect, describe, beforeEach, it } from 'vitest';
import { Pesapal, Iconfig } from '../../src/pesapal';
import { PesaPalController } from '../../src/controllers/payment.controller';

describe('PesaPalController', () => {
  let instance: Pesapal;
  let paymentInstance: PesaPalController;

  beforeEach(() => {
    const config: Iconfig = {
      pesapalEnvironment: 'sandbox',
      pesapalConsumerKey: 'TDpigBOOhs+zAl8cwH2Fl82jJGyD8xev',
      pesapalConsumerSecret: '1KpqkfsMaihIcOlhnBo/gBZ5smw=',
      pesapalIpnUrl: 'http://localhost:4000/payment', // TODO
      pesapalCallbackUrl: 'http://localhost:4000/payment' // TODO
    };

    instance = new Pesapal(config);
    paymentInstance = instance.run();
  });

  it('its real instance of Pesapal', () => {
    expect(instance).toBeInstanceOf(Pesapal);
  });

  it('its real instance of PesaPalController', () => {
    expect(paymentInstance).toBeInstanceOf(PesaPalController);
  });
});
