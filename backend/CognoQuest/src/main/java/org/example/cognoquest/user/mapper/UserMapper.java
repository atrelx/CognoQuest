package org.example.cognoquest.user.mapper;

import org.example.cognoquest.user.User;
import org.example.cognoquest.user.dto.AuthResponseDto;
import org.example.cognoquest.user.dto.UserDto;
import org.example.cognoquest.user.dto.UserRegistrationDto;
import org.example.cognoquest.user.dto.UserUpdateDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto toDto(User user);

    @Mapping(target = "token", ignore = true)
    @Mapping(target = "user", source = "user")
    AuthResponseDto toAuthResponseDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "profilePicture", ignore = true)
    @Mapping(target = "oauthProvider", ignore = true)
    @Mapping(target = "oauthId", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    User toEntity(UserRegistrationDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "profilePicture", ignore = true)
    @Mapping(target = "oauthProvider", ignore = true)
    @Mapping(target = "oauthId", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    void updateUserFromDto(UserUpdateDto dto, @MappingTarget User user);
}
