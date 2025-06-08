import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input, Button, Typography } from "@material-tailwind/react";
import { toast } from "react-toastify";
import axios from "axios";

export function Verify2FA() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Code is required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-2fa", { email, code });
      // const { token } = response.data;
      // localStorage.setItem("authToken", token);
      toast.success("Verification successful! Redirecting to registration...");
      navigate(`/register?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid or expired code. Please try again.");
    }
  };

  return (
    <section className="m-8 flex flex-col items-center">
      <div className="w-full lg:w-1/3 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Verify Your Identity</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Enter the 6-digit code sent to your email.
          </Typography>
        </div>
        <form className="mt-8 mb-2" onSubmit={handleVerifyCode}>
          <div className="mb-4 flex justify-center gap-2">
            {[...Array(6)].map((_, index) => (
              <Input
                key={index}
                type="number"
                maxLength="1"
                className="w-12 text-center text-lg"
                value={code[index] || ""}
                onChange={(e) => {
                  const newCode = code.split("");
                  newCode[index] = e.target.value;
                  setCode(newCode.join(""));
                }}
              />
            ))}
          </div>
          <Button className="mt-6" fullWidth type="submit">
            Verify Code
          </Button>
        </form>
      </div>
    </section>
  );
}

export default Verify2FA;
