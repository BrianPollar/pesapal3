/* eslint-disable @typescript-eslint/naming-convention */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { PesaPalController, createMockPayDetails } from '../../../src/controllers/payment.controller';
import { IpayDetails, IpesaPalError, IpesaPalToken } from '../../../src/interfaces/general.interface';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Pesapal } from '../../../src/pesapal';

const mockAxios = new MockAdapter(axios);

export const errorMock: IpesaPalError = {
  type: 'error',
  code: '500',
  message: 'some error'
};

const pesaplTokenresSuccess: IpesaPalToken = {
  token: faker.string.uuid(),
  expiryDate: new Date().toString(),
  // eslint-disable-next-line no-undefined
  error: undefined as any,
  status: 'status',
  message: 'message'
};

const pesaplTokenresFailure: IpesaPalToken = {
  token: null as any,
  expiryDate: new Date().toString(),
  error: errorMock,
  status: 'status',
  message: 'message'
};

describe('PaymentController', () => {
  let instance: PesaPalController;

  beforeEach(() => {
    instance = new PesaPalController();
    Pesapal.config = {
      pesapalEnvironment: 'sandbox',
      pesapalConsumerKey: 'test-consumer-key',
      pesapalConsumerSecret: 'test-consumer-secret',
      pesapalIpnUrl: 'http://localhost:4000/pesapal/ipn',
      pesapalCallbackUrl: 'http://localhost:4000/pesapal/callback'
    };
    Pesapal.pesapalUrl = 'https://cybqa.pesapal.com/pesapalv3';
  });

  it('#Pesapal should statics have methods defined', () => {
    expect(Pesapal.config).toBeDefined();
    expect(Pesapal.pesapalUrl).toBeDefined();
  });

  it('its real instance of PesaPalController', () => {
    expect(instance).toBeInstanceOf(PesaPalController);
  });

  it('should have props undefined', () => {
    expect(instance.token).toBeUndefined();
    expect(instance.notificationId).toBeUndefined();
  });

  it('should have props defined', () => {
    expect(instance.ipns).toBeDefined();
    expect(instance.ipns.length).toBe(0);
    expect(instance.defaultHeaders).toBeDefined();
  });

  it('#getToken should get and define token successfully', async() => {
    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Auth/RequestToken')
      .reply(200, pesaplTokenresSuccess);
    const getTokenSpy = vi.spyOn(instance, 'getToken');
    const response = await instance.getToken();
    expect(getTokenSpy).toHaveBeenCalled();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    expect(instance.token).toBeDefined();
    expect(instance.token).toHaveProperty('token');
    expect(typeof instance.token.token).toBe('string');
  });

  it('#getToken should fail if no token in respones', async() => {
    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Auth/RequestToken')
      .reply(200, pesaplTokenresFailure);
    const getTokenSpy = vi.spyOn(instance, 'getToken');
    const response = await instance.getToken();
    expect(getTokenSpy).toHaveBeenCalled();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(false);
    expect(instance.token).toBeUndefined();
  });

  it('#hasToken check instance has token defined', () => {
    const hasToken = instance.hasToken();
    expect(typeof hasToken).toBe('boolean');
    expectTypeOf(hasToken).toEqualTypeOf<boolean>(Boolean('true'));
  });

  it('#relegateTokenStatus check properly if token has the right date', async() => {
    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Auth/RequestToken')
      .reply(200, pesaplTokenresSuccess);
    const response = await instance.relegateTokenStatus();
    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('madeNewToken');
    expect(typeof response.success).toBe('boolean');
    expect(typeof response.madeNewToken).toBe('boolean');
  });

  it('#constructParamsFromObj should contruct params from object', () => {
    const payDetails: IpayDetails = {
      id: faker.string.uuid(),
      currency: 'UG',
      amount: 100,
      description: faker.string.alphanumeric(),
      callback_url: 'url',
      notification_id: faker.string.uuid(),
      billing_address: {
        email_address: faker.internet.email(),
        phone_number: faker.number.int().toString(),
        country_code: 'UG',
        first_name: faker.internet.userName(),
        middle_name: faker.internet.userName(),
        last_name: faker.internet.userName(),
        line_1: faker.string.alphanumeric(),
        line_2: faker.string.alphanumeric(),
        city: faker.string.alphanumeric(),
        state: faker.string.alphanumeric(),
        postal_code: faker.string.alphanumeric(),
        zip_code: faker.number.int().toString()
      }
    };

    const obj = instance.constructParamsFromObj(
      payDetails, faker.string.uuid(), faker.string.uuid(), faker.string.alphanumeric());
    expect(typeof obj).toBe('object');
    expect(obj).toHaveProperty('id');
    expect(obj).toHaveProperty('currency');
    expect(obj).toHaveProperty('amount');
    expect(obj).toHaveProperty('description');
    expect(obj).toHaveProperty('callback_url');
    expect(obj).toHaveProperty('notification_id');
    expect(obj).toHaveProperty('billing_address');
  });

  it('#registerIpn should registerIpn and add to ipn list', async() => {
    const mockReturnValue = {
      url: 'url',
      created_date: new Date().toString(),
      ipn_id: faker.string.uuid(),
      error: null,
      status: '200'
    };

    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Auth/RequestToken')
      .reply(200, pesaplTokenresSuccess);
    mockAxios.onPost(Pesapal.pesapalUrl +
        '/api/URLSetup/RegisterIPN')
      .reply(200, mockReturnValue);
    const relegateTokenStatusSpy = vi.spyOn(instance, 'registerIpn');
    const response = await instance.registerIpn();
    expect(relegateTokenStatusSpy).toHaveBeenCalled();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    expect(response.err).toBeUndefined();
    expect(instance.ipns[0]).toBeDefined();
    expect(instance.ipns[0]).toHaveProperty('url');
  });


  it('#registerIpn should fail to registerIpn and add to ipn list', async() => {
    const mockReturnValue = {
      url: 'url',
      created_date: new Date().toString(),
      ipn_id: faker.string.uuid(),
      error: errorMock,
      status: '500'
    };

    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Auth/RequestToken')
      .reply(200, pesaplTokenresSuccess);
    mockAxios.onPost(Pesapal.pesapalUrl +
        '/api/URLSetup/RegisterIPN')
      .reply(200, mockReturnValue);
    const relegateTokenStatusSpy = vi.spyOn(instance, 'relegateTokenStatus');
    const response = await instance.registerIpn();
    expect(relegateTokenStatusSpy).toHaveBeenCalled();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(false);
    expect(typeof response.err).toBe('string');
    expect(instance.ipns[0]).toBeUndefined();
  });


  it('#getIpnEndPoints should get getIpnEndPoints', async() => {
    const mockReturnValue = {
      url: 'http://localhost:4000',
      created_date: new Date().toString(),
      ipn_id: faker.string.uuid(),
      error: null,
      status: '200'
    };

    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Auth/RequestToken')
      .reply(200, pesaplTokenresSuccess);
    mockAxios.onGet(Pesapal.pesapalUrl +
        '/api/URLSetup/GetIpnList')
      .reply(200, [mockReturnValue]);
    const relegateTokenStatusSpy = vi.spyOn(instance, 'relegateTokenStatus');
    const response = await instance.getIpnEndPoints();
    expect(relegateTokenStatusSpy).toHaveBeenCalled();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    expect(response.err).toBeUndefined();
    expect(instance.ipns.length).toBeGreaterThan(0);
  });

  it('#getIpnEndPoints should fail toget get getIpnEndPoints', async() => {
    const mockReturnValue = {
      url: 'http://localhost:4000',
      created_date: new Date().toString(),
      ipn_id: faker.string.uuid(),
      error: errorMock,
      status: '200'
    };

    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Auth/RequestToken')
      .reply(200, pesaplTokenresSuccess);
    mockAxios.onGet(Pesapal.pesapalUrl +
        '/api/URLSetup/GetIpnList')
      .reply(200, [mockReturnValue]);
    const relegateTokenStatusSpy = vi.spyOn(instance, 'relegateTokenStatus');
    const response = await instance.getIpnEndPoints();
    expect(relegateTokenStatusSpy).toHaveBeenCalled();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(false);
    expect(typeof response.err).toBe('string');
  });

  it('#submitOrder should submitOrder', async() => {
    const phone = '0756920841';
    const ipnUrl = '/url';
    instance.ipns = [{
      url: 'url',
      created_date: new Date().toString(),
      ipn_id: faker.string.uuid(),
      error: null as any,
      status: '200'
    }];
    const productId = faker.string.uuid();
    const payDetails: IpayDetails = createMockPayDetails(ipnUrl, phone);

    const mockReturnValue = {
      order_tracking_id: faker.string.uuid(),
      merchant_reference: faker.string.uuid(),
      redirect_url: faker.string.uuid(),
      error: null,
      status: '200'
    };

    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Auth/RequestToken')
      .reply(200, pesaplTokenresSuccess);
    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Transactions/SubmitOrderRequest')
      .reply(200, mockReturnValue);
    const relegateTokenStatusSpy = vi.spyOn(instance, 'relegateTokenStatus');
    const constructParamsFromObjSpy = vi.spyOn(instance, 'constructParamsFromObj');
    const res = await instance.submitOrder(payDetails, productId, faker.string.alphanumeric());
    expect(relegateTokenStatusSpy).toHaveBeenCalled();
    expect(constructParamsFromObjSpy).toHaveBeenCalled();
    expect(res).toHaveProperty('success');
    expect(res).toHaveProperty('status');
    expect(res).toHaveProperty('pesaPalOrderRes');
    expect(res.success).toBe(true);
    expect(res.status).toBe(200);
    expect(res.err).toBeUndefined();
    expect(res.pesaPalOrderRes).toHaveProperty('order_tracking_id');
    // orderTrackingId = res.pesaPalOrderRes?.order_tracking_id ;
  });


  it('#submitOrder should fail to submitOrder', async() => {
    const phone = '0756920841';
    const ipnUrl = '/url';
    instance.ipns = [{
      url: 'url',
      created_date: new Date().toString(),
      ipn_id: faker.string.uuid(),
      error: null as any,
      status: '200'
    }];
    const productId = faker.string.uuid();
    const payDetails: IpayDetails = createMockPayDetails(ipnUrl, phone);

    const mockReturnValue = {
      order_tracking_id: faker.string.uuid(),
      merchant_reference: faker.string.uuid(),
      redirect_url: faker.string.uuid(),
      error: errorMock,
      status: '200'
    };

    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Auth/RequestToken')
      .reply(200, pesaplTokenresSuccess);
    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Transactions/SubmitOrderRequest')
      .reply(200, mockReturnValue);
    const relegateTokenStatusSpy = vi.spyOn(instance, 'relegateTokenStatus');
    const constructParamsFromObjSpy = vi.spyOn(instance, 'constructParamsFromObj');
    const res = await instance.submitOrder(payDetails, productId, faker.string.alphanumeric());
    expect(relegateTokenStatusSpy).toHaveBeenCalled();
    expect(constructParamsFromObjSpy).toHaveBeenCalled();
    expect(res).toHaveProperty('success');
    expect(res).toHaveProperty('err');
    expect(res.success).toBe(false);
    expect(typeof res.err).toBe('string');
  });

  it('#getTransactionStatus should getTransactionStatus with success', async() => {
    const mockReturnValue = {
      payment_method: faker.string.uuid(),
      amount: 100,
      created_date: faker.date.past().toString(),
      confirmation_code: faker.string.uuid(),
      payment_status_description: 'completed',
      description: faker.string.alphanumeric(),
      message: faker.string.alphanumeric(),
      payment_account: faker.string.alphanumeric(),
      call_back_url: faker.string.alphanumeric(),
      status_code: '200',
      merchant_reference: faker.string.uuid(),
      payment_status_code: faker.string.uuid(),
      currency: 'UG',
      error: null,
      status: '200'
    };

    const orderTrackingIdLocal = faker.string.uuid();
    mockAxios.onPost(Pesapal.pesapalUrl +
      '/api/Auth/RequestToken')
      .reply(200, pesaplTokenresSuccess);
    mockAxios.onGet(Pesapal.pesapalUrl +
      '/api/Transactions/GetTransactionStatus' +
      `/?orderTrackingId=${orderTrackingIdLocal}`)
      .reply(200, mockReturnValue);

    const relegateTokenStatusSpy = vi.spyOn(instance, 'relegateTokenStatus');

    const res = await instance.getTransactionStatus(orderTrackingIdLocal);
    expect(relegateTokenStatusSpy).toHaveBeenCalled();
    expect(res).toHaveProperty('success');
    expect(res.success).toBe(true);
    expect(res).toHaveProperty('response');
    expect(res.response).toHaveProperty('payment_method');
    expect(res.response).toHaveProperty('amount');
    expect(res.response).toHaveProperty('created_date');
    expect(res.response).toHaveProperty('confirmation_code');
    expect(res.response).toHaveProperty('payment_status_description');
  });
});
