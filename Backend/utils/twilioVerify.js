const twilio = require('twilio');

let client;

const getClient = () => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials are not configured');
  }

  if (!client) {
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return client;
};

const getVerifyServiceSid = () => {
  if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
    throw new Error('Twilio Verify service SID is not configured');
  }
  return process.env.TWILIO_VERIFY_SERVICE_SID;
};

const sendEmailVerification = async email => {
  return getClient()
    .verify.v2.services(getVerifyServiceSid())
    .verifications
    .create({ to: email, channel: 'email' });
};

const checkEmailVerification = async (email, code) => {
  return getClient()
    .verify.v2.services(getVerifyServiceSid())
    .verificationChecks
    .create({ to: email, code });
};

module.exports = {
  sendEmailVerification,
  checkEmailVerification
};
