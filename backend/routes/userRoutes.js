const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/sync', async (req, res) => {
  const { email, name, studentId, photo, uid, isAdmin } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { 
        name, 
        studentId, 
        photo, 
        firebaseUid: uid, 
        role: isAdmin ? 'admin' : 'student' 
      },
      { upsert: true, new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error syncing user data" });
  }
});

module.exports = router;