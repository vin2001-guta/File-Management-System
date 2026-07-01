package com.driveclone.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type;

    @Column(length = 500)
    private String description;

    private Long fileId;
    private String fileName;
    private Long folderId;
    private String folderName;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum ActivityType {
        FILE_UPLOAD, FILE_DOWNLOAD, FILE_DELETE, FILE_RESTORE,
        FILE_RENAME, FILE_MOVE, FILE_STAR, FILE_SHARE,
        FOLDER_CREATE, FOLDER_DELETE, FOLDER_RESTORE,
        FOLDER_RENAME, FOLDER_MOVE, FOLDER_STAR,
        USER_LOGIN, USER_LOGOUT, USER_REGISTER
    }
}
