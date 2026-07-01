package com.driveclone.service;

import com.driveclone.dto.DTOs.*;
import com.driveclone.model.Activity;
import com.driveclone.model.Folder;
import com.driveclone.model.User;
import com.driveclone.repository.ActivityRepository;
import com.driveclone.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class FolderService {

    private final FolderRepository folderRepository;
    private final ActivityRepository activityRepository;

    public FolderDTO createFolder(CreateFolderRequest request, User owner) {
        Folder parent = null;
        if (request.getParentId() != null) {
            parent = folderRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent folder not found"));
        }

        // Check for duplicate name
        boolean exists;
        if (parent == null) {
            exists = folderRepository.existsByNameAndParentIsNullAndOwnerAndTrashedFalse(request.getName(), owner);
        } else {
            exists = folderRepository.existsByNameAndParentAndOwnerAndTrashedFalse(request.getName(), parent, owner);
        }

        if (exists) {
            throw new RuntimeException("A folder with this name already exists");
        }

        Folder folder = Folder.builder()
                .name(request.getName())
                .parent(parent)
                .owner(owner)
                .color(request.getColor() != null ? request.getColor() : "#4F46E5")
                .build();

        folderRepository.save(folder);

        logActivity(owner, Activity.ActivityType.FOLDER_CREATE,
                "Created folder: " + request.getName(), folder.getId(), request.getName());

        return FolderDTO.from(folder);
    }

    public FolderDTO renameFolder(Long folderId, String newName, User owner) {
        Folder folder = getFolderById(folderId, owner);
        String oldName = folder.getName();
        folder.setName(newName);
        folderRepository.save(folder);

        logActivity(owner, Activity.ActivityType.FOLDER_RENAME,
                "Renamed folder from '" + oldName + "' to '" + newName + "'",
                folder.getId(), newName);

        return FolderDTO.from(folder);
    }

    public FolderDTO moveFolder(Long folderId, Long targetParentId, User owner) {
        Folder folder = getFolderById(folderId, owner);

        // Prevent moving to own subfolder
        if (targetParentId != null && targetParentId.equals(folderId)) {
            throw new RuntimeException("Cannot move folder into itself");
        }

        Folder targetParent = null;
        if (targetParentId != null) {
            targetParent = folderRepository.findById(targetParentId)
                    .orElseThrow(() -> new RuntimeException("Target folder not found"));
        }

        folder.setParent(targetParent);
        folderRepository.save(folder);

        logActivity(owner, Activity.ActivityType.FOLDER_MOVE,
                "Moved folder: " + folder.getName(), folder.getId(), folder.getName());

        return FolderDTO.from(folder);
    }

    public FolderDTO toggleStarFolder(Long folderId, User owner) {
        Folder folder = getFolderById(folderId, owner);
        folder.setStarred(!folder.isStarred());
        folderRepository.save(folder);

        logActivity(owner, Activity.ActivityType.FOLDER_STAR,
                (folder.isStarred() ? "Starred" : "Unstarred") + " folder: " + folder.getName(),
                folder.getId(), folder.getName());

        return FolderDTO.from(folder);
    }

    public FolderDTO trashFolder(Long folderId, User owner) {
        Folder folder = getFolderById(folderId, owner);
        trashRecursive(folder);
        folderRepository.save(folder);

        logActivity(owner, Activity.ActivityType.FOLDER_DELETE,
                "Moved to trash: " + folder.getName(), folder.getId(), folder.getName());

        return FolderDTO.from(folder);
    }

    public FolderDTO restoreFolder(Long folderId, User owner) {
        Folder folder = getFolderById(folderId, owner);
        folder.setTrashed(false);
        folder.setTrashedAt(null);
        folderRepository.save(folder);

        logActivity(owner, Activity.ActivityType.FOLDER_RESTORE,
                "Restored folder: " + folder.getName(), folder.getId(), folder.getName());

        return FolderDTO.from(folder);
    }

    public void deleteFolder(Long folderId, User owner) {
        Folder folder = getFolderById(folderId, owner);
        folderRepository.delete(folder);
    }

    public FolderDTO updateFolderColor(Long folderId, String color, User owner) {
        Folder folder = getFolderById(folderId, owner);
        folder.setColor(color);
        folderRepository.save(folder);
        return FolderDTO.from(folder);
    }

    private void trashRecursive(Folder folder) {
        folder.setTrashed(true);
        folder.setTrashedAt(LocalDateTime.now());
        folder.getSubFolders().forEach(this::trashRecursive);
        folder.getFiles().forEach(file -> {
            file.setTrashed(true);
            file.setTrashedAt(LocalDateTime.now());
        });
    }

    private Folder getFolderById(Long folderId, User owner) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
        if (!folder.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Access denied");
        }
        return folder;
    }

    private void logActivity(User user, Activity.ActivityType type, String description,
                              Long folderId, String folderName) {
        Activity activity = Activity.builder()
                .user(user)
                .type(type)
                .description(description)
                .folderId(folderId)
                .folderName(folderName)
                .build();
        activityRepository.save(activity);
    }
}
