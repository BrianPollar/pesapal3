/* eslint-disable @typescript-eslint/ban-ts-comment */
import { vi, expect, describe, beforeEach, it } from 'vitest';
import { Pesapal, Iconfig } from '../../src/pesapal';
import { PesaPalController } from '../../src/controllers/payment.controller';

describe('PesaPalController', () => {
  let instance: Pesapal;

  beforeEach(() => {
    const config: Iconfig = {
      pesapalEnvironment: 'sandbox',
      pesapalConsumerKey: 'TDpigBOOhs+zAl8cwH2Fl82jJGyD8xev',
      pesapalConsumerSecret: '1KpqkfsMaihIcOlhnBo/gBZ5smw=',
      pesapalIpnUrl: 'http://localhost:4000/payment', // TODO
      pesapalCallbackUrl: 'http://localhost:4000/payment' // TODO
    };

    instance = new Pesapal(config);
  });

  it('its real instance of Pesapal', () => {
    expect(instance).toBeInstanceOf(Pesapal);
  });

  it('#run should run Pesapal', () => {
    // @ts-ignore
    vi.spyOn(instance.paymentInstance, 'registerIpn').mockImplementationOnce(() => ({ success: true }));
    const runSpy = vi.spyOn(instance, 'run');
    const paymentInstance = instance.run();
    expect(runSpy).toHaveBeenCalled();
    expect(paymentInstance).toBeInstanceOf(PesaPalController);
  });
});
