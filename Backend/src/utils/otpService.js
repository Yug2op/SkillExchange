// Future Enhancement
import crypto from 'crypto';
// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store OTP in memory (for production, use Redis)
const otpStore = new Map();

// Save OTP
const saveOTP = (identifier, otp, expiryMinutes = 10) => {
  const expiry = Date.now() + expiryMinutes * 60 * 1000;
  otpStore.set(identifier, { otp, expiry });
};

// Verify OTP
const verifyOTP = (identifier, otp) => {
  const data = otpStore.get(identifier);
  
  if (!data) {
    return { valid: false, message: 'OTP not found' };
  }
  
  if (Date.now() > data.expiry) {
    otpStore.delete(identifier);
    return { valid: false, message: 'OTP expired' };
  }
  
  if (data.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  otpStore.delete(identifier);
  return { valid: true, message: 'OTP verified' };
};

export { generateOTP, saveOTP, verifyOTP };