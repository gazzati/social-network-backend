# Backend for [Gazzati Social network](https://github.com/gazzati/social-network)

## 🚀 How To Use

App published on [Heroku](https://gazzati-sc-backend.herokuapp.com/api)

```bash
# Run app 
ts-node-dev --files --respawn src/index.ts
```

## 🛠️ Development

- The mongoDB [Atlas cluster](https://cloud.mongodb.com/v2/5fa6c735a5a8404a1960f36a#metrics/replicaSet/5fddcde27c065e6dae3eabaf/explorer/social-network) was used to store data
- Upon authorization or registration, the user receives a token. When new requests come, they are verified with middlaware
- Endpoints are logically divided into routes (users, profile, auth, chats) and moved to different files
- User photos are uploaded to [cloud storage](https://cloudinary.com/)
     
## :technologist: Technologies used

- [NodeJs](https://nodejs.org/) 
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/) 
- [MongoDB](https://www.mongodb.com/) as data storage
- [JSON Web Token](https://www.npmjs.com/package/jsonwebtoken) and [bcrypt](https://www.npmjs.com/package/bcrypt) for authorization
- [Cloudinary](https://cloudinary.com/) for images save
