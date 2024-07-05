// test/login.test.js
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); // Assuming your server file is named server.js

chai.use(chaiHttp);

describe('Login', () => {
    it('should login successfully with valid credentials', (done) => {
        chai.request(server)
            .post('/login')
            .send({ name: 'testuser', password: 'password123' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.redirect;
                expect(res.redirects[0]).to.include('Dash.html');
                done();
            });
    });

    it('should not login with invalid credentials', (done) => {
        chai.request(server)
            .post('/login')
            .send({ name: 'invaliduser', password: 'wrongpassword' })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.text).to.equal('Invalid credentials');
                done();
            });
    });

    it('should return an error if the username is missing', (done) => {
        chai.request(server)
            .post('/login')
            .send({ password: 'password123' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.text).to.equal('Username is required');
                done();
            });
    });

    it('should return an error if the password is missing', (done) => {
        chai.request(server)
            .post('/login')
            .send({ name: 'testuser' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.text).to.equal('Password is required');
                done();
            });
    });
});
