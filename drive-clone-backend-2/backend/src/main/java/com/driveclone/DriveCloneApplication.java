package com.driveclone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DriveCloneApplication {
    public static void main(String[] args) {
        SpringApplication.run(DriveCloneApplication.class, args);
    }
}
