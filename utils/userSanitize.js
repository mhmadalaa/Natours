module.exports = (body) => {
  return {
    _id: body.id,
    name: body.name,
    email: body.email,
    password: body.password,
    passwordConfirm: body.passwordConfirm,
  };
};
