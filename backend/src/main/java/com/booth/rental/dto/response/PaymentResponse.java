package com.booth.rental.dto.response;

import com.booth.rental.domain.Payment;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private String id;
    private String contractId;
    private String contractNo;
    private String customerFullName;
    private String boothCode;
    private String title;
    private BigDecimal amount;
    private BigDecimal actualAmount;
    private BigDecimal penaltyAmount;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private String note;
    private String confirmedBy;
    private String status;
    private LocalDateTime createdAt;

    public static PaymentResponse from(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .contractId(p.getContract().getId())
                .contractNo(p.getContract().getContractNo())
                .customerFullName(p.getContract().getCustomer().getFullName())
                .boothCode(p.getContract().getBooth().getBoothCode())
                .title(p.getTitle())
                .amount(p.getAmount())
                .actualAmount(p.getActualAmount())
                .penaltyAmount(p.getPenaltyAmount())
                .dueDate(p.getDueDate())
                .paidDate(p.getPaidDate())
                .note(p.getNote())
                .confirmedBy(p.getConfirmedBy())
                .status(p.getStatus().name())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
