const bcrypt = require("bcryptjs");

const testPasswordHashing = async () => {
  const plainTextPassword = "Toutou22@";

  // Hash the password
  const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
  console.log("Hashed password:", hashedPassword);

  // Compare the password
  const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
  console.log("Password comparison result:", isMatch);
};

testPasswordHashing();
