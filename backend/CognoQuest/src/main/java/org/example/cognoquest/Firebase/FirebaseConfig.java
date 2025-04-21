package org.example.cognoquest.Firebase;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.storage.bucket}")
    private String storageBucket;

    @Value("${firebase.service.account.key.path}")
    private String serviceAccountKeyPath;

    @PostConstruct
    public void init() throws IOException {
        InputStream serviceAccount;

        // for local development check if the path starts with classpath:
        if (serviceAccountKeyPath.startsWith("classpath:")) {
            String resourcePath = serviceAccountKeyPath.replace("classpath:", "");
            serviceAccount = new ClassPathResource(resourcePath).getInputStream();
        } else {
            serviceAccount = new FileInputStream(serviceAccountKeyPath);
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setStorageBucket(storageBucket)
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }
}
