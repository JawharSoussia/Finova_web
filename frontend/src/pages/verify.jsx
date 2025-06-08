import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";
import { toast } from "react-toastify";
import axios from "axios";

export function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = new URLSearchParams(location.search).get("email");

  useEffect(() => {
    if (!email) {
      toast.error("No email provided. Redirecting to sign-up...");
      navigate("/sign-up");
    }
  }, [email, navigate]);

  const handleSendVerification = async () => {
    try {
      await axios.post("http://localhost:5000/api/send-verification", { email });
      toast.success("Verification email sent successfully!");
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.error("Failed to send verification email. Please try again.");
    }
  };

  return (
    <section className="m-8 flex flex-col items-center">
      <Typography variant="h2" className="font-bold mb-4">Verify Your Email</Typography>
      <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal mb-6">
        A verification email will be sent to <strong>{email}</strong>. Please check your inbox.
      </Typography>
      <Button onClick={handleSendVerification} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
        Resend Verification Email
      </Button>
    </section>
  );
}

export default Verify;
