/* eslint-disable @typescript-eslint/naming-convention */
import { IendpointResponse, IipnResponse, IorderResponse, IpayDetails, IpesaPalToken } from '../interfaces/general.interface';
import { Pesapal } from '../pesapal';
import axios from 'axios';
import { getLogger } from 'log4js';
const logger = getLogger('paymentController');
import { faker } from '@faker-js/faker';

export interface IgetTokenRes {
  success: boolean;
  err?;
}

export interface IregisterIpnRes {
  success: boolean;
  err?;
}

export interface IrelegateTokenStatusRes {
  success: boolean;
  madeNewToken: boolean;
}

export interface IgetIpnEndPointsRes {
  success: boolean;
  err?;
}

export interface IsubmitOrderRes {
  success: boolean;
  status?: number;
  pesaPalOrderRes?: IorderResponse;
  err?;
}

export interface IgetTransactionStatusRes {
  success: boolean;
  response?: IendpointResponse;
  status?: string;
  err?;
}

export const createMockPayDetails = (ipnUrl: string, phone: string) => ({
  id: faker.string.uuid(),
  currency: 'UGX',
  amount: 1000,
  description: faker.string.alphanumeric(),
  callback_url: 'http://localhost:4000',
  notification_id: ipnUrl,
  billing_address: {
    email_address: faker.internet.email(),
    phone_number: phone,
    country_code: 'UGA',
    first_name: faker.internet.userName(),
    middle_name: faker.internet.userName(),
    last_name: faker.internet.userName(),
    line_1: faker.string.alphanumeric(),
    line_2: faker.string.alphanumeric(),
    city: 'Kampala',
    state: 'Uganda',
    postal_code: '0000',
    zip_code: '0000'
  }
});

