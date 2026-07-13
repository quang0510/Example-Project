package com.booth.rental.service;

import com.booth.rental.domain.*;
import com.booth.rental.dto.RentalRequestDto;
import com.booth.rental.dto.response.RentalRequestResponse;
import com.booth.rental.exception.BusinessException;
import com.booth.rental.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RentalRequestService {
    private final RentalRequestRepository requestRepository;
    private final BoothRepository boothRepository;
    private final UserRepository userRepository;

    @Transactional
    public RentalRequestResponse createBookingRequest(RentalRequestDto dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Khong tim thay tai khoan", HttpStatus.NOT_FOUND));

        long pendingCount = requestRepository.countPendingRequestsByCustomerId(customer.getId());
        if (pendingCount >= 3)
            throw new BusinessException("Ban chi duoc gui toi da 3 yeu cau cho duyet", HttpStatus.FORBIDDEN);

        Booth booth = boothRepository.findByIdForUpdate(dto.getBoothId())
                .orElseThrow(() -> new BusinessException("Gian hang khong ton tai", HttpStatus.NOT_FOUND));

        if (booth.getStatus() != Booth.BoothStatus.TRONG)
            throw new BusinessException("Gian hang nay da duoc dat hoac dang cho thue", HttpStatus.CONFLICT);

        booth.setStatus(Booth.BoothStatus.DA_DAT);
        boothRepository.save(booth);

        RentalRequest request = RentalRequest.builder()
                .customer(customer).booth(booth)
                .startDate(dto.getStartDate()).endDate(dto.getEndDate())
                .note(dto.getNote()).status(RentalRequest.RequestStatus.CHO_DUYET).build();

        return RentalRequestResponse.from(requestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<RentalRequestResponse> getAllRequests(String status) {
        return requestRepository.findAll().stream()
                .filter(r -> status == null || status.equals("ALL") || r.getStatus().name().equals(status))
                .map(RentalRequestResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalRequestResponse> getMyRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Not found", HttpStatus.NOT_FOUND));
        return requestRepository.findAll().stream()
                .filter(r -> r.getCustomer().getId().equals(customer.getId()))
                .map(RentalRequestResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public RentalRequestResponse approveRequest(String id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User manager = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Not found", HttpStatus.NOT_FOUND));

        RentalRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay Yeu cau", HttpStatus.NOT_FOUND));

        if (request.getStatus() != RentalRequest.RequestStatus.CHO_DUYET)
            throw new BusinessException("Chi co the duyet yeu cau dang cho duyet", HttpStatus.BAD_REQUEST);

        request.setStatus(RentalRequest.RequestStatus.DA_DUYET);
        request.setApprovedBy(manager.getId());
        return RentalRequestResponse.from(requestRepository.save(request));
    }

    @Transactional
    public void rejectRequest(String id, String reason) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User manager = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Not found", HttpStatus.NOT_FOUND));

        RentalRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay Yeu cau", HttpStatus.NOT_FOUND));

        if (request.getStatus() != RentalRequest.RequestStatus.CHO_DUYET)
            throw new BusinessException("Chi co the tu choi yeu cau dang cho duyet", HttpStatus.BAD_REQUEST);

        request.setStatus(RentalRequest.RequestStatus.DA_HUY);
        request.setRejectedReason(reason);
        request.setRejectedBy(manager.getId());
        requestRepository.save(request);

        Booth booth = request.getBooth();
        booth.setStatus(Booth.BoothStatus.TRONG);
        boothRepository.save(booth);
    }

    @Transactional
    public void cancelRequest(String id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Not found", HttpStatus.NOT_FOUND));

        RentalRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay Yeu cau", HttpStatus.NOT_FOUND));

        if (!request.getCustomer().getId().equals(customer.getId()))
            throw new BusinessException("Ban khong co quyen huy yeu cau nay", HttpStatus.FORBIDDEN);

        if (request.getStatus() != RentalRequest.RequestStatus.CHO_DUYET)
            throw new BusinessException("Chi co the huy yeu cau dang cho duyet", HttpStatus.BAD_REQUEST);

        request.setStatus(RentalRequest.RequestStatus.DA_HUY);
        requestRepository.save(request);

        Booth booth = request.getBooth();
        booth.setStatus(Booth.BoothStatus.TRONG);
        boothRepository.save(booth);
    }
}
