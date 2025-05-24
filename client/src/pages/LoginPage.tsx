import Button from "../components/Button";
import Card from "../components/Card";
import "../assets/styles/LoginPage.css";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import API from "../api/axios";


const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email) {
            setEmailError("Email is required");
        }

        if (!password) {
            setPasswordError("Password is required");
        }

        if (!email || !password) {
            return;
        }

        try {
            const res = await API.post("/auth/login", { email, password });
            login(res.data.token);

            // redirect to dashboard
            window.location.href = "/dashboard";
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message);
            console.error(err.response?.data?.message);
        }
    };


    return (
        <div className="w-screen h-screen bg-gray-50 pt-0.5 overflow-x-hidden overflow-y-auto">
            <div className="sm:p-0 p-3 lg:mt-35 sm:mt-20">
                <Card className="lg:w-4xl md:w-2xl sm:w-md mx-auto p-0">
                    <div className="md:flex w-full m-0">
                        <div className="md:flex-1/2 px-8 pt-12 pb-6">
                            <div className="">
                                <h1 className="text-center text-2xl font-semibold">Welcome back!</h1>
                            </div>

                            <p className="text-xs text-red-500 text-center my-2">{ errorMsg }</p>

                            <div>
                                <div className="mb-4">
                                    <label className="text-xs font-semibold" htmlFor="email">Email</label>
                                    <Input error={ !!emailError } autoFocus={ true } className="my-2" type="email" value={ email } onChange={ (e) => setEmail(e.target.value) } />

                                    <div className="flex justify-end">
                                        <p className="text-xs text-red-500 -mt-2">{ emailError }</p>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-semibold" htmlFor="password">Password</label>
                                        <a href="#" className="text-xs text-teal-700 font-semibold hover:text-teal-600 transition-colors duration-200">Forgot password?</a>
                                    </div>

                                    <Input error={ !!passwordError } className="my-2" type="password" value={ password } onChange={ (e) => setPassword(e.target.value) } />

                                    <div className="flex justify-end">
                                        <p className="text-xs text-red-600 -mt-2">{ passwordError }</p>
                                    </div>
                                </div>

                                <Button className="shadow-sm hover:shadow-md transition-[shadow, colors] duration-300 h-8 hover:bg-teal-700" type="submit" onClick={ handleLogin }>Login</Button>


                            <p className="mt-6 text-sm font-semibold text-center">Don't have an account? <a className="text-teal-700 hover:text-teal-600 transition-colors duration-200" href="/register">Register here!</a></p>
                            </div>
                        </div>
                        <div className="card-image md:flex-1/2 bg-cover bg-no-repeat bg-center rounded-l-md rounded-r-lg"></div>
                    </div>
                </Card>
            </div>
        </div>
    );
}


export default LoginPage;