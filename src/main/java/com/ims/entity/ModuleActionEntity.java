package com.ims.entity;

import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Table(name = "module_actions")
public class ModuleActionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private ModuleEntity module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id")
    private ActionEntity action;

    @Column(name = "module_name", nullable = false)
    private String moduleName;

    @Column(name="action_name", nullable = false)
    private String actionName;

}
