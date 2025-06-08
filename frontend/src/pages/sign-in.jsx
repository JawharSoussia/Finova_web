import React, { useState } from "react";
import axios from "axios";
import { Input, Checkbox, Button, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      toast.error("Email is required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format.");
      return false;
    }
    if (!password.trim()) {
      toast.error("Password is required.");
      return false;
    }
    return true;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // Store auth token and user role
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", user.role);

      toast.success("Sign In successful! Redirecting...");

      // Redirect based on user role
      if (user.role === "admin") {
        navigate("/Admindashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Authentication failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left: Form */}
      <div className="flex flex-1 flex-col justify-center items-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="text-center">
            <Typography variant="h2" className="font-bold mb-4">Welcome Back!</Typography>
            <Typography color="gray" className="font-normal">
              Enter your email and password to sign in
            </Typography>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-4">
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Checkbox label="Remember me" />
              <Typography
                as={Link}
                to="/forgot-password"
                variant="small"
                color="blue"
                className="ml-auto font-normal"
              >
                Forgot password?
              </Typography>
            </div>
            <Button type="submit" className="w-full" fullWidth>
              Sign In
            </Button>
            <Typography color="gray" className="mt-4 text-center font-normal">
              Don't have an account?{" "}
              <Link to="/sign-up" className="font-medium text-blue-500">
                Sign Up
              </Link>
            </Typography>
          </form>
        </div>
      </div>
      {/* Right: Image (hidden on mobile) */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
        <div className=" w-full">
          <img
            src="/img/signin.jpg" // Use your image here
            alt="App Preview"
            className="h-full w-full "
          />
        </div>
      </div>
    </div>
  );
}

export default SignIn;