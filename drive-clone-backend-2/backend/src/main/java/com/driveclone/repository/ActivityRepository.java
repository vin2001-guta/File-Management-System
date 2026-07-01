package com.driveclone.repository;

import com.driveclone.model.Activity;
import com.driveclone.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
