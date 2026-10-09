package com.safecity.config;

import com.safecity.entity.EmergencyReport;
import com.safecity.entity.IncidentCategory;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;
import com.safecity.entity.Role;
import com.safecity.entity.User;
import com.safecity.entity.Shelter;
import com.safecity.entity.ShelterStatus;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.ShelterRepository;
import com.safecity.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmergencyReportRepository reportRepository;

    @Autowired
    private ShelterRepository shelterRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        User citizen = null;

        // Seed default Citizen test user
        if (!userRepository.existsByEmail("citizen@safecity.com")) {
            citizen = new User(
                    "Sarah Jenkins (Citizen)",
                    "citizen@safecity.com",
                    "+1-555-0101",
                    passwordEncoder.encode("Citizen123!"),
                    Role.CITIZEN
            );
            userRepository.save(citizen);
        } else {
            citizen = userRepository.findByEmail("citizen@safecity.com").orElse(null);
        }

        // Seed default Responder test user
        if (!userRepository.existsByEmail("responder@safecity.com")) {
            User responder = new User(
                    "Captain David Miller (Responder)",
                    "responder@safecity.com",
                    "+1-555-0102",
                    passwordEncoder.encode("Responder123!"),
                    Role.RESPONDER
            );
            userRepository.save(responder);
        }

        // Seed default Admin test user
        if (!userRepository.existsByEmail("admin@safecity.com")) {
            User admin = new User(
                    "Chief Admin Officer",
                    "admin@safecity.com",
                    "+1-555-0103",
                    passwordEncoder.encode("Admin123!"),
                    Role.ADMIN
            );
            userRepository.save(admin);
        }

        // Seed sample emergency reports if repository is empty
        if (citizen != null && reportRepository.count() == 0) {
            // Report 1: Critical Fire Emergency with valid coordinates (Hyderabad)
            EmergencyReport r1 = new EmergencyReport(
                    "SC-2026-000101",
                    citizen,
                    IncidentCategory.FIRE,
                    "Active commercial structure fire reported on 3rd floor. Heavy smoke visible.",
                    ReportPriority.CRITICAL,
                    17.3850,
                    78.4867,
                    "Abids Main Road, Hyderabad, Telangana",
                    LocalDateTime.now().minusMinutes(45),
                    null
            );
            r1.setStatus(ReportStatus.SUBMITTED);
            reportRepository.save(r1);

            // Report 2: High Priority Road Accident with valid coordinates (Hyderabad)
            EmergencyReport r2 = new EmergencyReport(
                    "SC-2026-000102",
                    citizen,
                    IncidentCategory.ROAD_ACCIDENT,
                    "Two vehicle collision at major intersection. Traffic blocked.",
                    ReportPriority.HIGH,
                    17.3980,
                    78.4750,
                    "Himayatnagar Circle, Hyderabad, Telangana",
                    LocalDateTime.now().minusHours(2),
                    null
            );
            r2.setStatus(ReportStatus.VERIFIED);
            reportRepository.save(r2);

            // Report 3: Medium Priority Medical Emergency with valid coordinates (Hyderabad)
            EmergencyReport r3 = new EmergencyReport(
                    "SC-2026-000103",
                    citizen,
                    IncidentCategory.MEDICAL_EMERGENCY,
                    "Pedestrian slipped on sidewalk needing assistance.",
                    ReportPriority.MEDIUM,
                    17.3600,
                    78.4700,
                    "Near Charminar Historic Sector, Hyderabad, Telangana",
                    LocalDateTime.now().minusHours(4),
                    null
            );
            r3.setStatus(ReportStatus.IN_PROGRESS);
            reportRepository.save(r3);

            // Report 4: Low Priority Public Safety Hazard with valid coordinates (Hyderabad)
            EmergencyReport r4 = new EmergencyReport(
                    "SC-2026-000104",
                    citizen,
                    IncidentCategory.PUBLIC_SAFETY_HAZARD,
                    "Broken streetlamp near pedestrian walkway causing dark corridor.",
                    ReportPriority.LOW,
                    17.4100,
                    78.5000,
                    "Road No 12, Banjara Hills, Hyderabad, Telangana",
                    LocalDateTime.now().minusDays(1),
                    null
            );
            r4.setStatus(ReportStatus.RESOLVED);
            reportRepository.save(r4);

            // Report 5: Emergency Report WITHOUT coordinates (Null/Invalid) - MUST NOT APPEAR ON MAP
            EmergencyReport r5 = new EmergencyReport(
                    "SC-2026-000105",
                    citizen,
                    IncidentCategory.OTHER,
                    "General noise complaint without location pinpoint.",
                    ReportPriority.LOW,
                    null,
                    null,
                    "UnknownLocation",
                    LocalDateTime.now().minusHours(6),
                    null
            );
            r5.setStatus(ReportStatus.SUBMITTED);
            reportRepository.save(r5);
        }

        // Seed Emergency Shelters
        if (shelterRepository != null && shelterRepository.count() == 0) {
            Shelter s1 = new Shelter(
                    "SH-HYD-01",
                    "Abids Civil Defense Emergency Center",
                    "Primary municipal indoor shelter with medical triage bay.",
                    "Abids Main Road, Hyderabad, Telangana",
                    17.3850,
                    78.4867,
                    300,
                    65,
                    ShelterStatus.AVAILABLE,
                    "+91-40-2345-6789",
                    "Medical Triage, Clean Drinking Water, Food Ration, Power Backup, Sanitation"
            );
            shelterRepository.save(s1);

            Shelter s2 = new Shelter(
                    "SH-HYD-02",
                    "Banjara Hills Relief & Evacuation Hub",
                    "Secondary evacuation center equipped for severe weather and fire emergencies.",
                    "Road No 1, Banjara Hills, Hyderabad, Telangana",
                    17.4156,
                    78.4347,
                    200,
                    190,
                    ShelterStatus.AVAILABLE,
                    "+91-40-2345-6790",
                    "Emergency Beds, First Aid, Children Facility, Wi-Fi"
            );
            shelterRepository.save(s2);

            Shelter s3 = new Shelter(
                    "SH-HYD-03",
                    "Secunderabad Railway Evacuation Camp",
                    "High-capacity emergency shelter located near central transportation hub.",
                    "Station Road, Secunderabad, Telangana",
                    17.4399,
                    78.4983,
                    500,
                    500,
                    ShelterStatus.FULL,
                    "+91-40-2345-6791",
                    "Mass Canteen, Ambulance Depot, Security Desk"
            );
            shelterRepository.save(s3);
        }
    }
}

