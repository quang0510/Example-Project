package com.booth.rental.service;

import com.booth.rental.domain.*;
import com.booth.rental.dto.response.PaymentResponse;
import com.booth.rental.exception.BusinessException;
import com.booth.rental.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments(String status) {
        return paymentRepository.findAll().stream()
                .filter(p -> status == null || status.equals("ALL") || p.getStatus().name().equals(status))
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Not found", HttpStatus.NOT_FOUND));
        return paymentRepository.findAll().stream()
                .filter(p -> p.getContract().getCustomer().getId().equals(customer.getId()))
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByContract(String contractId) {
        return paymentRepository.findByContractId(contractId).stream()
                .map(PaymentResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse confirmPayment(String paymentId, BigDecimal actualAmount, LocalDate paidDate, String note) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User manager = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Not found", HttpStatus.NOT_FOUND));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException("Khong tim thay thanh toan", HttpStatus.NOT_FOUND));

        if (payment.getStatus() == Payment.PaymentStatus.DA_THANH_TOAN)
            throw new BusinessException("Khoan thanh toan nay da duoc xac nhan", HttpStatus.BAD_REQUEST);

        payment.setActualAmount(actualAmount);
        payment.setPaidDate(paidDate != null ? paidDate : LocalDate.now());
        payment.setNote(note);
        payment.setConfirmedBy(manager.getId());
        payment.setStatus(Payment.PaymentStatus.DA_THANH_TOAN);

        return PaymentResponse.from(paymentRepository.save(payment));
    }
}
