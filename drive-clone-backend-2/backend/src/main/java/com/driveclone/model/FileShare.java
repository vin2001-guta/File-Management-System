package com.driveclone.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "file_shares")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FileShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private FileItem file;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_id")
    private User sharedWith;

    @Column
    private String sharedWithEmail; // For external sharing

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SharePermission permission = SharePermission.VIEW;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_by_id", nullable = false)
    private User sharedBy;

    private LocalDateTime expiresAt;

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum SharePermission {
        VIEW, COMMENT, EDIT
    }
}
