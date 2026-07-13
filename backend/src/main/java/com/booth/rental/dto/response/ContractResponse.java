package com.booth.rental.dto.response;

import com.booth.rental.domain.Contract;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ContractResponse {
    private String id;
    private String contractNo;
    private String customerId;
    private String customerFullName;
    private String customerPhone;
    private String boothId;
    private String boothCode;
    private String boothName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private BigDecimal deposit;
    private Double penaltyRate;
    private String terms;
    private String note;
    private String status;
    private String createdBy;
    private String activatedBy;
    private LocalDateTime activatedAt;
    private LocalDateTime terminatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ContractResponse from(Contract c) {
        return ContractResponse.builder()
                .id(c.getId())
                .contractNo(c.getContractNo())
                .customerId(c.getCustomer().getId())
                .customerFullName(c.getCustomer().getFullName())
                .customerPhone(c.getCustomer().getPhone())
                .boothId(c.getBooth().getId())
                .boothCode(c.getBooth().getBoothCode())
                .boothName(c.getBooth().getName())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .totalAmount(c.getTotalAmount())
                .deposit(c.getDeposit())
                .penaltyRate(c.getPenaltyRate())
                .terms(c.getTerms())
                .note(c.getNote())
                .status(c.getStatus().name())
                .createdBy(c.getCreatedBy())
                .activatedBy(c.getActivatedBy())
                .activatedAt(c.getActivatedAt())
                .terminatedAt(c.getTerminatedAt())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
