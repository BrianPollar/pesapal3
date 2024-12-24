# pesapal3

A Node.js library for integrating PesaPal payment services into your applications.

## PesaPal API Integration

This project connects to the PesaPal API to handle payments. Here’s what it does:

- **Get Tokens**: Retrieves tokens needed to make secure API requests.
- **Handle Payments**: Listens for payment notifications from PesaPal (IPN).

## Key Dependencies

The project relies on several important packages:

- **For Production**:
  - `axios`: Used to send HTTP requests.
  - `axios-mock-adapter`: Helps in testing by mocking requests.
  - `log4js`: Used for logging messages.
  - `tracer`: Assists with debugging.
- **For Development**:
  - ESLint plugins for maintaining code quality.
  - TypeScript for adding type safety.
  - Testing tools like `supertest` and `vitest`.

## Logging

The application logs important information using `log4js`. You can find these logs in the `pesapal.log` file, which helps in debugging issues.

## IPN Notifications

Make sure to set up your IPN URL in your PesaPal account settings so that the application can receive payment notifications.

## Installation

// with npm
npm install pesapal3

// with yarn
yarn add pesapal3

## Usage

```ts
import { initialisePesapal, Iconfig, IpayDetails } from "pesapal3";

const config: Iconfig = {
  pesapalEnvironment: "live", // or "sandbox"
  pesapalConsumerKey: "your-consumer-key",
  pesapalConsumerSecret: "your-consumer-secret",
  pesapalIpnUrl: "https://yourserverdomain/pesapal/ipn",
};

const paymentInstance = initialisePesapal(config);

const details: IpayDetails = {
  amount: 1000,
  currency: "USD",
  description: "This is a test payment",
  // ...other_details
};

const ordered = await paymentInstance.submitOrder(
  details,
  "ProductId",
  "description"
);

if (ordered.success) {
  console.log(ordered.response);
} else {
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

Complete documentation is available on [GitHub](https://github.com/BrianPollar/pesapal3).

## License

pesapal3 is licensed under the [MIT License](LICENSE).
