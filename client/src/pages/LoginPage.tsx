import Card from "../components/Card";


const LoginPage = () => {
    return (
        <div>
            <Card className="w-md m-auto mt-50">
                <h1>Login</h1>
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <button>Login</button>
            </Card>
        </div>
    );
}


export default LoginPage;