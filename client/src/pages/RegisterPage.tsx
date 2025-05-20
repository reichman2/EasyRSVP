import Card from "../components/Card";


const RegisterPage = () => {
    return (
        <div>
            <Card className="w-md m-auto mt-50">
                <h1>Register</h1>
                <input type="text" placeholder="First Name" />
                <input type="text" placeholder="Last Name" />
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <input type="password" placeholder="Confirm Password" />
                <button>Register</button>
            </Card>
        </div>
    );
}

export default RegisterPage;