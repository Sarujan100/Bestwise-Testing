const jwt = require("jsonwebtoken");
const User = require('../models/User');


// Token generator--summa
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


// Register - {base_url} /api/register
exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password, phone, address } = req.body;

  try {
    const olduser = await User.findOne({ email });

    if (olduser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email!'
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      role: 'user'
    });

    const token = generateToken(user);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        zipCode: user.zipCode
      }
    });

  } catch (err) {
    res.status(500).json({
      message: 'Registration Failed!',
      error: err.message
    });
  }
};



//  Login - {base_url} /api/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    //  Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
<<<<<<< HEAD
        phone: user.phone,
=======
>>>>>>> b72d6a6e57ab8402290872919715d1d3ec70ee5a
        zipCode: user.zipCode
      }
    });

  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
};



// Logout - {base_url} /api/logout
exports.logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0)
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};


// Get-User-Profile  -- {base_url}/api/myprofile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // remove password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};



// Change-Password  -- {base_url}/api/changePassword
exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(req.body.oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect"
      });
    }

    // Assign new password and save
    user.password = req.body.password;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message
    });
  }
};


// Update-User-Profile  -- {base_url}/api/updateprofile
exports.updateUserProfile = async (req, res) => {
  try {
    const { phone, address } = req.body;
    const user = await User.findById(req.user.id);

    if (user) {
      user.phone = phone || user.phone;
      user.address = address || user.address;

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          address: updatedUser.address,
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};
