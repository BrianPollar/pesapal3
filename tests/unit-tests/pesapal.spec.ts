import { expect, describe, beforeEach, it } from 'vitest';
import { Pesapal, Iconfig } from '../../src/pesapal';
import { PesaPalController } from '../../src/controllers/payment.controller';

describe('PesaPalController', () => {
  let instance: Pesapal;
  let paymentInstance: PesaPalController;

  beforeEach(() => {
    const config: Iconfig = {
      pesapalEnvironment: 'string;', // TODO
      pesapalConsumerKey: 'string;', // TODO
      pesapalConsumerSecret: 'string;', // TODO
      pesapalIpnUrl: 'string;', // TODO
      pesapalCallbackUrl: 'string;'
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
