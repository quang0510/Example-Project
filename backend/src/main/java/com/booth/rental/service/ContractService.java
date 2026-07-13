package com.booth.rental.service;

import com.booth.rental.domain.*;
import com.booth.rental.dto.response.ContractResponse;
import com.booth.rental.exception.BusinessException;
import com.booth.rental.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService {
    private final ContractRepository contractRepository;
    private final RentalRequestRepository requestRepository;
    private final PaymentRepository paymentRepository;
    private final BoothRepository boothRepository;
    private final UserRepository userRepository;

    @Transactional
    public ContractResponse createContractFromRequest(String requestId, BigDecimal totalAmount, BigDecimal deposit) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User manager = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Not found", HttpStatus.NOT_FOUND));

        RentalRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException("Khong tim thay Yeu cau thue", HttpStatus.NOT_FOUND));

        if (request.getStatus() != RentalRequest.RequestStatus.CHO_DUYET && request.getStatus() != RentalRequest.RequestStatus.DA_DUYET)
            throw new BusinessException("Yeu cau nay da bi tu choi hoac huy", HttpStatus.BAD_REQUEST);

        request.setStatus(RentalRequest.RequestStatus.DA_DUYET);
        request.setApprovedBy(manager.getId());
        requestRepository.save(request);

        String contractNo = "HD-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Contract contract = Contract.builder()
                .contractNo(contractNo).customer(request.getCustomer()).booth(request.getBooth())
                .rentalRequest(request).startDate(request.getStartDate()).endDate(request.getEndDate())
                .totalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO)
                .deposit(deposit != null ? deposit : BigDecimal.ZERO)
                .penaltyRate(0.5).status(Contract.ContractStatus.NHAP).createdBy(manager.getId()).build();

        return ContractResponse.from(contractRepository.save(contract));
    }

    @Transactional
    public ContractResponse updateDraftContract(String contractId, BigDecimal totalAmount, BigDecimal deposit, String note) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new BusinessException("Khong tim thay hop dong", HttpStatus.NOT_FOUND));

        if (contract.getStatus() != Contract.ContractStatus.NHAP)
            throw new BusinessException("Chi co the chinh sua hop dong dang o trang thai Nhap", HttpStatus.BAD_REQUEST);

        if (totalAmount != null) contract.setTotalAmount(totalAmount);
        if (deposit != null) contract.setDeposit(deposit);
        if (note != null) contract.setNote(note);

        return ContractResponse.from(contractRepository.save(contract));
    }

    @Transactional
    public ContractResponse activateContract(String contractId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User manager = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Not found", HttpStatus.NOT_FOUND));

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new BusinessException("Khong tim thay hop dong", HttpStatus.NOT_FOUND));

        if (contract.getStatus() != Contract.ContractStatus.NHAP)
            throw new BusinessException("Chi hop dong Nhap moi co the kich hoat", HttpStatus.BAD_REQUEST);

        contract.setStatus(Contract.ContractStatus.DANG_HIEU_LUC);
        contract.setActivatedBy(manager.getId());
        contract.setActivatedAt(java.time.LocalDateTime.now());
        contractRepository.save(contract);

        Booth booth = contract.getBooth();
        booth.setStatus(Booth.BoothStatus.DANG_THUE);
        boothRepository.save(booth);

        Payment depositPayment = Payment.builder()
                .contract(contract).title("Tien Coc - " + contract.getContractNo())
                .amount(contract.getDeposit()).dueDate(LocalDate.now().plusDays(3))
                .status(Payment.PaymentStatus.CHO_THANH_TOAN).build();
        paymentRepository.save(depositPayment);

        long months = java.time.temporal.ChronoUnit.MONTHS.between(contract.getStartDate(), contract.getEndDate());
        if (months <= 0) {
            months = 1;
        } else if (contract.getStartDate().plusMonths(months).isBefore(contract.getEndDate())) {
            months++;
        }

        BigDecimal monthlyAmount = contract.getTotalAmount().divide(BigDecimal.valueOf(months), 2, java.math.RoundingMode.HALF_UP);
        LocalDate currentDueDate = contract.getStartDate();

        for (int i = 1; i <= months; i++) {
            Payment rentPayment = Payment.builder()
                    .contract(contract)
                    .title("Tien thue thang " + i + " - " + contract.getContractNo())
                    .amount(monthlyAmount)
                    .dueDate(currentDueDate)
                    .status(Payment.PaymentStatus.CHO_THANH_TOAN)
                    .build();
            paymentRepository.save(rentPayment);
            currentDueDate = currentDueDate.plusMonths(1);
        }

        return ContractResponse.from(contract);
    }

    @Transactional
    public void terminateContract(String contractId, String note) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new BusinessException("Khong tim thay hop dong", HttpStatus.NOT_FOUND));

        contract.setStatus(Contract.ContractStatus.DA_KET_THUC);
        contract.setNote(note);
        contract.setTerminatedAt(java.time.LocalDateTime.now());
        contractRepository.save(contract);

        Booth booth = contract.getBooth();
        booth.setStatus(Booth.BoothStatus.TRONG);
        boothRepository.save(booth);
    }

    @Transactional
    public void cancelContract(String contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new BusinessException("Khong tim thay hop dong", HttpStatus.NOT_FOUND));

        if (contract.getStatus() != Contract.ContractStatus.NHAP)
            throw new BusinessException("Chi co the huy hop dong Nhap", HttpStatus.BAD_REQUEST);

        contract.setStatus(Contract.ContractStatus.DA_HUY);
        contractRepository.save(contract);

        Booth booth = contract.getBooth();
        if (booth.getStatus() == Booth.BoothStatus.DA_DAT) {
            booth.setStatus(Booth.BoothStatus.TRONG);
            boothRepository.save(booth);
        }
    }

    @Transactional
    public ContractResponse renewContract(String contractId, LocalDate newEndDate, BigDecimal newPrice, String note) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new BusinessException("Khong tim thay hop dong", HttpStatus.NOT_FOUND));

        if (contract.getStatus() != Contract.ContractStatus.DANG_HIEU_LUC)
            throw new BusinessException("Chi co the gia han hop dong dang hieu luc", HttpStatus.BAD_REQUEST);

        if (!newEndDate.isAfter(contract.getEndDate()))
            throw new BusinessException("Ngay ket thuc moi phai sau ngay ket thuc hien tai", HttpStatus.BAD_REQUEST);

        contract.setEndDate(newEndDate);
        if (newPrice != null) contract.setTotalAmount(newPrice);
        if (note != null) contract.setNote(note);

        return ContractResponse.from(contractRepository.save(contract));
    }

    @Transactional(readOnly = true)
    public List<ContractResponse> getAllContracts(String status) {
        return contractRepository.findAll().stream()
                .filter(c -> status == null || status.equals("ALL") || c.getStatus().name().equals(status))
                .map(ContractResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContractResponse> getMyContracts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Not found", HttpStatus.NOT_FOUND));
        return contractRepository.findByCustomerId(customer.getId()).stream()
                .map(ContractResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContractResponse getContractById(String id) {
        return ContractResponse.from(contractRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay hop dong", HttpStatus.NOT_FOUND)));
    }
}
