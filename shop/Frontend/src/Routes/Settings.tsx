import { useState, useEffect } from "react";

import Navbar from "@/components/NavBar";

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

import { jwtDecode } from "jwt-decode";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { getProfile, getAddress, EditProfile, EditAddress } from "@/API";

const Settings = () => {
  const [profile, setProfile] = useState({
    email: "",
    first_name: "",
    last_name: "",
    birth_date: undefined as Date | undefined,
    gender: "",
    phone_number: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [address, setAddress] = useState({
    country: "",
    city: "",
    street: "",
    house_number: "",
    flat_number: "",
  });
  const [isAnonymous, setIsAnonymous] = useState();
  const { toast } = useToast();

  useEffect(() => {
    const getData = async () => {
      const profileResponse = await getProfile();
      const addressResponse = await getAddress();
      if (profileResponse.status === 200 && addressResponse.status === 200) {
        setProfile({
          ...profileResponse.data,
          birth_date: new Date(profileResponse.data.birth_date),
        });
        setAddress(addressResponse.data);
        const jwtToken = localStorage.getItem("jwt_token");
        if (jwtToken) {
          const decodedToken: any = jwtDecode(jwtToken);
          setIsAnonymous(decodedToken.is_anonymous);
        }
      }
    };
    getData();
  }, []);

  const handleProfileEdit = async () => {
    if (
      profile.email === "" ||
      profile.first_name === "" ||
      profile.last_name === "" ||
      profile.gender === "" ||
      profile.phone_number === "" ||
      profile.birth_date === undefined
    ) {
      toast({
        title: "Hiba",
        description: "Minden mező kitöltése kötelező",
      });
      return;
    }

    let data: any = profile;
    if (newPassword !== "") {
      data.password = newPassword;
    }
    const response = await EditProfile(data);
    if (response?.status === 200) {
      toast({
        title: "Sikeres mentés",
        description: "A módosításokat sikeresen elmentettük",
      });
    } else {
      toast({
        title: "Hiba",
        description: "A módosítások mentése sikertelen",
      });
    }
  };

  const handleAddressEdit = async () => {
    if (
      address.country === "" ||
      address.city === "" ||
      address.street === "" ||
      address.house_number === ""
    ) {
      toast({
        title: "Hiba",
        description: "Minden mező kitöltése kötelező",
      });
      return;
    }

    const response = await EditAddress(address);
    if (response?.status === 200) {
      toast({
        title: "Sikeres mentés",
        description: "A módosításokat sikeresen elmentettük",
      });
    } else {
      toast({
        title: "Hiba",
        description: "A módosítások mentése sikertelen",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row w-screen h-full">
        <Card className="w-full m-2 ">
          <CardHeader>
            <CardTitle>Felhasználói adatok</CardTitle>
            <CardDescription>Módosítsa felhasználói adatait</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Input
              type="email"
              id="email"
              placeholder="Email cím"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
            <div className="flex gap-2">
              <Input
                type="text"
                id="firstName"
                placeholder="Vezetéknév"
                value={profile.first_name}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
              />
              <Input
                type="text"
                id="lastName"
                placeholder="Keresztnév"
                value={profile.last_name}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
              />
            </div>
            <Select
              value={profile.gender}
              onValueChange={(e) => setProfile({ ...profile, gender: e })}
            >
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
              value={profile.phone_number}
              onChange={(e) =>
                setProfile({ ...profile, phone_number: e.target.value })
              }
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !profile.birth_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {profile.birth_date ? (
                    format(profile.birth_date, "PPP")
                  ) : (
                    <span>Születési dátum</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={profile.birth_date}
                  onSelect={(e) => setProfile({ ...profile, birth_date: e })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {!isAnonymous && (
              <Input
                type="password"
                id="password"
                placeholder="Új jelszó"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleProfileEdit()}>
              Mentés
            </Button>
          </CardFooter>
        </Card>
        <Card className="w-full m-2 ">
          <CardHeader>
            <CardTitle>Szállítási cím</CardTitle>
            <CardDescription>Módosítsa szállítási címét</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Input
              type="text"
              id="country"
              placeholder="Ország"
              value={address.country}
              onChange={(e) =>
                setAddress({ ...address, country: e.target.value })
              }
            />
            <Input
              type="text"
              id="city"
              placeholder="Város"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
            <Input
              type="text"
              id="street"
              placeholder="Utca"
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
            />
            <Input
              type="number"
              id="house"
              placeholder="Hászszám"
              value={address.house_number}
              onChange={(e) =>
                setAddress({ ...address, house_number: e.target.value })
              }
            />
            <Input
              type="text"
              id="flat"
              placeholder="Emelet/Ajtó"
              value={address.flat_number}
              onChange={(e) =>
                setAddress({ ...address, flat_number: e.target.value })
              }
            />
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleAddressEdit()}>
              Mentés
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Settings;
