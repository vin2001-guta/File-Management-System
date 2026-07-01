package com.driveclone.dto;

import com.driveclone.model.FileItem;
import com.driveclone.model.FileShare;
import com.driveclone.model.Folder;
import com.driveclone.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class DTOs {

    // ===== AUTH DTOs =====
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String refreshToken;
        private String type;
        private UserDTO user;
    }

    // ===== USER DTOs =====
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserDTO {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String profilePicture;
        private Long storageUsed;
        private Long storageLimit;
        private LocalDateTime createdAt;

        public static UserDTO from(User user) {
            return UserDTO.builder()
                    .id(user.getId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .profilePicture(user.getProfilePicture())
                    .storageUsed(user.getStorageUsed())
                    .storageLimit(user.getStorageLimit())
                    .createdAt(user.getCreatedAt())
                    .build();
        }
    }

    // ===== FILE DTOs =====
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FileDTO {
        private Long id;
        private String name;
        private String originalName;
        private String mimeType;
        private Long fileSize;
        private String description;
        private Long folderId;
        private String folderName;
        private boolean starred;
        private boolean trashed;
        private long viewCount;
        private long downloadCount;
        private String shareToken;
        private FileItem.FileVisibility visibility;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String fileExtension;
        private UserDTO owner;

        public static FileDTO from(FileItem file) {
            return FileDTO.builder()
                    .id(file.getId())
                    .name(file.getName())
                    .originalName(file.getOriginalName())
                    .mimeType(file.getMimeType())
                    .fileSize(file.getFileSize())
                    .description(file.getDescription())
                    .folderId(file.getFolder() != null ? file.getFolder().getId() : null)
                    .folderName(file.getFolder() != null ? file.getFolder().getName() : null)
                    .starred(file.isStarred())
                    .trashed(file.isTrashed())
                    .viewCount(file.getViewCount())
                    .downloadCount(file.getDownloadCount())
                    .shareToken(file.getShareToken())
                    .visibility(file.getVisibility())
                    .createdAt(file.getCreatedAt())
                    .updatedAt(file.getUpdatedAt())
                    .fileExtension(file.getFileExtension())
                    .owner(UserDTO.from(file.getOwner()))
                    .build();
        }
    }

    // ===== FOLDER DTOs =====
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FolderDTO {
        private Long id;
        private String name;
        private Long parentId;
        private String parentName;
        private boolean starred;
        private boolean trashed;
        private String color;
        private int fileCount;
        private int subFolderCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private UserDTO owner;

        public static FolderDTO from(Folder folder) {
            return FolderDTO.builder()
                    .id(folder.getId())
                    .name(folder.getName())
                    .parentId(folder.getParent() != null ? folder.getParent().getId() : null)
                    .parentName(folder.getParent() != null ? folder.getParent().getName() : null)
                    .starred(folder.isStarred())
                    .trashed(folder.isTrashed())
                    .color(folder.getColor())
                    .createdAt(folder.getCreatedAt())
                    .updatedAt(folder.getUpdatedAt())
                    .owner(UserDTO.from(folder.getOwner()))
                    .build();
        }
    }

    // ===== FOLDER CONTENTS =====
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FolderContentsDTO {
        private FolderDTO currentFolder;
        private List<FolderDTO> folders;
        private List<FileDTO> files;
        private List<FolderDTO> breadcrumbs;
    }

    // ===== SHARE DTOs =====
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ShareRequest {
        private String email;
        private FileShare.SharePermission permission;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ShareDTO {
        private Long id;
        private Long fileId;
        private String fileName;
        private String sharedWithEmail;
        private FileShare.SharePermission permission;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;

        public static ShareDTO from(FileShare share) {
            return ShareDTO.builder()
                    .id(share.getId())
                    .fileId(share.getFile().getId())
                    .fileName(share.getFile().getName())
                    .sharedWithEmail(share.getSharedWithEmail())
                    .permission(share.getPermission())
                    .createdAt(share.getCreatedAt())
                    .expiresAt(share.getExpiresAt())
                    .build();
        }
    }

    // ===== SEARCH RESULTS =====
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SearchResultDTO {
        private List<FileDTO> files;
        private List<FolderDTO> folders;
        private int totalCount;
    }

    // ===== STORAGE INFO =====
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StorageInfoDTO {
        private Long storageUsed;
        private Long storageLimit;
        private Long storageAvailable;
        private double usagePercentage;
        private Long imageSize;
        private Long videoSize;
        private Long documentSize;
        private Long otherSize;
    }

    // ===== RENAME REQUEST =====
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RenameRequest {
        private String name;
    }

    // ===== MOVE REQUEST =====
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class MoveRequest {
        private Long targetFolderId; // null = root
    }

    // ===== CREATE FOLDER REQUEST =====
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateFolderRequest {
        private String name;
        private Long parentId; // null = root
        private String color;
    }

    // ===== API RESPONSE =====
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;

        public static ApiResponse ok(String message) {
            return ApiResponse.builder().success(true).message(message).build();
        }

        public static ApiResponse ok(String message, Object data) {
            return ApiResponse.builder().success(true).message(message).data(data).build();
        }

        public static ApiResponse error(String message) {
            return ApiResponse.builder().success(false).message(message).build();
        }
    }
}
