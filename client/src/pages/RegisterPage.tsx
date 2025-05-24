import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";


const RegisterPage = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errorMsg, setErrorMsg] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const { login } = useAuth();

    const handleRegister = async () => {
        if (!firstName) {
            setFirstNameError("First Name is required");
        }

        if (!lastName) {
            setLastNameError("Last Name is required");
        }

        if (!email) {
            setEmailError("Email is required");
        }

        if (!password) {
            setPasswordError("Password is required");
        }

        if (!confirmPassword) {
            setConfirmPasswordError("Confirm Password is required");
        }

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return;
        }

        try {
            const res = await API.post("/auth/register", {email, password, firstName, lastName });
            login(res.data.token);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message);
            console.error(err.response?.data?.message);
        }
    }

    return (
        <div className="w-screen h-screen bg-gray-50 pt-0.5 overflow-x-hidden overflow-y-auto">
            <div className="sm:p-0 p-3 lg:mt-35 sm:mt-20">
                <Card className="lg:w-4xl md:w-2xl sm:w-md mx-auto p-0">
                    <div className="md:flex w-full m-0">
                        <div className="md:flex-1/2 px-8 py-12">
                            <h1 className="text-center text-2xl font-semibold">Welcome!</h1>

                            <p className="text-xs text-red-500 text-center my-2">{ errorMsg }</p>

                            <div className="mt-6 mb-2 flex justify-between">
                                <div>
                                    <label className="text-xs font-semibold" htmlFor="firstName">First Name</label>
                                    <Input error={ !!firstNameError } className="my-2" type="text" value={ firstName } onChange={ (e) => setFirstName(e.target.value) } />
                                    <div className="flex justify-end">
                                        <p className="text-xs text-red-500 -mt-2">{ firstNameError }</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold" htmlFor="lastName">Last Name</label>
                                    <Input error={ !!lastNameError } className="my-2" type="text" value={ lastName } onChange={ (e) => setLastName(e.target.value) } />
                                <div className="flex justify-end">
                                    <p className="text-xs text-red-500 -mt-2">{ lastNameError }</p>
                                </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-xs font-semibold" htmlFor="email">Email</label>
                                <Input error={ !!emailError } type="email" value={ email } onChange={ (e) => setEmail(e.target.value) } />
                                <div className="flex justify-end">
                                    <p className="text-xs text-red-500">{ emailError }</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold" htmlFor="password">Password</label>
                                <Input error={ !!passwordError } type="password" value={ password } onChange={ (e) => setPassword(e.target.value) } />
                                <div className="flex justify-end">
                                    <p className="text-xs text-red-500">{ passwordError }</p>
                                </div>
                            </div>
                            
                            <div className="my-2">
                                <label className="text-xs font-semibold" htmlFor="confirmPassword">Confirm Password</label>
                                <Input error={ !!confirmPasswordError } type="password" value={ confirmPassword } onChange={ (e) => setConfirmPassword(e.target.value) }/>
                                <div className="flex justify-end">
                                    <p className="text-xs text-red-500">{ confirmPasswordError }</p>
                                </div>
                            </div>

                            <Button className="mt-8 shadow-sm hover:shadow-md transition-[shadow, colors] duration-300 h-8 hover:bg-teal-700" type="submit" onClick={ handleRegister }>Register</Button>
                            
                            <p className="mt-6 text-sm font-semibold text-center">Already have an account? <a className="text-teal-700 hover:text-teal-600 transition-colors duration-200" href="/login">Login here!</a></p>
                        </div>

                        <div className="card-image md:flex-1/2 bg-cover bg-no-repeat bg-center rounded-l-md rounded-r-lg"></div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default RegisterPage;