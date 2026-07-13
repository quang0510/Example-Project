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
     * Thay thế findAll().stream().filter() để tránh OOM khi data lớn.
     */
    @Query("SELECT p FROM Payment p WHERE p.status = :status AND p.dueDate < :today")
    List<Payment> findOverduePayments(
            @Param("status") Payment.PaymentStatus status,
            @Param("today") LocalDate today);
}
