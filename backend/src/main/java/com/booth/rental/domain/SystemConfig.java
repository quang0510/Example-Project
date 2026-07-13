package com.booth.rental.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfig {
    @Id
    @Column(name = "config_key", length = 100)
    private String key;

    @Column(nullable = false, length = 500)
    private String value;

    @Column(length = 500)
    private String description;

    @Column(columnDefinition = "VARCHAR(36)")
    private String updatedBy;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
