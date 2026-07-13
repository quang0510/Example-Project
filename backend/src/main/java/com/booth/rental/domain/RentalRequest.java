package com.booth.rental.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalRequest {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booth_id", nullable = false)
    private Booth booth;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(length = 500)
    private String rejectedReason;

    @Column(columnDefinition = "VARCHAR(36)")
    private String rejectedBy;

    @Column(columnDefinition = "VARCHAR(36)")
    private String approvedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

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

    public enum RequestStatus {
        CHO_DUYET, DA_DUYET, DA_HUY
    }
}
