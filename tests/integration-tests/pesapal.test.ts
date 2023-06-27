import { expect, describe, beforeEach, it } from 'vitest';
import { Pesapal, Iconfig } from '../../src/pesapal';
import { PesaPalController } from '../../src/controllers/payment.controller';
import axios from 'axios';
import * as MockAdapter from 'axios-mock-adapter';

const mockAxios = new MockAdapter(axios);

describe('PesapalPureMock', () => {
  let pesapal: Pesapal;

  beforeEach(() => {
    // axiosMock.reset();
    const config: Iconfig = {
      pesapalEnvironment: 'sandbox',
      pesapalConsumerKey: 'test-consumer-key',
      pesapalConsumerSecret: 'test-consumer-secret',
      pesapalIpnUrl: 'http://localhost:4000/pesapal/ipn',
      pesapalCallbackUrl: 'http://localhost:4000/pesapal/callback'
    };
    pesapal = new Pesapal(config);
  });

  it('should register the IPN', () => {
    const response = {
      id: '1234567890',
      status: 'Registered'
    };

    mockAxios.onPost('https://pay.pesapal.com/v3/ipg/register')
      .reply(200, {
        data: response
      });
    const res = pesapal.run();
    expect(res).toBeInstanceOf(Pesapal);
  });
});


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
