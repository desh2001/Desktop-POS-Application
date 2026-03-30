import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Default MongoDB URI used in the application
const uri = 'mongodb://127.0.0.1:27017/posdb';

// Minimal definition of the User schema for the purpose of seeding
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Worker'], default: 'Worker' }
});

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);

    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';

    // Check if user already exists
    const existingAdmin = await User.findOne({ username });
    if (existingAdmin) {
      console.log(`\n❌ User '${username}' already exists in the database.`);
      process.exit(0);
    }

    // Hash the password and save
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({ username, password: hashedPassword, role: 'Admin' });
    
    await newAdmin.save();
    console.log(`\n✅ Successfully created an Admin user!`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

seedAdmin();
