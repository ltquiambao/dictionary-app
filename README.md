# dictionary-app

TODO:

1. Create express app (server)
2. Add a db folder

- Add mongodb uri to env file
- create connect file to connect to mongodb via mongoose
- connect before listening to app

3. create a mongoose model for users

- model:
  ```
  User {
    username
    email
    password
  }
  ```

4. Add register and login endpoint

- /register
  - create a new user using mongoose User model
  - encrpyt password (optional)
  - save to db
  - return a token to browser
- /login
  - findOne user in db
  - check if password is the same
  - return a token to client

5. Add api/v1 endpoint

- add verifyToken middleware
- /dictionary
  - check if existing in memory
  - call dictionary api endpoint
  - format response:
    ```
    {
      uuid,
      id: "heart",
      def: [
        "{bc}a structure in an {d_link|invertebrate|invertebrate} animal functionally analogous to the vertebrate heart",
        "aasdasd"
      ]
      art: [
        {
          artid: "heart"
          capt: "heart 1a: {it}1{\/it} aorta, {it}2{\/it} pulmonary artery,
    {it}3{\/it} left atrium, {it}4{\/it} left ventricle, {it}5{\/it} right ventricle,
    {it}6{\/it} right atrium"
          arturl: https://www.merriam-webster.com/assets/mw/static/art/dict/[base filename].gif
        }
      ]
    }
    ```
  - save to memory
  - return response to client

1. Create express app (front-end)
