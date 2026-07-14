package com.booth.rental.scheduler;

import com.booth.rental.domain.Booth;
import com.booth.rental.domain.Contract;
import com.booth.rental.domain.Payment;
import com.booth.rental.domain.RentalRequest;
import com.booth.rental.repository.BoothRepository;
import com.booth.rental.repository.ContractRepository;
import com.booth.rental.repository.PaymentRepository;
import com.booth.rental.repository.RentalRequestRepository;
import com.booth.rental.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AutoReleaseScheduler {
    private final RentalRequestRepository requestRepository;
    private final BoothRepository boothRepository;
    private final PaymentRepository paymentRepository;
    private final ContractRepository contractRepository;
    private final EmailService emailService;

    // ─────────────────────────────────────────────────────────────
    // Job 1: Tự động hủy yêu cầu chưa được duyệt sau 24h
    // Chạy mỗi 1 giờ
    // ─────────────────────────────────────────────────────────────
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void autoReleaseExpiredRequests() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        List<RentalRequest> expired = requestRepository.findPendingRequestsOlderThan(cutoffTime);

        for (RentalRequest request : expired) {
            request.setStatus(RentalRequest.RequestStatus.DA_HUY);
            requestRepository.save(request);

            Booth booth = request.getBooth();
            if (booth.getStatus() == Booth.BoothStatus.DA_DAT) {
                booth.setStatus(Booth.BoothStatus.TRONG);
                boothRepository.save(booth);
            }
        }

        if (!expired.isEmpty())
            log.info("[Job1-AutoRelease] Da huy {} yeu cau het han", expired.size());
    }

    // ─────────────────────────────────────────────────────────────
    // Job 2: Quét công nợ quá hạn mỗi ngày lúc 00:01
    // Chuyển status -> QUA_HAN & tính tiền phạt
    // ─────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 1 0 * * *")
    @Transactional
    public void scanOverduePayments() {
        LocalDate today = LocalDate.now();
        List<Payment> overdue = paymentRepository.findOverduePayments(Payment.PaymentStatus.CHO_THANH_TOAN, today);

        for (Payment payment : overdue) {
            payment.setStatus(Payment.PaymentStatus.QUA_HAN);

            // Tính phạt: sử dụng penaltyRate từ Contract nếu có, mặc định 0.5%
            Double penaltyRate = payment.getContract().getPenaltyRate();
            if (penaltyRate == null || penaltyRate <= 0) {
                penaltyRate = 0.5;
            }

            long daysOverdue = today.toEpochDay() - payment.getDueDate().toEpochDay();
            BigDecimal penalty = payment.getAmount()
                    .multiply(BigDecimal.valueOf(penaltyRate / 100.0))
                    .multiply(new BigDecimal(daysOverdue));
            payment.setPenaltyAmount(penalty);
            paymentRepository.save(payment);
        }

        if (!overdue.isEmpty())
            log.info("[Job2-DebtScanner] Da cap nhat {} khoan thanh toan qua han", overdue.size());
    }

    // ─────────────────────────────────────────────────────────────
    // Job 3: Gửi email nhắc thanh toán trước hạn 3 ngày
    // Chạy mỗi ngày lúc 08:00
    // ─────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void sendPaymentReminders() {
        LocalDate today = LocalDate.now();
        LocalDate threeDaysLater = today.plusDays(3);

        List<Payment> upcoming = paymentRepository.findUpcomingPayments(
                Payment.PaymentStatus.CHO_THANH_TOAN, today, threeDaysLater);

        int sentCount = 0;
        for (Payment payment : upcoming) {
            try {
                String customerEmail = payment.getContract().getCustomer().getEmail();
                String customerName = payment.getContract().getCustomer().getFullName();

                emailService.sendPaymentReminder(
                        customerEmail,
                        customerName,
                        payment.getTitle(),
                        payment.getAmount(),
                        payment.getDueDate()
                );
                sentCount++;
            } catch (Exception e) {
                log.error("[Job3-PaymentReminder] Loi gui email cho payment {}: {}",
                        payment.getId(), e.getMessage());
            }
        }

        if (sentCount > 0)
            log.info("[Job3-PaymentReminder] Da gui {} email nhac thanh toan", sentCount);
    }

    // ─────────────────────────────────────────────────────────────
    // Job 4: Gửi email nhắc gia hạn hợp đồng trước 7 ngày
    // Chạy mỗi ngày lúc 08:00
    // ─────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void sendContractRenewalReminders() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysLater = today.plusDays(7);

        List<Contract> expiring = contractRepository.findExpiringContracts(
                Contract.ContractStatus.DANG_HIEU_LUC, today, sevenDaysLater);

        int sentCount = 0;
        for (Contract contract : expiring) {
            try {
                String customerEmail = contract.getCustomer().getEmail();
                String customerName = contract.getCustomer().getFullName();

                emailService.sendContractRenewalReminder(
                        customerEmail,
                        customerName,
                        contract.getContractNo(),
                        contract.getEndDate()
                );
                sentCount++;
            } catch (Exception e) {
                log.error("[Job4-RenewalReminder] Loi gui email cho contract {}: {}",
                        contract.getId(), e.getMessage());
            }
        }

        if (sentCount > 0)
            log.info("[Job4-RenewalReminder] Da gui {} email nhac gia han", sentCount);
    }
}
