package com.booth.rental.scheduler;

import com.booth.rental.domain.Booth;
import com.booth.rental.domain.RentalRequest;
import com.booth.rental.repository.BoothRepository;
import com.booth.rental.repository.PaymentRepository;
import com.booth.rental.repository.RentalRequestRepository;
import com.booth.rental.domain.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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

    /** Job 1: Tu dong huy YC chua duoc duyet sau 24h */
    @Scheduled(fixedRate = 3600000) // chay moi 1 gio
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

    /** Job 2: Scan no qua han moi ngay luc 00:01 */
    @Scheduled(cron = "0 1 0 * * *")
    @Transactional
    public void scanOverduePayments() {
        LocalDate today = LocalDate.now();
        List<Payment> overdue = paymentRepository.findOverduePayments(Payment.PaymentStatus.CHO_THANH_TOAN, today);

        for (Payment payment : overdue) {
            payment.setStatus(Payment.PaymentStatus.QUA_HAN);
            // Tinh phat: so ngay qua han * 0.5% * amount
            long daysOverdue = today.toEpochDay() - payment.getDueDate().toEpochDay();
            java.math.BigDecimal penalty = payment.getAmount()
                    .multiply(new java.math.BigDecimal("0.005"))
                    .multiply(new java.math.BigDecimal(daysOverdue));
            payment.setPenaltyAmount(penalty);
            paymentRepository.save(payment);
        }

        if (!overdue.isEmpty())
            log.info("[Job2-DebtScanner] Da cap nhat {} khoan thanh toan qua han", overdue.size());
    }
}
