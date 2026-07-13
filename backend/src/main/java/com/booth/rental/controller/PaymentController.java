package com.booth.rental.controller;

import com.booth.rental.dto.response.PaymentResponse;
import com.booth.rental.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getAll(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.getAllPayments(status));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<PaymentResponse>> getMyPayments() {
        return ResponseEntity.ok(service.getMyPayments());
    }

    @GetMapping("/by-contract/{contractId}")
    public ResponseEntity<List<PaymentResponse>> getByContract(@PathVariable String contractId) {
        return ResponseEntity.ok(service.getPaymentsByContract(contractId));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<PaymentResponse> confirm(@PathVariable String id, @RequestBody Map<String, Object> body) {
        BigDecimal actualAmount = new BigDecimal(body.get("actualAmount").toString());
        LocalDate paidDate = body.containsKey("paidDate") ? LocalDate.parse(body.get("paidDate").toString()) : null;
        String note = body.containsKey("note") ? body.get("note").toString() : null;
        return ResponseEntity.ok(service.confirmPayment(id, actualAmount, paidDate, note));
    }
}
