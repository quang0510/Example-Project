package com.booth.rental.service;

import com.booth.rental.domain.Booth;
import com.booth.rental.domain.RentalRequest;
import com.booth.rental.domain.User;
import com.booth.rental.dto.RentalRequestDto;
import com.booth.rental.dto.response.RentalRequestResponse;
import com.booth.rental.exception.BusinessException;
import com.booth.rental.repository.BoothRepository;
import com.booth.rental.repository.RentalRequestRepository;
import com.booth.rental.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RentalRequestService Tests")
class RentalRequestServiceTest {

    @Mock private RentalRequestRepository requestRepository;
    @Mock private BoothRepository boothRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private RentalRequestService rentalRequestService;

    private User mockCustomer;
    private Booth mockBooth;
    private RentalRequestDto mockDto;

    @BeforeEach
    void setUp() {
        mockCustomer = User.builder()
                .id("user-001")
                .username("testuser")
                .fullName("Nguyen Van A")
                .email("test@example.com")
                .phone("0901234567")
                .role(User.Role.CUSTOMER)
                .build();

        mockBooth = Booth.builder()
                .id("booth-001")
                .boothCode("A-001")
                .name("Gian hàng Test")
                .area(30.0)
                .zone("Khu A")
                .price(new BigDecimal("10000000"))
                .status(Booth.BoothStatus.TRONG)
                .build();

        mockDto = new RentalRequestDto();
        mockDto.setBoothId("booth-001");
        mockDto.setStartDate(LocalDate.now().plusDays(1));
        mockDto.setEndDate(LocalDate.now().plusDays(30));
        mockDto.setNote("Test note");

        // Mock SecurityContext
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("testuser");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Tạo booking thành công với đầy đủ điều kiện hợp lệ")
    void createBookingRequest_Success() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockCustomer));
        when(requestRepository.countPendingRequestsByCustomerId("user-001")).thenReturn(0L);
        when(boothRepository.findByIdForUpdate("booth-001")).thenReturn(Optional.of(mockBooth));

        RentalRequest savedRequest = RentalRequest.builder()
                .id("req-001")
                .customer(mockCustomer)
                .booth(mockBooth)
                .startDate(mockDto.getStartDate())
                .endDate(mockDto.getEndDate())
                .status(RentalRequest.RequestStatus.CHO_DUYET)
                .build();
        when(requestRepository.save(any(RentalRequest.class))).thenReturn(savedRequest);

        // Act
        RentalRequestResponse result = rentalRequestService.createBookingRequest(mockDto);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCustomerId()).isEqualTo("user-001");
        assertThat(result.getBoothId()).isEqualTo("booth-001");
        assertThat(result.getStatus()).isEqualTo("CHO_DUYET");

        // Booth phải được đặt sang DA_DAT
        assertThat(mockBooth.getStatus()).isEqualTo(Booth.BoothStatus.DA_DAT);
        verify(boothRepository).save(mockBooth);
        verify(requestRepository).save(any(RentalRequest.class));
    }

    @Test
    @DisplayName("Từ chối tạo booking khi user đã có 3 request đang chờ duyệt (Anti-spam)")
    void createBookingRequest_AntiSpam_ThrowsWhenExceeds3Pending() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockCustomer));
        when(requestRepository.countPendingRequestsByCustomerId("user-001")).thenReturn(3L);

        // Act & Assert
        assertThatThrownBy(() -> rentalRequestService.createBookingRequest(mockDto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("tối đa 3 yêu cầu")
                .extracting("status")
                .isEqualTo(HttpStatus.FORBIDDEN);

        // Booth KHÔNG được lock hay save
        verify(boothRepository, never()).findByIdForUpdate(anyString());
        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Từ chối tạo booking khi gian hàng không còn trống (DA_DAT)")
    void createBookingRequest_BoothNotAvailable_ThrowsConflict() {
        // Arrange
        mockBooth.setStatus(Booth.BoothStatus.DA_DAT);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockCustomer));
        when(requestRepository.countPendingRequestsByCustomerId("user-001")).thenReturn(0L);
        when(boothRepository.findByIdForUpdate("booth-001")).thenReturn(Optional.of(mockBooth));

        // Act & Assert
        assertThatThrownBy(() -> rentalRequestService.createBookingRequest(mockDto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("đã được đặt")
                .extracting("status")
                .isEqualTo(HttpStatus.CONFLICT);

        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Từ chối booking khi gian hàng không tồn tại")
    void createBookingRequest_BoothNotFound_ThrowsNotFound() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockCustomer));
        when(requestRepository.countPendingRequestsByCustomerId("user-001")).thenReturn(0L);
        when(boothRepository.findByIdForUpdate("booth-001")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> rentalRequestService.createBookingRequest(mockDto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("không tồn tại")
                .extracting("status")
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("rejectRequest thành công: trả gian hàng về TRỐNG")
    void rejectRequest_Success_ReleaseBooth() {
        // Arrange
        mockBooth.setStatus(Booth.BoothStatus.DA_DAT);
        RentalRequest request = RentalRequest.builder()
                .id("req-001")
                .customer(mockCustomer)
                .booth(mockBooth)
                .status(RentalRequest.RequestStatus.CHO_DUYET)
                .build();

        when(requestRepository.findById("req-001")).thenReturn(Optional.of(request));

        // Act
        rentalRequestService.rejectRequest("req-001", "Lý do từ chối");

        // Assert
        assertThat(request.getStatus()).isEqualTo(RentalRequest.RequestStatus.DA_HUY);
        assertThat(mockBooth.getStatus()).isEqualTo(Booth.BoothStatus.TRONG);
        verify(boothRepository).save(mockBooth);
    }

    @Test
    @DisplayName("rejectRequest thất bại khi request không ở trạng thái CHO_DUYET")
    void rejectRequest_AlreadyProcessed_ThrowsBadRequest() {
        // Arrange
        RentalRequest request = RentalRequest.builder()
                .id("req-001")
                .customer(mockCustomer)
                .booth(mockBooth)
                .status(RentalRequest.RequestStatus.DA_DUYET)
                .build();

        when(requestRepository.findById("req-001")).thenReturn(Optional.of(request));

        // Act & Assert
        assertThatThrownBy(() -> rentalRequestService.rejectRequest("req-001", "Lý do từ chối"))
                .isInstanceOf(BusinessException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
