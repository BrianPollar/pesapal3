/* eslint-disable @typescript-eslint/naming-convention */
/**
 * This is an interface that defines an IpesaPalError.
 *
 * The `type` property indicates the type of error.
 * The `code` property indicates the code of the error.
 * The `message` property indicates the message of the error.
 */
export interface IpesaPalError {
  type: string;
  code: string;
  message: string;
}

/**
 * This is an interface that defines an IpesaPalToken.
 *
 * The `token` property is the token itself.
 * The `expiryDate` property is the expiry date of the token.
 * The `error` property is the error, or `null` if there is no error.
 * The `status` property is the status of the token.
 * The `message` property is the message of the token.
 */
export interface IpesaPalToken {
  token: string;
  expiryDate: string;
  error: string | IpesaPalError;
  status: string;
  message: string;
}

/**
 * This is an interface that defines an IipnResponse.
 *
 * The `url` property is the URL of the IPN.
 * The `created_date` property is the date the IPN was created.
 * The `ipn_id` property is the ID of the IPN.
 * The `error` property is the error, or `null` if there is no error.
 * The `status` property is the status of the IPN.
 */
export interface IipnResponse {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  url: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_date: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ipn_id: string;
  error: string | IpesaPalError;
  status: string;
}

/**
 * This is an interface that defines an IregisteredIpin.
 *
 * The `url` property is the URL of the registered IPIN.
 * The `created_date` property is the date the IPIN was created.
 * The `ipn_id` property is the ID of the IPIN.
 * The `error` property is the error, or `null` if there is no error.
 * The `status` property is the status of the IPIN.
 */
export interface IregisteredIpin {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  url: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_date: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ipn_id: string;
  error: string | IpesaPalError;
  status: string;
}

/**
 * This is an interface that defines an IpayDetails.
 *
 * The `id` property is the ID of the payment details.
 * The `currency` property is the currency of the payment.
 * The `amount` property is the amount of the payment.
 * The `description` property is the description of the payment.
 * The `callback_url` property is the URL to call back when the payment is processed.
 * The `notification_id` property is the ID of the notification.
 * The `billing_address` property is the billing address of the payer.
 */
export interface IpayDetails {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number: string;
    country_code: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    line_1: string;
    line_2: string;
    city: string;
    state: string;
    postal_code: string;
    zip_code: string;
  };
}

/**
 * This is an interface that defines an IorderResponse.
 *
 * The `order_tracking_id` property is the ID of the order.
 * The `merchant_reference` property is the merchant reference.
 * The `redirect_url` property is the URL to redirect the payer to.
 * The `error` property is the error, or `null` if there is no error.
 * The `status` property is the status of the order.
 */
export interface IorderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error: string | IpesaPalError;
  status: string;
}

/**
 * This is an interface that defines an IendpointResponse.
 *
 * The `payment_method` property is the payment method used.
 * The `amount` property is the amount of the payment.
 * The `created_date` property is the date the payment was created.
 * The `confirmation_code` property is the confirmation code of the payment.
 * The `payment_status_description` property is the description of the payment status.
 * The `description` property is the description of the payment.
 * The `message` property is the message of the payment.
 * The `payment_account` property is the payment account used.
 * The `call_back_url` property is the URL to call back when the payment is processed.
 * The `status_code` property is the status code of the payment.
 * The `merchant_reference` property is the merchant reference.
 * The `payment_status_code` property is the payment status code.
 * The `currency` property is the currency of the payment.
 * The `error` property is the error, or `null` if there is no error.
 * The `status` property is the status of the payment.
 */
export interface IendpointResponse {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status_description: string;
  description: string;
  message: string;
  payment_account: string;
  call_back_url: string;
  status_code: number;
  merchant_reference: string;
  payment_status_code: string;
  currency: string;
  error: {
    error_type: string;
    code: string;
    message: string;
    call_back_url: string;
  };
  status: string;
}
