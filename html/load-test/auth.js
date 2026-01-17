module.exports = {
  loginFree: (requestParams, context, events, done) => {
    fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'free@example.com',
        password: 'password123'
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.accessToken) {
        context.vars.token = data.accessToken;
      } else {
        console.error('Login failed:', data);
      }
      done();
    })
    .catch(error => {
      console.error('Login error:', error);
      done();
    });
  },

  loginPaid: (requestParams, context, events, done) => {
    fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'paid@example.com',
        password: 'password123'
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.accessToken) {
        context.vars.token = data.accessToken;
      } else {
        console.error('Login failed:', data);
      }
      done();
    })
    .catch(error => {
      console.error('Login error:', error);
      done();
    });
  }
};