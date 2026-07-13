package com.booth.rental.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RentalRequestDto {
    // customerId không còn cần thiết - BE lấy từ JWT token
    
    @NotBlank(message = "ID gian hàng là bắt buộc")
    private String boothId;
    
    @NotNull(message = "Ngày bắt đầu thuê là bắt buộc")
    private LocalDate startDate;
    
    @NotNull(message = "Ngày kết thúc là bắt buộc")
    private LocalDate endDate;
    
    @NotBlank(message = "Loại hình kinh doanh là bắt buộc")
    private String businessType;
    
    private String note;
}
