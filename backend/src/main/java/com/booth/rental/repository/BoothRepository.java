package com.booth.rental.repository;

import com.booth.rental.domain.Booth;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoothRepository extends JpaRepository<Booth, String> {
    
    // Pessimistic Write Lock (dùng cho Booking API chống Race Condition)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booth b WHERE b.id = :id")
    Optional<Booth> findByIdForUpdate(@Param("id") String id);

    List<Booth> findByStatus(Booth.BoothStatus status);

    long countByStatus(Booth.BoothStatus status);

    boolean existsByBoothCode(String boothCode);
}
