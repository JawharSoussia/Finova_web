import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Typography } from "@material-tailwind/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export function SignUp() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const validateEmail = (email) => {
    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      // Simulate sending a 2FA code (replace with actual API call if needed)
      await axios.post("http://localhost:5000/api/auth/send-2fa", { email });
      toast.success("Verification code sent! Redirecting to verification page...");
      navigate(`/verify-2fa?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Error sending 2FA code:", error);
      toast.error("Failed to send verification code. Please try again.");
    }
  };

  return (
    <section className="m-8 flex gap-4">
      {/* Left Section */}
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Join Finova Today</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Enter your email to register.
          </Typography>
        </div>
        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSignUp}>
          <div className="mb-4">
            <Input
              size="lg"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button className="mt-6" fullWidth type="submit">
            Register Now
          </Button>
          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Already have an account?
            <a href="/sign-in" className="text-gray-900 ml-1">Sign In</a>
          </Typography>
        </form>
      </div>

      {/* Right Section */}
      <div className="w-2/3 h-full hidden lg:block">
        <img
          src="/img/signup.jpg"
          className="h-full rounded-3xl shadow-3xl"
        />
      </div>
    </section>
  );
}

export default SignUp;