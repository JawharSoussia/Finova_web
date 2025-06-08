import React, { useState } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Email is required");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
            toast.success("Reset code sent to your email!");
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset code");
        }
    };

    return (
        <div className="mt-16 mb-16 flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <Typography variant="h4" color="blue-gray" className="mb-2">
                        Forgot Password
                    </Typography>
                    <Typography color="gray" className="font-normal">
                        Enter your email to receive a reset code
                    </Typography>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" fullWidth>
                        Send Reset Code
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword; 