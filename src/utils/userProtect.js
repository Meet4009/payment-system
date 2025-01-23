const bcrypt = require('bcryptjs');

// Hash the password before saving the user
exports.doHash = async (password) => {
    const result = await bcrypt.hash(password, 12);
    return result;
}

// Compare the password during signin
exports.comparePassword = async (password, hashedPassword) => {


    const result = await bcrypt.compare(password, hashedPassword);
    return result;
}

