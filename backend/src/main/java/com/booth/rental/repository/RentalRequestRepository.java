package com.booth.rental.repository;

import com.booth.rental.domain.RentalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RentalRequestRepository extends JpaRepository<RentalRequest, String> {
    
    // Lấy các Yêu cầu đang chờ duyệt của 1 user
    @Query("SELECT COUNT(r) FROM RentalRequest r WHERE r.customer.id = :customerId AND r.status = 'CHO_DUYET'")
    long countPendingRequestsByCustomerId(@Param("customerId") String customerId);

    // Dành cho CronJob Auto-Release (Quét các request chưa duyệt sau X giờ)
    @Query("SELECT r FROM RentalRequest r WHERE r.status = 'CHO_DUYET' AND r.createdAt < :cutoffTime")
    List<RentalRequest> findPendingRequestsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);

    // Đếm theo trạng thái - dùng cho Dashboard stats
    long countByStatus(RentalRequest.RequestStatus status);
}
