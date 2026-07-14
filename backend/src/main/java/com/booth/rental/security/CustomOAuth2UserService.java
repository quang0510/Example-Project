package com.booth.rental.security;

import com.booth.rental.domain.AuthProvider;
import com.booth.rental.domain.User;
import com.booth.rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());
        return processOAuth2User(provider, oAuth2User.getAttributes());
    }

    private OAuth2User processOAuth2User(AuthProvider provider, Map<String, Object> attributes) {
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String id = null;
        String avatarUrl = null;

        if (provider == AuthProvider.GOOGLE) {
            id = (String) attributes.get("sub");
            avatarUrl = (String) attributes.get("picture");
        } else if (provider == AuthProvider.FACEBOOK) {
            id = (String) attributes.get("id");
            // Facebook avatar might be nested, simplified here
            if (attributes.containsKey("picture")) {
                Object pictureObj = attributes.get("picture");
                if (pictureObj instanceof Map) {
                    Map<?, ?> pictureMap = (Map<?, ?>) pictureObj;
                    if (pictureMap.containsKey("data")) {
                        Map<?, ?> dataMap = (Map<?, ?>) pictureMap.get("data");
                        if (dataMap.containsKey("url")) {
                            avatarUrl = (String) dataMap.get("url");
                        }
                    }
                }
            }
        }

        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (user.getProvider() != provider) {
                // Link account if provider is different? Or just update it?
                // The plan said we will link the account (update provider/providerId if not set, or just allow login).
                if (user.getProvider() == AuthProvider.LOCAL) {
                    user.setProvider(provider);
                    user.setProviderId(id);
                }
            }
            // Update info
            user.setFullName(name);
            if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
        } else {
            user = User.builder()
                    .email(email)
                    .username(email)
                    .fullName(name)
                    .avatarUrl(avatarUrl)
                    .provider(provider)
                    .providerId(id)
                    .role(User.Role.CUSTOMER) // Default role
                    .active(true)
                    .build();
        }

        user = userRepository.save(user);
        user.setAttributes(attributes);
        return user;
    }
}
