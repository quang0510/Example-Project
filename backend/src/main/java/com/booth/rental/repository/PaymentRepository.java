package com.booth.rental.repository;

import com.booth.rental.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByContractId(String contractId);
    long countByStatus(Payment.PaymentStatus status);

    /**
     * Tìm các Payment đang chờ thanh toán và đã quá hạn (dùng cho Scheduler).
     */
    @Query("SELECT p FROM Payment p WHERE p.status = :status AND p.dueDate < :today")
    List<Payment> findOverduePayments(
            @Param("status") Payment.PaymentStatus status,
            @Param("today") LocalDate today);

    /**
     * Tìm các Payment sắp đến hạn trong khoảng ngày (dùng cho Job nhắc thanh toán 3 ngày).
     */
    @Query("SELECT p FROM Payment p WHERE p.status = :status AND p.dueDate BETWEEN :from AND :to")
    List<Payment> findUpcomingPayments(
            @Param("status") Payment.PaymentStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    /**
     * Tìm tất cả payments theo danh sách status (dùng cho báo cáo).
     */
    List<Payment> findByStatusIn(List<Payment.PaymentStatus> statuses);
}
