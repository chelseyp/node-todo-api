const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require ('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo test';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then(todos => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(e => done(e));
            })
    });

    it('should not create todo with invalid body data', done => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then(todos => {
                    expect(todos.length).toBe(2);
                    //expect(todos).toEqual([]);
                    done();
                }).catch(e => done(e));
            })
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    })
});

describe ('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
  });

  it('should return a 404 if todo not found', done => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', done => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it ('should remove a todo', done => {
    var hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then(todo => {
          expect(todo).toBeNull();
          done();
        }).catch(e => done(e));
      });
  });

  it('should return 404 if todo not found', done => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', done => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done);
  });

});

describe('PATCH /todos/:id', () => {
  it('should update a todo', done => {
      var id = todos[0]._id;

      request(app)
      .patch(`/todos/${id}`)
      .send({
        text: 'First test update',
        completed: true
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        Todo.findById(id).then(todo => {
          expect(todo.text).not.toEqual(todos[0].text);
          expect(todo.completed).toBeTruthy();
          expect(typeof todo.completedAt).toBe('number');
          done();
        }).catch(e => done(e));
      });
  });

  it('should clear completedAt when todo is not completed', done => {
    var id = todos[1]._id;

    request(app)
      .patch(`/todos/${id}`)
      .send({
        text: 'Second test',
        completed: false
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        Todo.findById(id).then(todo => {
          expect(todo.text).not.toEqual(todos[1].text);
          expect(todo.completed).toBeFalsy();
          expect(todo.completedAt).toBeNull();
          done();
        }).catch(e => done(e));
      })
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', '')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {

  it('should create a user', done => {
    var email = 'example@example.com';
    var password = '123abc!';

    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then(user => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        })
      });
  });

  it ('should return validation errors if request invalid', done => {
    request(app)
      .post('/users')
      .send({email: '', password: ''})
      .expect(400)
      .end(done);
  });

  it ('should not create user if email in use', done => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: users[0].password
      })
      .expect(400)
      .end(done);
  });
})

describe ('POST /users/login', () => {
  it ('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body.email).toBe(users[1].email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then(user => {
          expect(user.tokens[0]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch(e => done(e));
      });
  });

  it ('should reject invalid login', done => {
    request(app)
      .post('/users/login')
      .send({
        email: 'test@test.com',
        password: '123456'
      })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then(user => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it ('should remove the tokens object', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then(user => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(e => done(e));
      });
  });

  it ('should return 401 if token is not found', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', '12345')
      .expect(401)
      .end(done);
  });
});