import { expect, describe, beforeEach, it } from 'vitest';
import { PesaPalController, createMockPayDetails } from '../../../src/controllers/payment.controller';
import { IpayDetails } from '../../../src/interfaces/general.interface';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import * as MockAdapter from 'axios-mock-adapter';

const mockAxios = new MockAdapter(axios);

describe('PesaPalControllerPureMock', () => {
  let controller: PesaPalController;

  beforeEach(() => {
    controller = new PesaPalController();
  });

  it('should submit the order', async() => {
    const payDetails = createMockPayDetails('http://localhost:4000', '+256775000000');
    const response = {
      orderTrackingId: '1234567890',
      paymentStatus: 'Completed'
    };

    mockAxios.onPost('https://www.pesapal.com/api/Transactions/SubmitOrderRequest')
      .reply(200, {
        data: response
      });

    const res = await controller.submitOrder(payDetails, 'id', 'description');
    expect(res.success).toBe(true);
    expect(res.pesaPalOrderRes?.order_tracking_id).toBe(response.orderTrackingId);
    expect(res.pesaPalOrderRes?.status).toBe(response.paymentStatus);
  });
});


describe('PaymentController', () => {
  let instance: PesaPalController;
  let orderTrackingId: string | undefined;

  beforeEach(() => {
    instance = new PesaPalController();
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

  it('should get and define token', async() => {
    const response = await instance.getToken();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    expect(response.err).toBeUndefined();
    expect(instance.token).toBeDefined();
  });

  it('check instance has token defined', () => {
    expect(instance.hasToken()).toBe(true);
  });

  it('check properly if token has the right date', async() => {
    const response = await instance.relegateTokenStatus();
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('madeNewToken');
    expect(response.success).toBe(true);
  });

  it('should registerIpn and add to ipn list', async() => {
    const response = await instance.registerIpn();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    expect(response.err).toBeUndefined();
    expect(instance.ipns[0]).toBeDefined();
    expect(instance.ipns[0]).toHaveProperty('url');
  });

  it('should get getIpnEndPoints', async() => {
    const response = await instance.getIpnEndPoints();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    expect(response.err).toBeUndefined();
    expect(instance.ipns.length).toBeGreaterThan(0);
  });

  it('should submitOrder', async() => {
    const phone = '0756920841';
    const ipnUrl = instance.ipns[0].url;
    const productId = faker.string.uuid();
    const payDetails: IpayDetails = createMockPayDetails(ipnUrl, phone);
    const res = await instance.submitOrder(payDetails, productId, faker.string.alphanumeric());
    expect(res).toHaveProperty('success');
    expect(res).toHaveProperty('status');
    expect(res).toHaveProperty('pesaPalOrderRes');
    expect(res.success).toBe(true);
    expect(res.status).toBe(200);
    expect(res.err).toBeUndefined();
    expect(res.pesaPalOrderRes).toHaveProperty('order_tracking_id');
    orderTrackingId = res.pesaPalOrderRes?.order_tracking_id ;
  });

  it('should getTransactionStatus with success', async() => {
    if (!orderTrackingId) {
      expect(orderTrackingId).toBeDefined();
      return;
    }
    const res = await instance.getTransactionStatus(orderTrackingId);
    expect(res).toHaveProperty('success');
    expect(res).toHaveProperty('response');
    expect(res.success).toBe(true);
    expect(res.response).toHaveProperty('payment_method');
    expect(res.response).toHaveProperty('amount');
    expect(res.response).toHaveProperty('created_date');
    expect(res.response).toHaveProperty('confirmation_code');
    expect(res.response).toHaveProperty('payment_status_description');
  });
});


