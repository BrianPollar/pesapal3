import { expect, describe, beforeEach, it } from 'vitest';
import { PesaPalController, createMockPayDetails } from '../../../src/controllers/payment.controller';
import { IpayDetails } from '../../../src/interfaces/general.interface';
import { faker } from '@faker-js/faker';

describe('AuthController', () => {
  let instance: PesaPalController;
  let orderTrackingId: string;

  beforeEach(() => {
    instance = new PesaPalController();
  });


  it('its real instance of AuthController', () => {
    expect(instance).toBeInstanceOf(PesaPalController);
  });

  it('should have props undefined', () => {
    expect(instance.token).toBeUndefined();
    expect(instance.notificationId).toBeUndefined();
  });


  it('should have props defined', () => {
    expect(instance.ipns).toBeDefined();
    expect(instance.defaultHeaders).toBeDefined();
  });


  it('should get token and define token', async() => {
    expect(await instance.getToken()).toBe(null);
    expect(instance.token).toBeDefined();
  });

  it('check instance hs token defined', () => {
    expect(instance.hasToken()).toBe(true);
  });

  it('should registerIpn and add to ipn list', async() => {
    expect(await instance.registerIpn()).toBe(null);
    expect(instance.ipns[0]).toBeDefined();
    expect(instance.ipns[0]).toHaveProperty('url');
  });

  it('should get getIpnEndPoins', async() => {
    expect(await instance.getIpnEndPoins()).toBe(null);
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
    expect((res as any).success).toBe(true);
    expect((res as any).status).toBe(200);
    expect((res as any).pesaPalOrderRes).toHaveProperty('order_tracking_id');
    orderTrackingId = (res as any).pesaPalOrderRes.order_tracking_id;
  });

  it('should getTransactionStatus with success', async() => {
    const res = await instance.getTransactionStatus(orderTrackingId);
    expect(res).toHaveProperty('success');
    expect(res).toHaveProperty('response');
    expect((res as any).success).toBe(true);
    expect((res as any).response).toHaveProperty('payment_method');
    expect((res as any).response).toHaveProperty('amount');
    expect((res as any).response).toHaveProperty('created_date');
    expect((res as any).response).toHaveProperty('confirmation_code');
    expect((res as any).response).toHaveProperty('payment_status_description');
  });
});
