import 'dotenv/config'
import axios from 'axios'

// always use live PayPal API
const PAYPAL_BASE = "https://sandbox.paypal.com"

export const generateAccessToken = async () => {
  const response = await axios({
    url: `${PAYPAL_BASE}/v1/oauth2/token`,
    method: "post",
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_CLIENT_SECRET
    },
    params: {
      grant_type: "client_credentials"
    }
  })

  return response.data.access_token
}

export const createPayPalOrder = async (amount) => {
  // sanity checks so we never call the API with an invalid body
  if (amount == null || amount === '') {
    throw new Error('createPayPalOrder: amount is required');
  }
  // ensure we send a string in the correct 2‑decimal format
  const value = (typeof amount === 'number') ? amount.toFixed(2) : String(amount);
  if (!/^[0-9]+(\.[0-9]{2})$/.test(value)) {
    throw new Error(`createPayPalOrder: invalid amount format "${value}"`);
  }

  const accessToken = await generateAccessToken();

  try {
    const response = await axios.post(
      `${PAYPAL_BASE}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value
          }
        }]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    return response.data;
  } catch (err) {
    // include PayPal's response body if present so we can troubleshoot
    if (err.response) {
      console.error('PayPal order creation failed', err.response.status, err.response.data);
      throw new Error(`PayPal error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
    }
    throw err;
  }
}

export const capturePayPalOrder = async (orderID) => {
  const accessToken = await generateAccessToken()

  const response = await axios.post(
    `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  )

  if (response.data.status !== "COMPLETED") {
    throw new Error(`Payment not completed. Status: ${response.data.status}`)
  }

  return {
    success: true,
    message: "Payment captured successfully",
    payer: response.data.payer?.email_address,
    transactionID: response.data.id
  }
}