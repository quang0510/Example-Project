package com.booth.rental.dto.response;

import com.booth.rental.domain.RentalRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class RentalRequestResponse {
    private String id;
    private String customerId;
    private String customerFullName;
    private String customerPhone;
    private String customerEmail;
    private String boothId;
    private String boothCode;
    private String boothName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String note;
    private String status;
    private String rejectedReason;
    private String rejectedBy;
    private String approvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RentalRequestResponse from(RentalRequest req) {
        return RentalRequestResponse.builder()
                .id(req.getId())
                .customerId(req.getCustomer().getId())
                .customerFullName(req.getCustomer().getFullName())
                .customerPhone(req.getCustomer().getPhone())
                .customerEmail(req.getCustomer().getEmail())
                .boothId(req.getBooth().getId())
                .boothCode(req.getBooth().getBoothCode())
                .boothName(req.getBooth().getName())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .note(req.getNote())
                .status(req.getStatus().name())
                .rejectedReason(req.getRejectedReason())
                .rejectedBy(req.getRejectedBy())
                .approvedBy(req.getApprovedBy())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }
}