export class PesaPalController {
  token: IpesaPalToken;
  ipns: IipnResponse[] = [];
  defaultHeaders = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Accept: 'application/json',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Content-Type': 'application/json'
  };
  // callbackUrl: string; // main callback url
  notificationId: string;

  constructor() {}

  async getToken(): Promise<IgetTokenRes> {
    const headers = {
      ...this.defaultHeaders
    };
    const parameters = {
      consumer_key: Pesapal.config.pesapalConsumerKey,
      consumer_secret: Pesapal.config.pesapalConsumerSecret
    };

    return new Promise(resolve => {
      axios
        .post(Pesapal.pesapalUrl +
        '/api/Auth/RequestToken',
        parameters,
        { headers })
        .then(res => {
          const data = res.data as IpesaPalToken;
          logger.debug('response data from getToken()', data);
          if (data.token) {
            this.token = data;
          // set token to file
          /** fs.writeFileSync(lConfig.
            encryptedDirectory + 'airtltoken', JSON.stringify(token)); */
          } else {
            logger.error('PesaPalController, unknown err', 'sorry but unknwn');
          }
          resolve({ success: true });
        }).catch((err) => {
          logger.error('PesaPalController, getToken err', err);
          resolve({ success: false, err });
        });
    });
  }

  hasToken() {
    return Boolean(this.token?.token);
  }

  async relegateTokenStatus(): Promise<IrelegateTokenStatusRes> {
    const response: IrelegateTokenStatusRes = {
      success: false,
      madeNewToken: false
    };
    if (this.hasToken()) {
      const nowDate = new Date();
      const tokenDate = new Date(this.token.expiryDate);
      if (nowDate > tokenDate) {
        await this.getToken();
        response.success = true;
        response.madeNewToken = true;
      } else {
        // await this.getToken();
        response.success = true;
        response.madeNewToken = false;
      }
    } else {
      await this.getToken();
      response.success = true;
      response.madeNewToken = false;
    }
    return response;
  }

  async registerIpn(): Promise<IregisterIpnRes> {
    await this.relegateTokenStatus();

    const parameters = {
      url: Pesapal.config.pesapalIpnUrl,
      ipn_notification_type: 'GET'
    };

    const headers = {
      ...this.defaultHeaders,
      Authorization: 'Bearer  ' + this.token.token
    };

    return new Promise(resolve => {
      axios
        .post(Pesapal.pesapalUrl +
        '/api/URLSetup/RegisterIPN',
        parameters,
        { headers })
        .then(res => {
          const response = res.data as IipnResponse;
          this.ipns = [ ...this.ipns, response];
          resolve({ success: true });
        }).catch((err) => {
          logger.error('PesaPalController, registerIpn err', err);
          resolve({ success: false, err });
        });
    });
  }

  async getIpnEndPoints(): Promise<IgetIpnEndPointsRes> {
    await this.relegateTokenStatus();

    const headers = {
      ...this.defaultHeaders,
      Authorization: 'Bearer  ' + this.token.token
    };
    return new Promise(resolve => {
      axios
        .get(Pesapal.pesapalUrl +
        '/api/URLSetup/GetIpnList',
        { headers })
        .then(res => {
          this.ipns = res.data as IipnResponse[];
          resolve({ success: true });
        }).catch((err) => {
          logger.error('PesaPalController, getIpnEndPoints err', err);
          resolve({ success: false, err });
        });
    });
  }

  constructParamsFromObj(
    paymentDetails: IpayDetails,
    notificationId: string,
    id: string | undefined,
    description: string
  ) {
    logger.debug('constructParamsFromObj, paymentDetails', paymentDetails);
    return {
      id,
      currency: paymentDetails.currency || 'UGA',
      amount: paymentDetails.amount,
      description,
      callback_url: Pesapal.config.pesapalCallbackUrl + '/' + id,
      notification_id: notificationId,
      billing_address: {
        email_address: paymentDetails.billing_address?.email_address,
        phone_number: paymentDetails.billing_address?.phone_number,
        country_code: 'UG',
        first_name: paymentDetails.billing_address?.first_name,
        middle_name: paymentDetails.billing_address?.middle_name,
        last_name: paymentDetails.billing_address?.last_name,
        line_1: paymentDetails.billing_address?.line_1,
        line_2: paymentDetails.billing_address?.line_2,
        city: paymentDetails.billing_address?.city,
        state: paymentDetails.billing_address?.state,
        // postal_code: paymentRelated.shippingAddress?.zipcode,
        zip_code: paymentDetails.billing_address?.zip_code
      }
    };
  }

  async submitOrder(
    paymentDetails: IpayDetails,
    productId: string,
    description: string
  ): Promise<IsubmitOrderRes> {
    logger.info('details are', paymentDetails);
    await this.relegateTokenStatus();

    const headers = {
      ...this.defaultHeaders,
      Authorization: 'Bearer  ' + this.token.token
    };

    const notifId = this.ipns[0].ipn_id;

    return new Promise(resolve => {
      axios
        .post(Pesapal.pesapalUrl +
        '/api/Transactions/SubmitOrderRequest',
        this.constructParamsFromObj(paymentDetails, notifId, productId, description),
        { headers })
        .then(res => {
          const response = res.data as IorderResponse;
          resolve({ success: true, status: 200, pesaPalOrderRes: response });
        }).catch((err) => {
          logger.error('PesaPalController, submitOrder err', err);
          resolve({ success: false, err });
        });
    });
  }

  async getTransactionStatus(orderTrackingId: string): Promise<IgetTransactionStatusRes> {
    await this.relegateTokenStatus();

    const headers = {
      ...this.defaultHeaders,
      Authorization: 'Bearer  ' + this.token.token
    };

    return new Promise(resolve => {
      axios
        .get(Pesapal.pesapalUrl +
        '/api/Transactions/GetTransactionStatus' +
        `/?orderTrackingId=${orderTrackingId}`,
        { headers })
        .then(res => {
          const response = res.data as IendpointResponse;

          if (response.payment_status_description.toLowerCase() === 'completed') {
            resolve({ success: true, response });
          } else {
            resolve({ success: false, status: response.payment_status_description });
          }
        }).catch((err) => {
          logger.error('PesaPalController, getToken err', err);
          resolve({ success: false, err });
        });
    });
  }
}
