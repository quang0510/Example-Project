package com.booth.rental.service;

import com.booth.rental.domain.Booth;
import com.booth.rental.domain.Contract;
import com.booth.rental.domain.RentalRequest;
import com.booth.rental.domain.User;
import com.booth.rental.dto.response.ContractResponse;
import com.booth.rental.exception.BusinessException;
import com.booth.rental.repository.BoothRepository;
import com.booth.rental.repository.ContractRepository;
import com.booth.rental.repository.PaymentRepository;
import com.booth.rental.repository.RentalRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ContractService Tests")
class ContractServiceTest {

    @Mock private ContractRepository contractRepository;
    @Mock private RentalRequestRepository requestRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private BoothRepository boothRepository;

    @InjectMocks
    private ContractService contractService;

    private User mockCustomer;
    private Booth mockBooth;
    private RentalRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockCustomer = User.builder()
                .id("user-001")
                .username("testuser")
                .fullName("Nguyen Van A")
                .email("test@example.com")
                .role(User.Role.CUSTOMER)
                .build();

        mockBooth = Booth.builder()
                .id("booth-001")
                .boothCode("A-001")
                .name("Gian hàng Test")
                .area(30.0)
                .zone("Khu A")
                .price(new BigDecimal("10000000"))
                .status(Booth.BoothStatus.DA_DAT)
                .build();

        mockRequest = RentalRequest.builder()
                .id("req-001")
                .customer(mockCustomer)
                .booth(mockBooth)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(30))
                .status(RentalRequest.RequestStatus.CHO_DUYET)
                .build();
    }

    @Test
    @DisplayName("Tạo hợp đồng thành công từ request đang chờ duyệt")
    void createContractFromRequest_Success() {
        // Arrange
        when(requestRepository.findById("req-001")).thenReturn(Optional.of(mockRequest));

        Contract savedContract = Contract.builder()
                .id("contract-001")
                .contractNo("HD-ABCDEFGH")
                .customer(mockCustomer)
                .booth(mockBooth)
                .startDate(mockRequest.getStartDate())
                .endDate(mockRequest.getEndDate())
                .totalAmount(new BigDecimal("15000000"))
                .deposit(new BigDecimal("5000000"))
                .penaltyRate(5.0)
                .status(Contract.ContractStatus.NHAP)
                .build();
        when(contractRepository.save(any(Contract.class))).thenReturn(savedContract);

        // Act
        ContractResponse result = contractService.createContractFromRequest(
                "req-001",
                new BigDecimal("15000000"),
                new BigDecimal("5000000")
        );

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("NHAP");
        assertThat(result.getTotalAmount()).isEqualByComparingTo("15000000");

        // Request phải được đổi sang DA_DUYET
        assertThat(mockRequest.getStatus()).isEqualTo(RentalRequest.RequestStatus.DA_DUYET);
        verify(requestRepository).save(mockRequest);
    }

    @Test
    @DisplayName("Không thể tạo hợp đồng từ request đã duyệt hoặc bị từ chối")
    void createContractFromRequest_AlreadyProcessed_ThrowsBadRequest() {
        // Arrange
        mockRequest.setStatus(RentalRequest.RequestStatus.DA_DUYET);
        when(requestRepository.findById("req-001")).thenReturn(Optional.of(mockRequest));

        // Act & Assert
        assertThatThrownBy(() -> contractService.createContractFromRequest(
                "req-001", new BigDecimal("15000000"), new BigDecimal("5000000")))
                .isInstanceOf(BusinessException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.BAD_REQUEST);

        verify(contractRepository, never()).save(any());
    }

    @Test
    @DisplayName("Kích hoạt hợp đồng thành công: booth chuyển sang DANG_THUE, tạo đợt thanh toán cọc")
    void activateContract_Success() {
        // Arrange
        Contract contract = Contract.builder()
                .id("contract-001")
                .contractNo("HD-ABCDEFGH")
                .customer(mockCustomer)
                .booth(mockBooth)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(30))
                .totalAmount(new BigDecimal("15000000"))
                .deposit(new BigDecimal("5000000"))
                .penaltyRate(5.0)
                .status(Contract.ContractStatus.NHAP)
                .build();

        when(contractRepository.findById("contract-001")).thenReturn(Optional.of(contract));

        // Act
        contractService.activateContract("contract-001");

        // Assert
        assertThat(contract.getStatus()).isEqualTo(Contract.ContractStatus.DANG_HIEU_LUC);
        assertThat(mockBooth.getStatus()).isEqualTo(Booth.BoothStatus.DANG_THUE);
        verify(boothRepository).save(mockBooth);
        verify(paymentRepository).save(any()); // Phải tạo đợt thanh toán cọc
    }

    @Test
    @DisplayName("Kích hoạt hợp đồng thất bại khi hợp đồng không ở trạng thái NHAP")
    void activateContract_NotDraft_ThrowsBadRequest() {
        // Arrange
        Contract contract = Contract.builder()
                .id("contract-001")
                .status(Contract.ContractStatus.DANG_HIEU_LUC)
                .build();

        when(contractRepository.findById("contract-001")).thenReturn(Optional.of(contract));

        // Act & Assert
        assertThatThrownBy(() -> contractService.activateContract("contract-001"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Nháp")
                .extracting("status")
                .isEqualTo(HttpStatus.BAD_REQUEST);

        verify(boothRepository, never()).save(any());
        verify(paymentRepository, never()).save(any());
    }
}
