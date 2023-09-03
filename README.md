# Cloud-Backup-System

I designed and developed a Cloud Backup System using Node.js, Express, and TypeScript. Implemented secure user registration and authentication functionalities,
enhancing system integrity.

I used Redis for efficient session management, ensuring seamless user experience and data persistence in this project. And used PostgreSQL
to establish a structured data storage system, enabling organized data retrieval and management.

I used Dropbox API as an alternative to S3 for main file storage, optimizing file handling and accessibility. Empowered users to upload, download, and 
categorize files, enhancing usability and customization.

I used Docker and Docker Compose to configure three containers (Redis, PostgreSQL, and API), guaranteeing cross-device compatibility and easy deployment. I made sure of 
high code quality through comprehensive testing using Jest, maintaining system reliability and performance.

## Endpoints
  
- `/signup`:- Use this endpoint to register users by sending a `POST` request, with an `application/json` content-type header.
  And the data in the following json format in the body.
  ```
  {
    "email": "email@email.mail",
    "firstname": "Jhon",
    "lastname": "Doe",
    "password": "12345678-Don'tTryThisAtHome"
  }
  ```
  
- `/login`:- Use this endpoint to log users in by sending a `POST` request, with an `application/json` content-type header. And the
  data in the following json format in the body.
  ```
  {
    "email": "email@email.mail",
    "password": "12345678-Don'tTryThisAtHome"
  }
  ```
  
- `/upload`:- Use this endpoint to upload user's data. Send a `POST` request, with an `multipart/form-data` content-type header. It takes
  2 parameters a data parameter which is the file to be uploaded and an optional path parameter, for the path to folder to put the file if not
  the user's root folder. P.S: The folder should already exist. 
  
- `/newfolder`:- Use this endpoint to create new folders for the user, send a `POST` request with a content-type header of `application/json`
  and in the body a file path relative to the user's root folder. Eg
  ```
  {
    "path": "newfolder"
  }
  ```
  or
  ```
  {
    "path": "existingfolder/newfolder"
  }
  ```
  
- `/download`:- Use this endpoint to download content from your file by `GET` request, has 2 parameters the file, which is the name of the file
  and the folder which is the path to the folder where the file is. Example
  ```
  {
    "file":- "examplefile.png",
    "folder": "path/to/thefolder",
  }
  ```

  ## How to run on your localmachine

  1. Make sure you have Docker installed, preferablly through the desktop app
  2. Ensure the docker engine is running
  3. run `docker-compose build` on your terminal
  4. then `docker-compose up`
  5. you should be all set up and ready to access the endpoint through localhost:3000
