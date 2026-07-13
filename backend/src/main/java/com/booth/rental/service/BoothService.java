package com.booth.rental.service;

import com.booth.rental.domain.Booth;
import com.booth.rental.dto.BoothDto;
import com.booth.rental.dto.response.BoothResponse;
import com.booth.rental.exception.BusinessException;
import com.booth.rental.repository.BoothRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoothService {
    private final BoothRepository boothRepository;
    private final AuditLogService auditLogService;

    @PostConstruct
    public void initTestBooths() {
        if (boothRepository.count() == 0) {
            boothRepository.save(Booth.builder()
                .boothCode("A-001").name("Gian hang Goc Cong Chinh").area(50.5).zone("Khu A - Thoi trang")
                .price(new BigDecimal("15000000")).status(Booth.BoothStatus.TRONG)
                .thumbnailUrl("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop")
                .description("Vi tri dac dia ngay cong vao, luu luong khach qua lai cao nhat.").build());

            boothRepository.save(Booth.builder()
                .boothCode("A-002").name("Kiot Ban Giay Dep").area(30.0).zone("Khu A - Thoi trang")
                .price(new BigDecimal("8000000")).status(Booth.BoothStatus.TRONG)
                .thumbnailUrl("https://images.unsplash.com/photo-1603522198007-8e67a0c50ed2?q=80&w=600&auto=format&fit=crop")
                .description("Kiot nho gon, phu hop kinh doanh giay dep.").build());

            boothRepository.save(Booth.builder()
                .boothCode("B-001").name("Gian hang Am thuc B1").area(80.0).zone("Khu B - Am thuc")
                .price(new BigDecimal("20000000")).status(Booth.BoothStatus.DANG_THUE)
                .thumbnailUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop")
                .description("Khong gian rong rai, trang bi day du bep, quay bar.").build());

            boothRepository.save(Booth.builder()
                .boothCode("B-002").name("Kiot Tra Sua").area(25.0).zone("Khu B - Am thuc")
                .price(new BigDecimal("6000000")).status(Booth.BoothStatus.DA_DAT)
                .thumbnailUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop")
                .description("Vi tri goc, view dep, phu hop kinh doanh do uong.").build());

            boothRepository.save(Booth.builder()
                .boothCode("C-001").name("Gian hang Dien tu C1").area(60.0).zone("Khu C - Dien tu")
                .price(new BigDecimal("18000000")).status(Booth.BoothStatus.TRONG)
                .thumbnailUrl("https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop")
                .description("Khu vuc dien tu hien dai, gan thang may.").build());
        }
    }

    @Transactional(readOnly = true)
    public List<BoothResponse> getAllBooths(String status, String zone, String search) {
        return boothRepository.findAll().stream()
                .filter(b -> {
                    if (status != null && !status.equals("ALL")) {
                        try { return b.getStatus() == Booth.BoothStatus.valueOf(status); }
                        catch (IllegalArgumentException e) { return true; }
                    }
                    return true;
                })
                .filter(b -> zone == null || zone.isBlank() || (b.getZone() != null && b.getZone().toLowerCase().contains(zone.toLowerCase())))
                .filter(b -> search == null || search.isBlank() ||
                        b.getName().toLowerCase().contains(search.toLowerCase()) ||
                        b.getBoothCode().toLowerCase().contains(search.toLowerCase()))
                .map(BoothResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BoothResponse getBoothById(String id) {
        return BoothResponse.from(boothRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay gian hang", HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public BoothResponse createBooth(BoothDto dto) {
        if (boothRepository.existsByBoothCode(dto.getBoothCode()))
            throw new BusinessException("Ma gian hang da ton tai", HttpStatus.BAD_REQUEST);

        Booth booth = Booth.builder()
                .boothCode(dto.getBoothCode()).name(dto.getName()).area(dto.getArea())
                .zone(dto.getZone()).price(dto.getPrice()).status(Booth.BoothStatus.TRONG)
                .thumbnailUrl(dto.getThumbnailUrl()).description(dto.getDescription()).build();
        Booth savedBooth = boothRepository.save(booth);
        
        auditLogService.logAction("CREATE", "BOOTH", savedBooth.getId(), "Tạo gian hàng mới: " + dto.getBoothCode());
        return BoothResponse.from(savedBooth);
    }

    @Transactional
    public BoothResponse updateBooth(String id, BoothDto dto) {
        Booth booth = boothRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay gian hang", HttpStatus.NOT_FOUND));
        if (booth.getStatus() == Booth.BoothStatus.DANG_THUE)
            throw new BusinessException("Khong the sua gian hang dang cho thue", HttpStatus.BAD_REQUEST);

        booth.setName(dto.getName()); booth.setArea(dto.getArea()); booth.setZone(dto.getZone());
        booth.setPrice(dto.getPrice()); booth.setDescription(dto.getDescription());
        booth.setThumbnailUrl(dto.getThumbnailUrl());
        Booth updatedBooth = boothRepository.save(booth);
        
        auditLogService.logAction("UPDATE", "BOOTH", updatedBooth.getId(), "Cập nhật gian hàng: " + updatedBooth.getBoothCode());
        return BoothResponse.from(updatedBooth);
    }

    @Transactional
    public void changeBoothStatus(String id, Booth.BoothStatus newStatus) {
        Booth booth = boothRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay gian hang", HttpStatus.NOT_FOUND));
        booth.setStatus(newStatus);
        boothRepository.save(booth);
        auditLogService.logAction("UPDATE", "BOOTH", booth.getId(), "Đổi trạng thái thành " + newStatus);
    }

    @Transactional
    public void deleteBooth(String id) {
        Booth booth = boothRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay gian hang", HttpStatus.NOT_FOUND));
        if (booth.getStatus() == Booth.BoothStatus.DANG_THUE)
            throw new BusinessException("Khong the xoa gian hang dang cho thue", HttpStatus.BAD_REQUEST);
        boothRepository.delete(booth);
        auditLogService.logAction("DELETE", "BOOTH", booth.getId(), "Xóa gian hàng: " + booth.getBoothCode());
    }
}
