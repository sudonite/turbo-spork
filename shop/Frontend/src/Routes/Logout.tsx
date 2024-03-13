import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Logout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.removeItem("jwt_token");
    toast({
      title: "Sikeres kijelentkezés",
      description: "Sikeresen kijelentkezett fiókjából",
    });
    navigate("/");
  }, []);

  return <></>;
};

export default Logout;
