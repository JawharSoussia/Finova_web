import React, { useState } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export function ResetPassword() {
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const email = new URLSearchParams(location.search).get("email");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            toast.error("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/auth/reset-password", {
                email,
                code,
                newPassword
            });

            toast.success("Password reset successful! Please login with your new password");
            navigate("/sign-in");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        }
    };

    return (
        <div className="mt-16 mb-16 flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <Typography variant="h4" color="blue-gray" className="mb-2">
                        Reset Password
                    </Typography>
                    <Typography color="gray" className="font-normal">
                        Enter the code sent to your email and your new password
                    </Typography>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            type="text"
                            label="Reset Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" fullWidth>
                        Reset Password
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword; 