import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/Input";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../redux/hooks";
import { login } from "../../redux/slices/authSlice";

export const Login = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Trim spaces from start and end
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        // Validation
        if (!trimmedEmail || !trimmedPassword) {
            toast.error("Email and Password are required");
            return;
        }

        // Simple email format validation
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

        try {
            setLoading(true);

            // Use Redux action to login
            await dispatch(login({
                email: trimmedEmail,
                password: trimmedPassword
            })).unwrap();

            toast.success("Login successful!");

            // Navigate to projects page
            navigate("/projects");
        } catch (error: any) {
            toast.error(error || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-screen">
            <span className="text-2xl font-bold mb-4">Login</span>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-96 p-6 border-2 border-green-500 rounded-md gap-2"
            >
                <Input
                    type="email"
                    value={email}
                    classNameS="border-2 p-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    nameI="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />

                <Input
                    type="password"
                    value={password}
                    classNameS="border-2 p-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    nameI="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />

                <button
                    type="submit"
                    className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={loading}
                >
                    {loading ? "Signing In..." : "Sign In"}
                </button>
            </form>
        </div>
    );
};