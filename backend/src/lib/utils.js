import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction =
    process.env.NODE_ENV === "production" ||
    (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes("localhost"));

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: isProduction ? "none" : "lax", // "none" required for cross-site cookies between Vercel and Render
    secure: Boolean(isProduction), // secure must be true when sameSite is "none"
  });

  return token;
};
