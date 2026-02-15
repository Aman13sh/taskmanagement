import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/Input";
import { toast } from 'react-toastify';
import { useAppDispatch } from "../../redux/hooks";
import { register } from "../../redux/slices/authSlice";

export const Register = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [repassword, setRepassword] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Trim values
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedRePassword = repassword.trim();

        // Required validation
        if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedRePassword) {
            toast.error("All fields are required");
            return;
        }

        // Name validation
        if (trimmedName.length < 3) {
            toast.error("Name must be at least 3 characters");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            toast.error("Please enter a valid email address");
            return;
        }

        // Password length validation
        if (trimmedPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        // Password match validation
        if (trimmedPassword !== trimmedRePassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            // Use Redux action to register
            await dispatch(register({
                name: trimmedName,
                email: trimmedEmail,
                password: trimmedPassword
            })).unwrap();

            toast.success("Registration successful!");

            // Navigate to projects page after successful registration
            navigate("/projects");
        } catch (error: any) {
            toast.error(error || "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-screen">
            <span className="text-2xl font-bold mb-4">Register</span>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-96 p-6 border-2 border-green-500 rounded-md gap-2"
            >
                <Input
                    type="text"
                    value={name}
                    classNameS="border-2 p-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    nameI="name"
                    placeholder="Name"
                    onChange={(e) => setName(e.target.value)}
                />

                <Input
                    type="email"
                    value={email}
                    classNameS="border-2 p-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    nameI="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                    type="password"
                    value={password}
                    classNameS="border-2 p-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    nameI="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                    type="password"
                    value={repassword}
                    classNameS="border-2 p-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    nameI="confirmPassword"
                    placeholder="Confirm Password"
                    onChange={(e) => setRepassword(e.target.value)}
                />

                <button
                    type="submit"
                    className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
};