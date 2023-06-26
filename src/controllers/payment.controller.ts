/* eslint-disable @typescript-eslint/naming-convention */
import { IendpointResponse, IipnResponse, IorderResponse, IpayDetails, IpesaPalToken } from '../interfaces/general.interface';
import { Pesapal } from '../pesapal';
import axios from 'axios';
import { getLogger } from 'log4js';
import { faker } from '@faker-js/faker';

const logger = getLogger('paymentController');

/**
 * This is an interface that defines an IgetTokenRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `err` property is the error, if any.
 */
export interface IgetTokenRes {
  success: boolean;
  err?;
}

/**
 * This is an interface that defines an IregisterIpnRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `err` property is the error, if any.
 */
export interface IregisterIpnRes {
  success: boolean;
  err?;
}

/**
 * This is an interface that defines an IrelegateTokenStatusRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `madeNewToken` property indicates whether a new token was created.
 */
export interface IrelegateTokenStatusRes {
  success: boolean;
  madeNewToken: boolean;
}

/**
 * This is an interface that defines an IgetIpnEndPointsRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `err` property is the error, if any.
 */
export interface IgetIpnEndPointsRes {
  success: boolean;
  err?;
}

/**
 * This is an interface that defines an IsubmitOrderRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `status` property is the status of the order.
 * The `pesaPalOrderRes` property is the PesaPal order response.
 * The `err` property is the error, if any.
 */
export interface IsubmitOrderRes {
  success: boolean;
  status?: number;
  pesaPalOrderRes?: IorderResponse;
  err?;
}

/**
 * This is an interface that defines an IgetTransactionStatusRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `response` property is the response from PesaPal.
 * The `status` property is the status of the transaction.
 * The `err` property is the error, if any.
 */
export interface IgetTransactionStatusRes {
  success: boolean;
  response?: IendpointResponse;
  status?: string;
  err?;
}

/**
 * This function creates a mock pay details object.
 *
 * The `ipnUrl` property is the IPN URL.
 * The `phone` property is the phone number of the payer.
 *
 * The function returns an object with the following properties:
 *
 * * `id`: The ID of the pay details.
 * * `currency`: The currency of the pay details.
 * * `amount`: The amount of the pay details.
 * * `description`: The description of the pay details.
 * * `callback_url`: The callback URL of the pay details.
 * * `notification_id`: The notification ID of the pay details.
 * * `billing_address`: The billing address of the payer.
 */
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

/**
 * This class is a controller for PesaPal payments.
 *
 * The `token` property is the PesaPal token.
 * The `ipns` property is an array of IIPnResponse objects.
 * The `defaultHeaders` property is an object with the default headers for the requests.
 * The `callbackUrl` property is the main callback URL.
 * The `notificationId` property is the notification ID.
 */
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

  /**
 * This method gets the PesaPal token.
 *
 * The method returns a promise with the following properties:
 *
 * * `success`: Indicates whether the request was successful.
 * * `err`: The error, if any.
 */
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

  /**
 * This method checks if the token is present.
 *
 * The method returns `true` if the token is present, and `false` otherwise.
 */
  hasToken() {
    return Boolean(this.token?.token);
  }

  /**
 * This method checks the status of the token and creates a new token if it is expired.
 *
 * The method returns a promise with the following properties:
 *
 * * `success`: Indicates whether the request was successful.
 * * `madeNewToken`: Indicates whether a new token was created.
 */
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

  /**
 * This method registers the IPN URL with PesaPal.
 *
 * The method returns a promise with the following properties:
 *
 * * `success`: Indicates whether the request was successful.
 */
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

  /**
 * This method gets the IPN endpoints from PesaPal.
 *
 * The method returns a promise with the following properties:
 *
 * * `success`: Indicates whether the request was successful.
 */
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

  /**
 * This method constructs the parameters from the object.
 *
 * The method takes the following parameters:
 *
 * * `paymentDetails`: The payment details object.
 * * `notificationId`: The notification ID.
 * * `id`: The ID of the payment.
 * * `description`: The description of the payment.
 *
 * The method returns an object with the following properties:
 *
 * * `id`: The ID of the payment.
 * * `currency`: The currency of the payment.
 * * `amount`: The amount of the payment.
 * * `description`: The description of the payment.
 * * `callback_url`: The callback URL of the payment.
 * * `notification_id`: The notification ID of the payment.
 * * `billing_address`: The billing address of the payer.
 */
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

  /**
 * This method submits the order to PesaPal.
 *
 * The method takes the following parameters:
 *
 * * `paymentDetails`: The payment details object.
 * * `productId`: The ID of the product.
 * * `description`: The description of the payment.
 *
 * The method returns a promise with the following properties:
 *
 * * `success`: Indicates whether the request was successful.
 * * `status`: The status of the order.
 * * `pesaPalOrderRes`: The PesaPal order response.
 */
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

  /**
 * This method gets the transaction status from PesaPal.
 *
 * The method takes the following parameters:
 *
 * * `orderTrackingId`: The order tracking ID.
 *
 * The method returns a promise with the following properties:
 *
 * * `success`: Indicates whether the request was successful.
 * * `response`: The response from PesaPal.
 */
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
