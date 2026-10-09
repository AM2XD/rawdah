# Database Setup & Operations Guide: Rawdah Cemetery Registry

This guide provides instructions for configuring and connecting Google Firebase (Firestore Database + Firebase Authentication) to the Rawdah Graveyard Registry.

---

## 1. Firebase Project Overview

The application is pre-configured with the following project identifier:
- **Project ID**: `rawdah-5b0b0`
- **Auth Domain**: `rawdah-5b0b0.firebaseapp.com`
- **Storage Bucket**: `rawdah-5b0b0.firebasestorage.app`
- **Sender ID**: `777017327604`
- **App ID**: `1:777017327604:web:6b0967e64a1003f50603a1`

---

## 2. Setting Up Cloud Firestore in Firebase Console

1. Navigate to the [Firebase Console](https://console.firebase.google.com/project/rawdah-5b0b0).
2. In the left navigation, select **Firestore Database** (under the **Build** menu).
3. Click **Create database**.
4. Configure the database settings:
   - **Database ID**: `(default)`
   - **Location**: Select a region close to your cemetery grounds (e.g., `europe-west2` or `us-central1`).
   - **Security rules**: Select **Start in production mode** (rules will be applied in the next step).
5. Click **Create** and wait for Firestore to initialize.

---

## 3. Applying Database Security Rules

1. In your Firestore Database console, select the **Rules** tab at the top.
2. Replace all existing text in the editor with this exact snippet:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Cemetery Plots Collection Rules
    match /plots/{plotId} {
      // 1. PUBLIC READ: Anyone can search and view graveyard plot occupancy
      allow read: if true;

      // 2. ADMIN WRITE: Only authenticated staff can record new burials or edit records
      allow create, update: if request.auth != null;

      // 3. HARD PROTECTION: Only authenticated staff can vacate or delete plot documents
      allow delete: if request.auth != null;
    }
  }
}
```

3. Click **Publish** to deploy the rules.

---

## 4. Enabling Firebase Authentication

To allow cemetery administrators to record burials and edit occupied plots:

1. In the left navigation of Firebase Console, select **Authentication** (under **Build**).
2. Click **Get Started** (if not already enabled).
3. Select the **Sign-in method** tab.
4. Select **Email/Password** from the Native providers list:
   - Toggle **Enable** to ON.
   - Leave "Email link (passwordless sign-in)" disabled.
   - Click **Save**.
5. Switch to the **Users** tab:
   - Click **Add user**.
   - Enter your administrator email (e.g., `admin@rawdah-cemetery.org`) and a secure password.
   - Click **Add user**.

### Authorized Domains (For Web Hosting / Previews)
If accessing from a custom domain or preview URL:
1. In Firebase Authentication, open the **Settings** tab &rarr; **Authorized domains**.
2. Add your deployment or custom domain to the list.

---

## 5. Publishing Plots to the Database

Once Firestore is created and security rules are published:

1. Open the application in your browser.
2. In the top navigation bar, click the gold **Admin** button.
3. Sign in using your registered cemetery staff email/password (or create one using "Need an admin account? Register").
   *(Note: The "Local Sandbox Preview" option operates strictly in local memory and cannot push to the live database).*
4. Click the **Publish to Database** button located in the top navigation bar (or inside the Admin dialog).
5. The application will execute an atomic batch write uploading all 200 plot documents (`plot-1` through `plot-200`) directly to your Firestore database collection `plots`.
6. You will see a success confirmation:
   `Successfully published all 200 plots to the database!`

### Continuous Automatic Real-Time Synchronization
- Once the initial publish is performed and rules are active, **all subsequent changes sync automatically in real-time**:
  - Whenever an administrator allocates a vacant plot or updates an existing record, the app automatically executes `setDoc(doc(db, 'plots', 'plot-X'), ...)` to Firestore.
  - The application listens to live Firestore changes via `onSnapshot`, so multiple devices or tabs stay perfectly in sync in real-time.
  - If network connectivity is lost, the application seamlessly preserves edits in local cache and resynchronizes.

---

## 6. Document Structure Reference

Each document in the `plots` collection uses the document ID format `plot-{number}`:

```json
{
  "id": "plot-1",
  "plotNumber": 1,
  "status": "occupied",
  "fullName": "Hassan bin Abdullah Al-Fahim",
  "passportId": "A84920194",
  "burialDate": "2021-04-12",
  "notes": "Demonstration record on file.",
  "updatedAt": "2021-04-12T10:00:00.000Z",
  "updatedBy": "Cemetery Administration"
}
```

Vacant plots use this document structure:

```json
{
  "id": "plot-2",
  "plotNumber": 2,
  "status": "vacant",
  "fullName": null,
  "passportId": null,
  "burialDate": null,
  "notes": null,
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "updatedBy": null
}
```

---

## 7. Troubleshooting & Verification

- **"Missing or insufficient permissions"**: This indicates the Firestore Security Rules have not been published in the Firebase Console. Review Section 3 and click **Publish**.
- **Admin Login Fails with "Invalid Credential"**: Verify that the Email/Password provider is enabled in Firebase Authentication and that the user account was created in the Users tab.
- **Offline / Local Fallback**: When disconnected or prior to publishing rules, the application continues to function in local storage mode without blocking user interactions.
