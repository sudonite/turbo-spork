import { useState } from "react";

import { PhotoURL } from "@/Consts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Star } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { AddToCart, addFavorite, removeFavorite } from "@/API";

import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "./ui/scroll-area";

const ProductCard = (props: any) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(props.images[0]);
  const { toast } = useToast();

  const handleAddFavorite = async (product_id: any) => {
    const data = {
      action: "add",
      product_id: product_id,
    };
    const response = await addFavorite(data);
    if (response.status === 200) {
      let products = [
        ...props.products.map((obj: any) => {
          if (obj.id === props.id) {
            return { ...obj, favorite: true };
          } else {
            return { ...obj };
          }
        }),
      ];
      props.setProducts(products);
      toast({
        title: "Sikeres hozzáadás",
        description: "A termék sikeresen hozzáadva a kedvencekhez",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Ismeretlen hiba",
      });
    }
    12;
  };

  const handleRemoveFavorite = async (product_id: any) => {
    const data = {
      action: "delete",
      product_id: product_id,
    };
    const response = await removeFavorite(data);
    if (response.status === 200) {
      let products = [
        ...props.products.map((obj: any) => {
          if (obj.id === props.id) {
            return { ...obj, favorite: false };
          } else {
            return { ...obj };
          }
        }),
      ];
      props.setProducts(products);
      toast({
        title: "Sikeres törlés",
        description: "A termék sikeresen törölve a kedvencekből",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Ismeretlen hiba",
      });
    }
  };

  const handleAddToCart = async () => {
    if (quantity < 1 || quantity > 99) {
      toast({
        title: "Hiba",
        description: "1 és 99 közötti mennyiség adható a kosárhoz",
      });
      return;
    }
    const data = {
      action: "add",
      product_id: props.id,
      quantity: quantity,
    };
    const response = await AddToCart(data);
    if (response.status === 200) {
      toast({
        title: "Sikeres hozzáadás",
        description: "A termék sikeresen hozzáadva a kosárhoz",
      });
    } else if (response.status === 409) {
      toast({
        title: "Hiba",
        description: "Nincs elegendő termék készleten",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Ismeretlen hiba",
      });
    }
  };

  return (
    <Card className="w-full">
      <div className="flex flex-col h-full">
        <img
          className="w-full p-1 h-48 object-cover rounded-lg"
          src={PhotoURL + props.images[0]}
        />
        <div className="flex flex-col justify-between items-start p-2 h-full">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{props.name}</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <CardDescription className="font-extrabold">
              {props.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} HUF
            </CardDescription>
            <div className="w-full flex justify-end mt-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Részletek</Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-screen">
                  <div className="grid grid-flow-row md:grid-flow-col md:grid-cols-2">
                    <div className="h-full">
                      <img
                        className="w-full h-[calc(100vh*0.4)] md:w-full md:h-[calc(100vh*0.6)] object-cover rounded-lg"
                        src={PhotoURL + selectedImage}
                      />
                      <div className="flex justify-start gap-2 mt-2">
                        {props.images.map((image: any, index: any) => (
                          <img
                            key={index}
                            className="w-12 h-12 border-4 cursor-pointer"
                            src={PhotoURL + image}
                            onClick={() => setSelectedImage(image)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-full md:flex md:flex-col md:justify-between px-0 pt-0 md:px-4 md:pt-4">
                      <div className="h-full">
                        <h1 className="text-2xl font-bold">{props.name}</h1>
                        <ScrollArea className="rounded border md:rounded-none md:border-none h-2/6 md:h-fit md:mt-2">
                          <p className="text-md">{props.description}</p>
                        </ScrollArea>
                        <h3 className="sm:mt-2 text-lg font-semibold">
                          {props.price
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
                          HUF
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 -my-8 md:my-0">
                        <Label htmlFor="quantity" className="w-2/12">
                          Mennyiség
                        </Label>
                        <Input
                          className="w-4/12"
                          id="quantity"
                          type="number"
                          min={1}
                          max={99}
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(parseInt(e.target.value))
                          }
                        />
                        <DialogClose asChild>
                          <Toggle
                            defaultChecked={props.favorite}
                            pressed={props.favorite}
                            variant="outline"
                            className="w-14"
                            onClick={() => {
                              if (!props.favorite) {
                                handleAddFavorite(props.id);
                              } else {
                                handleRemoveFavorite(props.id);
                              }
                            }}
                          >
                            <Star className="h-4 w-4" />
                          </Toggle>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            className="w-6/12"
                            onClick={() => handleAddToCart()}
                          >
                            Kosárba
                          </Button>
                        </DialogClose>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
