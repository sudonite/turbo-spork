import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar as CalendarIcon } from "lucide-react";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { register } from "../API";

import Navbar from "@/components/NavBar";

import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate] = useState<Date>();

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async () => {
    if (
      email === "" ||
      password === "" ||
      firstName === "" ||
      lastName === "" ||
      gender === "" ||
      mobile === "" ||
      date === undefined
    ) {
      toast({
        title: "Hiba",
        description: "Minden mező kitöltése kötelező",
      });
    } else if (password !== password2) {
      toast({
        title: "Hiba",
        description: "A két jelszó nem egyezik",
      });
    } else {
      const data = {
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName,
        gender: gender,
        phone_number: mobile,
        birth_date: date,
      };
      const response = await register(data);
      if (response?.status === 200) {
        toast({
          title: "Sikeres regisztráció",
          description: "Sikeresen regisztrált",
        });
        navigate("/login");
      } else {
        toast({
          title: "Hiba",
          description: "Ismeretlen hiba",
        });
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-1/4">
          <CardHeader>
            <CardTitle>Regisztráció</CardTitle>
            <CardDescription>
              Hozzon létre új felhasználói fiókot
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Input
              type="email"
              id="email"
              placeholder="Email cím"
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                type="text"
                id="firstName"
                placeholder="Vezetéknév"
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                type="text"
                id="lastName"
                placeholder="Keresztnév"
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <Select onValueChange={(e) => setGender(e)}>
              <SelectTrigger>
                <SelectValue placeholder="Nem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="man">Férfi</SelectItem>
                <SelectItem value="woman">Nő</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              id="mobile"
              placeholder="Telefonszám"
              onChange={(e) => setMobile(e.target.value)}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Születési dátum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex gap-2">
              <Input
                type="password"
                id="password"
                placeholder="Jelszó"
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                type="password"
                id="password_2"
                placeholder="Jelszó megerősítése"
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-1 justify-between">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Belépés
            </Button>
            <Button onClick={() => handleRegister()}>Regisztráció</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Register;
