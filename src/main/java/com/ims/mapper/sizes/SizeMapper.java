package com.ims.mapper.sizes;


import com.ims.dtos.sizes.SizeRequest;
import com.ims.dtos.sizes.SizeResponse;
import com.ims.entity.SizeEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.*;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = AuditMapper.class
)
public interface SizeMapper {


    @Mapping(target = "id", ignore = true)
    SizeEntity toEntity(
            SizeRequest request
    );


    @Mapping(target = "audit", source = ".")
    SizeResponse toResponse(
            SizeEntity entity
    );


    List<SizeResponse> toResponseList(
            List<SizeEntity> entities
    );


    @BeanMapping(
            nullValuePropertyMappingStrategy =
                    NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(
            SizeRequest request,
            @MappingTarget SizeEntity entity
    );

}