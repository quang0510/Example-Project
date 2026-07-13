package com.booth.rental.dto;

import com.booth.rental.domain.Booth.BoothStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BoothDto {
    private String id;
    
    @NotBlank(message = "Mã gian hàng không được để trống")
    private String boothCode;
    
    @NotBlank(message = "Tên gian hàng không được để trống")
    private String name;
    
    @NotNull(message = "Diện tích không được để trống")
    @Min(value = 1, message = "Diện tích phải lớn hơn 0")
    private Double area;
    
    @NotBlank(message = "Khu vực không được để trống")
    private String zone;
    
    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá không được âm")
    private BigDecimal price;
    
    private BoothStatus status;
    private String thumbnailUrl;
    private String description;
}
