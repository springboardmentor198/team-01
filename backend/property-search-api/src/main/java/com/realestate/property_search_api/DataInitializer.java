package com.realestate.property_search_api;

import com.realestate.property_search_api.entity.*;
import com.realestate.property_search_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private RiskAssessmentRepository riskAssessmentRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Create a User (Matches teammates seed)
        User user = new User();
        user.setFullName("Satya Prakash");
        user.setEmail("satya@gmail.com");
        user.setPasswordHash("$2a$10$abcdefghijklmnopqrstuv1234567890examplehash");
        user.setRole("ADMIN");
        user.setPhoneNumber("9876543210");
        user.setIsActive(true);
        user = userRepository.save(user);

        // 2. Create a small set of hand-crafted, realistic properties
        Property p1 = createProperty(user.getUserId(), "24 Lakeview Street", "Residential", "AVAILABLE", "24 Lakeview Street, Sector 4", "Bangalore", "Karnataka", "560102", 2450.50, 12500000.00);
        Property p2 = createProperty(user.getUserId(), "18 Green Avenue", "Commercial", "AVAILABLE", "18 Green Avenue, Indiranagar", "Mumbai", "Maharashtra", "400001", 5400.00, 32000000.00);
        Property p3 = createProperty(user.getUserId(), "Palm Residency", "Residential", "UNDER_REVIEW", "Flat 402, Palm Residency, Whitefield", "Bangalore", "Karnataka", "560066", 1850.00, 9500000.00);
        Property p4 = createProperty(user.getUserId(), "Skyline Towers", "Commercial", "AVAILABLE", "Suite 801, Skyline Towers, Outer Ring Rd", "Chennai", "Tamil Nadu", "600001", 8200.00, 45000000.00);
        Property p5 = createProperty(user.getUserId(), "Maple Heights", "Residential", "AVAILABLE", "Villa 12, Maple Heights, Sarjapur", "Bangalore", "Karnataka", "560035", 3100.00, 18000000.00);
        Property p6 = createProperty(user.getUserId(), "Sunrise Villas", "Residential", "AVAILABLE", "Plot 89, Sunrise Villas, Electronic City", "Mumbai", "Maharashtra", "400064", 2800.00, 14000000.00);
        Property p7 = createProperty(user.getUserId(), "88 Orchard Road", "Residential", "AVAILABLE", "88 Orchard Road, Koramangala", "Bangalore", "Karnataka", "560095", 2200.00, 11000000.00);
        Property p8 = createProperty(user.getUserId(), "Highland Meadows", "Land", "UNDER_REVIEW", "Survey No 45, Highland Meadows, Devanahalli", "Delhi", "NCR", "110001", 12000.00, 8500000.00);
        Property p9 = createProperty(user.getUserId(), "45 Industrial Parkway", "Industrial", "AVAILABLE", "45 Industrial Parkway, Peenya", "Pune", "Maharashtra", "411001", 15000.00, 60000000.00);
        Property p10 = createProperty(user.getUserId(), "Silver Creek Apartments", "Residential", "AVAILABLE", "Block B, Silver Creek, Bellandur", "Bangalore", "Karnataka", "560103", 1450.00, 7800000.00);

        // 3. Create Risk Assessments for these properties
        createAssessment(p1.getPropertyId(), user.getUserId(), 55, "MEDIUM", "Property is legally clear with minor environment concerns.");
        createAssessment(p2.getPropertyId(), user.getUserId(), 15, "LOW", "All legal and structural documents are verified.");
        createAssessment(p3.getPropertyId(), user.getUserId(), 88, "HIGH", "High risk due to ongoing litigation on boundary wall.");
        createAssessment(p4.getPropertyId(), user.getUserId(), 20, "LOW", "Clean title deed and up-to-date tax receipts.");
        createAssessment(p5.getPropertyId(), user.getUserId(), 10, "LOW", "All document verifications completed successfully.");
        createAssessment(p6.getPropertyId(), user.getUserId(), 60, "MEDIUM", "Moderate risk: property tax is due for the current year.");
        createAssessment(p7.getPropertyId(), user.getUserId(), 22, "LOW", "Low risk level. Title deed verified.");
        createAssessment(p8.getPropertyId(), user.getUserId(), 92, "HIGH", "High risk: Land is situated near forest buffer zone.");
        createAssessment(p9.getPropertyId(), user.getUserId(), 45, "MEDIUM", "Medium risk: minor zoning compliance update pending.");
        createAssessment(p10.getPropertyId(), user.getUserId(), 18, "LOW", "Low risk: all structural permits in order.");

        // 4. Create Reports (for completed assessments)
        createReport(1L, "Due Diligence Report - 24 Lakeview");
        createReport(2L, "Legal Assessment - 18 Green Ave");
        createReport(3L, "Property Risk Review - Palm Residency");
        createReport(4L, "Compliance Certificate - Skyline Towers");
        createReport(5L, "Verification Summary - Maple Heights");

        // 5. Create Notifications
        createNotification(user.getUserId(), "Report Ready : 24 Lakeview Street");
        createNotification(user.getUserId(), "Property Tax Update : Palm Residency");
        createNotification(user.getUserId(), "Permit Expiry Alert : 18 Green Avenue");
    }

    private Property createProperty(Long ownerId, String title, String type, String status, String address, String city, String state, String zip, double sqft, double price) {
        Property p = new Property();
        p.setOwnerId(ownerId);
        p.setPropertyTitle(title);
        p.setPropertyType(type);
        p.setAddress(address);
        p.setCity(city);
        p.setState(state);
        p.setZipCode(zip);
        p.setAreaSqft(BigDecimal.valueOf(sqft));
        p.setEstimatedPrice(BigDecimal.valueOf(price));
        p.setStatus(status);
        return propertyRepository.save(p);
    }

    private void createAssessment(Long propertyId, Long userId, int score, String level, String remarks) {
        RiskAssessment ra = new RiskAssessment();
        ra.setPropertyId(propertyId);
        ra.setAssessedBy(userId);
        ra.setOverallScore(score);
        ra.setRiskLevel(level);
        ra.setRemarks(remarks);
        riskAssessmentRepository.save(ra);
    }

    private void createReport(Long assessmentId, String name) {
        Report report = new Report();
        report.setAssessmentId(assessmentId);
        report.setReportName(name);
        report.setReportUrl("https://example.com/reports/rep-" + assessmentId + ".pdf");
        reportRepository.save(report);
    }

    private void createNotification(Long userId, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        n.setIsRead(false);
        notificationRepository.save(n);
    }
}
