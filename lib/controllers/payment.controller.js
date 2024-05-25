"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PesaPalController = exports.createMockPayDetails = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/naming-convention */
const faker_1 = require("@faker-js/faker");
const axios_1 = tslib_1.__importDefault(require("axios"));
const fs = tslib_1.__importStar(require("fs"));
const tracer = tslib_1.__importStar(require("tracer"));
const pesapal_1 = require("../pesapal");
const logger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = './serverLog/';
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    throw err;
                }
            }
        });
        fs.appendFile('./serverLog/pesapal.log', data.rawoutput + '\n', err => {
            if (err) {
                throw err;
            }
        });
    }
});
/**
 * This function creates a mock pay details object.
 * The `ipnUrl` property is the IPN URL.
 * The `phone` property is the phone number of the payer.
 *
 * The function returns an object with the following properties:
 * * `id`: The ID of the pay details.
 * * `currency`: The currency of the pay details.
 * * `amount`: The amount of the pay details.
 * * `description`: The description of the pay details.
 * * `callback_url`: The callback URL of the pay details.
 * * `notification_id`: The notification ID of the pay details.
 * * `billing_address`: The billing address of the payer.
 */
const createMockPayDetails = (ipnUrl, phone) => ({
    id: faker_1.faker.string.uuid(),
    currency: 'UGX',
    amount: 1000,
    description: faker_1.faker.string.alphanumeric(),
    callback_url: 'http://localhost:4000',
    notification_id: ipnUrl,
    billing_address: {
        email_address: faker_1.faker.internet.email(),
        phone_number: phone,
        country_code: 'UGA',
        first_name: faker_1.faker.internet.userName(),
        middle_name: faker_1.faker.internet.userName(),
        last_name: faker_1.faker.internet.userName(),
        line_1: faker_1.faker.string.alphanumeric(),
        line_2: faker_1.faker.string.alphanumeric(),
        city: 'Kampala',
        state: 'Uganda',
        postal_code: '0000',
        zip_code: '0000'
    }
});
exports.createMockPayDetails = createMockPayDetails;
/**
 * This class is a controller for PesaPal payments.
 * The `token` property is the PesaPal token.
 * The `ipns` property is an array of IIPnResponse objects.
 * The `defaultHeaders` property is an object with the default headers for the requests.
 * The `callbackUrl` property is the main callback URL.
 * The `notificationId` property is the notification ID.
 */
