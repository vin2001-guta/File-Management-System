package com.driveclone.repository;

import com.driveclone.model.FileShare;
import com.driveclone.model.FileItem;
import com.driveclone.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileShareRepository extends JpaRepository<FileShare, Long> {
    List<FileShare> findByFile(FileItem file);
    List<FileShare> findBySharedWith(User user);
    Optional<FileShare> findByFileAndSharedWith(FileItem file, User user);
    void deleteByFileAndSharedWith(FileItem file, User user);
}
