package com.booth.rental.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // Store email -> {otp: string, expireAt: long}
    private final Map<String, OtpData> otpCache = new ConcurrentHashMap<>();
    private final long EXPIRE_MINS = 5;

    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        long expireTime = System.currentTimeMillis() + (EXPIRE_MINS * 60 * 1000);
        otpCache.put(email, new OtpData(otp, expireTime));
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        OtpData data = otpCache.get(email);
        if (data == null) return false;
        if (System.currentTimeMillis() > data.expireAt) {
            otpCache.remove(email);
            return false;
        }
        boolean isValid = data.otp.equals(otp);
        if (isValid) {
            otpCache.remove(email);
        }
        return isValid;
    }

    private static class OtpData {
        String otp;
        long expireAt;

        public OtpData(String otp, long expireAt) {
            this.otp = otp;
            this.expireAt = expireAt;
        }
    }
}
