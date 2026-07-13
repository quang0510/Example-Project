package com.booth.rental.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    private String id;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE

    @Column(nullable = false)
    private String entityName; // e.g. BOOTH, USER, CONTRACT

    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false)
    private String performedBy; // Email or Username

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
