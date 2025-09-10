export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expireIn: process.env.JWT_expireIn
  },
  
});
