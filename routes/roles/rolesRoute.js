const express = require("express");
const router = express.Router();
const Role = require("../../models/Role");
//const { checkPermissions } = require('../middleware/auth');

// Get all roles
router.get("/", async (req, res) => {
  //   try {
  //     const roles = await Role.find();
  //     res.status(200).json(roles);
  //   } catch (err) {
  //     res.status(500).json({ message: err.message });
  //   }

  //   try {
  //     const roles = await Role.find().lean().populate({
  //       path: "userCount",
  //       select: "_id",
  //     });

  //     // Convert virtual to regular field
  //     const formattedRoles = roles.map((role) => ({
  //       ...role,
  //       users: role.userCount?.length || 0,
  //     }));

  //     res.json(formattedRoles);
  //   } catch (err) {
  //     res.status(500).json({ message: err.message });
  //   }

  try {
    const roles = await Role.aggregate([
      {
        $lookup: {
          from: "users", // collection name in MongoDB
          localField: "val",
          foreignField: "role",
          as: "users",
        },
      },
      {
        $addFields: {
          userCount: { $size: "$users" },
        },
      },
      {
        $project: {
          users: 0, // Remove the users array from output
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single role
// router.get('/:id', checkPermissions(['Role Management']), async (req, res) => {
//   try {
//     const role = await Role.findById(req.params.id);
//     if (!role) return res.status(404).json({ message: 'Role not found' });
//     res.json(role);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// Create new role
router.post("/", async (req, res) => {
  const role = new Role({
    name: req.body.name,
    description: req.body.description,
    permissions: req.body.permissions,
  });

  try {
    const newRole = await role.save();
    res.status(201).json(newRole);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// // Update role
router.put("/:id", async (req, res) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        permissions: req.body.permissions,
      },
      { new: true }
    );
    res.status(200).json(updatedRole);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// // Update role permissions
router.patch("/:id/permissions", async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    // Update permissions
    req.body.permissions.forEach((newPerm) => {
      const existingPerm = role.permissions.find(
        (p) => p.name === newPerm.name
      );
      if (existingPerm) {
        existingPerm.granted = newPerm.granted;
      } else {
        role.permissions.push(newPerm);
      }
    });

    const updatedRole = await role.save();
    res.json(updatedRole);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// // Delete role
// router.delete('/:id', checkPermissions(['Role Management']), async (req, res) => {
//   try {
//     await Role.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Role deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;
