# pesapal3

A robust and feature-rich Node.js implementation of the PesaPal payment gateway API. This library simplifies the integration of PesaPal payment services into your Node.js applications, providing a secure and reliable payment solution.

## Features

pesapal3 offers a comprehensive set of features for seamless PesaPal integration:

#### Reliability

- Establishes secure connections even in the presence of proxies, load balancers, personal firewalls, and antivirus software.
- Handles network disruptions and retries failed requests automatically.

#### Minimalistic Implementation

- Abstracts away the complexities of the PesaPal API, allowing you to focus on your application logic.
- No need to understand the internal structures and operations of the PesaPal systems.

#### Simple and Intuitive API

- Clean and well-documented API for easy integration.
- Supports both TypeScript and JavaScript.
- Provides clear error handling and detailed response messages.

#### Comprehensive Functionality

- Supports various payment scenarios: one-time payments, recurring subscriptions, and refunds.
- Handles IPN (Instant Payment Notification) callbacks for real-time payment updates.
- Allows customization of IPN endpoints and notification methods.
- Retrieves transaction statuses and detailed payment information.

## Installation

// with npm
npm install pesapal3

// with yarn
yarn add pesapal3

## Usage

The following example demonstrates how to initialize pesapal3, submit an order, and handle IPN callbacks:

```ts
import { Pesapal, Iconfig, IpayDetails } from "pesapal3";

// Configure PesaPal credentials and URLs
const config: Iconfig = {
  pesapalEnvironment: "live", // or "sandbox"
  pesapalConsumerKey: "your-consumer-key",
  pesapalConsumerSecret: "your-consumer-secret",
  pesapalIpnUrl: "https://yourserverdomain/pesapal/ipn",
};

// Initialize PesaPal instance
const pesapal = new Pesapal(config);
const paymentInstance = pesapal.run();

// Submit an order
const details: IpayDetails = {
  amount: 1000,
  currency: "UGX",
  description: "This is a test payment",
  // ...other_details
};

const ordered = await paymentInstance.submitOrder(
  details,
  "ProductId",
  "description"
);

if (ordered.success) {
  // The make payment request was successful.
  console.log(ordered.response);
} else {
  // The make payment request failed.
  console.error(ordered.error);
}

// Handle IPN callback
paymentRoutes.get("/ipn", async (req, res) => {
  const currntUrl = new URL(req.url);
  const searchParams = currntUrl.searchParams;

  const orderTrackingId = searchParams.get("OrderTrackingId") as string;
  const orderNotificationType = searchParams.get(
    "OrderNotificationType"
  ) as string;
  const orderMerchantReference = searchParams.get(
    "OrderMerchantReference"
  ) as string;

  if (!paymentInstance) {
    return res
      .status(500)
      .send({ success: false, err: "internal server error" });
  }

  const response = await paymentInstance.getTransactionStatus(orderTrackingId);
  return response;
});
```

## Documentation

The complete documentation for pesapal3, including detailed API references, usage examples, and advanced features, is available on [GitHub](https://github.com/BrianPollar/pesapal3). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on GitHub with a link to your site.

## License

pesapal3 is licensed under the [MIT License](LICENSE).
