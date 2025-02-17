const checkAuth = (context) => {
  if (!context.user) {
    throw new Error("Unauthorized! You must be logged in.");
  }
  return context.user;
};

const checkAdmin = (context) => {
  const user = checkAuth(context);
  if (user.role !== "ADMIN") {
    throw new Error("Access Denied! Admins only");
  }
  return user;
};
module.exports = { checkAuth, checkAdmin };
