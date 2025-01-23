const bcrypt = require('bcryptjs');

// Hash the password before saving the user
exports.doHash = async (password) => {
    // const salt = await bcrypt.genSalt(10);
    const result = await bcrypt.hash(password, 12);
    console.log(result);
    return result;
}

// Compare the password during signin
exports.comparePassword = async (password, hashedPassword) => {
    console.log(password, hashedPassword);

    const result = await bcrypt.compare(password, hashedPassword);
    console.log(result);
    return result;
}

