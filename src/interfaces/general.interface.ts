/* eslint-disable @typescript-eslint/naming-convention */
export interface IpesaPalError {
  type: string;
  code: string;
  message: string;
}

export interface IpesaPalToken {
  token: string;
  expiryDate: string;
  error: string | IpesaPalError;
  status: string;
  message: string;
}


export interface IipnResponse {
  url: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_date: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ipn_id: string;
  error: string | IpesaPalError;
  status: string;
}

export interface IregisteredIpin {
  url: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_date: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ipn_id: string;
  error: string | IpesaPalError;
  status: string;
}


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

export interface IorderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error: string | IpesaPalError;
  status: string;
}

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
