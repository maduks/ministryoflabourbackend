const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  granted: { type: Boolean, default: false },
  //name: String, // e.g., 'view_health_listings', 'edit_finance_listings', 'manage_users', 'create_roles'
  description: String, // e.g., 'Ability to view health-related listings'
  category: String, // e.g., 'health', 'finance', 'user_management', 'role_management'
  action: String, // e.g., 'view', 'edit', 'create', 'delete', 'manage'
  resource: String, // e.g., 'listings', 'users', 'roles', 'reports' (can be combined with category for clarity)
  createdAt: Date,
  updatedAt: Date,
});
// Super Admin: super@gov.com / admin123

// Ministry Admin: ministry@gov.com / ministry123

// Agent: agent@gov.com / agent123

// Public: public@example.com / public123
const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    users: { type: Number, default: 0 },
    permissions: [permissionSchema],
    val: String,
  },
  { timestamps: true }
);
// Add virtual for user count
roleSchema.virtual("userCount", {
  ref: "Users",
  localField: "_id",
  foreignField: "role",
  count: true,
});
module.exports = mongoose.model("Role", roleSchema);
