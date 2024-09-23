FROM node:20
WORKDIR /home/node
USER "${USER}"

ENV USER=node
ENV PORT=3000
ENV TZ=America/Sao_Paulo
ENV ENVIRONMENT=development
ENV PROJECT_ID=fiap-tech-challenge-5soat
ENV PROJECT_NUMBER=91827266597
ENV LOCATION=southamerica-east1
ENV TENANT=hackathon
ENV GITHUB_SHA=1233412asd
ENV GITHUB_RUN_ID=98736sa
ENV FIREBASE_API_KEY=AIzaSyChdMH2Wb3fGCQe9sWuXfgOd9C5ScEEPZk
ENV MONGODB_URL=mongodb+srv://fiaptcgrupo22:S2UHqqXKul2C1szS@fiap-tech-challenge-5so.rlozp.mongodb.net/?retryWrites=true&w=majority&appName=fiap-tech-challenge-5soat
ENV PATH="/home/node/.npm-global/bin:${PATH}"
ENV NPM_CONFIG_PREFIX="/home/node/.npm-global"
ENV SENDGRID_API_KEY=
ENV SENDGRID_TO_EMAIL=daniel.clemente@sortfy.com.br
ENV TZ=America/Sao_Paulo

RUN mkdir -p "${NPM_CONFIG_PREFIX}/lib"

COPY src ./src
COPY *.json ./
COPY pnpm-lock.yaml .
COPY .npmrc .
COPY .eslintrc.js .

RUN npm install -g --quiet --no-progress pnpm @nestjs/cli
RUN npm cache clean --force
RUN pnpm install

EXPOSE 3000

CMD [ "pnpm", "start"]