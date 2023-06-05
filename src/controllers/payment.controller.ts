/* eslint-disable @typescript-eslint/naming-convention */
import { IendpointResponse, IipnResponse, IorderResponse, IpayDetails, IpesaPalToken } from '../interfaces/general.interface';
import { Pesapal } from '../pesapal';
import axios from 'axios';
import { getLogger } from 'log4js';
const logger = getLogger('paymentController');

export class PesaPalController {
  token: IpesaPalToken;
  ipns: IipnResponse[] = [];
  defaultHeaders = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Accept: 'application/json',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Content-Type': 'application/json'
  };

  constructor() {}

  async getToken() {
    const headers = {
      ...this.defaultHeaders
    };
    const parameters = {
      consumer_key: Pesapal.config.pesapalConsumerKey,
      consumer_secret: Pesapal.config.pesapalConsumerSecret
    };
    logger.error('GETTING TOKEN');

    return new Promise((resolve, reject) => {
      axios
        .post(Pesapal.pesapalUrl +
        '/api/Auth/RequestToken',
        parameters,
        { headers })
        .then(res => {
          const token = res.data as IpesaPalToken;
          logger.error('GETTING TOKEN 3T5235636', token);
          if (token.token) {
            this.token = token;
          // set token to file
          /** fs.writeFileSync(lConfig.
            encryptedDirectory + 'airtltoken', JSON.stringify(token)); */
          } else {
            logger.error('PesaPalController, unknown err', 'sorry but unknwn');
          }
          resolve(null);
        }).catch((err) => {
          logger.error('PesaPalController, getToken err', err);
          resolve(null);
        });
    });
  }

  hasToken() {
    return Boolean(this.token?.token);
  }

  async relegateTokenStatus() {
    logger.error('SHIT 111111', this.token);
    if (this.hasToken()) {
      const nowDate = new Date();
      const tokenDate = new Date(this.token.expiryDate);
      if (nowDate > tokenDate) {
        logger.error('SHIT 222222');
        await this.getToken();
      } else {
        logger.error('SHIT 33333333');
        await this.getToken();
      }
    } else {
      await this.getToken();
    }
    return true;
  }

  async registerIpn() {
    await this.relegateTokenStatus();

    const parameters = {
      url: Pesapal.config.pesapalIpnUrl,
      ipn_notification_type: 'GET'
    };

    const headers = {
      ...this.defaultHeaders,
      Authorization: 'Bearer  ' + this.token.token
    };

    return new Promise((resolve, reject) => {
      axios
        .post(Pesapal.pesapalUrl +
        '/api/URLSetup/RegisterIPN',
        parameters,
        { headers })
        .then(res => {
          const response = res.data as IipnResponse;
          this.ipns = [ ...this.ipns, response];
          resolve(null);
        }).catch((err) => {
          logger.error('PesaPalController, registerIpn err', err);
          resolve(null);
        });
    });
  }

  async getIpnEndPoins() {
    await this.relegateTokenStatus();

    const headers = {
      ...this.defaultHeaders,
      Authorization: 'Bearer  ' + this.token.token
    };
    return new Promise((resolve, reject) => {
      axios
        .get(Pesapal.pesapalUrl +
        '/api/URLSetup/GetIpnList',
        { headers })
        .then(res => {
          this.ipns = res.data as IipnResponse[];
          resolve(null);
        }).catch((err) => {
          logger.error('PesaPalController, getIpnEndPoins err', err);
          resolve(null);
        });
    });
  }

  constructParamsFromObj(
    paymentDetails: IpayDetails,
    notificationId: string,
    id: string | undefined,
    description: string
  ) {
    console.log('PAYMENT RELATEDS ISSSSS', paymentDetails);
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
  ) {
    logger.info('details are', paymentDetails);
    await this.relegateTokenStatus();

    const headers = {
      ...this.defaultHeaders,
      Authorization: 'Bearer  ' + this.token.token
    };

    const notifId = this.ipns[0].ipn_id;

    return new Promise((resolve, reject) => {
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
          resolve(null);
        });
    });
  }

  async getTransactionStatus(orderTrackingId: string) {
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
          resolve(null);
        });
    });
  }
}
