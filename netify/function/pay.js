// netlify/functions/pay.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { amount, currency, plan } = JSON.parse(event.body);

  const merchantId = 'TEST993455000226';
  const apiUsername = 'merchant.TEST993455000226';
  const apiPassword = process.env.NMB_API_PASSWORD; // Siri inatoka Netlify

  const orderId = 'ASALI_' + Date.now();
  const nmbAmount = currency === 'TZS'? (amount / 100).toFixed(2) : amount;

  const body = {
    apiOperation: "INITIATE_CHECKOUT",
    order: { id: orderId, amount: nmbAmount, currency: currency, description: "Asali - " + plan },
    interaction: { operation: "PURCHASE", returnUrl: "https://asaliwildscreenfestival.netlify.app/success.html" }
  };

  try {
    const response = await fetch(`https://test-nmbbank.mtf.gateway.mastercard.com/api/rest/v1/merchant/${merchantId}/session`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(apiUsername + ':' + apiPassword).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.session && data.session.id) {
      return { statusCode: 200, body: JSON.stringify({ checkoutId: data.session.id }) };
    } else {
      return { statusCode: 500, body: JSON.stringify({ error: data.errors? data.errors[0].explanation : 'NMB Error' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
