import bcrypt from "bcryptjs";

const hash = "$2a$10$0mq6b7ttniUb1cbXNXBlROHgG/CP5wIW9aNkiKyfdqOsllTBNUmkW";

bcrypt.compare("1234", hash).then(result => {
  console.log("Does 1234 match?", result);
});