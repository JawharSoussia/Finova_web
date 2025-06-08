import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Input, Button, Typography } from "@material-tailwind/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get("email");
    if (email) {
      setFormData((prev) => ({ ...prev, email }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error("First name is required.");
      return false;
    }
    if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
      toast.error("First name must contain only alphabets.");
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error("Last name is required.");
      return false;
    }
    if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
      toast.error("Last name must contain only alphabets.");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format.");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required.");
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      toast.error(
        "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters."
      );
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      });
      toast.success("Registration successful! Redirecting to Sign In...");
      navigate("/sign-in");
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Register</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Enter your details to create an account.
          </Typography>
        </div>
        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleRegister}>
          <Input
            size="lg"
            placeholder="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="mb-4"
          />
          <Input
            size="lg"
            placeholder="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="mb-4"
          />
          <Input
            size="lg"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!!formData.email}
            className="mb-4"
          />
          <Input
            size="lg"
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mb-4"
          />
          <Input
            size="lg"
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mb-4"
          />
          <Button className="mt-6" fullWidth type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Already have an account?
            <a href="/sign-in" className="text-gray-900 ml-1">Sign In</a>
          </Typography>
        </form>
      </div>
      <div className="w1/5 h-full hidden lg:block">
        <img src="/img/pattern1.png" className="h-full rounded-3xl shadow-3xl" />
      </div>
    </section>
  );
}

export default Register;
