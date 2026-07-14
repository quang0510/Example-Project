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
        LocalDate now = LocalDate.now();

        // Doanh thu tháng này
        BigDecimal monthRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.DA_THANH_TOAN)
                .filter(p -> p.getPaidDate() != null && p.getPaidDate().getMonth() == now.getMonth()
                        && p.getPaidDate().getYear() == now.getYear())
                .map(p -> p.getActualAmount() != null ? p.getActualAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tổng doanh thu tất cả thời gian
        BigDecimal totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.DA_THANH_TOAN)
                .map(p -> p.getActualAmount() != null ? p.getActualAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tỷ lệ lấp đầy
        long totalBooths = boothRepository.count();
        long rentedBooths = boothRepository.countByStatus(Booth.BoothStatus.DANG_THUE);
        double occupancyRate = totalBooths > 0 ? (double) rentedBooths / totalBooths * 100 : 0;

        // Tổng nợ quá hạn (bao gồm tiền phạt)
        BigDecimal totalDebt = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.QUA_HAN)
                .map(p -> p.getAmount().add(p.getPenaltyAmount() != null ? p.getPenaltyAmount() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // HĐ sắp hết hạn trong 30 ngày
        long expiringContracts = contractRepository.countExpiringContracts(
                Contract.ContractStatus.DANG_HIEU_LUC, now, now.plusDays(30));

        summary.put("monthRevenue", monthRevenue);
        summary.put("totalRevenue", totalRevenue);
        summary.put("occupancyRate", Math.round(occupancyRate * 10.0) / 10.0);
        summary.put("activeContracts", contractRepository.countByStatus(Contract.ContractStatus.DANG_HIEU_LUC));
        summary.put("expiringContracts", expiringContracts);
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

    /**
     * Trả data doanh thu 2 năm để so sánh (year hiện tại & year-1).
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRevenueComparison(int year) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("currentYear", year);
        result.put("previousYear", year - 1);
        result.put("currentData", getRevenueChart(year));
        result.put("previousData", getRevenueChart(year - 1));
        return result;
    }
}
