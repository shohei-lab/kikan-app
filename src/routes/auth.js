const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const validUsername = username === process.env.ADMIN_USERNAME;
  const validPassword =
    validUsername && (await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH));

  if (!validPassword) {
    return res.render('login', { error: 'ユーザー名またはパスワードが違います' });
  }

  req.session.isAuthenticated = true;
  req.session.username = username;
  res.redirect('/');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