class PesaPalController {
    constructor(config) {
        this.config = config;
        this.ipns = [];
        this.defaultHeaders = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Accept: 'application/json',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/json'
        };
    }
    /**
   * This method registers the IPN URL with PesaPal.
   * The method returns a promise with the following properties:
   *
   * * `success`: Indicates whether the request was successful.
   */
    async registerIpn(ipn, notificationMethodType) {
        const gotToken = await this.relegateTokenStatus();
        if (!gotToken.success) {
            return { success: false, err: 'couldnt resolve getting token' };
        }
        const ipnUrl = ipn || this.config.pesapalIpnUrl;
        const ipnNotificationType = notificationMethodType || 'GET';
        const parameters = {
            url: ipnUrl,
            ipn_notification_type: ipnNotificationType
        };
        const headers = {
            ...this.defaultHeaders,
            Authorization: 'Bearer  ' + this.token.token
        };
        return new Promise(resolve => {
            axios_1.default
                .post(pesapal_1.Pesapal.pesapalUrl +
                '/api/URLSetup/RegisterIPN', parameters, { headers })
                .then(res => {
                const response = res.data;
                if (response.error) {
                    resolve({ success: false, err: response.error.message || response.error });
                }
                else {
                    this.ipns = [...this.ipns, response];
                    resolve({ success: true });
                }
            }).catch((err) => {
                logger.error('PesaPalController, registerIpn err', err);
                resolve({ success: false, err });
            });
        });
    }
    /**
   * This method gets the IPN endpoints from PesaPal.
   * The method returns a promise with the following properties:
   *
   * * `success`: Indicates whether the request was successful.
   */
    async getIpnEndPoints() {
        const gotToken = await this.relegateTokenStatus();
        if (!gotToken.success) {
            return { success: false, err: 'couldnt resolve getting token' };
        }
        const headers = {
            ...this.defaultHeaders,
            Authorization: 'Bearer  ' + this.token.token
        };
        return new Promise(resolve => {
            axios_1.default
                .get(pesapal_1.Pesapal.pesapalUrl +
                '/api/URLSetup/GetIpnList', { headers })
                .then(res => {
                const response = res.data;
                if (response[0] && response[0].error) {
                    resolve({ success: false, err: response[0].error.message || response[0].error });
                }
                else {
                    this.ipns = res.data;
                    resolve({ success: true });
                }
            }).catch((err) => {
                logger.error('PesaPalController, getIpnEndPoints err', err);
                resolve({ success: false, err });
            });
        });
    }
    /**
   * This method submits the order to PesaPal.
   * The method takes the following parameters:
   * * `paymentDetails`: The payment details object.
   * * `productId`: The ID of the product.
   * * `description`: The description of the payment.
   *
   * The method returns a promise with the following properties:
   * * `success`: Indicates whether the request was successful.
   * * `status`: The status of the order.
   * * `pesaPalOrderRes`: The PesaPal order response.
   */
    async submitOrder(paymentDetails, productId, description) {
        logger.info('details are', paymentDetails);
        const gotToken = await this.relegateTokenStatus();
        if (!gotToken.success) {
            return { success: false, err: 'couldnt resolve getting token' };
        }
        const headers = {
            ...this.defaultHeaders,
            Authorization: 'Bearer  ' + this.token.token
        };
        logger.debug('IPNS ARE', this.ipns);
        const notifId = this.ipns[0].ipn_id;
        return new Promise(resolve => {
            axios_1.default
                .post(pesapal_1.Pesapal.pesapalUrl +
                '/api/Transactions/SubmitOrderRequest', this.constructParamsFromObj(paymentDetails, notifId, productId, description), { headers })
                .then(res => {
                const response = res.data;
                if (response.error) {
                    logger.error('PesaPalController, submitOrder error', response.error);
                    resolve({ success: false, err: response.error.message || response.error });
                }
                else {
                    resolve({ success: true, status: 200, pesaPalOrderRes: response });
                }
            }).catch((err) => {
                logger.error('PesaPalController, submitOrder err', err);
                resolve({ success: false, err });
            });
        });
    }
    /**
   * This method gets the transaction status from PesaPal.
   * The method takes the following parameters:
   * * `orderTrackingId`: The order tracking ID.
   *
   * The method returns a promise with the following properties:
   * * `success`: Indicates whether the request was successful.
   * * `response`: The response from PesaPal.
   */
    async getTransactionStatus(orderTrackingId) {
        const gotToken = await this.relegateTokenStatus();
        if (!gotToken.success) {
            return { success: false, err: 'couldnt resolve getting token' };
        }
        const headers = {
            ...this.defaultHeaders,
            Authorization: 'Bearer  ' + this.token.token
        };
        return new Promise(resolve => {
            axios_1.default
                .get(pesapal_1.Pesapal.pesapalUrl +
                '/api/Transactions/GetTransactionStatus' +
                `/?orderTrackingId=${orderTrackingId}`, { headers })
                .then(res => {
                const response = res.data;
                if (response.error) {
                    resolve({ success: false, err: response.error.message || response.error });
                }
                else if (response.payment_status_description.toLowerCase() === 'completed') {
                    resolve({ success: true, response });
                }
                else {
                    resolve({ success: false, status: response.payment_status_description });
                }
            }).catch((err) => {
                logger.error('PesaPalController, getToken err', err);
                resolve({ success: false, err });
            });
        });
    }
    /**
     * Sends a refund request for a transaction.
     * @param refunReqObj - The refund request object.
     * @returns A promise that resolves to the refund request response.
     */
    async refundRequest(refunReqObj) {
        const gotToken = await this.relegateTokenStatus();
        if (!gotToken.success) {
            return { success: false, err: 'couldnt resolve getting token' };
        }
        const headers = {
            ...this.defaultHeaders,
            Authorization: 'Bearer  ' + this.token.token
        };
        return new Promise(resolve => {
            axios_1.default
                .post(pesapal_1.Pesapal.pesapalUrl +
                '/api/Transactions/RefundRequestt', refunReqObj, { headers })
                .then(res => {
                const response = res.data;
                if (!response) {
                    resolve({ success: false, err: 'somethinh went wrong' });
                }
                else {
                    resolve({ success: true, refundRequestRes: response });
                }
            }).catch((err) => {
                logger.error('PesaPalController, submitOrder err', err);
                resolve({ success: false, err });
            });
        });
    }
    /**
   * This method gets the PesaPal token.
   * The method returns a promise with the following properties:
   *
   * * `success`: Indicates whether the request was successful.
   * * `err`: The error, if any.
   */
    getToken() {
        const headers = {
            ...this.defaultHeaders
        };
        const parameters = {
            consumer_key: this.config.pesapalConsumerKey,
            consumer_secret: this.config.pesapalConsumerSecret
        };
        return new Promise(resolve => {
            axios_1.default
                .post(pesapal_1.Pesapal.pesapalUrl +
                '/api/Auth/RequestToken', parameters, { headers })
                .then(res => {
                const data = res.data;
                logger.debug('response data from getToken()', data);
                if (data?.error) {
                    logger.error('PesaPalController, unknown err', data.error.message || data.error);
                    resolve({ success: false, err: data.error.message || data.error });
                }
                else if (data?.token) {
                    this.token = data;
                    // set token to file
                    /** fs.writeFileSync(lConfig.
                    encryptedDirectory + 'airtltoken', JSON.stringify(token)); */
                    resolve({ success: true });
                }
                else {
                    logger.error('PesaPalController, unknown err', 'sorry but unknwn');
                    this.token = null;
                    const toReturn = {
                        success: false,
                        err: 'unknown err, sorry but unknown error occured'
                    };
                    resolve(toReturn);
                    // resolve({ success: false, err: 'sorry not token' });
                }
                resolve({ success: true });
            }).catch((err) => {
                logger.error('PesaPalController, getToken err', err);
                resolve({ success: false, err });
            });
        });
    }
    /**
   * This method checks the status of the token and creates a new token if it is expired.
   *
   * The method returns a promise with the following properties:
   *
   * * `success`: Indicates whether the request was successful.
   * * `madeNewToken`: Indicates whether a new token was created.
   */
    async relegateTokenStatus() {
        const response = {
            success: false,
            madeNewToken: false
        };
        if (this.hasToken()) {
            const nowDate = new Date();
            const tokenDate = new Date(this.token.expiryDate);
            if (nowDate > tokenDate) {
                const tokenRes = await this.getToken();
                if (!tokenRes.success) {
                    response.success = false;
                    response.madeNewToken = false;
                    return response;
                }
                else {
                    response.success = true;
                    response.madeNewToken = true;
                }
            }
            else {
                // await this.getToken();
                response.success = true;
                response.madeNewToken = false;
            }
        }
        else {
            const tokenRes = await this.getToken();
            if (!tokenRes.success) {
                response.success = false;
                response.madeNewToken = false;
            }
            else {
                response.success = true;
                response.madeNewToken = false;
            }
        }
        return response;
    }
    /**
   * This method constructs the parameters from the object.
   * The method takes the following parameters:
   * * `paymentDetails`: The payment details object.
   * * `notificationId`: The notification ID.
   * * `id`: The ID of the payment.
   * * `description`: The description of the payment.
   *
   * The method returns an object with the following properties:
   * * `id`: The ID of the payment.
   * * `currency`: The currency of the payment.
   * * `amount`: The amount of the payment.
   * * `description`: The description of the payment.
   * * `callback_url`: The callback URL of the payment.
   * * `notification_id`: The notification ID of the payment.
   * * `billing_address`: The billing address of the payer.
   * * `countryCode`: The country code to map country the payment is from.
   * * `countryCurrency`: The countriesmoney currency.
   */
    constructParamsFromObj(paymentDetails, notificationId, id, description, countryCode = 'UG', countryCurrency = 'UGA') {
        const constructedObj = {
            id,
            currency: paymentDetails.currency || countryCurrency,
            amount: paymentDetails.amount,
            description,
            callback_url: this.config.pesapalCallbackUrl,
            notification_id: notificationId,
            billing_address: {
                email_address: paymentDetails.billing_address?.email_address,
                phone_number: paymentDetails.billing_address?.phone_number,
                country_code: countryCode,
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
        logger.debug('constructParamsFromObj, constructedObj', paymentDetails);
        return constructedObj;
    }
    /**
   * This method checks if the token is present.
   * The method returns `true` if the token is present, and `false` otherwise.
   */
    hasToken() {
        return Boolean(this.token?.token);
    }
}
exports.PesaPalController = PesaPalController;
//# sourceMappingURL=payment.controller.js.map