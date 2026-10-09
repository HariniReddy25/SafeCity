package com.safecity.scheduler;

import com.safecity.service.EmergencyEscalationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class EscalationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(EscalationScheduler.class);

    @Autowired
    private EmergencyEscalationService escalationService;

    // Runs every 60 seconds (60,000 milliseconds)
    @Scheduled(fixedRate = 60000)
    public void runAutomaticEscalationCheck() {
        try {
            logger.info("Executing automatic emergency SLA escalation check...");
            escalationService.checkAndEscalateReports();
        } catch (Exception ex) {
            logger.error("Error executing automatic emergency SLA escalation check: ", ex);
        }
    }
}
