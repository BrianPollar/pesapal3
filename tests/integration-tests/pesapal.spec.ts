/* eslint-disable @typescript-eslint/ban-ts-comment */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PesaPalController } from '../../src/controllers/payment.controller';
import { Iconfig, Pesapal } from '../../src/pesapal';

describe('Pesapal', () => {
  let instance: Pesapal;
  let config: Iconfig;

  beforeEach(() => {
    config = {
      pesapalEnvironment: 'sandbox',
      pesapalConsumerKey: 'TDpigBOOhs+zAl8cwH2Fl82jJGyD8xev',
      pesapalConsumerSecret: '1KpqkfsMaihIcOlhnBo/gBZ5smw=',
      pesapalIpnUrl: 'http://localhost:4000/payment'
    };
    instance = new Pesapal(config);
  });

  it('should be instance of pesapal', () => {
    expect(instance).toBeInstanceOf(Pesapal);
    expect(Pesapal.config).toEqual(config);
    expect(Pesapal.pesapalUrl).toBe('https://cybqa.pesapal.com/pesapalv3');
  });

  it('should set live url when not sandbox', () => {
    config = {
      pesapalEnvironment: 'live',
      pesapalConsumerKey: 'TDpigBOOhs+zAl8cwH2Fl82jJGyD8xev',
      pesapalConsumerSecret: '1KpqkfsMaihIcOlhnBo/gBZ5smw=',
      pesapalIpnUrl: 'http://localhost:4000/payment'
    };
    instance = new Pesapal(config);
    expect(Pesapal.pesapalUrl).toBe('https://pay.pesapal.com/v3');
  });

  it('should set the config and pesapalUrl correctly', () => {
    expect(Pesapal.config).toEqual({
      pesapalEnvironment: 'sandbox',
      pesapalConsumerKey: 'TDpigBOOhs+zAl8cwH2Fl82jJGyD8xev',
      pesapalConsumerSecret: '1KpqkfsMaihIcOlhnBo/gBZ5smw=',
      pesapalIpnUrl: 'http://localhost:4000/payment'
    });
    expect(Pesapal.pesapalUrl).toBe('https://cybqa.pesapal.com/pesapalv3');
  });

  it('should create an instance of PesaPalController', () => {
    expect(instance['paymentInstance']).toBeInstanceOf(PesaPalController);
  });

  it('should register IPN and return an instance of PesaPalController', () => {
    const registerIpnSpy = vi.spyOn(instance['paymentInstance'], 'registerIpn');
    const paymentInstance = instance.run();

    expect(registerIpnSpy).toHaveBeenCalled();
    expect(paymentInstance).toBeInstanceOf(PesaPalController);
  });
});
