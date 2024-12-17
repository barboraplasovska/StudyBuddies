# StudyBuddies

**StudyBuddies** is a mobile application designed to connect students and enhance their study experience by facilitating collaboration, communication, and organization. Developed as a group project, StudyBuddies aims to address challenges like academic difficulties and social isolation that many students face during their studies.


## Features

- **User Profiles**: Create a personalized profile and list your classes to find compatible study partners.
- **Matchmaking**: Discover other students in your courses and connect with them for group study sessions.
- **Chat**: Communicate seamlessly with other students via the integrated chat feature.
- **Event Organization**: Plan and manage study events, group meetups, or collaborative sessions.
- **Exam Management**: Create and track exams to stay on top of your schedule.
- **Calendar Integration**: Visualize events and exams in a user-friendly calendar interface.

## Technologies Used

The application was built using:

- **Frontend**: Flutter and Dart for a responsive and modern UI.
- **Backend**: Node.js with TypeScript for scalable and modular APIs.
- **Real-Time Communication**: Socket.IO for chat and messaging functionality.
- **Databases**:
  - **MariaDB**: Manages relational data like user profiles and event schedules.
  - **MongoDB**: Handles chat messages data.
- **Monitoring**: Prometheus for metrics gathering and Grafana for visualization.
- **Deployment**: Microsoft Azure for hosting backend services and Docker for development purpose.

## Architecture

The StudyBuddies application follows a **client-server architecture**, with a modular and scalable design that includes the following components:

### **1. Frontend**
- **Framework**: Flutter (Dart)
- Handles all user interactions, such as profile creation, event management, and messaging.
- Communicates with the backend APIs via HTTP requests.

### **2. Backend APIs**
The backend is implemented using **Node.js** and **TypeScript** and is divided into two key services:
- **API Service**:
  - **Presentation Layer**: Handles HTTP requests from the frontend.
  - **Domain Layer**: Manages business logic (e.g., user authentication, event creation).
  - **Data Layer**: Connects with the database to store and retrieve data.
- **Chat Service**: Supports real-time messaging using **Socket.IO**.

### **3. Databases**
The backend uses a dual-database system:
- **MariaDB**: Manages relational data (e.g., user profiles, event schedules).
- **MongoDB**: Handles chat messages data.

### **4. Real-Time Communication**
- **Socket.IO** enables real-time messaging functionality between users:
  - `sendMessage`: Send a chat message.
  - `receiveMessage`: Receive chat messages instantly.

### **5. Monitoring**
- The system uses **Prometheus** to gather metrics and **Grafana** for data visualization.
- Exposed metrics (`/metrics`) help monitor API performance and reliability.

### **6. Deployment**
- The backend APIs are deployed on **Microsoft Azure** for scalability and availability.

## Team Contributions

| **Team Member** | **Role**                | **Responsibilities**                                |
|------------------|-------------------------|----------------------------------------------------|
| Paul             | Backend, Deployment    | Backend APIs, server-side logic, and deployment   |
| Emeric           | Backend, Deployment    | Database design, backend support, and deployment  |
| Barbora          | Frontend               | UI/UX design and implementation using Flutter     |
| Nathan           | Frontend               | Frontend implementation using Flutter    |

## Acknowledgments

We thank our professors and peers for their support and feedback throughout this project. A special thanks to EPITA for providing the resources to bring StudyBuddies to life.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
