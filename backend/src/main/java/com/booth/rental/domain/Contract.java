package com.booth.rental.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)")
    private String id;

    @Column(unique = true, length = 50)
    private String contractNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booth_id", nullable = false)
    private Booth booth;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_request_id")
    private RentalRequest rentalRequest;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal deposit = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Double penaltyRate = 0.5;

    @Column(columnDefinition = "TEXT")
    private String terms;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractStatus status;

    @Column(columnDefinition = "VARCHAR(36)")
    private String createdBy;

    @Column(columnDefinition = "VARCHAR(36)")
    private String activatedBy;

    private LocalDateTime activatedAt;
    private LocalDateTime terminatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ContractStatus {
        NHAP, DANG_HIEU_LUC, TAM_DINH_CHI, DA_KET_THUC, DA_HUY
    }
}
