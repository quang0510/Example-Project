package com.booth.rental.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    private BigDecimal amount;

    /** Số tiền thực thu — chỉ set khi đã xác nhận */
    private BigDecimal actualAmount;

    @Builder.Default
    private BigDecimal penaltyAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate dueDate;

    private LocalDate paidDate;

    @Column(length = 500)
    private String note;

    /** Manager ID đã xác nhận thanh toán */
    @Column(columnDefinition = "VARCHAR(36)")
    private String confirmedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

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

    public enum PaymentStatus {
        CHO_THANH_TOAN, DA_THANH_TOAN, QUA_HAN
    }
}
