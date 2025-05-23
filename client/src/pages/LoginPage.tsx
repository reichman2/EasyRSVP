import Button from "../components/Button";
import Card from "../components/Card";
import "../assets/styles/LoginPage.css";
import Input from "../components/Input";


const LoginPage = () => {
    return (
        <div className="sm:p-0 p-3">
            <Card className="lg:w-4xl md:w-2xl sm:w-md m-auto mt-50 p-0">
                <div className="block md:flex w-full m-0 p-0">
                    <div className="md:flex-1/2 p-4">
                        <h1>Login</h1>
                        <Input className="m-2" type="email" placeholder="Email" />
                        <Input className="m-2" type="password" placeholder="Password" />
                        <Button className="shadow-sm hover:shadow-md transition-shadow duration-300">Login</Button>
                    </div>
                    <div className="card-image md:flex-1/2 bg-cover bg-no-repeat bg-center rounded-l-md rounded-r-lg">

                    </div>
                </div>
            </Card>
        </div>
    );
}


export default LoginPage;