import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";

dotenv.config();

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : "";
}

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is missing in environment variables.");
    process.exit(1);
  }

  const name = getArg("name") || process.env.SEED_SUPERADMIN_NAME || "Super Admin";
  const email = getArg("email") || process.env.SEED_SUPERADMIN_EMAIL;
  const password = getArg("password") || process.env.SEED_SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Email or password missing.");
    console.error("Provide with args: --email=... --password=... [--name=...]");
    console.error("Or set env: SEED_SUPERADMIN_EMAIL and SEED_SUPERADMIN_PASSWORD");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);

    const existing = await User.findOne({ email });
    if (existing) {
      existing.name = name || existing.name;
      existing.role = "superadmin";
      existing.activeRole = "superadmin";
      existing.roles = Array.from(new Set([...(existing.roles || []), "superadmin", "admin"]));

      const hashedPassword = await bcrypt.hash(password, 10);
      existing.password = hashedPassword;

      await existing.save();
      console.log("Existing user upgraded to superadmin.");
      console.log(`Email: ${existing.email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "superadmin",
      activeRole: "superadmin",
      roles: ["superadmin", "admin"],
    });

    console.log("Superadmin created successfully.");
    console.log(`Email: ${user.email}`);
  } catch (error) {
    console.error("Failed to seed superadmin:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();
