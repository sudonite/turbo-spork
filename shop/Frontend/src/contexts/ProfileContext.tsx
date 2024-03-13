import { createContext, useContext, useState, useEffect } from "react";
import { getProfileContext } from "@/API";
import { useToast } from "@/components/ui/use-toast";

const ProfileContext = createContext({});

export const ProfileProvider = ({ children }: any) => {
  const [profile, setProfile] = useState({ is_admin: false });
  const { toast } = useToast();

  useEffect(() => {
    const getData = async () => {
      const response = await getProfileContext();
      if (response.status === 200) {
        setProfile({ is_admin: response?.data });
      } else {
        toast({
          title: "Hiba",
          description: "Ismeretlen hiba",
        });
      }
    };

    getData();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
