[Korean](./documents/korean.md)

<div align="center">

# Project Odin

This project is still in the development stage!

<b>Many things still need to be implemented, and many things will change.<b/>

</div>

# Project Info

Project Odin is an open-source game distribution platform developed for indie games.

It is designed to effectively support indie game developers with low fees and developer subscriptions.

Features for gamers, such as Discord integration and DRM-Free, will also be available.

# Project Stack

- Nest.js
- Aws-SDK
- TypeORM
- Postgres

# Running on your machine

## Requirements

- Node.js ^21.6 (Recommend)
- pnpm

## Installation

1. Clone the project

```cmd
$ git clone https://github.com/odin-store/native.git
```

2. Install packages via pnpm

```cmd
$ pnpm i
```

3. Rename .env.sample to .env.development.

All values in .env.sample are example values. Please modify them according to your environment.

```env
#JWT
JWT_SECRET=
JWT_ACCESS_EXPIRES_IN=20000
JWT_REFRESH_EXPIRATION_TIME=2592000000
JWT_REFRESH_SECRET=

#Database
DATABASE_URL=
DATABASE_PASSWORD=
DATABASE_NAME=
DATABASE_USER=

#MAIL
MAIL_USER=
MAIL_PASS=

#AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_CLOUD_BUCKET=
AWS_REGION=

#Portone
PORTONE_API_SECRET=
```

> You can get your portone api info from [here](https://portone.io/)

## Start your own client

Enter the command below to start your client.

```cmd
$ pnpm start
```
