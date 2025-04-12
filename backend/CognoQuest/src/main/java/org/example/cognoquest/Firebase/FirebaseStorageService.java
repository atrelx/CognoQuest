package org.example.cognoquest.Firebase;

import com.google.cloud.storage.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


// Currently using public access for Firebase Storage
@Service
public class FirebaseStorageService {

    @Value("${firebase.storage.bucket}")
    private String storageBucket;

    public String uploadFile(MultipartFile file, String fileName) throws IOException {
        Storage storage = StorageClient.getInstance(FirebaseApp.getInstance()).bucket(storageBucket).getStorage();

        BlobId blobId = BlobId.of(storageBucket, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        Blob blob = storage.create(blobInfo, file.getBytes());

        return String.format("https://storage.googleapis.com/%s/%s", storageBucket, fileName);
    }


    public void deleteFile(String fileName) throws StorageException {
        try {
            Storage storage = StorageOptions.getDefaultInstance().getService();
            BlobId blobId = BlobId.of(storageBucket, fileName);
            if (storage.get(blobId) != null) {
                storage.delete(blobId);
                System.out.println("Successfully deleted file: " + fileName);
            } else {
                System.out.println("File not found, cannot delete: " + fileName);
            }
        } catch (StorageException e) {
            System.err.println("Error deleting file " + fileName + ": " + e.getMessage());
             throw e;
        }
    }
}
