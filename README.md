# dictionary-app

### Screenshots
![screenshot_1](https://user-images.githubusercontent.com/46307552/163845392-5f2e96c4-3943-47f9-b5a9-6ee76a37b104.png)


### Quick start

1. clone this repository in your local machine `git clone `
2. go in the cloned repository `cd dictionary-app`
3. install dependencies `npm install`
4. add an environment file `.env`

- add 3 variables:
  - MONGO_URI (your own MongoDB connection uri)
  - JWT_ACCESS_TOKEN_SECRET
  - DICT_API_KEY (your own API key from [Dictionary API](https://dictionaryapi.com))

5. run the application `npm start`
6. check your [localhost](http://localhost:3000)

### Technologies

- Front-end
  - HTML
  - CSS
    - Bootstrap 5
  - JavaScript
    - JQuery
- Back-end
  - Node.js
    - Express (Web app framework)
    - Pug (Templating engine)
    - Mongoose (Object modeling)
    - JWT (Authentication)
- Database
  - MongoDB
- External API
  - [Dictionary API](https://dictionaryapi.com)

### Features

- Search meaning of words/phrases as a registered/logged in user
- Register as a new user
- Login as an existing user

### Backlog Features

- Allow user log out
- Encrpyt password before saving to database
- Add refresh tokens
