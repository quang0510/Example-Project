package com.booth.rental.dto.response;

import com.booth.rental.domain.Booth;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BoothResponse {
    private String id;
    private String boothCode;
    private String name;
    private Double area;
    private String zone;
    private BigDecimal price;
    private String status;
    private String thumbnailUrl;
    private String description;

    public static BoothResponse from(Booth booth) {
        return BoothResponse.builder()
                .id(booth.getId())
                .boothCode(booth.getBoothCode())
                .name(booth.getName())
                .area(booth.getArea())
                .zone(booth.getZone())
                .price(booth.getPrice())
                .status(booth.getStatus().name())
                .thumbnailUrl(booth.getThumbnailUrl())
                .description(booth.getDescription())
                .build();
    }
}
