# CognoQuest

CognoQuest is a full-stack web application for creating, managing, and completing quizzes.

## 🎥 Project Overview (Demo Video)

Check out the demo video showcasing the core features:
- **Login via Google OAuth2**: Secure user authentication.
- **Create a Quiz**: Add a new quiz with questions and options.
- **Complete a Quiz**: Take a quiz and view results.

https://github.com/user-attachments/assets/c18d527f-d45a-4b2c-a460-ccf397a66f86

## 🛠️ Tech Stack

### Backend
- **Spring Boot**: Core framework for REST API development.
- **Spring Security**: Implements JWT-based authentication and Google OAuth2.
- **PostgreSQL**: Relational database for storing quizzes and user data.
- **Firebase Storage**: Stores user avatars.

### Frontend
- **React**: Frontend library for building the UI.
- **Zustand**: Lightweight global state management.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Toastify**: For displaying notifications and alerts.
- **Axios**: For API requests to the backend.
- **React Router**: For client-side routing.

### Deployment
- **Docker**: Backend and frontend are containerized for easy setup.
- **GitHub Actions**: CI/CD pipeline for linting and building Docker images.

## 🚀 Getting Started

Follow these steps to set up and run CognoQuest locally using Docker.

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/cognoquest.git
   cd cognoquest
   ```

2. **Obtain Google OAuth2 Credentials**

    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Create a new project (or select an existing one):
        - Click on the project dropdown at the top and select **New Project**.
        - Give it a name (e.g., `CognoQuest`) and click **Create**.
    - Enable the necessary APIs:
        - Navigate to **APIs & Services** > **Library**.
        - Search for "Google+ API" and enable it (required for OAuth2 scopes like `email` and `profile`).
    - Set up OAuth2 credentials:
        - Go to **APIs & Services** > **Credentials**.
        - Click **Create Credentials** > **OAuth 2.0 Client IDs**.
        - Select **Web application** as the application type.
        - Set the **Authorized redirect URIs** to `http://localhost:8080/login/oauth2/code/google`.
        - Click **Create**.
    - Copy the **Client ID** and **Client Secret** for use in the `.env` file.

3. **Set Up Firebase Project and Storage Bucket**

    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Create a new project:
        - Click **Add project**, name it (e.g., `CognoQuest`), and follow the setup steps.
    - Set up Firebase Storage:
        - In the Firebase Console, go to **Build** > **Storage**.
        - Click **Get Started**, then follow the prompts to create a storage bucket.
        - Choose a location (e.g., `us-central`) and set the rules (default rules are fine for development).
        - After creation, note the bucket name (e.g., `cognoquest-123.appspot.com`) for use in the `.env` file.
    - Generate a Firebase Service Account Key:
        - Go to **Project Settings** > **Service Accounts**.
        - Click **Generate new private key**, then download the JSON file.
        - Rename it to `firebase-service-account.json` and place it in:
          ```
          backend/CognoQuest/src/main/resources/firebase-service-account.json
          ```

4. **Set Up Environment Variables**

    - **Global `.env` File**:
      Copy the example file and fill in the required values:
      ```bash
      cp .env.example .env
      ```
      Edit `.env` with your credentials.
   

5. **Run the Application with Docker**

    - Build and start the containers:
      ```bash
      docker-compose up --build
      ```
    - The app will be available at:
        - Frontend: `http://localhost`
        - Backend: `http://localhost:8080`

6. **Access the App**
    - Open `http://localhost` in your browser.
    - Log in using Google OAuth2, create a quiz, and try completing it!

## 📋 Project Structure

- **`backend/CognoQuest`**: Spring Boot backend with REST API, OAuth2, and Firebase integration.
- **`frontend`**: React frontend with Zustand for state management.
- **`.github/workflows/ci.yml`**: GitHub Actions pipeline for linting and building Docker images.
