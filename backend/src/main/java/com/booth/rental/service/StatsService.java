package com.booth.rental.service;

import com.booth.rental.domain.*;
import com.booth.rental.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StatsService {
    private final BoothRepository boothRepository;
    private final ContractRepository contractRepository;
    private final PaymentRepository paymentRepository;
    private final RentalRequestRepository requestRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();

        BigDecimal monthRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.DA_THANH_TOAN)
                .filter(p -> p.getPaidDate() != null && p.getPaidDate().getMonth() == LocalDate.now().getMonth()
                        && p.getPaidDate().getYear() == LocalDate.now().getYear())
                .map(p -> p.getActualAmount() != null ? p.getActualAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalBooths = boothRepository.count();
        long rentedBooths = boothRepository.countByStatus(Booth.BoothStatus.DANG_THUE);
        double occupancyRate = totalBooths > 0 ? (double) rentedBooths / totalBooths * 100 : 0;

        BigDecimal totalDebt = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.QUA_HAN)
                .map(p -> p.getAmount().add(p.getPenaltyAmount() != null ? p.getPenaltyAmount() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        summary.put("monthRevenue", monthRevenue);
        summary.put("occupancyRate", Math.round(occupancyRate * 10.0) / 10.0);
        summary.put("activeContracts", contractRepository.countByStatus(Contract.ContractStatus.DANG_HIEU_LUC));
        summary.put("pendingRequests", requestRepository.countByStatus(RentalRequest.RequestStatus.CHO_DUYET));
        summary.put("overduePayments", paymentRepository.countByStatus(Payment.PaymentStatus.QUA_HAN));
        summary.put("totalDebt", totalDebt);
        summary.put("totalBooths", totalBooths);
        summary.put("rentedBooths", rentedBooths);

        return summary;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRevenueChart(int year) {
        List<Map<String, Object>> chart = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            final int m = month;
            BigDecimal revenue = paymentRepository.findAll().stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.DA_THANH_TOAN)
                    .filter(p -> p.getPaidDate() != null && p.getPaidDate().getYear() == year && p.getPaidDate().getMonthValue() == m)
                    .map(p -> p.getActualAmount() != null ? p.getActualAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", month);
            entry.put("revenue", revenue);
            chart.add(entry);
        }
        return chart;
    }
}
