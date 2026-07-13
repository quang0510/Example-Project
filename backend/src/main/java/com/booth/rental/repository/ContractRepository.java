package com.booth.rental.repository;

import com.booth.rental.domain.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, String> {
    List<Contract> findByCustomerId(String customerId);
    boolean existsByContractNo(String contractNo);
    long countByStatus(Contract.ContractStatus status);

    /**
     * Tìm hợp đồng đang hiệu lực đã hết hạn (dùng cho Scheduler).
     * Thay thế findAll().stream().filter() để tránh OOM.
     */
    @Query("SELECT c FROM Contract c WHERE c.status = :status AND c.endDate < :today")
    List<Contract> findExpiredContracts(
            @Param("status") Contract.ContractStatus status,
            @Param("today") LocalDate today);

    /**
     * Tìm hợp đồng sắp hết hạn trong khoảng ngày (dùng cho Stats Dashboard).
     */
    @Query("SELECT COUNT(c) FROM Contract c WHERE c.status = :status AND c.endDate > :from AND c.endDate < :to")
    long countExpiringContracts(
            @Param("status") Contract.ContractStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
