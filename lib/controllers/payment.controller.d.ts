import { IipnResponse, IpayDetails, IpesaPalToken } from '../interfaces/general.interface';
export declare class PesaPalController {
    token: IpesaPalToken;
    ipns: IipnResponse[];
    defaultHeaders: {
        Accept: string;
        'Content-Type': string;
    };
    constructor();
    getToken(): Promise<unknown>;
    hasToken(): boolean;
    relegateTokenStatus(): Promise<boolean>;
    registerIpn(): Promise<unknown>;
    getIpnEndPoins(): Promise<unknown>;
    constructParamsFromObj(paymentDetails: IpayDetails, notificationId: string, id: string | undefined, description: string): {
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
            zip_code: string;
        };
    };
    submitOrder(paymentDetails: IpayDetails, productId: string, description: string): Promise<unknown>;
    getTransactionStatus(orderTrackingId: string): Promise<unknown>;
}
