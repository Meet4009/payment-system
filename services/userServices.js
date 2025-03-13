exports.renderHome = (req, res) => {
    res.render('index', { title: 'home' });
}

exports.renderRegister = (req, res) => {
    res.render('register', { title: 'Register' });
}

exports.renderLogin = (req, res) => {
    res.render('login', { title: 'Login' });
}