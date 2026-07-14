package com.booth.rental.service;

import com.booth.rental.domain.Payment;
import com.booth.rental.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final PaymentRepository paymentRepository;
    private static final DateTimeFormatter VN_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Tạo báo cáo tài chính dạng Excel (.xlsx).
     * - Sheet 1: Tổng hợp doanh thu theo tháng
     * - Sheet 2: Chi tiết thanh toán
     * - Sheet 3: Danh sách công nợ quá hạn
     */
    @Transactional(readOnly = true)
    public byte[] generateFinancialReport(int year, Integer month) throws IOException {
        List<Payment> allPayments = paymentRepository.findAll();

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            // === Styles ===
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);

            // === Sheet 1: Tổng hợp doanh thu ===
            createRevenueSheet(workbook, allPayments, year, headerStyle, titleStyle, currencyStyle);

            // === Sheet 2: Chi tiết thanh toán ===
            createPaymentDetailSheet(workbook, allPayments, year, month, headerStyle, titleStyle, currencyStyle, dateStyle);

            // === Sheet 3: Công nợ quá hạn ===
            createOverdueSheet(workbook, allPayments, headerStyle, titleStyle, currencyStyle, dateStyle);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void createRevenueSheet(Workbook workbook, List<Payment> allPayments, int year,
                                     CellStyle headerStyle, CellStyle titleStyle, CellStyle currencyStyle) {
        Sheet sheet = workbook.createSheet("Tổng hợp doanh thu");
        sheet.setColumnWidth(0, 5000);
        sheet.setColumnWidth(1, 6000);
        sheet.setColumnWidth(2, 4000);

        // Title
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO DOANH THU NĂM " + year);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 2));

        // Header
        Row header = sheet.createRow(2);
        String[] headers = {"Tháng", "Doanh thu (VND)", "Số giao dịch"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows
        BigDecimal totalRevenue = BigDecimal.ZERO;
        int totalTransactions = 0;

        for (int m = 1; m <= 12; m++) {
            final int currentMonth = m;
            List<Payment> monthlyPaid = allPayments.stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.DA_THANH_TOAN)
                    .filter(p -> p.getPaidDate() != null
                            && p.getPaidDate().getYear() == year
                            && p.getPaidDate().getMonthValue() == currentMonth)
                    .collect(Collectors.toList());

            BigDecimal monthRevenue = monthlyPaid.stream()
                    .map(p -> p.getActualAmount() != null ? p.getActualAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Row row = sheet.createRow(m + 2);
            row.createCell(0).setCellValue("Tháng " + m);

            Cell revenueCell = row.createCell(1);
            revenueCell.setCellValue(monthRevenue.doubleValue());
            revenueCell.setCellStyle(currencyStyle);

            row.createCell(2).setCellValue(monthlyPaid.size());

            totalRevenue = totalRevenue.add(monthRevenue);
            totalTransactions += monthlyPaid.size();
        }

        // Total row
        Row totalRow = sheet.createRow(15);
        Cell totalLabel = totalRow.createCell(0);
        totalLabel.setCellValue("TỔNG CỘNG");
        totalLabel.setCellStyle(headerStyle);

        Cell totalRevenueCell = totalRow.createCell(1);
        totalRevenueCell.setCellValue(totalRevenue.doubleValue());
        totalRevenueCell.setCellStyle(currencyStyle);

        Cell totalTxCell = totalRow.createCell(2);
        totalTxCell.setCellValue(totalTransactions);
        totalTxCell.setCellStyle(headerStyle);
    }

    private void createPaymentDetailSheet(Workbook workbook, List<Payment> allPayments, int year, Integer month,
                                           CellStyle headerStyle, CellStyle titleStyle,
                                           CellStyle currencyStyle, CellStyle dateStyle) {
        Sheet sheet = workbook.createSheet("Chi tiết thanh toán");
        sheet.setColumnWidth(0, 4000);
        sheet.setColumnWidth(1, 5000);
        sheet.setColumnWidth(2, 8000);
        sheet.setColumnWidth(3, 6000);
        sheet.setColumnWidth(4, 6000);
        sheet.setColumnWidth(5, 4000);
        sheet.setColumnWidth(6, 4000);
        sheet.setColumnWidth(7, 4000);

        // Title
        String titleText = month != null
                ? "CHI TIẾT THANH TOÁN THÁNG " + month + "/" + year
                : "CHI TIẾT THANH TOÁN NĂM " + year;
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(titleText);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));

        // Header
        Row header = sheet.createRow(2);
        String[] headers = {"Mã HĐ", "Khách hàng", "Nội dung", "Số tiền", "Thực thu", "Hạn TT", "Ngày TT", "Trạng thái"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Filter payments
        List<Payment> filtered = allPayments.stream()
                .filter(p -> {
                    if (p.getPaidDate() != null) {
                        boolean yearMatch = p.getPaidDate().getYear() == year;
                        if (month != null) return yearMatch && p.getPaidDate().getMonthValue() == month;
                        return yearMatch;
                    }
                    if (p.getDueDate() != null) {
                        boolean yearMatch = p.getDueDate().getYear() == year;
                        if (month != null) return yearMatch && p.getDueDate().getMonthValue() == month;
                        return yearMatch;
                    }
                    return false;
                })
                .sorted(Comparator.comparing(Payment::getDueDate))
                .collect(Collectors.toList());

        int rowIdx = 3;
        for (Payment p : filtered) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(p.getContract().getContractNo());
            row.createCell(1).setCellValue(p.getContract().getCustomer().getFullName());
            row.createCell(2).setCellValue(p.getTitle());

            Cell amountCell = row.createCell(3);
            amountCell.setCellValue(p.getAmount().doubleValue());
            amountCell.setCellStyle(currencyStyle);

            Cell actualCell = row.createCell(4);
            if (p.getActualAmount() != null) {
                actualCell.setCellValue(p.getActualAmount().doubleValue());
                actualCell.setCellStyle(currencyStyle);
            }

            Cell dueCell = row.createCell(5);
            dueCell.setCellValue(p.getDueDate().format(VN_DATE));

            Cell paidCell = row.createCell(6);
            if (p.getPaidDate() != null) {
                paidCell.setCellValue(p.getPaidDate().format(VN_DATE));
            }

            row.createCell(7).setCellValue(mapPaymentStatus(p.getStatus()));
        }
    }

    private void createOverdueSheet(Workbook workbook, List<Payment> allPayments,
                                     CellStyle headerStyle, CellStyle titleStyle,
                                     CellStyle currencyStyle, CellStyle dateStyle) {
        Sheet sheet = workbook.createSheet("Công nợ quá hạn");
        sheet.setColumnWidth(0, 4000);
        sheet.setColumnWidth(1, 5000);
        sheet.setColumnWidth(2, 8000);
        sheet.setColumnWidth(3, 6000);
        sheet.setColumnWidth(4, 6000);
        sheet.setColumnWidth(5, 4000);
        sheet.setColumnWidth(6, 4000);

        // Title
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("DANH SÁCH CÔNG NỢ QUÁ HẠN - " + LocalDate.now().format(VN_DATE));
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 6));

        // Header
        Row header = sheet.createRow(2);
        String[] headers = {"Mã HĐ", "Khách hàng", "Nội dung", "Số tiền gốc", "Tiền phạt", "Tổng nợ", "Hạn TT"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<Payment> overduePayments = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.QUA_HAN)
                .sorted(Comparator.comparing(Payment::getDueDate))
                .collect(Collectors.toList());

        BigDecimal totalDebt = BigDecimal.ZERO;
        int rowIdx = 3;
        for (Payment p : overduePayments) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(p.getContract().getContractNo());
            row.createCell(1).setCellValue(p.getContract().getCustomer().getFullName());
            row.createCell(2).setCellValue(p.getTitle());

            Cell amountCell = row.createCell(3);
            amountCell.setCellValue(p.getAmount().doubleValue());
            amountCell.setCellStyle(currencyStyle);

            BigDecimal penalty = p.getPenaltyAmount() != null ? p.getPenaltyAmount() : BigDecimal.ZERO;
            Cell penaltyCell = row.createCell(4);
            penaltyCell.setCellValue(penalty.doubleValue());
            penaltyCell.setCellStyle(currencyStyle);

            BigDecimal total = p.getAmount().add(penalty);
            Cell totalCell = row.createCell(5);
            totalCell.setCellValue(total.doubleValue());
            totalCell.setCellStyle(currencyStyle);

            row.createCell(6).setCellValue(p.getDueDate().format(VN_DATE));

            totalDebt = totalDebt.add(total);
        }

        // Total row
        Row totalRow = sheet.createRow(rowIdx + 1);
        Cell totalLabel = totalRow.createCell(0);
        totalLabel.setCellValue("TỔNG CỘNG NỢ");
        totalLabel.setCellStyle(headerStyle);

        Cell totalDebtCell = totalRow.createCell(5);
        totalDebtCell.setCellValue(totalDebt.doubleValue());
        totalDebtCell.setCellStyle(currencyStyle);
    }

    // === Style helpers ===

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        font.setColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("dd/mm/yyyy"));
        return style;
    }

    private String mapPaymentStatus(Payment.PaymentStatus status) {
        switch (status) {
            case CHO_THANH_TOAN: return "Chờ thanh toán";
            case DA_THANH_TOAN: return "Đã thanh toán";
            case QUA_HAN: return "Quá hạn";
            default: return status.name();
        }
    }
}
