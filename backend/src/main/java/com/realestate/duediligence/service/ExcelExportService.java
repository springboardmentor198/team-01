package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.Report;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class ExcelExportService {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    public byte[] generateExcel(Report report) {

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Due Diligence Report");

            sheet.setColumnWidth(0, 7000);
            sheet.setColumnWidth(1, 17000);

            //-----------------------------
            // Title Style
            //-----------------------------
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short)18);
            titleFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            titleStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            //-----------------------------
            // Section Header
            //-----------------------------
            Font sectionFont = workbook.createFont();
            sectionFont.setBold(true);
            sectionFont.setFontHeightInPoints((short)13);

            CellStyle sectionStyle = workbook.createCellStyle();
            sectionStyle.setFont(sectionFont);
            sectionStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            sectionStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            //-----------------------------
            // Label Style
            //-----------------------------
            Font labelFont = workbook.createFont();
            labelFont.setBold(true);

            CellStyle labelStyle = workbook.createCellStyle();
            labelStyle.setFont(labelFont);
            labelStyle.setBorderBottom(BorderStyle.THIN);
            labelStyle.setBorderTop(BorderStyle.THIN);
            labelStyle.setBorderLeft(BorderStyle.THIN);
            labelStyle.setBorderRight(BorderStyle.THIN);

            //-----------------------------
            // Value Style
            //-----------------------------
            CellStyle valueStyle = workbook.createCellStyle();
            valueStyle.setBorderBottom(BorderStyle.THIN);
            valueStyle.setBorderTop(BorderStyle.THIN);
            valueStyle.setBorderLeft(BorderStyle.THIN);
            valueStyle.setBorderRight(BorderStyle.THIN);

            //-----------------------------
            // Summary Style
            //-----------------------------
            CellStyle summaryStyle = workbook.createCellStyle();
            summaryStyle.setWrapText(true);
            summaryStyle.setVerticalAlignment(VerticalAlignment.TOP);
            summaryStyle.setBorderBottom(BorderStyle.THIN);
            summaryStyle.setBorderTop(BorderStyle.THIN);
            summaryStyle.setBorderLeft(BorderStyle.THIN);
            summaryStyle.setBorderRight(BorderStyle.THIN);

            //-----------------------------
            // Risk Style
            //-----------------------------
            CellStyle riskStyle = workbook.createCellStyle();

            String summary = report.getExecutiveSummary() == null ?
                    "" : report.getExecutiveSummary().toUpperCase();

            if(summary.contains("HIGH")){
                riskStyle.setFillForegroundColor(IndexedColors.RED.getIndex());
            }
            else if(summary.contains("MEDIUM")){
                riskStyle.setFillForegroundColor(IndexedColors.GOLD.getIndex());
            }
            else{
                riskStyle.setFillForegroundColor(IndexedColors.BRIGHT_GREEN.getIndex());
            }

            riskStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Font riskFont = workbook.createFont();
            riskFont.setBold(true);
            riskFont.setColor(IndexedColors.WHITE.getIndex());

            riskStyle.setFont(riskFont);
            riskStyle.setAlignment(HorizontalAlignment.CENTER);

            int row = 0;

            //---------------------------------
            // TITLE
            //---------------------------------

            Row titleRow = sheet.createRow(row++);
            titleRow.setHeightInPoints(30);

            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("REAL ESTATE DUE DILIGENCE REPORT");
            titleCell.setCellStyle(titleStyle);

            sheet.addMergedRegion(new CellRangeAddress(0,0,0,1));

            row++;

            //---------------------------------
            // REPORT INFORMATION
            //---------------------------------

            Row sec1 = sheet.createRow(row++);
            sec1.createCell(0).setCellValue("REPORT INFORMATION");
            sec1.getCell(0).setCellStyle(sectionStyle);

            writeRow(sheet,row++,"Report ID",
                    String.valueOf(report.getId()),labelStyle,valueStyle);

            writeRow(sheet,row++,"Property ID",
                    String.valueOf(report.getPropertyId()),labelStyle,valueStyle);

            writeRow(sheet,row++,"Status",
                    report.getStatus(),labelStyle,valueStyle);

            writeRow(sheet,row++,"Generated By",
                    report.getCreatedBy(),labelStyle,valueStyle);

            writeRow(sheet,row++,"Generated At",
                    report.getCreatedAt().format(DATE_FMT),
                    labelStyle,valueStyle);

            row++;

            //---------------------------------
            // RISK
            //---------------------------------

            Row sec2 = sheet.createRow(row++);
            sec2.createCell(0).setCellValue("OVERALL RISK");
            sec2.getCell(0).setCellStyle(sectionStyle);

            Row riskRow = sheet.createRow(row++);

            Cell riskCell = riskRow.createCell(0);

            if(summary.contains("HIGH"))
                riskCell.setCellValue("HIGH RISK");
            else if(summary.contains("MEDIUM"))
                riskCell.setCellValue("MEDIUM RISK");
            else
                riskCell.setCellValue("LOW RISK");

            riskCell.setCellStyle(riskStyle);

            row++;

            //---------------------------------
            // EXECUTIVE SUMMARY
            //---------------------------------

            Row sec3 = sheet.createRow(row++);
            sec3.createCell(0).setCellValue("EXECUTIVE SUMMARY");
            sec3.getCell(0).setCellStyle(sectionStyle);

            Row summaryRow = sheet.createRow(row++);
            summaryRow.setHeightInPoints(220);

            Cell summaryCell = summaryRow.createCell(0);
            summaryCell.setCellValue(
                    report.getExecutiveSummary()==null ?
                            "" :
                            report.getExecutiveSummary());

            summaryCell.setCellStyle(summaryStyle);

            sheet.addMergedRegion(new CellRangeAddress(
                    summaryRow.getRowNum(),
                    summaryRow.getRowNum(),
                    0,
                    1));

            row++;

            //---------------------------------
            // DISCLAIMER
            //---------------------------------

            Row sec4 = sheet.createRow(row++);
            sec4.createCell(0).setCellValue("DISCLAIMER");
            sec4.getCell(0).setCellStyle(sectionStyle);

            Row dis = sheet.createRow(row++);
            dis.setHeightInPoints(70);

            Cell d = dis.createCell(0);
            d.setCellValue(
                    "This report has been automatically generated by the Real Estate Due Diligence System. "
                  + "It summarizes available property records, uploaded documents, permit verification, "
                  + "ownership validation and calculated risk indicators. "
                  + "Please consult a legal professional before making any investment decision."
            );

            d.setCellStyle(summaryStyle);

            sheet.addMergedRegion(new CellRangeAddress(
                    dis.getRowNum(),
                    dis.getRowNum(),
                    0,
                    1));

            workbook.write(out);

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to generate Excel for report " + report.getId(), e);
        }
    }

    private void writeRow(
            Sheet sheet,
            int rowNumber,
            String key,
            String value,
            CellStyle keyStyle,
            CellStyle valueStyle){

        Row row = sheet.createRow(rowNumber);

        Cell c1 = row.createCell(0);
        c1.setCellValue(key);
        c1.setCellStyle(keyStyle);

        Cell c2 = row.createCell(1);
        c2.setCellValue(value==null ? "" : value);
        c2.setCellStyle(valueStyle);
    }

}