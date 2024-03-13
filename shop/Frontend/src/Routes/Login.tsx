import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavBar from "@/components/NavBar";

import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

import { login } from "../API";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const response = await login({
      mode: "profile",
      email: email,
      password: password,
    });

    if (response?.status === 200) {
      toast({
        title: "Sikeres bejelentkezés",
        description: "Sikeresen bejelentkezett fiókjába",
      });
      navigate("/products");
    } else if (response?.status === 401) {
      toast({
        title: "Hiba",
        description: "Hibás email cím vagy jelszó",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Ismeretlen hiba",
      });
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-1/4">
          <CardHeader>
            <CardTitle>Belépés</CardTitle>
            <CardDescription>
              Jelentkezzen be felhasználói fiókjába
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Input
              type="email"
              id="email"
              placeholder="Email cím"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              id="password"
              placeholder="Jelszó"
              onChange={(e) => setPassword(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex flex-1 justify-between">
            <Button variant="ghost" onClick={() => navigate("/register")}>
              Regisztráció
            </Button>
            <Button onClick={() => handleLogin()}>Belépés</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Login;
