package com.booth.rental.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;

@Entity
@Table(name = "booths")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booth {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)")
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String boothCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double area;

    @Column(nullable = false)
    private String zone;

    @Column(nullable = false)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BoothStatus status;

    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Version
    private Long version;

    public enum BoothStatus {
        TRONG, DA_DAT, DANG_THUE, BAO_TRI
    }
}
