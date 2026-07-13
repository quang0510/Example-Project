package com.booth.rental.scheduler;

import com.booth.rental.domain.Payment;
import com.booth.rental.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentScheduler {

    private final PaymentRepository paymentRepository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void updateOverduePayments() {
        log.info("Running overdue payment check...");
        
        List<Payment> overduePayments = paymentRepository.findOverduePayments(
                Payment.PaymentStatus.CHO_THANH_TOAN, 
                LocalDate.now()
        );

        for (Payment p : overduePayments) {
            p.setStatus(Payment.PaymentStatus.QUA_HAN);
            
            Double penaltyRate = p.getContract().getPenaltyRate();
            if (penaltyRate != null && penaltyRate > 0) {
                BigDecimal penaltyAmount = p.getAmount().multiply(BigDecimal.valueOf(penaltyRate));
                p.setPenaltyAmount(penaltyAmount);
            }
            
            paymentRepository.save(p);
            log.info("Payment ID: {} marked as OVERDUE. Penalty: {}", p.getId(), p.getPenaltyAmount());
        }
        
        log.info("Finished updating overdue payments. Updated {} records.", overduePayments.size());
    }
}
